import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { QrCode, Loader2 } from 'lucide-react';
import api from '../../api/axios';
import { cn } from '../../lib/utils';

const STATUS_DOT = {
  LIBRE:      'bg-green-400',
  OCCUPEE:    'bg-orange-400',
  RESERVEE:   'bg-blue-400',
  EN_ATTENTE: 'bg-yellow-400',
  DESACTIVEE: 'bg-gray-300',
};

const STATUS_LABELS = {
  LIBRE:      'Libre',
  OCCUPEE:    'Occupée',
  RESERVEE:   'Réservée',
  EN_ATTENTE: 'Appel',
  DESACTIVEE: 'Inactive',
};

export default function FloorPlanWidget({ restaurantId }) {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['tables-status', restaurantId],
    queryFn: () => api.get('/dashboard/tables-status').then((r) => r.data.data),
    refetchInterval: 20_000,
    enabled: !!restaurantId,
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-center h-48">
        <Loader2 size={22} className="animate-spin text-cyan-400" />
      </div>
    );
  }

  const { tables = [], byStatus = {}, total = 0 } = data || {};
  const occupied = (byStatus.OCCUPEE || 0) + (byStatus.EN_ATTENTE || 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <QrCode size={15} className="text-cyan-500" />
          Plan de salle
        </h2>
        <button
          type="button"
          onClick={() => navigate('/dashboard/tables')}
          className="text-xs text-orange-500 hover:text-orange-600 font-medium"
        >
          Gérer →
        </button>
      </div>

      <div className="flex items-baseline gap-1.5 mb-3">
        <span className="text-2xl font-bold text-gray-900">{occupied}</span>
        <span className="text-sm text-gray-400">/ {total} occupées</span>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 mb-3">
        {Object.entries(STATUS_LABELS).map(([status, label]) => {
          const count = byStatus[status] || 0;
          if (!count) return null;
          return (
            <div key={status} className="flex items-center gap-1 text-xs text-gray-500">
              <div className={cn('w-2 h-2 rounded-full shrink-0', STATUS_DOT[status])} />
              {label} ({count})
            </div>
          );
        })}
      </div>

      {/* Table grid — max 20 shown */}
      <div className="grid grid-cols-5 gap-1.5">
        {tables.slice(0, 20).map((table) => (
          <div
            key={table.id}
            title={`Table ${table.number} — ${STATUS_LABELS[table.status] || table.status}`}
            className={cn(
              'aspect-square rounded-lg flex items-center justify-center text-white text-[10px] font-bold select-none',
              STATUS_DOT[table.status] || 'bg-gray-200',
              table.status === 'EN_ATTENTE' && 'animate-pulse',
            )}
          >
            {table.number}
          </div>
        ))}
        {total === 0 && (
          <p className="col-span-5 text-xs text-gray-400 text-center py-6">
            Aucune table configurée
          </p>
        )}
        {total > 20 && (
          <div className="col-span-5 text-[10px] text-gray-400 text-right mt-0.5">
            +{total - 20} autres
          </div>
        )}
      </div>
    </div>
  );
}
