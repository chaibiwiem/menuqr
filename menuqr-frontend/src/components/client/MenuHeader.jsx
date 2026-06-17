import { useTranslation } from 'react-i18next';
import { Bell, ShoppingBag } from 'lucide-react';
import useCart from '../../hooks/useCart';

const LANG_FLAGS = { fr: '🇫🇷', en: '🇬🇧', it: '🇮🇹', ar: '🇹🇳' };
const LANGS = ['fr', 'en', 'it', 'ar'];

function SocialLink({ href, icon, label }) {
  if (!href) return null;
  const url = href.startsWith('http') ? href : `https://${href}`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 transition-colors"
      title={label}
    >
      {icon}
    </a>
  );
}

const socialIcons = {
  facebook: (
    <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
  ),
  instagram: (
    <svg className="w-4 h-4 fill-none stroke-white stroke-2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
  ),
  whatsapp: (
    <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
  ),
  website: (
    <svg className="w-4 h-4 fill-none stroke-white stroke-2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
  ),
  tripadvisor: (
    <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1.05 14.4c-.77.77-2.03.77-2.8 0s-.77-2.03 0-2.8 2.03-.77 2.8 0 .77 2.03 0 2.8zm0-5.6c-.77.77-2.03.77-2.8 0s-.77-2.03 0-2.8 2.03-.77 2.8 0 .77 2.03 0 2.8zm5.6 5.6c-.77.77-2.03.77-2.8 0s-.77-2.03 0-2.8 2.03-.77 2.8 0 .77 2.03 0 2.8zm0-5.6c-.77.77-2.03.77-2.8 0s-.77-2.03 0-2.8 2.03-.77 2.8 0 .77 2.03 0 2.8z"/></svg>
  ),
  maps: (
    <svg className="w-4 h-4 fill-none stroke-white stroke-2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
  ),
};

