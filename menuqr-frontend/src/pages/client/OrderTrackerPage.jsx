import { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Loader2, ArrowLeft } from 'lucide-react';
import { io } from 'socket.io-client';
import api from '../../api/axios';
import { formatDT } from '../../utils/currency';

const STATUSES = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED'];

const STATUS_META = {
  PENDING:   { label: 'order.status_pending',   icon: '🕐', color: '#F59E0B', bg: '#FEF3C7' },
  CONFIRMED: { label: 'order.status_confirmed', icon: '✅', color: '#3B82F6', bg: '#DBEAFE' },
  PREPARING: { label: 'order.status_preparing', icon: '👨‍🍳', color: '#8B5CF6', bg: '#EDE9FE' },
  READY:     { label: 'order.status_ready',     icon: '🔔', color: '#10B981', bg: '#D1FAE5' },
  SERVED:    { label: 'order.status_served',    icon: '🍽',  color: '#6B7280', bg: '#F3F4F6' },
  CLOSED:    { label: 'order.status_served',    icon: '🍽',  color: '#6B7280', bg: '#F3F4F6' },
  CANCELLED: { label: 'order.status_cancelled', icon: '❌', color: '#EF4444', bg: '#FEE2E2' },
};

export default function OrderTrackerPage() {
  const { slug, orderId } = useParams();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const socketRef = useRef(null);
  const lang = ['fr', 'en', 'it', 'ar'].includes(i18n.language) ? i18n.language : 'fr';

  const { data: orderData, isLoading } = useQuery({
    queryKey: ['order-track', orderId],
    queryFn: () => api.get(`/public/orders/${orderId}`).then((r) => r.data.data),
    refetchInterval: 10_000,
    staleTime: 5_000,
  });

  // Clear localStorage when order is completed
  useEffect(() => {
    if (
      (orderData?.status === 'SERVED' || orderData?.status === 'CLOSED') &&
      orderData?.table_id
    ) {
      localStorage.removeItem(`menuqr_order_${slug}_${orderData.table_id}`);
    }
  }, [orderData?.status, orderData?.table_id, slug]);

  // Real-time via Socket.io
  useEffect(() => {
    if (!orderData?.restaurant_id) return;
    const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001');
    socketRef.current = socket;
    socket.emit('join:restaurant', orderData.restaurant_id);
    socket.on('order:status_changed', ({ orderId: id, newStatus }) => {
      if (id === orderId) {
        qc.setQueryData(['order-track', orderId], (old) =>
          old ? { ...old, status: newStatus } : old
        );
      }
    });
    return () => { socket.disconnect(); };
  }, [orderData?.restaurant_id, orderId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-svh bg-gray-50">
        <Loader2 size={32} className="animate-spin text-orange-400" />
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="flex items-center justify-center min-h-svh bg-gray-50">
        <p className="text-gray-500 text-sm">{t('order.not_found')}</p>
      </div>
    );
  }

  const status = orderData.status;
  const meta = STATUS_META[status] || STATUS_META.PENDING;
  const currentIdx = STATUSES.indexOf(status);
  const items = orderData.items || [];
  const isCancelled = status === 'CANCELLED';

  return (
    <div className="min-h-svh bg-gray-100 pb-10">
      {/* Top bar */}
      <div
        className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 border-b bg-white"
        style={{ borderColor: '#e5e7eb' }}
      >
        <button
          type="button"
          onClick={() => navigate(`/${slug}`)}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <span className="text-sm font-semibold text-gray-700">
          {t('order.order_id')} #{orderId.slice(-6).toUpperCase()}
        </span>
      </div>

      <div className="max-w-md mx-auto px-4 py-5 space-y-4">
        {/* Status hero */}
        <div
          className="rounded-2xl p-5 text-center"
          style={{ backgroundColor: meta.bg }}
        >
          <div className="text-4xl mb-2">{meta.icon}</div>
          <h1 className="text-lg font-bold" style={{ color: meta.color }}>
            {t(meta.label)}
          </h1>
        </div>

        {/* Vertical stepper */}
        {!isCancelled && (
          <div className="bg-white rounded-2xl border border-gray-100 px-5 py-4">
            {STATUSES.map((s, idx) => {
              const m = STATUS_META[s];
              const done = idx < currentIdx;
              const current = idx === currentIdx;
              const isLast = idx === STATUSES.length - 1;

              return (
                <div key={s} className="flex gap-4">
                  {/* Timeline column */}
                  <div className="flex flex-col items-center">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0 transition-all"
                      style={
                        done
                          ? { backgroundColor: '#10B981', color: 'white', border: '2px solid #10B981' }
                          : current
                          ? { backgroundColor: meta.bg, color: meta.color, border: `2px solid ${meta.color}` }
                          : { backgroundColor: 'white', color: '#d1d5db', border: '2px solid #e5e7eb' }
                      }
                    >
                      {done ? '✓' : m.icon}
                    </div>
                    {!isLast && (
                      <div
                        className="w-0.5 flex-1 my-1"
                        style={{
                          minHeight: '20px',
                          backgroundColor: done ? '#10B981' : '#e5e7eb',
                        }}
                      />
                    )}
                  </div>

                  {/* Label column */}
                  <div className="pb-4 pt-1.5 min-w-0">
                    <p
                      className="text-sm font-semibold"
                      style={{
                        color: done ? '#374151' : current ? '#111827' : '#9ca3af',
                      }}
                    >
                      {t(m.label)}
                    </p>
                    {current && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {t('order.in_progress')}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Order items */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-900">{t('order.your_order')}</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {items.map((item) => {
              const lineTotal =
                parseFloat(item.unit_price) * item.quantity +
                (item.supplements || []).reduce(
                  (acc, s) => acc + parseFloat(s.extra_price || 0),
                  0
                );
              return (
                <div key={item.id} className="px-4 py-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-gray-800">
                        {item.quantity} × {item.name_snapshot}
                      </span>
                      {(item.supplements || []).length > 0 && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {item.supplements.map((s) => s.option_name_snapshot).join(', ')}
                        </p>
                      )}
                      {item.notes && (
                        <p className="text-xs text-gray-400 italic mt-0.5">{item.notes}</p>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-orange-500 shrink-0 ms-2">
                      {formatDT(lineTotal, lang)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm font-bold text-gray-900">{t('common.total')}</span>
            <span className="text-base font-bold text-orange-600">
              {formatDT(parseFloat(orderData.total), lang)}
            </span>
          </div>
        </div>

        {/* Payment */}
        <div className="bg-amber-50 rounded-2xl border border-amber-200 px-4 py-3 text-center">
          <p className="text-sm font-medium text-amber-800">{t('order.payment_on_site')}</p>
          <p className="text-xs text-amber-600 mt-0.5">
            {t('order.payment_amount', { amount: formatDT(parseFloat(orderData.total), lang) })}
          </p>
        </div>

        {/* Back to menu */}
        <button
          type="button"
          onClick={() => navigate(`/${slug}`)}
          className="w-full py-3 rounded-2xl border text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          style={{ borderColor: '#e5e7eb' }}
        >
          ← {t('order.back_to_menu')}
        </button>
      </div>
    </div>
  );
}
