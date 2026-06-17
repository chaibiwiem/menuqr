import { formatDT } from '../../utils/currency';

export default function OrderSummary({ order, lang }) {
  const items = order?.items || [];

  if (!items.length) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-2 text-gray-300">
        <div className="text-3xl">🛒</div>
        <p className="text-sm text-gray-400">Aucun article dans cette commande</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-50">
      {items.map((item) => {
        const supplements = item.supplements || [];
        const lineTotal   = Number(item.unit_price) * item.quantity;

        return (
          <div key={item.id} className="py-3 flex items-start justify-between gap-3">
            {/* Left: qty badge + name + sups */}
            <div className="flex items-start gap-2.5 flex-1 min-w-0">
              <span className="mt-0.5 w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-[11px] font-black text-white bg-orange-500">
                {item.quantity}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 leading-tight truncate">
                  {item.name_snapshot}
                </p>
                {supplements.map((sup) => (
                  <p key={sup.id} className="text-xs text-gray-400 mt-0.5 truncate">
                    + {sup.option_name_snapshot}
                    {Number(sup.extra_price) > 0 && (
                      <span className="text-gray-300"> ({formatDT(sup.extra_price, lang)})</span>
                    )}
                  </p>
                ))}
                {item.notes && (
                  <p className="text-xs text-gray-400 mt-1 italic truncate">"{item.notes}"</p>
                )}
              </div>
            </div>

            {/* Right: price */}
            <div className="shrink-0 text-right">
              <p className="text-sm font-bold text-gray-900">{formatDT(lineTotal, lang)}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {item.quantity} × {formatDT(item.unit_price, lang)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
