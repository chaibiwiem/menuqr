import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { formatDT, getEffectivePrice, isHappyHour, isPromoActive } from '../../utils/currency';

export default function DishCard({ item, template, index, onOpen }) {
  const { t, i18n } = useTranslation();
  const lang = ['fr', 'en', 'it', 'ar'].includes(i18n.language) ? i18n.language : 'fr';

  const name = item[`name_${lang}`] || item.name_fr;
  const desc = item[`description_${lang}`] || item.description_fr || '';
  const price = getEffectivePrice(item);
  const happyHour = isHappyHour(item);
  const promoActive = isPromoActive(item);
  const showStrikethrough = promoActive || happyHour;
  const unavailable = !item.is_available;
  const isDarkSleek = template === 'dark_sleek';
  const isClassic = template === 'classic_theme';
  const isEditorial = template === 'editorial_menu';
  const isModern = template === 'modern_theme';
  const isBento = template === 'bento_menu';
  const isAurora = template === 'aurora_glass';

  if (isClassic) {
    return (
      <article
        onClick={() => !unavailable && onOpen(item)}
        role={unavailable ? 'presentation' : 'button'}
        tabIndex={unavailable ? -1 : 0}
        onKeyDown={(e) => e.key === 'Enter' && !unavailable && onOpen(item)}
        className={`overflow-hidden rounded-2xl select-none transition-all
          ${unavailable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-[0.98]'}`}
        style={{
          backgroundColor: 'var(--card-bg, #fff)',
          border: '1px solid var(--card-border, #efefef)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        }}
      >
        {/* Full-width image */}
        <div
          className="relative w-full overflow-hidden"
          style={{ aspectRatio: '16/9', backgroundColor: 'var(--bg-secondary, #f5f5f5)' }}
        >
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={name}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl opacity-20">
              🍽
            </div>
          )}
        </div>

        {/* Info row */}
        <div className="px-4 py-3">
          <div className="flex items-start gap-2 justify-between">
            <div className="flex-1 min-w-0">
              <h3
                className="text-sm font-bold leading-snug line-clamp-1"
                style={{ color: 'var(--text-primary, #1a1a1a)' }}
              >
                {name}
              </h3>
              {desc && (
                <p
                  className="text-xs mt-0.5 line-clamp-2"
                  style={{ color: 'var(--text-secondary, #9ca3af)' }}
                >
                  {desc}
                </p>
              )}
              {promoActive && (
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <span className="inline-flex items-center text-xs font-semibold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600">
                    🏷 {item.promo_label || t('menu.promo_badge')}
                  </span>
                </div>
              )}
            </div>

            <div className="shrink-0 flex flex-col items-end gap-1.5">
              <div className="flex flex-col items-end gap-0.5">
                <span className="text-sm font-extrabold" style={{ color: 'var(--text-primary, #1a1a1a)' }}>
                  {formatDT(price, lang)}
                </span>
                {showStrikethrough && (
                  <span className="text-xs line-through" style={{ color: 'var(--text-secondary, #9ca3af)' }}>
                    {formatDT(parseFloat(item.price), lang)}
                  </span>
                )}
                {item.is_featured && (
                  <span className="flex items-center gap-0.5 text-xs font-semibold" style={{ color: 'var(--accent, #FF6B35)' }}>
                    ⭐ {t('menu.popular')}
                  </span>
                )}
              </div>
              {!unavailable && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onOpen(item); }}
                  className="px-5 py-1.5 rounded-full text-white text-xs font-semibold whitespace-nowrap transition-opacity hover:opacity-85 active:scale-95"
                  style={{ backgroundColor: 'var(--accent, #FF6B35)' }}
                  aria-label={t('cart.add')}
                >
                  {t('cart.add')}
                </button>
              )}
            </div>
          </div>

          {unavailable && (
            <span className="mt-1.5 inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">
              {t('menu.unavailable')}
            </span>
          )}
        </div>
      </article>
    );
  }

  if (isModern) {
    return (
      <article
        onClick={() => !unavailable && onOpen(item)}
        role={unavailable ? 'presentation' : 'button'}
        tabIndex={unavailable ? -1 : 0}
        onKeyDown={(e) => e.key === 'Enter' && !unavailable && onOpen(item)}
        className={`flex items-start gap-4 p-3 rounded-2xl select-none transition-all
          ${unavailable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-[0.99]'}`}
        style={{
          backgroundColor: 'var(--card-bg, #fff)',
          boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
        }}
      >
        {/* Image — LEFT */}
        <div
          className="relative shrink-0 w-20 h-20 rounded-xl overflow-hidden"
          style={{ backgroundColor: 'var(--bg-primary, #f7f7f7)' }}
        >
          {item.image_url ? (
            <img src={item.image_url} alt={name} loading="lazy" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl opacity-20">🍽</div>
          )}
        </div>

        {/* Text — CENTER */}
        <div className="flex-1 min-w-0">
          <h3
            className="text-sm font-bold leading-snug line-clamp-2"
            style={{ color: 'var(--text-primary, #1a1a1a)' }}
          >
            {name}
          </h3>
          {desc && (
            <p
              className="text-xs mt-0.5 line-clamp-2 leading-relaxed"
              style={{ color: 'var(--text-secondary, #9ca3af)' }}
            >
              {desc}
            </p>
          )}
          {promoActive && (
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="inline-flex items-center text-xs font-semibold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600">
                🏷 {item.promo_label || t('menu.promo_badge')}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-sm font-extrabold" style={{ color: 'var(--text-primary, #1a1a1a)' }}>
              {formatDT(price, lang)}
            </span>
            {showStrikethrough && (
              <span className="text-xs line-through" style={{ color: 'var(--text-secondary, #9ca3af)' }}>
                {formatDT(parseFloat(item.price), lang)}
              </span>
            )}
            {unavailable && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">
                {t('menu.unavailable')}
              </span>
            )}
          </div>
        </div>

        {/* "+" outline button — RIGHT */}
        {!unavailable && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onOpen(item); }}
            className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors hover:bg-gray-50 active:scale-90"
            style={{ borderColor: 'var(--text-secondary, #9ca3af)', color: 'var(--text-secondary, #9ca3af)' }}
            aria-label={t('cart.add')}
          >
            <Plus size={14} strokeWidth={2.5} />
          </button>
        )}
      </article>
    );
  }

  if (isEditorial) {
    return (
      <article
        onClick={() => !unavailable && onOpen(item)}
        role={unavailable ? 'presentation' : 'button'}
        tabIndex={unavailable ? -1 : 0}
        onKeyDown={(e) => e.key === 'Enter' && !unavailable && onOpen(item)}
        className={`flex gap-4 p-4 rounded-2xl select-none transition-all
          ${unavailable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-[0.99]'}`}
        style={{
          backgroundColor: 'var(--card-bg, #fff)',
          boxShadow: '0 1px 10px rgba(0,0,0,0.07)',
        }}
      >
        {/* Image — LEFT */}
        <div
          className="relative shrink-0 w-28 h-28 rounded-2xl overflow-hidden"
          style={{ backgroundColor: 'var(--bg-secondary, #F2EFE8)' }}
        >
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={name}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">🍽</div>
          )}
        </div>

        {/* Text — RIGHT */}
        <div className="flex-1 min-w-0 flex flex-col">
          <h3
            className="text-sm font-bold leading-snug line-clamp-2"
            style={{ color: 'var(--text-primary, #1a1a1a)' }}
          >
            {name}
          </h3>

          {desc && (
            <p
              className="text-xs mt-1 line-clamp-3 leading-relaxed"
              style={{ color: 'var(--text-secondary, #6b6b6b)' }}
            >
              {desc}
            </p>
          )}

          {promoActive && (
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <span className="inline-flex items-center text-xs font-semibold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600">
                🏷 {item.promo_label || t('menu.promo_badge')}
              </span>
            </div>
          )}

          <div className="mt-auto pt-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold" style={{ color: 'var(--text-primary, #1a1a1a)' }}>
                {formatDT(price, lang)}
              </span>
              {showStrikethrough && (
                <span className="text-xs line-through" style={{ color: 'var(--text-secondary, #6b6b6b)' }}>
                  {formatDT(parseFloat(item.price), lang)}
                </span>
              )}
              {unavailable && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">
                  {t('menu.unavailable')}
                </span>
              )}
            </div>
            {!unavailable && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onOpen(item); }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow transition-opacity hover:opacity-80 shrink-0"
                style={{ backgroundColor: 'var(--accent, #1a1a1a)' }}
                aria-label={t('cart.add')}
              >
                <Plus size={15} strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>
      </article>
    );
  }

  if (isDarkSleek || isAurora) {
    const imgSize = isAurora ? 'w-32 h-32' : 'w-24 h-24';
    return (
      <article
        onClick={() => !unavailable && onOpen(item)}
        role={unavailable ? 'presentation' : 'button'}
        tabIndex={unavailable ? -1 : 0}
        onKeyDown={(e) => e.key === 'Enter' && !unavailable && onOpen(item)}
        className={`relative flex gap-3 p-3 rounded-2xl overflow-hidden select-none
          transition-all active:scale-[0.98]
          ${unavailable ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:brightness-110'}`}
        style={{
          backgroundColor: 'var(--card-bg, #1E1E1F)',
          border: '1px solid var(--card-border, #2A2A2B)',
        }}
      >
        {/* Image — LEFT, square */}
        <div
          className={`relative shrink-0 ${imgSize} rounded-xl overflow-hidden`}
          style={{ backgroundColor: 'var(--bg-secondary, #1A1A1B)' }}
        >
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={name}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl opacity-30">
              🍽
            </div>
          )}
        </div>

        {/* Text — RIGHT */}
        <div className="flex-1 min-w-0 flex flex-col py-0.5">
          <div className="flex items-start justify-between gap-1">
            <h3
              className="text-sm font-bold leading-snug line-clamp-2"
              style={{ color: 'var(--text-primary, #F5F5F5)' }}
            >
              {name}
            </h3>
            {item.is_featured && (
              <span
                className="shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: 'var(--accent, #FF5C35)', color: '#fff', opacity: 0.9 }}
              >
                {t('menu.popular')}
              </span>
            )}
          </div>

          {desc && (
            <p
              className="text-xs mt-1 line-clamp-2 leading-relaxed"
              style={{ color: 'var(--text-secondary, #A0A0A0)' }}
            >
              {desc}
            </p>
          )}

          {promoActive && (
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <span className="inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400">
                🏷 {item.promo_label || t('menu.promo_badge')}
              </span>
            </div>
          )}

          <div className="mt-auto pt-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="text-base font-extrabold"
                style={{ color: 'var(--accent, #FF5C35)' }}
              >
                {formatDT(price, lang)}
              </span>
              {showStrikethrough && (
                <span
                  className="text-xs line-through opacity-50"
                  style={{ color: 'var(--text-secondary, #A0A0A0)' }}
                >
                  {formatDT(parseFloat(item.price), lang)}
                </span>
              )}
            </div>
            {unavailable ? (
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: '#2A2A2B', color: '#A0A0A0' }}
              >
                {t('menu.unavailable')}
              </span>
            ) : (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onOpen(item); }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-lg transition-transform active:scale-90"
                style={{ backgroundColor: 'var(--accent, #FF5C35)' }}
                aria-label={t('cart.add')}
              >
                <Plus size={15} strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>
      </article>
    );
  }

  if (isBento) {
    return (
      <article
        onClick={() => !unavailable && onOpen(item)}
        role={unavailable ? 'presentation' : 'button'}
        tabIndex={unavailable ? -1 : 0}
        onKeyDown={(e) => e.key === 'Enter' && !unavailable && onOpen(item)}
        className={`overflow-hidden rounded-2xl flex flex-col select-none transition-all
          ${unavailable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-[0.97]'}`}
        style={{
          backgroundColor: 'var(--card-bg, #fff)',
          boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        }}
      >
        {/* Image — top, square */}
        <div
          className="relative w-full overflow-hidden shrink-0"
          style={{ aspectRatio: '1/1', backgroundColor: 'var(--bg-primary, #f5f5f5)' }}
        >
          {item.image_url ? (
            <img src={item.image_url} alt={name} loading="lazy" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">🍽</div>
          )}
          {unavailable && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <span className="text-white text-xs font-semibold px-2 py-1 rounded-full bg-black/50">
                {t('menu.unavailable')}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-2.5 flex flex-col flex-1">
          <h3
            className="text-xs font-bold leading-snug line-clamp-2"
            style={{ color: 'var(--text-primary, #1a1a1a)' }}
          >
            {name}
          </h3>

          {desc && (
            <p
              className="text-[11px] mt-0.5 line-clamp-2 leading-relaxed"
              style={{ color: 'var(--text-secondary, #9ca3af)' }}
            >
              {desc}
            </p>
          )}

          {/* Meta row */}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {item.is_featured && (
              <span className="text-[11px] font-semibold" style={{ color: '#F59E0B' }}>
                ⭐ {t('menu.popular')}
              </span>
            )}
            {promoActive && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600">
                🏷 {item.promo_label || t('menu.promo_badge')}
              </span>
            )}
          </div>

          {/* Price + add */}
          <div className="mt-auto pt-2 flex items-center justify-between gap-1">
            <div>
              <span className="text-sm font-extrabold" style={{ color: 'var(--text-primary, #1a1a1a)' }}>
                {formatDT(price, lang)}
              </span>
              {showStrikethrough && (
                <span className="block text-[10px] line-through" style={{ color: 'var(--text-secondary, #9ca3af)' }}>
                  {formatDT(parseFloat(item.price), lang)}
                </span>
              )}
            </div>
            {!unavailable && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onOpen(item); }}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-sm transition-transform active:scale-90"
                style={{ backgroundColor: 'var(--accent, #22C55E)' }}
                aria-label={t('cart.add')}
              >
                <Plus size={16} strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>
      </article>
    );
  }

  // Default layout (all other templates) — image RIGHT
  return (
    <article
      onClick={() => !unavailable && onOpen(item)}
      role={unavailable ? 'presentation' : 'button'}
      tabIndex={unavailable ? -1 : 0}
      onKeyDown={(e) => e.key === 'Enter' && !unavailable && onOpen(item)}
      className={`relative flex gap-3 p-3 rounded-2xl border cursor-pointer select-none
        transition-transform active:scale-98
        ${unavailable ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}`}
      style={{
        backgroundColor: 'var(--card-bg, white)',
        borderColor: 'var(--card-border, #e5e7eb)',
      }}
    >
      {/* Text */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-start gap-1.5 flex-wrap">
          <h3 className="text-sm font-semibold leading-snug" style={{ color: 'var(--text-primary, #111)' }}>
            {name}
          </h3>
          {item.is_featured && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 shrink-0">
              {t('menu.popular')}
            </span>
          )}
          {unavailable && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 shrink-0">
              {t('menu.unavailable')}
            </span>
          )}
        </div>

        {desc && (
          <p className="text-xs mt-1 line-clamp-2 leading-relaxed" style={{ color: 'var(--text-secondary, #6b7280)' }}>
            {desc}
          </p>
        )}

        {promoActive && (
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <span className="inline-flex items-center text-xs font-semibold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600">
              🏷 {item.promo_label || t('menu.promo_badge')}
            </span>
          </div>
        )}

        <div className="mt-auto pt-2 flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold" style={{ color: 'var(--accent, #6c47ff)' }}>
              {formatDT(price, lang)}
            </span>
            {showStrikethrough && (
              <span className="text-xs line-through" style={{ color: 'var(--text-secondary, #9ca3af)' }}>
                {formatDT(parseFloat(item.price), lang)}
              </span>
            )}
            {happyHour && !promoActive && (
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                Happy Hour
              </span>
            )}
          </div>
          {!unavailable && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onOpen(item); }}
              className="w-7 h-7 rounded-full flex items-center justify-center text-white shadow transition-opacity hover:opacity-80"
              style={{ backgroundColor: 'var(--accent, #6c47ff)' }}
              aria-label={t('cart.add')}
            >
              <Plus size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Image — RIGHT */}
      {item.image_url && (
        <div className="relative shrink-0 w-20 h-20 rounded-xl overflow-hidden">
          <img
            src={item.image_url}
            alt={name}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </article>
  );
}
