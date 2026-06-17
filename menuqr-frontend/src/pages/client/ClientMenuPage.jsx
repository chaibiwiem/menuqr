import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import api from '../../api/axios';
import useCart from '../../hooks/useCart';
import { formatDT } from '../../utils/currency';
import MenuHeader from '../../components/client/MenuHeader';
import CategoryNav from '../../components/client/CategoryNav';
import DishCard from '../../components/client/DishCard';
import DishModal from '../../components/client/DishModal';
import CartDrawer from '../../components/client/CartDrawer';
import CallWaiterButton from '../../components/client/CallWaiterButton';

export default function ClientMenuPage() {
  const { slug, qrToken } = useParams();
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const TABLE_KEY = `menuqr_table_${slug}`;

  // Initialize table from sessionStorage so it survives navigation back from tracker
  const [selectedDish, setSelectedDish] = useState(null);
  const [table, setTable] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem(TABLE_KEY)) || null; } catch { return null; }
  });
  const [cartOpen, setCartOpen] = useState(false);
  const [callWaiterOpen, setCallWaiterOpen] = useState(false);
  const [callCooldown, setCallCooldown] = useState(0);
  const [activeCatId, setActiveCatId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  // Order banner: only show for the specific table that placed the order
  const [activeOrderId, setActiveOrderId] = useState(() => {
    try {
      const storedTable = JSON.parse(sessionStorage.getItem(`menuqr_table_${slug}`));
      if (!storedTable?.id) return null;
      return localStorage.getItem(`menuqr_order_${slug}_${storedTable.id}`);
    } catch { return null; }
  });

  const { items } = useCart();
  const cartCount = items.reduce((acc, l) => acc + l.quantity, 0);
  const cartTotal = items.reduce((acc, l) => acc + (l.unitTotal || 0) * l.quantity, 0);
  const lang = ['fr', 'en', 'it', 'ar'].includes(i18n.language) ? i18n.language : 'fr';

  // Sync cooldown to header icon
  function handleCallSuccess() {
    setCallCooldown(30);
    const timer = setInterval(() => {
      setCallCooldown((c) => {
        if (c <= 1) { clearInterval(timer); return 0; }
        return c - 1;
      });
    }, 1000);
  }

  // Fetch restaurant info + menu — staleTime:0 so custom colors/font always fresh
  const { data, isLoading, isError } = useQuery({
    queryKey: ['public-menu', slug],
    queryFn: () => api.get(`/public/${slug}/menu`).then((r) => r.data.data),
    staleTime: 0,
    refetchOnMount: true,
  });

  // Verify table via QR token — save table data to sessionStorage so it survives navigation back
  useQuery({
    queryKey: ['verify-table', slug, qrToken],
    queryFn: () =>
      api.get(`/public/${slug}/table/${qrToken}`).then((r) => {
        const tableData = r.data.data.table;
        setTable(tableData);
        sessionStorage.setItem(TABLE_KEY, JSON.stringify(tableData));
        return r.data.data;
      }),
    enabled: !!qrToken,
    retry: false,
  });

  // Apply template + custom colors/font — inject a <style> tag so overrides beat [data-template] CSS
  useEffect(() => {
    if (!data?.restaurant) return;
    const { template_id, custom_colors, custom_font } = data.restaurant;

    // 1. Set template attribute
    if (template_id) document.documentElement.setAttribute('data-template', template_id);

    // 2. Build CSS override rules and inject as a <style> tag
    //    A <style> appended to <head> comes AFTER the bundled CSS, so same-specificity
    //    selectors in this tag win over [data-template] rules in globals.css
    const styleId = 'menuqr-custom-theme';
    let styleTag = document.getElementById(styleId);
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = styleId;
      document.head.appendChild(styleTag);
    }

    const rules = [];
    if (custom_colors && typeof custom_colors === 'object') {
      Object.entries(custom_colors).forEach(([k, v]) => {
        if (v) rules.push(`--${k}: ${v};`);
      });
    }
    if (custom_font) {
      rules.push(`--font-family: '${custom_font}', sans-serif;`);
    }
    // html[data-template] has specificity [0,1,1] which beats [data-template="x"] [0,1,0]
    styleTag.textContent = rules.length ? `html[data-template] { ${rules.join(' ')} }` : '';

    // 3. Load Google Font if needed
    if (custom_font) {
      const fontId = `gfont-${custom_font.replace(/\s+/g, '-')}`;
      if (!document.getElementById(fontId)) {
        const link = document.createElement('link');
        link.id = fontId; link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(custom_font)}:wght@400;500;600;700;800&display=swap`;
        document.head.appendChild(link);
      }
    }

    return () => {
      document.documentElement.removeAttribute('data-template');
      const tag = document.getElementById(styleId);
      if (tag) tag.textContent = '';
    };
  }, [data?.restaurant]);

  const restaurant = data?.restaurant;
  const menus      = data?.menus || [];

  // Stable reference — only recomputes when query data changes, not on every render
  const allCategories = useMemo(
    () => menus.flatMap((m) => m.categories || []),
    [menus]
  );

  // Set first category as default once data loads (editorial_menu starts with all visible)
  useEffect(() => {
    const noAutoSelect = ['editorial_menu', 'bento_menu'];
    if (allCategories.length > 0 && activeCatId === null && !noAutoSelect.includes(restaurant?.template_id)) {
      setActiveCatId(allCategories[0].id);
    }
  }, [allCategories, restaurant?.template_id]);

  const visibleCategories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    // When searching, ignore category filter and search across all
    let cats = (activeCatId && !q)
      ? allCategories.filter((c) => c.id === activeCatId)
      : allCategories;
    if (q) {
      cats = cats.map((cat) => ({
        ...cat,
        items: (cat.items || []).filter((item) => {
          const n = (item[`name_${lang}`] || item.name_fr || '').toLowerCase();
          const d = (item[`description_${lang}`] || item.description_fr || '').toLowerCase();
          return n.includes(q) || d.includes(q);
        }),
      })).filter((cat) => cat.items.length > 0);
    }
    return cats;
  }, [allCategories, activeCatId, searchQuery, lang]);

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center min-h-svh"
        style={{ backgroundColor: 'var(--bg-primary, #f9fafb)' }}
      >
        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--accent, #6c47ff)' }} />
      </div>
    );
  }

  if (isError || !restaurant) {
    return (
      <div className="flex items-center justify-center min-h-svh bg-gray-50">
        <div className="text-center p-8">
          <p className="text-4xl mb-4">🍽</p>
          <p className="text-gray-500 text-sm">Menu introuvable ou indisponible.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-svh flex flex-col"
      style={{ backgroundColor: 'var(--bg-primary, #f9fafb)' }}
    >
      {/* Header with banner, logo, action icons, language switcher */}
      <MenuHeader
        restaurant={restaurant}
        table={table}
        onOpenCart={() => setCartOpen(true)}
        onOpenCallWaiter={table ? () => setCallWaiterOpen(true) : undefined}
        cooldown={callCooldown}
      />

      {/* Category nav */}
      <CategoryNav
        categories={allCategories}
        activeCatId={activeCatId}
        onChange={(id) => { setActiveCatId(id); setSearchQuery(''); }}
        template={restaurant?.template_id}
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
      />

      {/* Menu content */}
      <main className="flex-1 max-w-2xl mx-auto px-3 py-4 pb-32 space-y-8">
        {visibleCategories.map((category) => {
          const lang = ['fr', 'en', 'it', 'ar'].includes(i18n.language) ? i18n.language : 'fr';
          const catName = category[`name_${lang}`] || category.name_fr;
          const items = category.items || [];
          const tmpl = restaurant?.template_id;
          const isClassic = tmpl === 'classic_theme';
          const isEditorial = tmpl === 'editorial_menu';
          const isModern = tmpl === 'modern_theme';
          const isBento = tmpl === 'bento_menu';
          const isAurora = tmpl === 'aurora_glass';
          if (items.length === 0) return null;

          return (
            <section key={category.id}>
              {/* Category header */}
              {isClassic ? (
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-extrabold" style={{ color: 'var(--text-primary, #1a1a1a)' }}>
                    {catName}
                  </h2>
                  {allCategories.length > 1 && activeCatId && (
                    <button
                      type="button"
                      className="text-sm font-semibold"
                      style={{ color: 'var(--accent, #FF6B35)' }}
                      onClick={() => setActiveCatId(null)}
                    >
                      {t('common.see_all', { defaultValue: 'Voir tout' })}
                    </button>
                  )}
                </div>
              ) : isEditorial || isModern || isAurora ? (
                <h2
                  className="text-lg font-extrabold mb-3 tracking-tight"
                  style={{ color: 'var(--text-primary, #1a1a1a)' }}
                >
                  {catName}
                </h2>
              ) : (
                <div className="flex items-center gap-2 mb-3">
                  {category.icon && <span className="text-xl">{category.icon}</span>}
                  <h2 className="text-base font-bold" style={{ color: 'var(--text-primary, #111)' }}>
                    {catName}
                  </h2>
                </div>
              )}

              {/* Items */}
              <div className={isBento ? 'grid grid-cols-2 gap-3' : 'space-y-3'}>
                {items.map((item, idx) => (
                  <DishCard
                    key={item.id}
                    item={item}
                    index={idx + 1}
                    template={restaurant?.template_id}
                    onOpen={(dish) => setSelectedDish(dish)}
                  />
                ))}
              </div>
            </section>
          );
        })}

        {allCategories.length === 0 && (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">🍽</p>
            <p className="text-sm" style={{ color: 'var(--text-secondary, #6b7280)' }}>
              Aucun plat disponible pour le moment.
            </p>
          </div>
        )}
      </main>

      {/* Dish detail modal (bottom sheet) */}
      {selectedDish && (
        <DishModal item={selectedDish} onClose={() => setSelectedDish(null)} canOrder={!!table} />
      )}

      {/* Cart drawer — controlled by header icon */}
      <CartDrawer slug={slug} tableId={table?.id} open={cartOpen} setOpen={setCartOpen} />

      {/* Call waiter sheet — controlled by header icon */}
      {table && (
        <CallWaiterButton
          slug={slug}
          tableId={table.id}
          open={callWaiterOpen}
          onClose={() => setCallWaiterOpen(false)}
          onSuccess={handleCallSuccess}
        />
      )}

      {/* Sticky cart bar — only shown after QR scan */}
      {table && cartCount > 0 && !cartOpen && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-3"
          style={{ background: 'linear-gradient(to top, var(--bg-primary, white) 60%, transparent)' }}
        >
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="w-full max-w-md mx-auto flex items-center justify-between gap-3 px-5 py-3.5 rounded-2xl shadow-lg text-white text-sm font-bold"
            style={{ backgroundColor: 'var(--accent, #6c47ff)', display: 'flex' }}
          >
            <span
              className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold shrink-0"
            >
              {cartCount}
            </span>
            <span className="flex-1 text-center">{t('cart.view_cart')}</span>
            <span className="opacity-90">{formatDT(cartTotal, lang)}</span>
          </button>
        </div>
      )}

      {/* Copyright footer */}
      <div className="py-5 px-4 text-center">
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

      {/* Sticky order tracker banner — moves up when cart bar is visible */}
      {activeOrderId && (
        <div
          className="fixed left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-sm transition-all"
          style={{ bottom: cartCount > 0 && !cartOpen ? '76px' : '16px' }}
        >
          <button
            type="button"
            onClick={() => navigate(`/${slug}/order/${activeOrderId}`)}
            className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl shadow-lg text-white text-sm font-semibold"
            style={{ backgroundColor: 'var(--accent, #6c47ff)' }}
          >
            <span className="flex items-center gap-2">
              <span className="text-base">📦</span>
              {t('order.track_banner')}
            </span>
            <span className="opacity-70 text-xs">
              #{activeOrderId.slice(-6).toUpperCase()} →
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (table?.id) localStorage.removeItem(`menuqr_order_${slug}_${table.id}`);
              setActiveOrderId(null);
            }}
            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-gray-500 text-white flex items-center justify-center text-xs hover:bg-gray-600"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