export default function MenuHeader({ restaurant, table, onOpenCart, onOpenCallWaiter, cooldown = 0 }) {
  const { t, i18n } = useTranslation();
  const { items } = useCart();
  const cartCount = items.reduce((acc, i) => acc + i.quantity, 0);
  const enabledLangs = Array.isArray(restaurant?.menu_languages) && restaurant.menu_languages.length > 0
    ? LANGS.filter((l) => restaurant.menu_languages.includes(l))
    : LANGS;

  function changeLanguage(l) {
    i18n.changeLanguage(l);
    document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = l;
  }

  const today = new Date().getDay();
  const todayHoraire = (restaurant?.horaires || []).find((h) => h.day_of_week === today);

  const hasSocial = !!(
    restaurant?.social_facebook || restaurant?.social_instagram ||
    restaurant?.social_whatsapp || restaurant?.social_website ||
    restaurant?.social_tripadvisor || restaurant?.social_google_maps
  );

  return (
    <header>
      {/* ── Banner with everything overlaid ── */}
      <div className="relative h-56 md:h-64 overflow-hidden">

        {/* Background image */}
        {restaurant?.banner_url ? (
          <img
            src={restaurant.banner_url}
            alt={restaurant.name}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full" style={{ backgroundColor: 'var(--bg-secondary, #d1d5db)' }} />
        )}

        {/* Strong gradient at bottom for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />

        {/* ── Action icons — top left ── */}
        <div className="absolute top-3 start-3 flex gap-1.5 z-10">

          {/* Call waiter bell — only if table assigned */}
          {table && onOpenCallWaiter && (
            <button
              type="button"
              onClick={onOpenCallWaiter}
              disabled={cooldown > 0}
              className="relative flex items-center justify-center w-9 h-9 rounded-full bg-black/35 hover:bg-black/55 disabled:opacity-60 transition-colors"
              title={cooldown > 0 ? `${cooldown}s` : t('client.call_waiter')}
            >
              {cooldown > 0
                ? <span className="text-[10px] font-bold text-white">{cooldown}s</span>
                : <Bell size={17} className="text-white" />
              }
            </button>
          )}

          {/* Cart icon */}
          <button
            type="button"
            onClick={onOpenCart}
            className="relative flex items-center justify-center w-9 h-9 rounded-full bg-black/35 hover:bg-black/55 transition-colors"
            title={t('cart.title')}
          >
            <ShoppingBag size={17} className="text-white" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-0.5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center leading-none">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {/* Language switcher — top right */}
        <div className="absolute top-3 end-3 flex gap-1.5">
          {enabledLangs.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => changeLanguage(l)}
              className="flex items-center justify-center transition-all"
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: '0.02em',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                backgroundColor: i18n.language === l ? 'var(--accent, #6c47ff)' : 'rgba(255,255,255,0.85)',
                color: i18n.language === l ? '#fff' : '#111',
                boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                border: i18n.language === l ? '2px solid transparent' : '1.5px solid rgba(0,0,0,0.08)',
              }}
              title={l.toUpperCase()}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Bottom overlay: logo + info + social */}
        <div className="absolute bottom-0 inset-x-0 px-4 pb-4 flex items-end justify-between gap-3">

          {/* Left: logo + text info */}
          <div className="flex items-end gap-3 min-w-0 flex-1">
            {restaurant?.logo_url && (
              <img
                src={restaurant.logo_url}
                alt="logo"
                className="w-14 h-14 rounded-2xl object-cover border-2 border-white/80 shadow-lg shrink-0"
              />
            )}

            <div className="min-w-0">
              {/* Name */}
              <h1 className="text-white text-lg font-bold leading-tight drop-shadow-sm">
                {restaurant?.name}
              </h1>

              {/* Description */}
              {restaurant?.short_description && (
                <p className="text-white/75 text-xs mt-0.5 line-clamp-1">
                  {restaurant.short_description}
                </p>
              )}

              {/* Hours · Address · Phone */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1.5">
                {todayHoraire && (
                  <span className="flex items-center gap-1 text-white/80 text-xs">
                    <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                    </svg>
                    {todayHoraire.is_closed
                      ? t('client.closed_today', { defaultValue: 'Fermé' })
                      : `${todayHoraire.open_time?.slice(0, 5)} - ${todayHoraire.close_time?.slice(0, 5)}`}
                  </span>
                )}

                {restaurant?.address && (
                  <span className="flex items-center gap-1 text-white/80 text-xs">
                    <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                    <span className="truncate max-w-[120px]">{restaurant.address}</span>
                  </span>
                )}

                {restaurant?.phone && (
                  <span className="flex items-center gap-1 text-white/80 text-xs">
                    <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.13 6.13l.95-.95a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                    {restaurant.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: social icons */}
          {hasSocial && (
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <div className="flex gap-1.5">
                <SocialLink href={restaurant.social_facebook}    icon={socialIcons.facebook}    label="Facebook" />
                <SocialLink href={restaurant.social_instagram}   icon={socialIcons.instagram}   label="Instagram" />
                <SocialLink href={restaurant.social_whatsapp}    icon={socialIcons.whatsapp}    label="WhatsApp" />
              </div>
              <div className="flex gap-1.5">
                <SocialLink href={restaurant.social_website}     icon={socialIcons.website}     label="Site web" />
                <SocialLink href={restaurant.social_tripadvisor} icon={socialIcons.tripadvisor} label="TripAdvisor" />
                <SocialLink href={restaurant.social_google_maps} icon={socialIcons.maps}        label="Google Maps" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Table indicator */}
      {table && (
        <div
          className="flex items-center justify-center gap-2 py-2 text-sm font-semibold"
          style={{ backgroundColor: 'var(--bg-secondary, #f9fafb)', color: 'var(--text-primary, #111)' }}
        >
          <span>🪑</span>
          <span>{t('client.table_number', { name: table.name || table.number })}</span>
        </div>
      )}

    </header>
  );
}
