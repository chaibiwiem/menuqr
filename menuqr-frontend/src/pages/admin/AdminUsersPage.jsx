import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Search, ShieldCheck, Loader2, Eye, EyeOff, KeyRound, RefreshCw } from 'lucide-react';
import api from '../../api/axios';
import { cn } from '../../lib/utils';

const ROLES = ['OWNER', 'MANAGER', 'WAITER', 'CASHIER', 'KITCHEN', 'STAFF'];

const ROLE_COLORS = {
  OWNER:   'bg-orange-100 text-orange-600',
  MANAGER: 'bg-purple-100 text-purple-700',
  WAITER:  'bg-blue-100 text-blue-700',
  CASHIER: 'bg-green-100 text-green-700',
  KITCHEN: 'bg-orange-100 text-orange-700',
  STAFF:   'bg-gray-100 text-gray-700',
};

function ResetPasswordModal({ user, onClose }) {
  const [done, setDone] = useState(null);
  const [copied, setCopied] = useState(false);
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => api.post(`/admin/users/${user.id}/reset-password`).then((r) => r.data.data),
    onSuccess: (data) => { setDone(data.temp_password); qc.invalidateQueries({ queryKey: ['admin-users'] }); },
  });

  function copy() {
    navigator.clipboard.writeText(done);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-base font-bold text-gray-900 mb-1">Réinitialiser mot de passe</h2>
        <p className="text-sm text-gray-500 mb-5">
          Utilisateur : <strong>{user.name}</strong> ({user.email || user.username})
        </p>

        {!done ? (
          <>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 mb-5">
              Un nouveau mot de passe temporaire sera généré. L'utilisateur devra le changer à la prochaine connexion.
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => mutation.mutate()}
                disabled={mutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-medium hover:bg-orange-600 disabled:opacity-50"
              >
                {mutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <KeyRound size={14} />}
                Générer
              </button>
              <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">
                Annuler
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="p-3 bg-gray-100 rounded-xl font-mono text-sm text-center tracking-widest mb-4 select-all">
              {done}
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={copy} className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700">
                {copied ? 'Copié !' : 'Copier'}
              </button>
              <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">
                Fermer
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [resetTarget, setResetTarget] = useState(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-users', search, roleFilter, page],
    queryFn: () => {
      const params = new URLSearchParams({ page, limit: 25 });
      if (search) params.set('search', search);
      if (roleFilter) params.set('role', roleFilter);
      return api.get(`/admin/users?${params}`).then((r) => r.data.data);
    },
    keepPreviousData: true,
  });

  const toggleMutation = useMutation({
    mutationFn: (id) => api.put(`/admin/users/${id}/toggle`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const users = data?.users || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  function fmtDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {resetTarget && (
        <ResetPasswordModal user={resetTarget} onClose={() => setResetTarget(null)} />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Users size={22} className="text-orange-500" />
            Gestion Utilisateurs
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} utilisateurs au total</p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
        >
          <RefreshCw size={14} />
          Actualiser
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Nom, email, username…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
          <option value="">Tous les rôles</option>
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 size={28} className="animate-spin text-orange-500" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-14 text-gray-400 text-sm">Aucun utilisateur trouvé</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <th className="text-left px-5 py-3">Utilisateur</th>
                  <th className="text-left px-4 py-3">Rôle</th>
                  <th className="text-left px-4 py-3">Restaurant</th>
                  <th className="text-left px-4 py-3">Créé le</th>
                  <th className="text-left px-4 py-3">Statut</th>
                  <th className="text-right px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-gray-900 truncate max-w-[180px]">{u.name}</div>
                      <div className="text-xs text-gray-400 truncate max-w-[180px]">{u.email || u.username || '—'}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-semibold', ROLE_COLORS[u.role] || 'bg-gray-100 text-gray-600')}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="text-gray-800 truncate max-w-[140px]">
                        {u.restaurant?.name || '—'}
                      </div>
                      {u.restaurant?.plan && (
                        <div className="text-xs text-gray-400">{u.restaurant.plan}</div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">{fmtDate(u.created_at)}</td>
                    <td className="px-4 py-3.5">
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-semibold',
                        u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>
                        {u.is_active ? 'Actif' : 'Inactif'}
                      </span>
                      {u.is_first_login && (
                        <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-600">
                          1ère cnx
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          title={u.is_active ? 'Désactiver' : 'Activer'}
                          onClick={() => toggleMutation.mutate(u.id)}
                          disabled={toggleMutation.isPending}
                          className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500 transition-colors"
                        >
                          {u.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <button
                          type="button"
                          title="Réinitialiser mot de passe"
                          onClick={() => setResetTarget(u)}
                          className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500 transition-colors"
                        >
                          <KeyRound size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Page {page} / {totalPages} ({total} utilisateurs)</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
            >
              ← Préc.
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
            >
              Suiv. →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
