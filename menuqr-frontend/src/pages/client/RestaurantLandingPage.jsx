import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Loader2, ChefHat, CalendarCheck2, Phone, MapPin } from 'lucide-react';
import api from '../../api/axios';

const LANG_FLAGS = { fr: '🇫🇷', en: '🇬🇧', it: '🇮🇹', ar: '🇹🇳' };
const LANGS = ['fr', 'en', 'it', 'ar'];

function applyTheme(restaurant) {
  if (!restaurant) return;
  const { template_id, custom_colors, custom_font } = restaurant;

  if (template_id) document.documentElement.setAttribute('data-template', template_id);

  const styleId = 'menuqr-custom-theme';
  let styleTag = document.getElementById(styleId);
  if (!styleTag) {
    styleTag = document.createElement('style');
    styleTag.id = styleId;
    document.head.appendChild(styleTag);
  }

  const rules = [];
  if (custom_colors && typeof custom_colors === 'object') {
    Object.entries(custom_colors).forEach(([k, v]) => { if (v) rules.push(`--${k}: ${v};`); });
  }
  if (custom_font) rules.push(`--font-family: '${custom_font}', sans-serif;`);
  styleTag.textContent = rules.length ? `html[data-template] { ${rules.join(' ')} }` : '';

  if (custom_font) {
    const fontId = `gfont-${custom_font.replace(/\s+/g, '-')}`;
    if (!document.getElementById(fontId)) {
      const link = document.createElement('link');
      link.id = fontId; link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(custom_font)}:wght@400;500;600;700;800&display=swap`;
      document.head.appendChild(link);
    }
  }
}

export default function RestaurantLandingPage() {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const lang = ['fr', 'en', 'it', 'ar'].includes(i18n.language) ? i18n.language : 'fr';
  const enabledLangs = LANGS;

  const { data: restaurant, isLoading, isError } = useQuery({
    queryKey: ['public-restaurant-info', slug],
    queryFn: () => api.get(`/public/${slug}`).then((r) => r.data.data),
    staleTime: 0,
  });

  useEffect(() => {
    if (restaurant) applyTheme(restaurant);
    return () => {
      document.documentElement.removeAttribute('data-template');
      const tag = document.getElementById('menuqr-custom-theme');
      if (tag) tag.textContent = '';
    };
  }, [restaurant]);

  function changeLanguage(l) {
    i18n.changeLanguage(l);
    document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = l;
  }

  if (isLoading) {
    return (
      <div className="min-h-svh flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary, #f9fafb)' }}>
        <Loader2 size={28} className="animate-spin text-orange-400" />
      </div>
    );
  }

  if (isError || !restaurant) {
    return (
      <div className="min-h-svh flex flex-col items-center justify-center gap-3 px-4" style={{ backgroundColor: 'var(--bg-primary, #f9fafb)' }}>
        <div className="text-4xl">🍽️</div>
        <p className="text-sm font-medium" style={{ color: 'var(--text-secondary, #6b7280)' }}>
          Restaurant introuvable
        </p>
      </div>
    );
  }

  const isRTL = lang === 'ar';

  return (
    <div
      className="min-h-svh flex flex-col"
      style={{ backgroundColor: 'var(--bg-primary, #f9fafb)' }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Language switcher */}
      <div className="absolute top-3 end-3 z-20 flex gap-1.5">
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

      {/* Hero banner */}
      <div className="relative h-56 overflow-hidden shrink-0">
        {restaurant.banner_url ? (
          <img src={restaurant.banner_url} alt={restaurant.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full" style={{ backgroundColor: 'var(--accent, #6c47ff)', opacity: 0.15 }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
      </div>

      {/* Restaurant card — overlaps the banner */}
      <div className="flex-1 flex flex-col items-center px-4 -mt-16 relative z-10">

        {/* Logo + info */}
        <div
          className="w-full max-w-sm rounded-3xl shadow-xl border p-5 flex flex-col items-center text-center gap-3"
          style={{ backgroundColor: 'var(--card-bg, white)', borderColor: 'var(--card-border, #e5e7eb)' }}
        >
          {restaurant.logo_url && (
            <img
              src={restaurant.logo_url}
              alt="logo"
              className="w-20 h-20 rounded-2xl object-cover border-4 shadow-md -mt-14"
              style={{ borderColor: 'var(--card-bg, white)' }}
            />
          )}

          <div>
            <h1 className="text-xl font-bold leading-tight" style={{ color: 'var(--text-primary, #111)' }}>
              {restaurant.name}
            </h1>
            {restaurant.short_description && (
              <p className="text-sm mt-1 leading-relaxed" style={{ color: 'var(--text-secondary, #6b7280)' }}>
                {restaurant.short_description}
              </p>
            )}
          </div>

          {(restaurant.phone || restaurant.address) && (
            <div className="flex flex-col items-center gap-1.5 text-xs" style={{ color: 'var(--text-secondary, #6b7280)' }}>
              {restaurant.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone size={15} style={{ color: 'var(--accent, #6c47ff)' }} />
                  {restaurant.phone}
                </span>
              )}
              {restaurant.address && (
                <span className="flex items-center gap-1.5">
                  <MapPin size={15} style={{ color: 'var(--accent, #6c47ff)' }} />
                  {restaurant.address}
                </span>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="w-full mt-1 flex flex-col gap-3">
            {/* View menu */}
            <Link
              to={`/${slug}/menu`}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-sm font-bold transition-opacity hover:opacity-90"
              style={{ backgroundColor: 'var(--accent, #6c47ff)', color: '#fff' }}
            >
              <ChefHat size={22} />
              {t('client.view_menu', { defaultValue: 'Voir le menu' })}
            </Link>

            {/* Reserve — only if module active */}
            {restaurant.reservations_active && (
              <Link
                to={`/${slug}/reservation`}
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-sm font-bold border-2 transition-colors hover:opacity-90"
                style={{
                  borderColor: 'var(--accent, #6c47ff)',
                  color: 'var(--accent, #6c47ff)',
                  backgroundColor: 'transparent',
                }}
              >
                <CalendarCheck2 size={22} />
                {t('reservation.cta_button', { defaultValue: 'Réserver une table' })}
              </Link>
            )}
          </div>
        </div>

      </div>

      {/* Copyright footer — pinned to bottom */}
      <div className="py-4 px-4 text-center mt-auto">
        <p className="text-[11px]" style={{ color: 'var(--text-secondary, #9ca3af)' }}>
          Copyright © 2026{' '}
          <a
            href="https://www.hannibaladvanced.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold hover:underline"
            style={{ color: 'var(--accent, #6c47ff)' }}
          >
            Hannibal Advanced
          </a>
          . All Rights Reserved.
        </p>
      </div>
    </div>
  );
}
