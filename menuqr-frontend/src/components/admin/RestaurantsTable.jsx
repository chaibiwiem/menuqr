import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { formatDT } from '../../utils/currency';

const PLAN_BADGE = {
  FREE:    'bg-gray-100 text-gray-600',
  STARTER: 'bg-blue-100 text-blue-700',
  PRO:     'bg-violet-100 text-violet-700',
  PREMIUM: 'bg-amber-100 text-amber-700',
};

export default function RestaurantsTable({ restaurants = [], title = 'Top restaurants' }) {
  const navigate = useNavigate();

  if (!restaurants.length) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">{title}</h2>
        <p className="text-xs text-gray-400 italic">Aucun restaurant enregistré</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h2 className="text-sm font-semibold text-gray-700 mb-4">{title}</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-50">
              <th className="pb-2 font-medium">Nom</th>
              <th className="pb-2 font-medium">Plan</th>
              <th className="pb-2 font-medium text-right">Commandes</th>
              <th className="pb-2 font-medium text-right">CA</th>
              <th className="pb-2 w-6" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {restaurants.map((r) => (
              <tr
                key={r.id}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => navigate(`/admin/restaurants/${r.id}`)}
              >
                <td className="py-2.5 pr-3">
                  <div className="font-medium text-gray-800 truncate max-w-[140px]">{r.name}</div>
                  {r.owner?.email && (
                    <div className="text-gray-400 truncate max-w-[140px]">{r.owner.email}</div>
                  )}
                </td>
                <td className="py-2.5 pr-3">
                  <span className={cn('px-2 py-0.5 rounded-full font-semibold text-[10px]', PLAN_BADGE[r.subscription?.plan] || 'bg-gray-100 text-gray-600')}>
                    {r.subscription?.plan || '—'}
                  </span>
                </td>
                <td className="py-2.5 pr-3 text-right text-gray-700 font-medium">
                  {r.ordersThisMonth ?? '—'}
                </td>
                <td className="py-2.5 pr-3 text-right text-gray-700 font-medium">
                  {r.revenueThisMonth != null ? formatDT(r.revenueThisMonth, 'fr') : '—'}
                </td>
                <td className="py-2.5">
                  <ChevronRight size={13} className="text-gray-300" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
