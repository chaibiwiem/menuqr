import { Loader2 } from 'lucide-react';
import { formatDT } from '../../utils/currency';

const STATUS_STYLE = {
  OCCUPEE:    'bg-orange-100 border-orange-200 text-orange-700',
  EN_ATTENTE: 'bg-yellow-100 border-yellow-200 text-yellow-700',
  LIBRE:      'bg-green-100 border-green-200 text-green-700',
};

const STATUS_LABEL = {
  OCCUPEE:    'Occupée',
  EN_ATTENTE: 'En attente',
  LIBRE:      'Libre',
};

export default function TableSelector({ tables, isLoading, selectedId, onSelect, lang }) {
  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 size={24} className="animate-spin text-orange-500" />
      </div>
    );
  }

  if (!tables.length) {
    return (
      <div className="p-6 text-center text-sm text-gray-400">
        Aucune table disponible
      </div>
    );
  }

  // Group: occupied/waiting first, then free
  const busy  = tables.filter(t => t.status !== 'LIBRE');
  const libre = tables.filter(t => t.status === 'LIBRE');

  function renderTable(table) {
    const activeOrder = table.orders?.slice().sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    )[0];
    const isSelected = table.id === selectedId;
    const isFree = table.status === 'LIBRE';

    return (
      <button
        key={table.id}
        type="button"
        onClick={() => onSelect(table.id)}
        className={`w-full text-left p-3 rounded-xl border transition-all ${
          isSelected
            ? 'border-orange-400 bg-orange-50 shadow-sm'
            : isFree
            ? 'border-gray-100 bg-white hover:border-green-200 hover:bg-green-50'
            : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="font-semibold text-gray-800 text-sm truncate">
              {table.name || `Table ${table.number}`}
            </div>
            {table.room && (
              <div className="text-xs text-gray-400 mt-0.5 truncate">
                {table.room.name}{table.room.zone ? ` · ${table.room.zone}` : ''}
              </div>
            )}
          </div>
          <div className="shrink-0 text-right">
            <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full border font-medium ${STATUS_STYLE[table.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
              {STATUS_LABEL[table.status] || table.status}
            </span>
            {activeOrder && (
              <div className="text-xs font-bold text-gray-700 mt-1">
                {formatDT(activeOrder.total, lang)}
              </div>
            )}
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className="p-3 space-y-4">
      {busy.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-1">
            Occupées ({busy.length})
          </p>
          {busy.map(renderTable)}
        </div>
      )}
      {libre.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-1">
            Libres ({libre.length})
          </p>
          {libre.map(renderTable)}
        </div>
      )}
    </div>
  );
}
