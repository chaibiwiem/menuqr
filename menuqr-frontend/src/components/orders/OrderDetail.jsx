import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { X, Printer, XCircle, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDT } from '../../utils/currency';
import api from '../../api/axios';
import { useAuthStore } from '../../store/authStore';

const STATUS_LABELS = {
  PENDING:   'orders.status_pending',
  CONFIRMED: 'orders.status_confirmed',
  PREPARING: 'orders.status_preparing',
  READY:     'orders.status_ready',
  SERVED:    'orders.status_served',
  CLOSED:    'orders.status_closed',
  CANCELLED: 'orders.status_cancelled',
};

const STATUS_DOT = {
  PENDING:   'bg-amber-400',
  CONFIRMED: 'bg-blue-400',
  PREPARING: 'bg-purple-400',
  READY:     'bg-green-400',
  SERVED:    'bg-teal-400',
  CLOSED:    'bg-gray-400',
  CANCELLED: 'bg-red-400',
};

const STATUS_NEXT = {
  PENDING:   { label: 'orders.action_confirm',  nextStatus: 'CONFIRMED'  },
  CONFIRMED: { label: 'orders.action_prepare',  nextStatus: 'PREPARING'  },
  PREPARING: { label: 'orders.action_ready',    nextStatus: 'READY'      },
  READY:     { label: 'orders.action_served',   nextStatus: 'SERVED'     },
  SERVED:    { label: 'orders.action_close',    nextStatus: 'CLOSED'     },
};

export default function OrderDetail({ orderId, restaurantId, onClose }) {
  const { t, i18n } = useTranslation();
  const lang = ['fr', 'en', 'it', 'ar'].includes(i18n.language) ? i18n.language : 'fr';
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const canCancel = ['OWNER', 'MANAGER'].includes(user?.role);

  const { data, isLoading } = useQuery({
    queryKey: ['order-detail', orderId],
    queryFn: () => api.get(`/orders/${orderId}`).then((r) => r.data.data),
    enabled: !!orderId,
    refetchInterval: 15000,
  });

  const statusMutation = useMutation({
    mutationFn: (nextStatus) =>
      api.put(`/orders/${orderId}/status`, { status: nextStatus }).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', restaurantId] });
      queryClient.invalidateQueries({ queryKey: ['order-detail', orderId] });
    },
    onError: (err) => toast.error(err.response?.data?.message || t('common.error')),
  });

  const cancelMutation = useMutation({
    mutationFn: () => api.put(`/orders/${orderId}/cancel`, { reason: '' }).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', restaurantId] });
      queryClient.invalidateQueries({ queryKey: ['order-detail', orderId] });
      toast.success(t('orders.cancelled_success'));
    },
    onError: (err) => toast.error(err.response?.data?.message || t('common.error')),
  });

  const printMutation = useMutation({
    mutationFn: () => api.post(`/orders/${orderId}/print`).then((r) => r.data),
    onSuccess: () => toast.success(t('orders.print_success')),
    onError: (err) => toast.error(err.response?.data?.message || t('orders.print_error')),
  });

  const order = data;
  const next = order ? STATUS_NEXT[order.status] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              {t('orders.detail_title')} #{order ? String(order.id).slice(-6).toUpperCase() : '…'}
            </h2>
            {order && (
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`inline-block w-2 h-2 rounded-full ${STATUS_DOT[order.status]}`} />
                <span className="text-xs text-gray-500">{t(STATUS_LABELS[order.status] || order.status)}</span>
                {order.table && (
                  <span className="text-xs text-gray-400">· {t('orders.table_label')} {order.table.name}</span>
                )}
              </div>
            )}
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
            </div>
          ) : !order ? (
            <p className="text-sm text-gray-500 text-center py-8">{t('orders.not_found')}</p>
          ) : (
            <>
              {/* Items */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{t('orders.items')}</h3>
                <div className="space-y-2">
                  {(order.items || []).map((item) => (
                    <div key={item.id} className="bg-gray-50 rounded-xl p-3 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-medium text-gray-900">
                          {item.quantity}× {item.name_snapshot}
                        </span>
                        <span className="text-sm font-semibold text-gray-900 shrink-0">
                          {formatDT(item.unit_price * item.quantity, lang)}
                        </span>
                      </div>
                      {(item.supplements || []).map((s) => (
                        <div key={s.id} className="flex items-center justify-between text-xs text-gray-500 pl-3">
                          <span>+ {s.option_name_snapshot}</span>
                          {s.extra_price > 0 && <span>{formatDT(s.extra_price, lang)}</span>}
                        </div>
                      ))}
                      {item.notes && (
                        <div className="text-xs text-gray-400 pl-3 italic">{item.notes}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                <span className="text-sm font-semibold text-gray-700">{t('orders.total')}</span>
                <span className="text-lg font-bold text-gray-900">{formatDT(order.total, lang)}</span>
              </div>

              {/* Notes */}
              {order.notes && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
                  <span className="font-medium">{t('orders.note')}: </span>{order.notes}
                </div>
              )}

              {/* Status timeline */}
              {(order.statusLogs || []).length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{t('orders.timeline')}</h3>
                  <div className="space-y-1.5">
                    {order.statusLogs.map((log) => (
                      <div key={log.id} className="flex items-center gap-2 text-xs text-gray-500">
                        <CheckCircle2 size={13} className="shrink-0 text-orange-400" />
                        <span>
                          {log.old_status && (
                            <>
                              <span className="text-gray-400">{t(STATUS_LABELS[log.old_status] || log.old_status)}</span>
                              <ChevronRight size={11} className="inline mx-0.5" />
                            </>
                          )}
                          <span className="font-medium text-gray-700">{t(STATUS_LABELS[log.new_status] || log.new_status)}</span>
                        </span>
                        <span className="ml-auto shrink-0 text-gray-400">
                          {format(new Date(log.created_at), 'HH:mm', { locale: lang === 'fr' ? fr : undefined })}
                        </span>
                        {log.changedBy && (
                          <span className="text-gray-400 shrink-0">{log.changedBy.name}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer actions */}
        {order && (
          <div className="px-5 py-4 border-t border-gray-100 flex items-center gap-2">
            {next && (
              <button
                type="button"
                disabled={statusMutation.isPending}
                onClick={() => statusMutation.mutate(next.nextStatus)}
                className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 disabled:opacity-50 transition-colors"
              >
                {t(next.label)}
              </button>
            )}

            <button
              type="button"
              disabled={printMutation.isPending}
              onClick={() => printMutation.mutate()}
              className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              title={t('orders.print_ticket')}
            >
              <Printer size={16} />
            </button>

            {canCancel && !['CLOSED', 'CANCELLED'].includes(order.status) && (
              <button
                type="button"
                disabled={cancelMutation.isPending}
                onClick={() => {
                  if (window.confirm(t('orders.cancel_confirm'))) cancelMutation.mutate();
                }}
                className="p-2.5 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 disabled:opacity-50 transition-colors"
                title={t('orders.cancel')}
              >
                <XCircle size={16} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
