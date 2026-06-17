import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Plus, Search, MoreVertical, ToggleLeft, ToggleRight,
  Trash2, Eye, KeyRound, Loader2
} from 'lucide-react';
import api from '../../api/axios';
import { cn } from '../../lib/utils';

const PLAN_COLORS = {
  FREE:    'bg-gray-100 text-gray-600',
  STARTER: 'bg-blue-100 text-blue-700',
  PRO:     'bg-purple-100 text-purple-700',
  PREMIUM: 'bg-amber-100 text-amber-700',
};

const STATUS_COLORS = {
  active:   'bg-green-100 text-green-700',
  inactive: 'bg-red-100 text-red-700',
};

function PlanBadge({ plan }) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold', PLAN_COLORS[plan] || PLAN_COLORS.FREE)}>
      {plan}
    </span>
  );
}

function StatusBadge({ active }) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', active ? STATUS_COLORS.active : STATUS_COLORS.inactive)}>
      {active ? 'Actif' : 'Inactif'}
    </span>
  );
}

function ActionsMenu({ restaurant, onToggle, onReset, onDelete }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
      >
        <MoreVertical size={16} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-20 bg-white rounded-xl shadow-lg border border-gray-100 py-1 min-w-[180px]">
            <button
              type="button"
              onClick={() => { onToggle(); setOpen(false); }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              {restaurant.is_active ? <ToggleLeft size={15} /> : <ToggleRight size={15} />}
              {restaurant.is_active ? 'Désactiver' : 'Activer'}
            </button>
            <button
              type="button"
              onClick={() => { onReset(); setOpen(false); }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <KeyRound size={15} /> Réinitialiser MDP
            </button>
            <hr className="my-1 border-gray-100" />
            <button
              type="button"
              onClick={() => { onDelete(); setOpen(false); }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <Trash2 size={15} /> Supprimer
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function RestaurantsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-restaurants', search, planFilter, statusFilter, page],
    queryFn: () =>
      api.get('/admin/restaurants', {
        params: { search, plan: planFilter, status: statusFilter, page, limit: 15 },
      }).then((r) => r.data.data),
    keepPreviousData: true,
  });

  const toggleMutation = useMutation({
    mutationFn: (id) => api.put(`/admin/restaurants/${id}/toggle`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-restaurants'] }),
  });

  const resetMutation = useMutation({
    mutationFn: (id) => api.post(`/admin/restaurants/${id}/reset-password`),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/restaurants/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-restaurants'] });
      setConfirmDelete(null);
    },
  });

  const restaurants = data?.restaurants || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  function formatDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('admin.restaurants')}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} établissement{total !== 1 ? 's' : ''}</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/admin/restaurants/new')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-medium hover:bg-orange-600"
        >
          <Plus size={16} /> Nouveau restaurant
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Nom, email, slug..."
            className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-200"
          />
        </div>
        <select
          value={planFilter}
          onChange={(e) => { setPlanFilter(e.target.value); setPage(1); }}
          className="px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-200"
        >
          <option value="">Tous les plans</option>
          {['FREE', 'STARTER', 'PRO', 'PREMIUM'].map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-200"
        >
          <option value="">Tous les statuts</option>
          <option value="active">Actif</option>
          <option value="inactive">Inactif</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-orange-500" />
          </div>
        ) : restaurants.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">Aucun restaurant trouvé</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Restaurant</th>
                <th className="text-left px-4 py-3.5 font-semibold text-gray-600">Plan</th>
                <th className="text-left px-4 py-3.5 font-semibold text-gray-600">Statut</th>
                <th className="text-left px-4 py-3.5 font-semibold text-gray-600">Owner</th>
                <th className="text-left px-4 py-3.5 font-semibold text-gray-600">Créé le</th>
                <th className="text-left px-4 py-3.5 font-semibold text-gray-600">Expiration</th>
                <th className="px-4 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {restaurants.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {r.logo_url ? (
                        <img src={r.logo_url} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                          <span className="text-orange-500 font-bold text-sm">{r.name?.[0]?.toUpperCase()}</span>
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-gray-900">{r.name}</div>
                        <div className="text-xs text-gray-400">{r.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <PlanBadge plan={r.subscription?.plan || r.plan} />
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge active={r.is_active} />
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-gray-700">{r.owner?.name || '—'}</div>
                    <div className="text-xs text-gray-400">{r.owner?.email || ''}</div>
                  </td>
                  <td className="px-4 py-4 text-gray-500">{formatDate(r.created_at)}</td>
                  <td className="px-4 py-4 text-gray-500">
                    {r.subscription?.ends_at ? formatDate(r.subscription.ends_at) : '—'}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/restaurants/${r.id}`)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-orange-500"
                        title="Voir détails"
                      >
                        <Eye size={15} />
                      </button>
                      <ActionsMenu
                        restaurant={r}
                        onToggle={() => toggleMutation.mutate(r.id)}
                        onReset={() => resetMutation.mutate(r.id)}
                        onDelete={() => setConfirmDelete(r)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-5">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-40 hover:bg-gray-50"
          >
            Précédent
          </button>
          <span className="text-sm text-gray-500">Page {page} / {totalPages}</span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-40 hover:bg-gray-50"
          >
            Suivant
          </button>
        </div>
      )}

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-base font-bold text-gray-900 mb-2">Supprimer le restaurant ?</h3>
            <p className="text-sm text-gray-500 mb-5">
              Cette action supprimera <strong>{confirmDelete.name}</strong> et désactivera tous ses comptes staff. Cette opération est irréversible.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => deleteMutation.mutate(confirmDelete.id)}
                disabled={deleteMutation.isPending}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {deleteMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : null}
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
