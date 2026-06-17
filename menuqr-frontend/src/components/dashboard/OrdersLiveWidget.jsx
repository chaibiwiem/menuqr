import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import { formatDT } from '../../utils/currency';
import { cn } from '../../lib/utils';

const STATUS_META = {
  PENDING:   { label: 'En attente',  color: 'bg-amber-100 text-amber-800 border-amber-200' },
  CONFIRMED: { label: 'Confirmée',   color: 'bg-blue-100 text-blue-800 border-blue-200' },
  PREPARING: { label: 'Préparation', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  READY:     { label: 'Prête',       color: 'bg-green-100 text-green-800 border-green-200' },
  SERVED:    { label: 'Servie',      color: 'bg-gray-100 text-gray-700 border-gray-200' },
};

export default function OrdersLiveWidget({ restaurantId }) {
  const { i18n } = useTranslation();
  const lang = ['fr', 'en', 'it', 'ar'].includes(i18n.language) ? i18n.language : 'fr';
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['orders-live', restaurantId],
    queryFn: () => api.get('/dashboard/orders-live').then((r) => r.data.data),
    refetchInterval: 20_000,
    enabled: !!restaurantId,
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-center h-48">
        <Loader2 size={22} className="animate-spin text-orange-400" />
      </div>
    );
  }

  const { byStatus = {}, recent = [], total = 0 } = data || {};

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <ShoppingBag size={15} className="text-orange-500" />
          Commandes actives
          {total > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-orange-500 text-white text-[10px] font-bold leading-none">
              {total}
            </span>
          )}
        </h2>
        <button
          type="button"
          onClick={() => navigate('/dashboard/orders')}
          className="text-xs text-orange-500 hover:text-orange-600 font-medium"
        >
          Voir tout →
        </button>
      </div>

      {/* Status pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.entries(STATUS_META).map(([status, { label, color }]) => {
          const count = byStatus[status] || 0;
          if (!count) return null;
          return (
            <div key={status} className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-semibold', color)}>
              <span>{count}</span>
              <span>{label}</span>
            </div>
          );
        })}
        {total === 0 && (
          <span className="text-xs text-gray-400 italic">Aucune commande active</span>
        )}
      </div>

      {/* 5 most recent active orders */}
      {recent.length > 0 && (
        <div className="divide-y divide-gray-50">
          {recent.map((order) => {
            const meta = STATUS_META[order.status];
            return (
              <div key={order.id} className="flex items-center justify-between py-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">
                    Table {order.Table?.number ?? '?'}
                  </span>
                  <span className={cn('px-1.5 py-0.5 rounded-full border text-[10px] font-semibold', meta?.color)}>
                    {meta?.label}
                  </span>
                </div>
                <span className="font-semibold text-gray-900">{formatDT(order.total, lang)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
