import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDT } from '../../utils/currency';
import api from '../../api/axios';
import { useAuthStore } from '../../store/authStore';

const STATUS_NEXT = {
  PENDING:   { label: 'Confirmer',       nextStatus: 'CONFIRMED'  },
  CONFIRMED: { label: 'En préparation',  nextStatus: 'PREPARING'  },
  PREPARING: { label: 'Prête',           nextStatus: 'READY'      },
  READY:     { label: 'Servie',          nextStatus: 'SERVED'     },
};

const STATUS_BADGE = {
  PENDING:   { label: 'En attente',      cls: 'bg-gray-100 text-gray-500'      },
  CONFIRMED: { label: 'Confirmée',       cls: 'bg-blue-100 text-blue-600'      },
  PREPARING: { label: '🍳 En préparation', cls: 'bg-amber-100 text-amber-700'  },
  READY:     { label: '✓ Prête',         cls: 'bg-green-100 text-green-700'    },
  SERVED:    { label: '🛵 Servie',       cls: 'bg-gray-100 text-gray-500'      },
  CLOSED:    { label: 'Clôturée',        cls: 'bg-gray-100 text-gray-400'      },
  CANCELLED: { label: 'Annulée',         cls: 'bg-red-100 text-red-500'        },
};

export default function OrderCard({ order, restaurantId, onViewDetail }) {
  const { i18n } = useTranslation();
  const lang = ['fr', 'en', 'it', 'ar'].includes(i18n.language) ? i18n.language : 'fr';
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const canCancel = ['OWNER', 'MANAGER'].includes(user?.role);

  const shortId = `#${String(order.id).slice(-6).toUpperCase()}`;
  const tableName = order.table?.name || (order.table?.number ? `Table ${order.table.number}` : null);
  const customerName = order.customer_name || (order.user ? `${order.user.first_name || ''} ${(order.user.last_name || '')[0] || ''}`.trim() : null);

  const time = new Date(order.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  const badge = STATUS_BADGE[order.status] || STATUS_BADGE.PENDING;
  const next  = STATUS_NEXT[order.status];

  const statusMutation = useMutation({
    mutationFn: (nextStatus) =>
      api.put(`/orders/${order.id}/status`, { status: nextStatus }).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders', restaurantId] }),
    onError: (err) => toast.error(err.response?.data?.message || 'Erreur'),
  });

  const cancelMutation = useMutation({
    mutationFn: () =>
      api.put(`/orders/${order.id}/cancel`, { reason: '' }).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', restaurantId] });
      toast.success('Commande annulée');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Erreur'),
  });

return (
    <div
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onViewDetail?.(order)}
    >
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-black text-gray-900 leading-tight">
            {shortId}{tableName ? ` — ${tableName}` : ''}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {customerName ? `${customerName} · ` : '— · '}{time}
          </p>
        </div>
        <span className={`shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full ${badge.cls}`}>
          {badge.label}
        </span>
      </div>

      {/* ── Items ── */}
      <div className="space-y-1.5">
        {(order.items || []).slice(0, 4).map((item, idx) => (
          <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-1.5">
            <span className="text-xs text-gray-700 font-medium truncate">
              {item.quantity}× {item.name_snapshot}
            </span>
            <span className="text-xs text-gray-500 shrink-0 ml-2">
              {formatDT((item.unit_price || 0) * item.quantity, lang)}
            </span>
          </div>
        ))}
        {(order.items || []).length > 4 && (
          <p className="text-xs text-gray-400 px-1">+{order.items.length - 4} article(s)…</p>
        )}
      </div>

      {/* ── Type ── */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400 font-medium">Type</span>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full border border-gray-200 text-gray-600">
          {order.order_type === 'takeaway' ? 'À emporter' : order.order_type === 'delivery' ? 'Livraison' : 'Sur place'}
        </span>
      </div>

      {/* ── Total ── */}
      <div className="flex items-center justify-between border-t border-gray-50 pt-2">
        <span className="text-sm font-semibold text-gray-900">Total</span>
        <span className="text-lg font-black" style={{ color: '#e55a1e' }}>
          {formatDT(order.total, lang)}
        </span>
      </div>

      {/* ── Actions ── */}
      {(next || order.status === 'SERVED' || (canCancel && !['CLOSED', 'CANCELLED'].includes(order.status))) && (
        <div className="flex gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
          {next && (
            <button
              type="button"
              disabled={statusMutation.isPending}
              onClick={() => statusMutation.mutate(next.nextStatus)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-white text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: '#e55a1e' }}
            >
              <ArrowRight size={14} />
              {next.label}
            </button>
          )}
          {order.status === 'SERVED' && (
            <button
              type="button"
              onClick={() => navigate('/dashboard/pos')}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-white text-sm font-bold transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#e55a1e' }}
            >
              <ArrowRight size={14} />
              Clôturer
            </button>
          )}
{canCancel && !['CLOSED', 'CANCELLED'].includes(order.status) && (
            <button
              type="button"
              disabled={cancelMutation.isPending}
              onClick={() => {
                if (window.confirm('Annuler cette commande ?')) cancelMutation.mutate();
              }}
              className="py-2.5 px-3 rounded-xl border border-red-200 text-red-400 text-sm font-semibold hover:bg-red-50 transition-colors shrink-0 flex items-center gap-1"
            >
              <X size={13} />
              Annuler
            </button>
          )}
        </div>
      )}
    </div>
  );
}
