import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Minus, Plus } from 'lucide-react';
import { formatDT } from '../../utils/currency';
import { cn } from '../../lib/utils';

function pickName(obj, lang) {
  return obj?.[`name_${lang}`] || obj?.name_fr || '';
}

export default function ItemDetailModal({ item, lang, theme, onClose, onAddToCart }) {
  const { t } = useTranslation();
  const [quantity, setQuantity] = useState(1);
  const [selected, setSelected] = useState({});
  // selected = { groupId: optionId (radio) | Set<optionId> (checkbox) }
  const [notes, setNotes] = useState('');

  const groups = item.supplementGroups || [];
  const basePrice = parseFloat(item.price) || 0;

  const suppTotal = groups.reduce((sum, g) => {
    const sel = selected[g.id];
    if (!sel) return sum;
    if (g.type === 'radio') {
      const opt = (g.options || []).find((o) => o.id === sel);
      return sum + (parseFloat(opt?.extra_price) || 0);
    }
    return sum + [...sel].reduce((s, id) => {
      const opt = (g.options || []).find((o) => o.id === id);
      return s + (parseFloat(opt?.extra_price) || 0);
    }, 0);
  }, 0);

  const lineTotal = (basePrice + suppTotal) * quantity;

  const isValid = groups.every((g) => {
    if (!g.is_required) return true;
    const sel = selected[g.id];
    if (g.type === 'radio') return !!sel;
    return sel instanceof Set && sel.size >= (g.min_select || 1);
  });

  function toggleRadio(groupId, optionId) {
    setSelected((prev) => ({ ...prev, [groupId]: optionId }));
  }

  function toggleCheckbox(groupId, optionId, checked) {
    setSelected((prev) => {
      const cur = prev[groupId] instanceof Set ? prev[groupId] : new Set();
      const next = new Set(cur);
      checked ? next.add(optionId) : next.delete(optionId);
      return { ...prev, [groupId]: next };
    });
  }

  function buildSupplements() {
    const result = [];
    groups.forEach((g) => {
      const sel = selected[g.id];
      if (!sel) return;
      if (g.type === 'radio') {
        const opt = (g.options || []).find((o) => o.id === sel);
        if (opt) result.push({ option_id: opt.id, name: pickName(opt, lang), extra_price: parseFloat(opt.extra_price) || 0 });
      } else {
        [...sel].forEach((id) => {
          const opt = (g.options || []).find((o) => o.id === id);
          if (opt) result.push({ option_id: opt.id, name: pickName(opt, lang), extra_price: parseFloat(opt.extra_price) || 0 });
        });
      }
    });
    return result;
  }

  const name = pickName(item, lang);
  const desc = item[`description_${lang}`] || item.description_fr || '';

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm" onClick={onClose} />
      <div className={cn(
        'fixed inset-x-0 bottom-0 z-50 rounded-t-3xl shadow-2xl max-h-[92vh] flex flex-col',
        theme.dark ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'
      )}>
        {/* Item image */}
        {item.image_url && (
          <div className="relative h-52 shrink-0 overflow-hidden rounded-t-3xl">
            <img src={item.image_url} alt={name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>
        )}

        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/30 text-white flex items-center justify-center backdrop-blur-sm"
        >
          <X size={17} />
        </button>

        {/* Scrollable body */}
        <div className="flex-1 overflow-auto px-5 py-5">
          {/* Name + base price */}
          <div className="flex items-start justify-between gap-3 mb-1">
            <h2 className="text-xl font-extrabold leading-tight flex-1">{name}</h2>
            <span className={cn('text-lg font-extrabold shrink-0', theme.accentText)}>
              {formatDT(basePrice, lang)}
            </span>
          </div>
          {desc && (
            <p className={cn('text-sm leading-relaxed mb-5', theme.muted)}>{desc}</p>
          )}

          {/* Supplement groups */}
          {groups.map((group) => {
            const groupName = pickName(group, lang);
            const sel = selected[group.id];
            return (
              <div key={group.id} className={cn('mb-4 rounded-2xl border p-4', theme.border)}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold">{groupName}</span>
                  <span className={cn(
                    'text-xs px-2 py-0.5 rounded-full font-semibold',
                    group.is_required
                      ? (theme.dark ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-600')
                      : (theme.dark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500')
                  )}>
                    {group.is_required ? t('menu.required_choice') : t('menu.optional_choice')}
                  </span>
                </div>

                <div className="space-y-2">
                  {(group.options || []).map((opt) => {
                    const optName = pickName(opt, lang);
                    const extra = parseFloat(opt.extra_price) || 0;
                    const checked = group.type === 'radio'
                      ? sel === opt.id
                      : sel instanceof Set && sel.has(opt.id);

                    return (
                      <label
                        key={opt.id}
                        className={cn(
                          'flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors',
                          checked
                            ? (theme.dark ? 'bg-violet-900/40 border border-violet-500/50' : 'bg-orange-50 border border-orange-200')
                            : (theme.dark ? 'bg-gray-800/50 border border-transparent' : 'bg-gray-50 border border-transparent')
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type={group.type === 'radio' ? 'radio' : 'checkbox'}
                            name={`grp-${group.id}`}
                            checked={checked}
                            onChange={(e) => {
                              group.type === 'radio'
                                ? toggleRadio(group.id, opt.id)
                                : toggleCheckbox(group.id, opt.id, e.target.checked);
                            }}
                            className="h-4 w-4 accent-orange-500 shrink-0"
                          />
                          <span className="text-sm font-medium">{optName}</span>
                        </div>
                        {extra > 0 && (
                          <span className={cn('text-sm font-semibold shrink-0', theme.accentText)}>
                            +{formatDT(extra, lang)}
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Notes */}
          <div>
            <label className={cn('block text-xs font-semibold mb-1.5', theme.muted)}>{t('menu.comment')}</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('menu.comment_placeholder')}
              rows={2}
              className={cn(
                'w-full px-3 py-2.5 rounded-xl text-sm resize-none border focus:outline-none focus:ring-2 focus:ring-orange-300',
                theme.dark
                  ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500'
                  : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400'
              )}
            />
          </div>
        </div>

        {/* Footer */}
        <div className={cn('px-5 py-4 border-t shrink-0', theme.border)}>
          {/* Quantity */}
          <div className="flex items-center gap-4 mb-4">
            <span className={cn('text-sm font-semibold', theme.muted)}>{t('menu.quantity')}</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className={cn('w-8 h-8 rounded-full border flex items-center justify-center font-bold', theme.border,
                  theme.dark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100')}
              >
                <Minus size={13} />
              </button>
              <span className="text-lg font-bold w-6 text-center">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                className={cn('w-8 h-8 rounded-full border flex items-center justify-center font-bold', theme.border,
                  theme.dark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100')}
              >
                <Plus size={13} />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => isValid && onAddToCart(quantity, buildSupplements(), notes)}
            disabled={!isValid}
            className={cn(
              'w-full py-4 rounded-2xl text-white font-bold text-sm flex items-center justify-between px-5 transition-all active:scale-98 disabled:opacity-50',
              theme.accent
            )}
          >
            <span>{t('menu.add_btn')}</span>
            <span className="font-extrabold">{formatDT(lineTotal, lang)}</span>
          </button>
        </div>
      </div>
    </>
  );
}
