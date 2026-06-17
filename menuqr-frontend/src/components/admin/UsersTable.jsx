import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { KeyRound, ShieldOff, ShieldCheck, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { cn } from '../../lib/utils';

const ROLE_BADGE = {
  SUPER_ADMIN: 'bg-red-100 text-red-700',
  OWNER:       'bg-orange-100 text-orange-600',
  MANAGER:     'bg-purple-100 text-purple-700',
  STAFF:       'bg-gray-100 text-gray-700',
  CASHIER:     'bg-green-100 text-green-700',
};

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function UsersTable({ users = [], queryKey = ['admin-users'] }) {
  const qc = useQueryClient();
  const [loadingId, setLoadingId] = useState(null);

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }) => api.put(`/admin/users/${id}/toggle`, { is_active }),
    onSuccess: () => { qc.invalidateQueries({ queryKey }); },
    onError: () => toast.error('Impossible de modifier cet utilisateur'),
  });

  const resetMutation = useMutation({
    mutationFn: (id) => api.post(`/admin/users/${id}/reset-password`).then((r) => r.data.data),
    onSuccess: (data) => toast.success(`Nouveau MDP temporaire : ${data.temp_password}`),
    onError: () => toast.error('Réinitialisation impossible'),
  });

  if (!users.length) {
    return <p className="text-xs text-gray-400 italic py-4 text-center">Aucun utilisateur</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-left text-gray-400 border-b border-gray-100">
            <th className="pb-2 font-medium">Nom</th>
            <th className="pb-2 font-medium">Rôle</th>
            <th className="pb-2 font-medium">Restaurant</th>
            <th className="pb-2 font-medium">Dernière connexion</th>
            <th className="pb-2 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {users.map((u) => (
            <tr key={u.id} className={cn('transition-colors', !u.is_active && 'opacity-50')}>
              <td className="py-2.5 pr-3">
                <div className="font-medium text-gray-800">{u.name}</div>
                <div className="text-gray-400">{u.email || u.username}</div>
              </td>
              <td className="py-2.5 pr-3">
                <span className={cn('px-2 py-0.5 rounded-full font-semibold text-[10px]', ROLE_BADGE[u.role] || 'bg-gray-100 text-gray-600')}>
                  {u.role}
                </span>
              </td>
              <td className="py-2.5 pr-3 text-gray-500 truncate max-w-[120px]">
                {u.restaurant?.name || '—'}
              </td>
              <td className="py-2.5 pr-3 text-gray-400">{fmtDate(u.last_login_at)}</td>
              <td className="py-2.5">
                <div className="flex items-center justify-end gap-1">
                  <button
                    type="button"
                    title="Réinitialiser MDP"
                    disabled={resetMutation.isPending}
                    onClick={() => resetMutation.mutate(u.id)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-orange-500 transition-colors"
                  >
                    <KeyRound size={13} />
                  </button>
                  <button
                    type="button"
                    title={u.is_active ? 'Désactiver' : 'Activer'}
                    onClick={() => toggleMutation.mutate({ id: u.id, is_active: !u.is_active })}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-amber-600 transition-colors"
                  >
                    {u.is_active ? <ShieldOff size={13} /> : <ShieldCheck size={13} />}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
