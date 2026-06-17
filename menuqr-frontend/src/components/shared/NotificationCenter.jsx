import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ShoppingBag, Bell, CheckCheck, X, Loader2 } from 'lucide-react';
import api from '../../api/axios';
import { cn } from '../../lib/utils';

const TYPE_CFG = {
  NEW_ORDER:   { icon: ShoppingBag, color: 'text-orange-500', bg: 'bg-orange-50'  },
  CALL_WAITER: { icon: Bell,        color: 'text-amber-500',  bg: 'bg-amber-50'   },
};

function NotifIcon({ type }) {
  const cfg = TYPE_CFG[type] || { icon: Bell, color: 'text-gray-400', bg: 'bg-gray-50' };
  const Icon = cfg.icon;
  return (
    <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center shrink-0', cfg.bg)}>
      <Icon size={15} className={cfg.color} />
    </div>
  );
}

export default function NotificationCenter({ onClose }) {
  const qc       = useQueryClient();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn:  () => api.get('/notifications').then((r) => r.data),
    staleTime: 0,
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => api.put(`/notifications/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllMutation = useMutation({
    mutationFn: () => api.put('/notifications/read-all'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const notifications = data?.data || [];
  const unread        = data?.meta?.unread || 0;

  function handleClick(notif) {
    if (!notif.is_read) markReadMutation.mutate(notif.id);
    if (notif.type === 'NEW_ORDER') { onClose(); navigate('/dashboard/orders'); }
    if (notif.type === 'CALL_WAITER') { onClose(); navigate('/dashboard/orders'); }
  }

  return (
    <div className="w-80 bg-white rounded-2xl border border-gray-100 shadow-2xl overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Bell size={15} className="text-gray-500" />
          <span className="text-sm font-semibold text-gray-800">Notifications</span>
          {unread > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold">
              {unread}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unread > 0 && (
            <button
              type="button"
              onClick={() => markAllMutation.mutate()}
              disabled={markAllMutation.isPending}
              title="Tout marquer comme lu"
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <CheckCheck size={14} />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={20} className="animate-spin text-orange-400" />
          </div>
        )}

        {!isLoading && notifications.length === 0 && (
          <div className="text-center py-10">
            <Bell size={24} className="mx-auto mb-2 text-gray-200" />
            <p className="text-xs text-gray-400">Aucune notification</p>
          </div>
        )}

        {!isLoading && notifications.map((notif) => (
          <button
            key={notif.id}
            type="button"
            onClick={() => handleClick(notif)}
            className={cn(
              'w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0',
              !notif.is_read && 'bg-orange-50/40',
            )}
          >
            <NotifIcon type={notif.type} />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-1">
                <p className={cn('text-xs font-semibold truncate', notif.is_read ? 'text-gray-600' : 'text-gray-900')}>
                  {notif.title}
                </p>
                {!notif.is_read && (
                  <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-orange-500 mt-1" />
                )}
              </div>
              {notif.body && (
                <p className="text-[11px] text-gray-400 truncate mt-0.5">{notif.body}</p>
              )}
              <p className="text-[10px] text-gray-300 mt-0.5">
                {notif.created_at
                  ? formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: fr })
                  : ''}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
