import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import api from '../../api/axios';
import { formatDT } from '../../utils/currency';
import { useTranslation } from 'react-i18next';
import { Loader2, Banknote, CreditCard, FileText, AlertTriangle, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ServiceClosePage() {
  const { i18n } = useTranslation();
  const lang = ['fr', 'en', 'it', 'ar'].includes(i18n.language) ? i18n.language : 'fr';
  const { user } = useAuthStore();
  const restaurantId = user?.restaurant_id;
  const qc = useQueryClient();

  const [notes, setNotes] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const { data: closes = [], isLoading } = useQuery({
    queryKey: ['service-closes', restaurantId],
    queryFn: () => api.get('/pos/service-close').then((r) => r.data.data),
    enabled: !!restaurantId,
    staleTime: 0,
  });

  const closeMutation = useMutation({
    mutationFn: () => api.post('/pos/service-close', { notes }),
    onSuccess: () => {
      toast.success('Service clôturé avec succès');
      setShowConfirm(false);
      setNotes('');
      qc.invalidateQueries({ queryKey: ['service-closes'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Erreur lors de la clôture');
    },
  });

  const latest = closes[0];

  function handleDownloadReport(id) {
    const base = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    window.open(`${base}/pos/service-close/${id}/report`, '_blank');
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Clôture de service</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Récapitulatif des encaissements et clôture journalière
        </p>
      </div>

      {/* Latest service summary */}
      {latest && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <TrendingUp size={16} className="text-orange-500" />
              Dernier service clôturé
            </h2>
            <span className="text-sm font-medium text-gray-500">{latest.date}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 border border-green-100 rounded-xl p-4">
              <div className="flex items-center gap-2 text-green-600 mb-2">
                <Banknote size={16} />
                <span className="text-xs font-semibold uppercase tracking-wide">Espèces</span>
              </div>
              <div className="text-xl font-bold text-green-700">{formatDT(latest.total_cash, lang)}</div>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <div className="flex items-center gap-2 text-blue-600 mb-2">
                <CreditCard size={16} />
                <span className="text-xs font-semibold uppercase tracking-wide">Carte</span>
              </div>
              <div className="text-xl font-bold text-blue-700">{formatDT(latest.total_card, lang)}</div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div>
              <p className="text-sm text-gray-500">{latest.total_orders} commande(s) encaissée(s)</p>
              <p className="text-xl font-bold text-gray-900 mt-0.5">
                Total : {formatDT(latest.total_revenue, lang)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleDownloadReport(latest.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <FileText size={15} />
              Télécharger PDF
            </button>
          </div>
        </div>
      )}

      {/* New service close */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <h2 className="font-semibold text-gray-800">Clôturer le service actuel</h2>
        <p className="text-sm text-gray-500">
          Calcule automatiquement les totaux de la journée à partir des paiements enregistrés.
        </p>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes (optionnel)…"
          rows={3}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
        />

        {!showConfirm ? (
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            className="w-full py-3 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition-colors"
          >
            Clôturer le service
          </button>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-100 rounded-lg shrink-0 mt-0.5">
                <AlertTriangle size={16} className="text-red-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">Confirmer la clôture ?</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Un rapport sera créé. Cette action est définitive.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => closeMutation.mutate()}
                disabled={closeMutation.isPending}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {closeMutation.isPending ? 'Clôture en cours…' : 'Confirmer'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* History */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Historique des clôtures</h2>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 size={24} className="animate-spin text-orange-500" />
          </div>
        ) : closes.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-400">
            Aucune clôture enregistrée
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {closes.map((c) => (
              <div key={c.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{c.date}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {c.total_orders} commande(s) ·
                    <span className="text-green-600 ml-1">Espèces {formatDT(c.total_cash, lang)}</span>
                    <span className="text-blue-600 ml-1">Carte {formatDT(c.total_card, lang)}</span>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-800">{formatDT(c.total_revenue, lang)}</span>
                  <button
                    type="button"
                    onClick={() => handleDownloadReport(c.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-100 border border-gray-200 transition-colors"
                  >
                    <FileText size={13} />
                    PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
