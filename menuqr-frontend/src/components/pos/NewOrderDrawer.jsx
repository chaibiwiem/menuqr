import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { formatDT } from '../../utils/currency';
import toast from 'react-hot-toast';
import {
  X, Plus, Minus, Check, ChevronLeft, Loader2, Search,
  Banknote, CreditCard, Printer, Users, Trash2, MessageSquarePlus,
} from 'lucide-react';

const TEAL = '#0d9488';
const TEAL_LIGHT = '#f0fdfa';
const TEAL_BORDER = '#99f6e4';

// ─── SupplementPicker ─────────────────────────────────────────────────────────

function SupplementPicker({ item, lang, onConfirm, onCancel }) {
  const variants = item.variants || [];
  const [selectedVariantId, setSelectedVariantId] = useState(variants.length > 0 ? variants[0].id : null);
  const [selections, setSelections] = useState({});

  const selectedVariant = variants.find((v) => v.id === selectedVariantId) || null;
  const basePrice = selectedVariant ? Number(selectedVariant.price) : Number(item.price);

  function toggle(group, option) {
    setSelections((prev) => {
      const current = prev[group.id] || [];
      if (group.type === 'radio') return { ...prev, [group.id]: [option.id] };
      const exists = current.includes(option.id);
      if (exists) return { ...prev, [group.id]: current.filter((id) => id !== option.id) };
      if (group.max_select > 0 && current.length >= group.max_select) return prev;
      return { ...prev, [group.id]: [...current, option.id] };
    });
  }

  function validate() {
    for (const group of item.supplementGroups || []) {
      const selected = selections[group.id] || [];
      if (group.is_required && selected.length === 0) {
        toast.error(`Requis : ${group[`name_${lang}`] || group.name_fr}`);
        return false;
      }
      if (group.min_select > 0 && selected.length < group.min_select) {
        toast.error(`Minimum ${group.min_select} choix pour : ${group[`name_${lang}`] || group.name_fr}`);
        return false;
      }
    }
    return true;
  }

  function handleConfirm() {
    if (!validate()) return;
    const chosen = [];
    if (selectedVariant) {
      chosen.push({
        supplement_option_id: null,
        option_name_snapshot: selectedVariant[`label_${lang}`] || selectedVariant.label_fr,
        extra_price: 0,
        variant_id: selectedVariant.id,
      });
    }
    for (const group of item.supplementGroups || []) {
      const selectedIds = selections[group.id] || [];
      for (const opt of group.options || []) {
        if (selectedIds.includes(opt.id)) {
          chosen.push({
            supplement_option_id: opt.id,
            option_name_snapshot: opt[`name_${lang}`] || opt.name_fr,
            extra_price: Number(opt.extra_price) || 0,
          });
        }
      }
    }
    onConfirm(chosen, basePrice);
  }

  const extraTotal = (item.supplementGroups || []).reduce((sum, group) =>
    sum + (selections[group.id] || []).reduce((gs, optId) => {
      const opt = (group.options || []).find((o) => o.id === optId);
      return gs + (opt ? Number(opt.extra_price) : 0);
    }, 0), 0);

  const description = item[`description_${lang}`] || item.description_fr || item.description || '';
  const hasSupplements = (item.supplementGroups || []).some((g) => (g.options || []).length > 0);

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 flex items-end sm:items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl flex flex-col max-h-[88vh]">

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 shrink-0">
          <button type="button" onClick={onCancel} className="p-1.5 rounded-lg hover:bg-gray-100">
            <ChevronLeft size={18} className="text-gray-500" />
          </button>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 truncate">{item[`name_${lang}`] || item.name_fr}</h3>
            <p className="text-xs text-gray-400">Prix de base : {formatDT(item.price, lang)}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">

          {/* Dish image */}
          {item.image_url && (
            <div className="w-full h-44 shrink-0 overflow-hidden">
              <img src={item.image_url} alt={item[`name_${lang}`] || item.name_fr} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="p-4 space-y-5">

            {/* Description */}
            {description && (
              <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
            )}

            {/* Variants */}
            {variants.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-gray-700 mb-2">Taille / Variante</h4>
                <div className="space-y-2">
                  {variants.map((v) => {
                    const label = v[`label_${lang}`] || v.label_fr;
                    const active = selectedVariantId === v.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariantId(v.id)}
                        className="w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all text-left"
                        style={active
                          ? { borderColor: TEAL, backgroundColor: TEAL_LIGHT }
                          : { borderColor: '#e5e7eb', backgroundColor: 'white' }
                        }
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-4 h-4 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors"
                            style={active ? { backgroundColor: TEAL, borderColor: TEAL } : { borderColor: '#d1d5db', backgroundColor: 'white' }}>
                            {active && <Check size={10} className="text-white" />}
                          </div>
                          <span className="text-sm font-medium text-gray-800">{label}</span>
                        </div>
                        <span className="text-sm font-bold shrink-0" style={{ color: TEAL }}>{formatDT(v.price, lang)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Supplement groups */}
            {hasSupplements && (item.supplementGroups || []).map((group) => (
              <div key={group.id}>
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-sm font-bold text-gray-700">{group[`name_${lang}`] || group.name_fr}</h4>
                  {group.is_required && (
                    <span className="text-[10px] font-semibold text-white bg-red-500 px-1.5 py-0.5 rounded-full">Requis</span>
                  )}
                  {group.type === 'checkbox' && group.max_select > 0 && (
                    <span className="text-xs text-gray-400 ml-auto">max {group.max_select}</span>
                  )}
                </div>
                <div className="space-y-2">
                  {(group.options || []).map((opt) => {
                    const selected = (selections[group.id] || []).includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => toggle(group, opt)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left ${
                          selected ? 'border-teal-400 bg-teal-50' : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-4 h-4 shrink-0 flex items-center justify-center border-2 transition-colors ${
                            group.type === 'radio' ? 'rounded-full' : 'rounded-md'
                          } ${selected ? 'bg-teal-500 border-teal-500' : 'border-gray-300 bg-white'}`}>
                            {selected && <Check size={10} className="text-white" />}
                          </div>
                          <span className="text-sm text-gray-800">{opt[`name_${lang}`] || opt.name_fr}</span>
                        </div>
                        {Number(opt.extra_price) > 0 && (
                          <span className="text-xs font-semibold text-gray-500 ml-2 shrink-0">+{formatDT(opt.extra_price, lang)}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 shrink-0">
          <button
            type="button"
            onClick={handleConfirm}
            className="w-full py-3 rounded-xl text-white font-bold text-sm"
            style={{ backgroundColor: TEAL }}
          >
            Ajouter — {formatDT(basePrice + extraTotal, lang)}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MenuItem Card ────────────────────────────────────────────────────────────

function MenuItemCard({ item, lang, cartQty, onAdd, onIncrement, onDecrement }) {
  const name     = item[`name_${lang}`] || item.name_fr;
  const catLabel = item.category_name || '';
  const hasSupp  = (item.supplementGroups || []).some((g) => (g.options || []).length > 0);
  const inCart   = cartQty > 0;

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden flex flex-col transition-all"
      style={{
        border: inCart ? `2px solid ${TEAL}` : '1.5px solid #e5e7eb',
        boxShadow: inCart ? `0 0 0 3px ${TEAL}18` : '0 1px 4px rgba(0,0,0,0.06)',
      }}
    >
      {/* Image */}
      <div className="relative w-full" style={{ paddingBottom: '62%' }}>
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={name}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-2xl">🍽️</div>
        )}
      </div>

      {/* Info */}
      <div className="p-2.5 flex flex-col gap-1 flex-1">
        {catLabel && (
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide leading-none">
            {catLabel}
          </span>
        )}
        <p className="text-xs font-bold text-gray-800 leading-snug line-clamp-2 flex-1">{name}</p>

        {/* Price + Qty controls */}
        <div className="flex items-center justify-between mt-1">
          <span className="text-sm font-bold" style={{ color: TEAL }}>
            {formatDT(item.price, lang)}
          </span>

          {inCart ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onDecrement(item)}
                className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <Minus size={10} />
              </button>
              <span className="w-5 text-center text-xs font-bold text-gray-800">{cartQty}</span>
              <button
                type="button"
                onClick={() => hasSupp ? onAdd(item) : onIncrement(item)}
                className="w-6 h-6 rounded-full flex items-center justify-center text-white transition-colors"
                style={{ backgroundColor: TEAL }}
              >
                <Plus size={10} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onAdd(item)}
              className="w-7 h-7 rounded-full flex items-center justify-center text-white shadow-sm transition-colors hover:opacity-90"
              style={{ backgroundColor: TEAL }}
            >
              <Plus size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── NewOrderDrawer ───────────────────────────────────────────────────────────

export default function NewOrderDrawer({ table, lang, onClose, onOrderCreated }) {
  const qc = useQueryClient();

  const [cart, setCart]               = useState([]);
  const [activeCatId, setActiveCatId] = useState(null);
  const [pickerItem, setPickerItem]   = useState(null);
  const [search, setSearch]           = useState('');
  const [payMethod, setPayMethod]     = useState('cash');
  const [noteOpen,  setNoteOpen]      = useState({});
  const [selectedTable, setSelectedTable] = useState(table || null);
  const [selectedZoneId, setSelectedZoneId] = useState(null);

  const { data: menus = [], isLoading } = useQuery({
    queryKey: ['pos-menu'],
    queryFn: () => api.get('/pos/menu').then((r) => r.data.data),
    staleTime: 60_000,
  });

  const { data: allTables = [] } = useQuery({
    queryKey: ['pos-all-tables'],
    queryFn: () => api.get('/pos/tables').then((r) => r.data.data),
    enabled: !table,
    staleTime: 30_000,
  });

  const zones = useMemo(() => {
    const seen = new Set();
    const result = [];
    for (const t of allTables) {
      const zId = t.room?.id || '__none__';
      if (!seen.has(zId)) {
        seen.add(zId);
        result.push({ id: zId, name: t.room?.name || 'Sans zone' });
      }
    }
    return result;
  }, [allTables]);

  const filteredTables = useMemo(() => {
    if (!selectedZoneId) return allTables;
    return allTables.filter((t) => (t.room?.id || '__none__') === selectedZoneId);
  }, [allTables, selectedZoneId]);

  const categories = menus.flatMap((m) => m.categories || []);
  const activeCategory = categories.find((c) => c.id === activeCatId) || categories[0];
  const allItems = activeCategory?.items || [];

  const displayItems = useMemo(() => {
    if (!search.trim()) return allItems;
    const q = search.toLowerCase();
    return allItems.filter((item) => {
      const n = (item[`name_${lang}`] || item.name_fr || '').toLowerCase();
      return n.includes(q);
    });
  }, [allItems, search, lang]);

  // Cart helpers
  function getItemCartQty(itemId) {
    return cart.filter((e) => e.menu_item_id === itemId).reduce((s, e) => s + e.quantity, 0);
  }

  function addToCart(item, supplements = [], overridePrice = null) {
    const unitBase  = overridePrice !== null ? overridePrice : Number(item.price);
    const suppExtra = supplements.reduce((s, sup) => s + Number(sup.extra_price || 0), 0);
    const unitTotal = unitBase + suppExtra;
    const key = item.id + '::' + supplements.map((s) => s.supplement_option_id || s.variant_id || '').sort().join(',');
    setCart((prev) => {
      const idx = prev.findIndex((e) => e.key === key);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = {
          ...next[idx],
          quantity: next[idx].quantity + 1,
          lineTotal: Math.round((next[idx].lineTotal + unitTotal) * 1000) / 1000,
        };
        return next;
      }
      return [...prev, {
        key,
        menu_item_id: item.id,
        name_snapshot: item[`name_${lang}`] || item.name_fr,
        unit_price: unitBase,
        supplements,
        quantity: 1,
        lineTotal: Math.round(unitTotal * 1000) / 1000,
      }];
    });
  }

  function changeQty(key, delta) {
    setCart((prev) =>
      prev.map((entry) => {
        if (entry.key !== key) return entry;
        const newQty = entry.quantity + delta;
        if (newQty <= 0) return null;
        const unitTotal = Math.round((entry.lineTotal / entry.quantity) * 1000) / 1000;
        return { ...entry, quantity: newQty, lineTotal: Math.round(unitTotal * newQty * 1000) / 1000 };
      }).filter(Boolean)
    );
  }

  function handleItemAdd(item) {
    const groups    = (item.supplementGroups || []).filter((g) => (g.options || []).length > 0);
    const hasVariants = (item.variants || []).length > 0;
    if (groups.length > 0 || hasVariants) setPickerItem(item);
    else addToCart(item);
  }

  function handleItemIncrement(item) {
    // For items without supplements, increment first matching cart entry
    const entry = cart.find((e) => e.menu_item_id === item.id);
    if (entry) changeQty(entry.key, 1);
    else addToCart(item);
  }

  function handleItemDecrement(item) {
    const entry = cart.find((e) => e.menu_item_id === item.id);
    if (entry) changeQty(entry.key, -1);
  }

  function removeFromCart(key) {
    setCart((prev) => prev.filter((e) => e.key !== key));
    setNoteOpen((prev) => { const n = { ...prev }; delete n[key]; return n; });
  }

  function setEntryNote(key, text) {
    setCart((prev) => prev.map((e) => e.key === key ? { ...e, notes: text } : e));
  }

  const cartTotal = Math.round(cart.reduce((s, e) => s + e.lineTotal, 0) * 1000) / 1000;
  const cartCount = cart.reduce((s, e) => s + e.quantity, 0);

  const mutation = useMutation({
    mutationFn: () => api.post('/orders', {
      table_id: selectedTable?.id || null,
      items: cart.map((entry) => ({
        menu_item_id: entry.menu_item_id,
        name_snapshot: entry.name_snapshot,
        unit_price: entry.unit_price,
        quantity: entry.quantity,
        supplements: entry.supplements,
        notes: entry.notes || null,
      })),
    }).then((r) => r.data),
    onSuccess: (res) => {
      toast.success('Commande envoyée en cuisine !');
      qc.invalidateQueries({ queryKey: ['pos-active-tables'] });
      qc.invalidateQueries({ queryKey: ['pos-order', selectedTable?.id] });
      qc.invalidateQueries({ queryKey: ['tables'] });
      qc.invalidateQueries({ queryKey: ['orders'] });
      onOrderCreated(res.data);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Erreur lors de la création'),
  });

  const PAY_METHODS = [
    { key: 'cash', label: 'Espèces', icon: <Banknote   size={14} /> },
    { key: 'card', label: 'Carte',   icon: <CreditCard size={14} /> },
  ];

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />

      {/* Full-screen drawer */}
      <div className="fixed inset-0 z-50 flex bg-gray-50">

        {/* ── LEFT: Menu browser ── */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white">

          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 shrink-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <X size={17} />
            </button>
            <div className="flex-1">
              <h2 className="text-base font-black text-gray-900">Menu</h2>
              <p className="text-xs text-gray-400">
                {selectedTable ? `Table : ${selectedTable.name || `T${selectedTable.number}`}` : 'Emporter'}
              </p>
            </div>

            {/* Search */}
            <div className="relative w-52">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-full border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': TEAL + '55' }}
              />
            </div>
          </div>

          {/* Category tabs */}
          {categories.length > 0 && (
            <div className="flex gap-2 px-5 py-3 overflow-x-auto border-b border-gray-100 shrink-0 scrollbar-none">
              {categories.map((cat, i) => {
                const isActive = activeCatId ? cat.id === activeCatId : i === 0;
                const count = (cat.items || []).length;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => { setActiveCatId(cat.id); setSearch(''); }}
                    className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all"
                    style={isActive
                      ? { backgroundColor: TEAL_LIGHT, color: TEAL, border: `1.5px solid ${TEAL_BORDER}` }
                      : { backgroundColor: '#f3f4f6', color: '#6b7280', border: '1.5px solid transparent' }
                    }
                  >
                    {cat.icon && <span className="text-sm">{cat.icon}</span>}
                    <span>{cat[`name_${lang}`] || cat.name_fr}</span>
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                      style={isActive
                        ? { backgroundColor: TEAL + '25', color: TEAL }
                        : { backgroundColor: '#e5e7eb', color: '#9ca3af' }
                      }
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Items grid */}
          <div className="flex-1 overflow-y-auto p-4">
            {isLoading ? (
              <div className="flex justify-center pt-16">
                <Loader2 size={24} className="animate-spin" style={{ color: TEAL }} />
              </div>
            ) : displayItems.length === 0 ? (
              <div className="text-center pt-16 text-gray-400">
                <p className="text-sm">Aucun article trouvé</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {displayItems.map((item) => (
                  <MenuItemCard
                    key={item.id}
                    item={{ ...item, category_name: activeCategory?.[`name_${lang}`] || activeCategory?.name_fr }}
                    lang={lang}
                    cartQty={getItemCartQty(item.id)}
                    onAdd={handleItemAdd}
                    onIncrement={handleItemIncrement}
                    onDecrement={handleItemDecrement}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Order summary ── */}
        <div className="w-80 shrink-0 flex flex-col bg-white border-l border-gray-100" style={{ boxShadow: '-4px 0 20px rgba(0,0,0,0.04)' }}>

          {/* Table info / selector */}
          <div className="px-5 py-4 border-b border-gray-100 shrink-0 space-y-3">
            {/* Order number row */}
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Nouvelle commande</p>
              {selectedTable?.capacity && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-50 border border-gray-100">
                  <Users size={12} className="text-gray-400" />
                  <span className="text-xs font-semibold text-gray-600">{selectedTable.capacity}</span>
                </div>
              )}
            </div>

            {/* Table name if pre-selected from prop */}
            {table ? (
              <h3 className="text-lg font-black text-gray-900 leading-tight">{table.name || '—'}</h3>
            ) : (
              /* Zone + Table selectors */
              <div className="space-y-2">
                <select
                  value={selectedZoneId || ''}
                  onChange={(e) => { setSelectedZoneId(e.target.value || null); setSelectedTable(null); }}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-200"
                >
                  <option value="">Toutes les zones</option>
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>{z.name}</option>
                  ))}
                </select>
                <select
                  value={selectedTable?.id || ''}
                  onChange={(e) => {
                    const t = filteredTables.find((t) => String(t.id) === e.target.value);
                    setSelectedTable(t || null);
                  }}
                  className="w-full text-sm border rounded-xl px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-200 transition-colors"
                  style={{ borderColor: selectedTable ? TEAL : '#e5e7eb' }}
                >
                  <option value="">Sélectionner une table</option>
                  {filteredTables.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name || `Table ${t.number}`}{t.status === 'OCCUPEE' ? ' (Occupée)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Order items */}
          <div className="flex-1 overflow-y-auto px-5 py-3">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Articles commandés</h4>
              {cartCount > 0 && (
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: TEAL }}
                >
                  {cartCount}
                </span>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-gray-300">
                <div className="text-4xl">🛒</div>
                <p className="text-xs text-gray-400">Aucun article sélectionné</p>
              </div>
            ) : (
              <div className="space-y-1">
                {cart.map((entry) => (
                  <div key={entry.key} className="py-2 border-b border-gray-50 last:border-0">
                    <div className="flex items-start gap-2">
                      {/* Qty badge */}
                      <span
                        className="w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-xs font-black text-white mt-0.5"
                        style={{ backgroundColor: TEAL }}
                      >
                        {entry.quantity}
                      </span>

                      {/* Name + supplements */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800 truncate leading-tight">{entry.name_snapshot}</p>
                        {(entry.supplements || []).map((s, i) => (
                          <p key={i} className="text-[10px] text-gray-400 truncate">+ {s.option_name_snapshot}</p>
                        ))}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-bold" style={{ color: TEAL }}>{formatDT(entry.lineTotal, lang)}</span>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => removeFromCart(entry.key)}
                          className="w-5 h-5 rounded-full flex items-center justify-center bg-red-50 hover:bg-red-100 transition-colors"
                        >
                          <Trash2 size={9} className="text-red-400" />
                        </button>
                        {/* Qty */}
                        <div className="flex items-center gap-0.5">
                          <button
                            type="button"
                            onClick={() => changeQty(entry.key, -1)}
                            className="w-5 h-5 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 text-gray-500"
                          >
                            <Minus size={9} />
                          </button>
                          <button
                            type="button"
                            onClick={() => changeQty(entry.key, 1)}
                            className="w-5 h-5 rounded-full flex items-center justify-center text-white"
                            style={{ backgroundColor: TEAL }}
                          >
                            <Plus size={9} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Notes row */}
                    <div className="mt-1 ml-8">
                      {noteOpen[entry.key] ? (
                        <input
                          autoFocus
                          type="text"
                          value={entry.notes || ''}
                          onChange={(e) => setEntryNote(entry.key, e.target.value)}
                          onBlur={() => { if (!entry.notes) setNoteOpen((p) => ({ ...p, [entry.key]: false })); }}
                          placeholder="Note pour la cuisine…"
                          className="w-full text-[11px] px-2 py-1 rounded-lg border border-gray-200 focus:outline-none focus:border-teal-400 text-gray-600 placeholder-gray-300"
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() => setNoteOpen((p) => ({ ...p, [entry.key]: true }))}
                          className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-teal-500 transition-colors"
                        >
                          <MessageSquarePlus size={11} />
                          {entry.notes ? <span className="truncate max-w-[140px] text-gray-500 italic">{entry.notes}</span> : 'Ajouter une note'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer: total + payment + button */}
          <div className="shrink-0 px-5 pt-3 pb-5 border-t border-gray-100 space-y-4">

            {/* Total */}
            {cart.length > 0 && (
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm font-semibold text-gray-500">Total</span>
                <span className="text-xl font-black text-gray-900">{formatDT(cartTotal, lang)}</span>
              </div>
            )}

            {/* Payment method */}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Mode de paiement</p>
              <div className="flex justify-center gap-3">
                {PAY_METHODS.map((m) => (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setPayMethod(m.key)}
                    className="w-28 flex flex-col items-center gap-1 py-2.5 rounded-xl border text-xs font-semibold transition-all"
                    style={payMethod === m.key
                      ? { backgroundColor: TEAL_LIGHT, borderColor: TEAL, color: TEAL }
                      : { backgroundColor: 'white', borderColor: '#e5e7eb', color: '#6b7280' }
                    }
                  >
                    {m.icon}
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex items-center gap-1.5 px-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                title="Annuler"
              >
                <Printer size={15} />
              </button>
              <button
                type="button"
                onClick={() => mutation.mutate()}
                disabled={cart.length === 0 || mutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-black tracking-wide disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:opacity-90"
                style={{ backgroundColor: TEAL, boxShadow: `0 4px 16px ${TEAL}44` }}
              >
                {mutation.isPending
                  ? <><Loader2 size={15} className="animate-spin" /> Envoi…</>
                  : 'Envoyer en cuisine'
                }
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Supplement picker */}
      {pickerItem && (
        <SupplementPicker
          item={pickerItem}
          lang={lang}
          onConfirm={(supplements, basePrice) => {
            addToCart(pickerItem, supplements, basePrice);
            setPickerItem(null);
          }}
          onCancel={() => setPickerItem(null)}
        />
      )}
    </>
  );
}
