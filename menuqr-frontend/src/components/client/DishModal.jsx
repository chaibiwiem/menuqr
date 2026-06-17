import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Minus, Plus, Clock, FileText } from 'lucide-react';

const NOTE_MAX = 150;
import { formatDT, getEffectivePrice, isHappyHour, isPromoActive } from '../../utils/currency';
import useCart from '../../hooks/useCart';

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function DishModal({ item, onClose, canOrder = true }) {
  const { t, i18n } = useTranslation();
  const { addToCart } = useCart();
  const lang = ['fr', 'en', 'it', 'ar'].includes(i18n.language) ? i18n.language : 'fr';

  const variants = item.variants || [];
  const hasVariants = variants.length > 0;

  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const [selectedSupplements, setSelectedSupplements] = useState({});
  const [errors, setErrors] = useState({});
  const [selectedVariant, setSelectedVariant] = useState(hasVariants ? variants[0] : null);

  const name = item[`name_${lang}`] || item.name_fr;
  const desc = item[`description_${lang}`] || item.description_fr || '';
  const groups = item.supplementGroups || [];
  const happyHour = isHappyHour(item);
  const promoActive = isPromoActive(item);
  const showStrikethrough = !hasVariants && (promoActive || happyHour);
  const basePrice = hasVariants
    ? (parseFloat(selectedVariant?.price) || 0)
    : getEffectivePrice(item);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  function getSupplementsForGroup(groupId) {
    return selectedSupplements[groupId] || [];
  }

  function toggleRadio(group, option) {
    setSelectedSupplements((prev) => ({ ...prev, [group.id]: [option] }));
    setErrors((prev) => ({ ...prev, [group.id]: undefined }));
  }

  function toggleCheckbox(group, option) {
    const current = getSupplementsForGroup(group.id);
    const exists = current.find((o) => o.id === option.id);
    let next;
    if (exists) {
      next = current.filter((o) => o.id !== option.id);
    } else {
      if (group.max_select && current.length >= group.max_select) return;
      next = [...current, option];
    }
    setSelectedSupplements((prev) => ({ ...prev, [group.id]: next }));
    setErrors((prev) => ({ ...prev, [group.id]: undefined }));
  }

  const supplementTotal = Object.values(selectedSupplements)
    .flat()
    .reduce((acc, opt) => acc + (parseFloat(opt.extra_price) || 0), 0);
  const unitTotal = basePrice + supplementTotal;
  const grandTotal = unitTotal * quantity;

  function validate() {
    const newErrors = {};
    for (const group of groups) {
      const selected = getSupplementsForGroup(group.id);
      if (group.is_required && selected.length < (group.min_select || 1)) {
        newErrors[group.id] = t('client.supplement_required');
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleAdd() {
    if (hasVariants && !selectedVariant) {
      setErrors((prev) => ({ ...prev, _variant: t('client.variant_required') }));
      return;
    }
    if (!validate()) return;
    const supplements = Object.values(selectedSupplements).flat().map((opt) => ({
      option_id: opt.id,
      name: opt[`name_${lang}`] || opt.name_fr,
      extra_price: parseFloat(opt.extra_price) || 0,
    }));
    const variant = selectedVariant
      ? { id: selectedVariant.id, label: selectedVariant[`label_${lang}`] || selectedVariant.label_fr, price: parseFloat(selectedVariant.price) || 0 }
      : null;
    addToCart({ id: generateId(), item, variant, supplements, quantity, note: note.trim() || null, unitTotal });
    onClose();
  }

  const isRTL = lang === 'ar';

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />

      {/* Centered modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div
          className="relative w-full max-w-md max-h-[90dvh] flex flex-col rounded-2xl shadow-2xl overflow-hidden"
          style={{ backgroundColor: 'var(--bg-primary, white)' }}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 end-3 z-10 w-8 h-8 rounded-full flex items-center justify-center bg-black/40 text-white hover:bg-black/60 transition-colors"
          >
            <X size={15} />
          </button>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto">
            {/* Hero image — responsive 16:9 */}
            {item.image_url && (
              <div className="w-full aspect-video overflow-hidden">
                <img
                  src={item.image_url}
                  alt={name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            )}

            <div className="p-5 space-y-5">
              {/* Name, price, description */}
              <div>
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-xl font-extrabold leading-tight flex-1" style={{ color: 'var(--text-primary, #111)' }}>
                    {name}
                  </h2>
                  {!hasVariants && (
                    <span className="text-xl font-extrabold shrink-0" style={{ color: 'var(--accent, #6c47ff)' }}>
                      {formatDT(basePrice, lang)}
                    </span>
                  )}
                </div>
                {desc && (
                  <p className="text-sm mt-1.5 leading-relaxed" style={{ color: 'var(--text-secondary, #6b7280)' }}>
                    {desc}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {hasVariants ? (
                    selectedVariant ? (
                      <span className="text-lg font-extrabold" style={{ color: 'var(--accent, #6c47ff)' }}>
                        {formatDT(parseFloat(selectedVariant.price), lang)}
                      </span>
                    ) : (
                      <span className="text-sm" style={{ color: 'var(--text-secondary, #9ca3af)' }}>
                        À partir de{' '}
                        <span className="font-bold" style={{ color: 'var(--accent, #6c47ff)' }}>
                          {formatDT(Math.min(...variants.map((v) => parseFloat(v.price) || 0)), lang)}
                        </span>
                      </span>
                    )
                  ) : (
                    <>
                      {showStrikethrough && (
                        <span className="text-sm line-through" style={{ color: 'var(--text-secondary, #9ca3af)' }}>
                          {formatDT(parseFloat(item.price), lang)}
                        </span>
                      )}
                      {promoActive && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                          {item.promo_label || t('menu.promo_badge')}
                        </span>
                      )}
                      {happyHour && !promoActive && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                          Happy Hour
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Prep time */}
              {item.prep_time_min && (
                <div className="flex items-center gap-1.5 mt-2">
                  <span
                    className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: 'rgba(108,71,255,0.08)', color: 'var(--accent, #6c47ff)' }}
                  >
                    <Clock size={11} />
                    {item.prep_time_min} min
                  </span>
                </div>
              )}

              {/* Variant selector */}
              {hasVariants && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary, #111)' }}>
                      Taille
                    </h3>
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 font-medium">
                      {t('common.required')}
                    </span>
                  </div>
                  {errors._variant && (
                    <p className="text-xs text-red-500 mb-1">{errors._variant}</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {variants.map((v) => {
                      const vLabel = v[`label_${lang}`] || v.label_fr;
                      const isSelected = selectedVariant?.id === v.id;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => { setSelectedVariant(v); setErrors((p) => ({ ...p, _variant: undefined })); }}
                          className="flex flex-col items-center px-4 py-2.5 rounded-xl border-2 transition-all text-sm font-medium"
                          style={
                            isSelected
                              ? { borderColor: 'var(--accent, #6c47ff)', backgroundColor: 'rgba(108,71,255,0.08)', color: 'var(--accent, #6c47ff)' }
                              : { borderColor: 'var(--card-border, #e5e7eb)', backgroundColor: 'var(--card-bg, white)', color: 'var(--text-primary, #111)' }
                          }
                        >
                          <span>{vLabel}</span>
                          <span className="text-xs font-bold mt-0.5" style={{ color: isSelected ? 'var(--accent, #6c47ff)' : 'var(--text-secondary, #6b7280)' }}>
                            {formatDT(parseFloat(v.price), lang)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Supplement groups */}
              {groups.map((group) => {
                const groupName = group[`name_${lang}`] || group.name_fr;
                const selected = getSupplementsForGroup(group.id);
                return (
                  <div key={group.id}>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary, #111)' }}>
                        {groupName}
                      </h3>
                      {group.is_required && (
                        <span className="text-xs px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 font-medium">
                          {t('common.required')}
                        </span>
                      )}
                      {group.type === 'checkbox' && group.max_select && (
                        <span className="text-xs" style={{ color: 'var(--text-secondary, #6b7280)' }}>
                          (max {group.max_select})
                        </span>
                      )}
                    </div>
                    {errors[group.id] && (
                      <p className="text-xs text-red-500 mb-1">{errors[group.id]}</p>
                    )}
                    <div className="space-y-2">
                      {(group.options || []).map((option) => {
                        const optName = option[`name_${lang}`] || option.name_fr;
                        const extraPrice = parseFloat(option.extra_price) || 0;
                        const isSelected =
                          group.type === 'radio'
                            ? selected.length > 0 && selected[0].id === option.id
                            : selected.some((o) => o.id === option.id);
                        return (
                          <label
                            key={option.id}
                            className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors"
                            style={
                              isSelected
                                ? { borderColor: 'var(--accent, #6c47ff)', backgroundColor: 'rgba(108,71,255,0.06)' }
                                : { borderColor: 'var(--card-border, #e5e7eb)', backgroundColor: 'var(--card-bg, white)' }
                            }
                          >
                            <input
                              type={group.type === 'radio' ? 'radio' : 'checkbox'}
                              name={`group-${group.id}`}
                              checked={isSelected}
                              onChange={() =>
                                group.type === 'radio'
                                  ? toggleRadio(group, option)
                                  : toggleCheckbox(group, option)
                              }
                              className="accent-orange-500"
                            />
                            <span className="flex-1 text-sm" style={{ color: 'var(--text-primary, #111)' }}>
                              {optName}
                            </span>
                            {extraPrice > 0 && (
                              <span className="text-sm font-medium" style={{ color: 'var(--accent, #6c47ff)' }}>
                                +{formatDT(extraPrice, lang)}
                              </span>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Note */}
              <div>
                <div className="flex items-start gap-3 mb-2">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: 'var(--card-border)' }}
                  >
                    <FileText size={16} style={{ color: 'var(--text-secondary, #6b7280)' }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary, #111)' }}>
                      {t('cart.note')}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary, #9ca3af)' }}>
                      {t('cart.note_subtitle')}
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value.slice(0, NOTE_MAX))}
                    placeholder={t('cart.note_placeholder')}
                    rows={2}
                    maxLength={NOTE_MAX}
                    className="w-full px-3 py-2.5 pb-5 text-sm rounded-xl border resize-none focus:outline-none focus:ring-2"
                    style={{
                      borderColor: 'var(--card-border, #e5e7eb)',
                      backgroundColor: 'var(--card-bg, white)',
                      color: 'var(--text-primary, #111)',
                    }}
                  />
                  <span
                    className="absolute bottom-1.5 end-2.5 text-[10px]"
                    style={{ color: 'var(--text-secondary, #9ca3af)' }}
                  >
                    {note.length}/{NOTE_MAX}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            className="shrink-0 p-4 border-t"
            style={{ borderColor: 'var(--card-border, #e5e7eb)', backgroundColor: 'var(--bg-primary, white)' }}
          >
            {canOrder ? (
              <div className="flex items-center gap-3">
                {/* Quantity stepper */}
                <div
                  className="flex items-center gap-1 rounded-full border px-1.5 py-1.5 shrink-0"
                  style={{ borderColor: 'var(--card-border, #e5e7eb)' }}
                >
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--card-border)]"
                    style={{ color: 'var(--text-primary, #111)' }}
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-6 text-center text-sm font-bold" style={{ color: 'var(--text-primary, #111)' }}>
                    {String(quantity).padStart(2, '0')}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--card-border)]"
                    style={{ color: 'var(--text-primary, #111)' }}
                  >
                    <Plus size={14} />
                  </button>
                </div>
                {/* Add to cart */}
                <button
                  type="button"
                  onClick={handleAdd}
                  className="flex-1 py-3.5 rounded-full text-white text-sm font-bold transition-opacity hover:opacity-90"
                  style={{ backgroundColor: 'var(--accent, #6c47ff)' }}
                >
                  {t('cart.add')} — {formatDT(grandTotal, lang)}
                </button>
              </div>
            ) : (
              <div
                className="flex items-center justify-center gap-2.5 py-3.5 rounded-2xl border-2 border-dashed text-sm font-medium"
                style={{ borderColor: 'var(--card-border, #e5e7eb)', color: 'var(--text-secondary, #9ca3af)' }}
              >
                <span className="text-lg">📷</span>
                <span>Scannez le QR code de votre table pour commander</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
