import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Check, X, Loader2, GripVertical } from 'lucide-react';
import api from '../../api/axios';
import { formatDT } from '../../utils/currency';
import { cn } from '../../lib/utils';

const LANGS = ['fr', 'en', 'it', 'ar'];

function VariantRow({ variant, itemId, lang, onDeleted, onUpdated }) {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    label_fr: variant.label_fr || '',
    label_en: variant.label_en || '',
    label_it: variant.label_it || '',
    label_ar: variant.label_ar || '',
    price: String(variant.price || '0'),
    is_available: variant.is_available ?? true,
  });
  const [editLang, setEditLang] = useState('fr');

  const label = variant[`label_${lang}`] || variant.label_fr;

  const updateMut = useMutation({
    mutationFn: (body) => api.put(`/variants/${variant.id}`, body),
    onSuccess: (res) => {
      onUpdated(res.data.data);
      setEditing(false);
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  });

  const deleteMut = useMutation({
    mutationFn: () => api.delete(`/variants/${variant.id}`),
    onSuccess: () => onDeleted(variant.id),
    onError: () => toast.error('Erreur lors de la suppression'),
  });

  const toggleMut = useMutation({
    mutationFn: () => api.put(`/variants/${variant.id}`, { is_available: !variant.is_available }),
    onSuccess: (res) => onUpdated(res.data.data),
  });

  if (editing) {
    return (
      <div className="bg-orange-50 rounded-xl border border-orange-200 p-3 space-y-3">
        {/* Lang tabs */}
        <div className="flex gap-1">
          {LANGS.map((l) => (
            <button key={l} type="button" onClick={() => setEditLang(l)}
              className={cn('px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors',
                editLang === l ? 'bg-orange-500 text-white' : 'bg-white text-gray-500 border border-gray-200'
              )}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>
        <div dir={editLang === 'ar' ? 'rtl' : 'ltr'}>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Libellé ({editLang.toUpperCase()}) {editLang === 'fr' && <span className="text-red-500">*</span>}
          </label>
          <input
            value={form[`label_${editLang}`]}
            onChange={(e) => setForm((f) => ({ ...f, [`label_${editLang}`]: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Prix (DT) <span className="text-red-500">*</span></label>
          <input
            type="number" step="0.001" min="0"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
          />
        </div>
        <div className="flex gap-2">
          <button type="button"
            onClick={() => updateMut.mutate({ ...form, price: parseFloat(form.price) || 0 })}
            disabled={updateMut.isPending || !form.label_fr.trim()}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-medium hover:bg-orange-600 disabled:opacity-60">
            {updateMut.isPending ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
            Enregistrer
          </button>
          <button type="button" onClick={() => setEditing(false)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50">
            <X size={12} /> Annuler
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-3 p-3 rounded-xl border bg-white transition-opacity', !variant.is_available && 'opacity-50')}>
      <GripVertical size={14} className="text-gray-300 shrink-0" />
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium text-gray-900">{label}</span>
        <span className="ml-2 text-sm font-semibold text-orange-500">{formatDT(parseFloat(variant.price), lang)}</span>
      </div>
      <button type="button" onClick={() => toggleMut.mutate()} disabled={toggleMut.isPending}
        className={cn('text-xs px-2 py-0.5 rounded-full font-medium transition-colors',
          variant.is_available
            ? 'bg-green-100 text-green-700 hover:bg-green-200'
            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
        )}>
        {variant.is_available ? 'Actif' : 'Inactif'}
      </button>
      <button type="button" onClick={() => { setForm({ label_fr: variant.label_fr||'', label_en: variant.label_en||'', label_it: variant.label_it||'', label_ar: variant.label_ar||'', price: String(variant.price||0), is_available: variant.is_available??true }); setEditing(true); }}
        className="p-1.5 rounded-lg text-gray-400 hover:text-orange-500 hover:bg-orange-50">
        <Pencil size={13} />
      </button>
      <button type="button" onClick={() => deleteMut.mutate()} disabled={deleteMut.isPending}
        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50">
        {deleteMut.isPending ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
      </button>
    </div>
  );
}

function AddVariantForm({ itemId, onCreated }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState('fr');
  const [form, setForm] = useState({ label_fr: '', label_en: '', label_it: '', label_ar: '', price: '' });

  const createMut = useMutation({
    mutationFn: (body) => api.post(`/items/${itemId}/variants`, body),
    onSuccess: (res) => {
      onCreated(res.data.data);
      setForm({ label_fr: '', label_en: '', label_it: '', label_ar: '', price: '' });
      setOpen(false);
    },
    onError: () => toast.error('Erreur lors de la création'),
  });

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-orange-300 text-orange-500 text-sm font-medium hover:bg-orange-50 transition-colors">
        <Plus size={15} /> Ajouter une variante
      </button>
    );
  }

  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 p-3 space-y-3">
      <p className="text-xs font-semibold text-gray-700">Nouvelle variante</p>
      <div className="flex gap-1">
        {LANGS.map((l) => (
          <button key={l} type="button" onClick={() => setLang(l)}
            className={cn('px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors',
              lang === l ? 'bg-orange-500 text-white' : 'bg-white text-gray-500 border border-gray-200'
            )}>
            {l.toUpperCase()}
          </button>
        ))}
      </div>
      <div dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          Libellé ({lang.toUpperCase()}) {lang === 'fr' && <span className="text-red-500">*</span>}
        </label>
        <input
          value={form[`label_${lang}`]}
          onChange={(e) => setForm((f) => ({ ...f, [`label_${lang}`]: e.target.value }))}
          placeholder={lang === 'fr' ? 'ex: Mini, Medium, Familiale' : ''}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Prix (DT) <span className="text-red-500">*</span></label>
        <input
          type="number" step="0.001" min="0"
          value={form.price}
          onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
          placeholder="0.000"
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
        />
      </div>
      <div className="flex gap-2">
        <button type="button"
          onClick={() => createMut.mutate({ ...form, price: parseFloat(form.price) || 0 })}
          disabled={createMut.isPending || !form.label_fr.trim() || !form.price}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-medium hover:bg-orange-600 disabled:opacity-60">
          {createMut.isPending ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
          Ajouter
        </button>
        <button type="button" onClick={() => setOpen(false)}
          className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50">
          Annuler
        </button>
      </div>
    </div>
  );
}

export default function VariantManager({ itemId }) {
  const { i18n } = useTranslation();
  const lang = ['fr', 'en', 'it', 'ar'].includes(i18n.language) ? i18n.language : 'fr';

  const { data: variants = [], isLoading, refetch } = useQuery({
    queryKey: ['item-variants', itemId],
    queryFn: () => api.get(`/items/${itemId}/variants`).then((r) => r.data.data),
    staleTime: 0,
  });

  const [list, setList] = useState(null);
  const displayed = list ?? variants;

  function handleCreated(v) { setList((prev) => [...(prev ?? variants), v]); }
  function handleDeleted(id) { setList((prev) => (prev ?? variants).filter((v) => v.id !== id)); }
  function handleUpdated(updated) { setList((prev) => (prev ?? variants).map((v) => v.id === updated.id ? updated : v)); }

  if (isLoading) {
    return <div className="flex items-center justify-center py-8"><Loader2 size={20} className="animate-spin text-orange-400" /></div>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-1">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Variantes (tailles)</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Chaque variante a son propre prix. Le client choisit sa taille lors de la commande.
          </p>
        </div>
        {displayed.length > 0 && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 font-medium">
            {displayed.length} variante{displayed.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {displayed.length === 0 ? (
        <div className="text-center py-6 text-sm text-gray-400">
          Aucune variante — le plat a un prix unique.
        </div>
      ) : (
        <div className="space-y-2">
          {displayed.map((v) => (
            <VariantRow key={v.id} variant={v} itemId={itemId} lang={lang}
              onDeleted={handleDeleted} onUpdated={handleUpdated} />
          ))}
        </div>
      )}

      <AddVariantForm itemId={itemId} onCreated={handleCreated} />
    </div>
  );
}
