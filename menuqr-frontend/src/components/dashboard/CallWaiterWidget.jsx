import { useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import { Bell, CheckCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { cn } from '../../lib/utils';

// Sounds and toasts for call_waiter:new are handled by useNotifications in DashboardPage.
// This widget only keeps the calls list in sync and shows the resolve UI.

const SOCKET_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001/api').replace('/api', '');

const TYPE_LABELS = { WAITER: 'Serveur', CHECK: 'Addition', OTHER: 'Autre' };
const TYPE_ICONS  = { WAITER: '🔔', CHECK: '💳', OTHER: '💬' };

export default function CallWaiterWidget({ restaurantId }) {
  const qc = useQueryClient();
  const socketRef = useRef(null);

  const { data: callsData, isLoading } = useQuery({
    queryKey: ['table-calls', restaurantId],
    queryFn: () => api.get('/tables/calls').then((r) => r.data.data),
    enabled: !!restaurantId,
    refetchInterval: 15_000,
  });

  const resolveMutation = useMutation({
    mutationFn: (id) => api.put(`/call-waiter/${id}/resolve`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['table-calls', restaurantId] });
      qc.invalidateQueries({ queryKey: ['call-waiter-stats'] });
      toast.success('Appel résolu');
    },
    onError: () => toast.error('Erreur'),
  });

  useEffect(() => {
    if (!restaurantId) return;

    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current.on('connect', () => {
      socketRef.current.emit('join:restaurant', restaurantId);
    });

    socketRef.current.on('call_waiter:new', () => {
      qc.invalidateQueries({ queryKey: ['table-calls', restaurantId] });
      // Sound + toast handled by useNotifications hook in DashboardPage
    });

    socketRef.current.on('call_waiter:resolved', () => {
      qc.invalidateQueries({ queryKey: ['table-calls', restaurantId] });
    });

    socketRef.current.on('table:status_changed', () => {
      qc.invalidateQueries({ queryKey: ['tables'] });
    });

    return () => {
      socketRef.current?.emit('leave:restaurant', restaurantId);
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [restaurantId, qc]);

  const calls = callsData || [];

  if (!isLoading && calls.length === 0) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Bell size={15} className="text-amber-600" />
        <h3 className="text-sm font-bold text-amber-900">Appels en attente</h3>
        {calls.length > 0 && (
          <span className="ml-auto px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold animate-pulse">
            {calls.length}
          </span>
        )}
      </div>

      {isLoading ? (
        <Loader2 size={18} className="animate-spin text-amber-500" />
      ) : (
        <div className="space-y-2">
          {calls.map((call) => {
            const ageMs = call.created_at ? Date.now() - new Date(call.created_at).getTime() : 0;
            const isOld = ageMs > 5 * 60 * 1000;
            return (
              <div
                key={call.id}
                className={cn(
                  'flex items-center justify-between bg-white rounded-xl px-3 py-2.5 border transition-colors',
                  isOld ? 'border-red-300 animate-pulse' : 'border-amber-100'
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-base shrink-0">{TYPE_ICONS[call.type] || '🔔'}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {call.table?.name || '—'}
                      {isOld && <span className="ml-1 text-red-500 text-xs font-bold">+5 min</span>}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {TYPE_LABELS[call.type]}
                      {call.message ? ` — ${call.message}` : ''}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => resolveMutation.mutate(call.id)}
                  disabled={resolveMutation.isPending}
                  className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 text-xs font-medium hover:bg-amber-200 disabled:opacity-50 ml-2"
                >
                  <CheckCircle size={12} /> OK
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
