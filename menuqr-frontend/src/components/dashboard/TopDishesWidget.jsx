import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, UtensilsCrossed } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import { formatDT } from '../../utils/currency';

function DishAvatar({ imageUrl, name }) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className="w-9 h-9 rounded-full object-cover shrink-0 border border-gray-100"
      />
    );
  }
  return (
    <div className="w-9 h-9 rounded-full bg-pink-50 flex items-center justify-center shrink-0 border border-pink-100">
      <UtensilsCrossed size={14} className="text-pink-400" />
    </div>
  );
}

export default function TopDishesWidget({ restaurantId }) {
  const { i18n } = useTranslation();
  const lang = ['fr', 'en', 'it', 'ar'].includes(i18n.language) ? i18n.language : 'fr';
  const [period, setPeriod] = useState('day');

  const { data, isLoading } = useQuery({
    queryKey: ['top-dishes', restaurantId, period],
    queryFn: () => api.get(`/dashboard/top-dishes?period=${period}`).then((r) => r.data.data),
    refetchInterval: 60_000,
    enabled: !!restaurantId,
  });

  const dishes = data || [];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <UtensilsCrossed size={15} className="text-pink-500" />
          Top plats populaires
        </h2>

        {/* Toggle */}
        <div className="flex items-center bg-gray-100 rounded-lg p-0.5 gap-0.5">
          <button
            onClick={() => setPeriod('day')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              period === 'day'
                ? 'bg-gray-900 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Jour
          </button>
          <button
            onClick={() => setPeriod('week')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              period === 'week'
                ? 'bg-gray-900 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Semaine
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 size={22} className="animate-spin text-pink-400" />
        </div>
      ) : dishes.length === 0 ? (
        <div className="h-40 flex items-center justify-center">
          <p className="text-xs text-gray-400 italic">
            Aucune vente enregistrée {period === 'day' ? "aujourd'hui" : 'cette semaine'}
          </p>
        </div>
      ) : (
        <>
          {/* Column headers */}
          <div className="grid grid-cols-[1fr_auto_auto] gap-3 px-1 mb-2">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Plat</span>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide text-right">Prix unit.</span>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide text-right">CA total</span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-gray-50">
            {dishes.map((d, i) => (
              <div key={i} className="grid grid-cols-[1fr_auto_auto] gap-3 items-center py-2.5 px-1">
                {/* Name + avatar */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <DishAvatar imageUrl={d.imageUrl} name={d.name} />
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-800 truncate">{d.name}</div>
                    <div className="text-[10px] text-gray-400">{d.qty} vendus</div>
                  </div>
                </div>

                {/* Unit price */}
                <span className="text-sm font-semibold text-gray-600 text-right whitespace-nowrap">
                  {formatDT(d.unitPrice, lang)}
                </span>

                {/* Total revenue */}
                <span className="text-sm font-bold text-gray-900 text-right whitespace-nowrap">
                  {formatDT(d.revenue, lang)}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
