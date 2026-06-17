import { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';

export default function CategoryNav({ categories, activeCatId, onChange, template, searchQuery, onSearch }) {
  const { i18n, t } = useTranslation();
  const navRef = useRef(null);
  const lang = ['fr', 'en', 'it', 'ar'].includes(i18n.language) ? i18n.language : 'fr';

  const scrollLeft  = () => navRef.current?.scrollBy({ left: -160, behavior: 'smooth' });
  const scrollRight = () => navRef.current?.scrollBy({ left: 160,  behavior: 'smooth' });

  useEffect(() => {
    if (!activeCatId || !navRef.current) return;
    const pill = navRef.current.querySelector(`[data-cat="${activeCatId}"]`);
    if (pill) pill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [activeCatId]);

  if (!categories || categories.length === 0) return null;

  // ── Aurora Glass ────────────────────────────────────────────────────────────
  if (template === 'aurora_glass') {
    return (
      <div className="sticky top-0 z-30" style={{ backgroundColor: 'var(--bg-primary, #0D1B2A)' }}>
        <div className="px-4 pt-3 pb-0" style={{ marginBottom: '10px' }}>
          <span className="text-sm font-bold tracking-wide" style={{ color: 'var(--text-primary, #F5F5F5)' }}>
            {t('menu.categories', { defaultValue: 'Catégories' })}
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-3 pb-3">
          <button type="button" onClick={scrollLeft} aria-label="Défiler à gauche"
            className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-base transition-opacity hover:opacity-70"
            style={{ backgroundColor: 'var(--card-bg, #152840)', color: 'var(--text-secondary, #8DA4BC)' }}>
            ‹
          </button>
          <nav ref={navRef} className="flex-1 overflow-x-auto scrollbar-hide flex gap-2">
            <button type="button" onClick={() => onChange(null)}
              className="shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all"
              style={!activeCatId
                ? { backgroundColor: 'var(--accent, #2DD4BF)', color: '#0D1B2A' }
                : { backgroundColor: 'transparent', color: 'var(--text-secondary, #8DA4BC)', border: '1px solid var(--card-border, #1E3550)' }}>
              {t('common.all', { defaultValue: 'Tous' })}
            </button>
            {categories.map((cat) => {
              const name = cat[`name_${lang}`] || cat.name_fr;
              const isActive = activeCatId === cat.id;
              return (
                <button key={cat.id} type="button" data-cat={cat.id} onClick={() => onChange(cat.id)}
                  className="shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all"
                  style={isActive
                    ? { backgroundColor: 'var(--accent, #2DD4BF)', color: '#0D1B2A' }
                    : { backgroundColor: 'transparent', color: 'var(--text-secondary, #8DA4BC)', border: '1px solid var(--card-border, #1E3550)' }}>
                  {name}
                </button>
              );
            })}
          </nav>
          <button type="button" onClick={scrollRight} aria-label="Défiler à droite"
            className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-base transition-opacity hover:opacity-70"
            style={{ backgroundColor: 'var(--card-bg, #152840)', color: 'var(--text-secondary, #8DA4BC)' }}>
            ›
          </button>
        </div>
      </div>
    );
  }

  // ── Bento ───────────────────────────────────────────────────────────────────
  if (template === 'bento_menu') {
    return (
      <div
        className="sticky top-0 z-30 flex items-center gap-1.5 px-3 py-3 border-b"
        style={{ backgroundColor: 'var(--bg-secondary, #fff)', borderColor: 'var(--card-border, #efefef)' }}
      >
        <button type="button" onClick={scrollLeft} aria-label="Défiler à gauche"
          className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-base transition-opacity hover:opacity-70"
          style={{ backgroundColor: 'var(--bg-primary, #f5f5f5)', color: 'var(--text-secondary, #9ca3af)' }}>
          ‹
        </button>
        <nav ref={navRef} className="flex-1 overflow-x-auto scrollbar-hide flex gap-5">
          <button type="button" onClick={() => onChange(null)}
            className="shrink-0 text-sm font-semibold whitespace-nowrap pb-1 transition-colors"
            style={!activeCatId
              ? { color: 'var(--accent, #22C55E)', borderBottom: '2px solid var(--accent, #22C55E)' }
              : { color: 'var(--text-secondary, #9ca3af)', borderBottom: '2px solid transparent' }}>
            {t('common.all', { defaultValue: 'Tous' })}
          </button>
          {categories.map((cat) => {
            const name = cat[`name_${lang}`] || cat.name_fr;
            const isActive = activeCatId === cat.id;
            return (
              <button key={cat.id} type="button" data-cat={cat.id} onClick={() => onChange(cat.id)}
                className="shrink-0 text-sm font-semibold whitespace-nowrap pb-1 transition-colors"
                style={isActive
                  ? { color: 'var(--accent, #22C55E)', borderBottom: '2px solid var(--accent, #22C55E)' }
                  : { color: 'var(--text-secondary, #9ca3af)', borderBottom: '2px solid transparent' }}>
                {name}
              </button>
            );
          })}
        </nav>
        <button type="button" onClick={scrollRight} aria-label="Défiler à droite"
          className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-base transition-opacity hover:opacity-70"
          style={{ backgroundColor: 'var(--bg-primary, #f5f5f5)', color: 'var(--text-secondary, #9ca3af)' }}>
          ›
        </button>
      </div>
    );
  }

  // ── Modern ──────────────────────────────────────────────────────────────────
  if (template === 'modern_theme') {
    return (
      <div className="sticky top-0 z-30" style={{ backgroundColor: 'var(--bg-primary, #f7f7f7)' }}>
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <span className="text-base font-extrabold" style={{ color: 'var(--text-primary, #1a1a1a)' }}>
            {t('menu.categories', { defaultValue: 'Catégories' })}
          </span>
          {activeCatId && (
            <button type="button" onClick={() => onChange(null)}
              className="text-sm font-semibold" style={{ color: 'var(--accent, #6C47FF)' }}>
              {t('common.see_all', { defaultValue: 'Voir tout' })}
            </button>
          )}
        </div>
        <div className="flex items-center gap-1.5 px-3 pb-3">
          <button type="button" onClick={scrollLeft} aria-label="Défiler à gauche"
            className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-base transition-opacity hover:opacity-70"
            style={{ backgroundColor: 'var(--card-bg, #fff)', color: 'var(--text-secondary, #9ca3af)', border: '1px solid var(--card-border, #efefef)' }}>
            ‹
          </button>
          <nav ref={navRef} className="flex-1 overflow-x-auto scrollbar-hide flex gap-2">
            {categories.map((cat) => {
              const name = cat[`name_${lang}`] || cat.name_fr;
              const isActive = activeCatId === cat.id;
              return (
                <button key={cat.id} type="button" data-cat={cat.id} onClick={() => onChange(cat.id)}
                  className="shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all"
                  style={isActive
                    ? { backgroundColor: 'var(--text-primary, #1a1a1a)', color: '#fff' }
                    : { backgroundColor: 'var(--card-bg, #fff)', color: 'var(--text-secondary, #9ca3af)', border: '1px solid var(--card-border, #efefef)' }}>
                  {name}
                </button>
              );
            })}
          </nav>
          <button type="button" onClick={scrollRight} aria-label="Défiler à droite"
            className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-base transition-opacity hover:opacity-70"
            style={{ backgroundColor: 'var(--card-bg, #fff)', color: 'var(--text-secondary, #9ca3af)', border: '1px solid var(--card-border, #efefef)' }}>
            ›
          </button>
        </div>
        <div className="px-4 pb-3 flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-2xl"
            style={{ backgroundColor: 'var(--card-bg, #fff)', border: '1px solid var(--card-border, #efefef)' }}>
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
              style={{ color: 'var(--text-secondary, #9ca3af)' }}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input type="text" value={searchQuery || ''} onChange={(e) => onSearch?.(e.target.value)}
              placeholder={t('menu.search_placeholder', { defaultValue: 'Rechercher...' })}
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: 'var(--text-primary, #1a1a1a)' }} />
            {searchQuery && (
              <button type="button" onClick={() => onSearch?.('')} className="text-gray-400 hover:text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            )}
          </div>
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: 'var(--card-bg, #fff)', border: '1px solid var(--card-border, #efefef)' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
              style={{ color: 'var(--text-secondary, #9ca3af)' }}>
              <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
            </svg>
          </div>
        </div>
      </div>
    );
  }

  // ── Editorial ───────────────────────────────────────────────────────────────
  if (template === 'editorial_menu') {
    return (
      <div
        className="sticky top-0 z-30 flex items-center gap-1.5 px-3 py-3"
        style={{ backgroundColor: 'var(--bg-primary, #F9F7F4)' }}
      >
        <button type="button" onClick={scrollLeft} aria-label="Défiler à gauche"
          className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-base transition-opacity hover:opacity-70"
          style={{ backgroundColor: 'var(--bg-secondary, #F2EFE8)', color: 'var(--text-secondary, #6b6b6b)' }}>
          ‹
        </button>
        <nav ref={navRef} className="flex-1 overflow-x-auto scrollbar-hide flex gap-2">
          <button type="button" onClick={() => onChange(null)}
            className="shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all"
            style={!activeCatId
              ? { backgroundColor: 'var(--text-primary, #1a1a1a)', color: '#fff' }
              : { backgroundColor: 'transparent', color: 'var(--text-secondary, #6b6b6b)', border: '1px solid var(--card-border, #e0ddd8)' }}>
            {t('common.all', { defaultValue: 'Tous' })}
          </button>
          {categories.map((cat) => {
            const name = cat[`name_${lang}`] || cat.name_fr;
            const isActive = activeCatId === cat.id;
            return (
              <button key={cat.id} type="button" data-cat={cat.id} onClick={() => onChange(cat.id)}
                className="shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all"
                style={isActive
                  ? { backgroundColor: 'var(--text-primary, #1a1a1a)', color: '#fff' }
                  : { backgroundColor: 'transparent', color: 'var(--text-secondary, #6b6b6b)', border: '1px solid var(--card-border, #e0ddd8)' }}>
                {name}
              </button>
            );
          })}
        </nav>
        <button type="button" onClick={scrollRight} aria-label="Défiler à droite"
          className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-base transition-opacity hover:opacity-70"
          style={{ backgroundColor: 'var(--bg-secondary, #F2EFE8)', color: 'var(--text-secondary, #6b6b6b)' }}>
          ›
        </button>
      </div>
    );
  }

  // ── Classic ─────────────────────────────────────────────────────────────────
  if (template === 'classic_theme') {
    return (
      <div
        className="sticky top-0 z-30 flex items-center gap-1.5 px-3 py-2.5 border-b"
        style={{ backgroundColor: 'var(--bg-primary, #f8f8f6)', borderColor: 'var(--card-border, #efefef)' }}
      >
        <button type="button" onClick={scrollLeft} aria-label="Défiler à gauche"
          className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-base transition-opacity hover:opacity-70"
          style={{ backgroundColor: 'var(--bg-secondary, #fff)', color: 'var(--text-secondary, #9ca3af)' }}>
          ‹
        </button>
        <nav ref={navRef} className="flex-1 overflow-x-auto scrollbar-hide flex gap-2">
          {categories.map((cat) => {
            const name = cat[`name_${lang}`] || cat.name_fr;
            const isActive = activeCatId === cat.id;
            return (
              <button key={cat.id} type="button" data-cat={cat.id} onClick={() => onChange(cat.id)}
                className="shrink-0 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all"
                style={isActive
                  ? { backgroundColor: 'var(--accent, #FF6B35)', color: '#fff' }
                  : { backgroundColor: 'transparent', color: 'var(--text-secondary, #9ca3af)' }}>
                {name}
              </button>
            );
          })}
        </nav>
        <button type="button" onClick={scrollRight} aria-label="Défiler à droite"
          className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-base transition-opacity hover:opacity-70"
          style={{ backgroundColor: 'var(--bg-secondary, #fff)', color: 'var(--text-secondary, #9ca3af)' }}>
          ›
        </button>
      </div>
    );
  }

  // ── Default ─────────────────────────────────────────────────────────────────
  return (
    <div
      className="sticky top-0 z-30 flex items-center gap-1.5 px-3 py-2 border-b"
      style={{ backgroundColor: 'var(--bg-primary, white)', borderColor: 'var(--card-border, #e5e7eb)' }}
    >
      <button type="button" onClick={scrollLeft} aria-label="Défiler à gauche"
        className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-base transition-opacity hover:opacity-70"
        style={{ backgroundColor: 'var(--card-bg, #f3f4f6)', color: 'var(--text-secondary, #6b7280)' }}>
        ‹
      </button>
      <nav ref={navRef} className="flex-1 overflow-x-auto scrollbar-hide flex gap-2">
        {categories.map((cat) => {
          const name = cat[`name_${lang}`] || cat.name_fr;
          const isActive = activeCatId === cat.id;
          return (
            <button key={cat.id} type="button" data-cat={cat.id} onClick={() => onChange(cat.id)}
              className={cn(
                'shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                !isActive && 'bg-transparent'
              )}
              style={isActive
                ? { backgroundColor: 'var(--accent, #6c47ff)', color: 'white' }
                : { color: 'var(--text-secondary, #6b7280)', border: '1px solid var(--card-border, #e5e7eb)' }}>
              {cat.icon && <span>{cat.icon}</span>}
              {name}
            </button>
          );
        })}
      </nav>
      <button type="button" onClick={scrollRight} aria-label="Défiler à droite"
        className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-base transition-opacity hover:opacity-70"
        style={{ backgroundColor: 'var(--card-bg, #f3f4f6)', color: 'var(--text-secondary, #6b7280)' }}>
        ›
      </button>
    </div>
  );
}
