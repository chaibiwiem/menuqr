import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import {
  Loader2, RefreshCw, ShoppingBag, Search, Plus,
  LayoutGrid, List, X, CalendarDays, ChefHat, ClipboardList, Clock,
} from 'lucide-react';
import api from '../../api/axios';
import { useAuthStore } from '../../store/authStore';
import { useOrdersSocket } from '../../hooks/useOrdersSocket';
import OrderCard from '../../components/orders/OrderCard';
import OrderDetail from '../../components/orders/OrderDetail';
import NewOrderDrawer from '../../components/pos/NewOrderDrawer';
import { formatDT } from '../../utils/currency';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const ACTIVE_STATUSES = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED', 'CLOSED', 'CANCELLED'];
const KITCHEN_STATUSES = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'];

const TABS = [
  { value: 'all',       label: 'Tout',           statuses: ACTIVE_STATUSES            },
  { value: 'PENDING',   label: 'En attente',     statuses: ['PENDING']                },
  { value: 'PREPARING', label: 'En préparation', statuses: ['CONFIRMED', 'PREPARING'] },
  { value: 'READY',     label: 'Prête',          statuses: ['READY']                  },
  { value: 'SERVED',    label: 'Servie',         statuses: ['SERVED']                 },
  { value: 'CLOSED',    label: 'Terminée',       statuses: ['CLOSED']                 },
  { value: 'CANCELLED', label: 'Annulée',        statuses: ['CANCELLED']              },
];

const STAT_CARDS = [
  { label: 'En attente',     statuses: ['PENDING'],              filterValue: 'PENDING',   activeColor: 'bg-amber-500 text-white border-amber-500'   },
  { label: 'En préparation', statuses: ['CONFIRMED','PREPARING'], filterValue: 'PREPARING', activeColor: 'bg-purple-500 text-white border-purple-500' },
  { label: 'Prête',          statuses: ['READY'],                filterValue: 'READY',     activeColor: 'bg-green-500 text-white border-green-500'   },
  { label: 'Terminée',       statuses: ['SERVED','CLOSED'],      filterValue: 'SERVED',    activeColor: 'bg-gray-600 text-white border-gray-600'     },
  { label: 'Annulée',        statuses: ['CANCELLED'],            filterValue: 'CANCELLED', activeColor: 'bg-red-500 text-white border-red-500'       },
];

const KDS_COLUMNS = [
  { key: 'PENDING',   label: 'Nouveau',         color: 'border-amber-400',  bg: 'bg-amber-50',  dot: 'bg-amber-400',  text: 'text-amber-700'  },
  { key: 'CONFIRMED', label: 'Confirmé',         color: 'border-blue-400',   bg: 'bg-blue-50',   dot: 'bg-blue-400',   text: 'text-blue-700'   },
  { key: 'PREPARING', label: 'En cuisine',       color: 'border-purple-400', bg: 'bg-purple-50', dot: 'bg-purple-400', text: 'text-purple-700' },
  { key: 'READY',     label: 'Prêt à servir',   color: 'border-green-400',  bg: 'bg-green-50',  dot: 'bg-green-400',  text: 'text-green-700'  },
];

const KDS_NEXT = {
  PENDING:   { label: 'Confirmer →',    next: 'CONFIRMED'  },
  CONFIRMED: { label: 'En cuisine →',   next: 'PREPARING'  },
  PREPARING: { label: '✓ Prêt',        next: 'READY'      },
  READY:     { label: '✓ Servi',       next: 'SERVED'     },
};

function elapsed(createdAt) {
  const diff = Math.floor((Date.now() - new Date(createdAt)) / 1000);
  if (diff < 60) return `${diff}s`;
  const m = Math.floor(diff / 60);
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

function KDSCard({ order, restaurantId, lang }) {
  const qc = useQueryClient();
  const next = KDS_NEXT[order.status];
  const isUrgent = (Date.now() - new Date(order.created_at)) > 20 * 60 * 1000; // >20 min

  const statusMutation = useMutation({
    mutationFn: (nextStatus) =>
      api.put(`/orders/${order.id}/status`, { status: nextStatus }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders', restaurantId] }),
    onError:   (err) => toast.error(err.response?.data?.message || 'Erreur'),
  });

  const shortId    = `#${String(order.id).slice(-6).toUpperCase()}`;
  const tableName  = order.table?.name || (order.table?.number ? `T-${order.table.number}` : 'Takeaway');
  const time       = elapsed(order.created_at);

  return (
    <div className={`rounded-2xl border-2 bg-white shadow-sm flex flex-col overflow-hidden transition-all ${
      isUrgent ? 'border-red-400 shadow-red-100' : 'border-gray-100'
    }`}>
      {/* Card header */}
      <div className={`px-4 py-3 flex items-center justify-between ${isUrgent ? 'bg-red-50' : 'bg-gray-50'}`}>
        <div>
          <p className="text-sm font-black text-gray-900">{shortId} — {tableName}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {(order.items || []).reduce((s, i) => s + i.quantity, 0)} article(s)
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock size={12} className={isUrgent ? 'text-red-500' : 'text-gray-400'} />
          <span className={`text-xs font-bold ${isUrgent ? 'text-red-500' : 'text-gray-500'}`}>{time}</span>
        </div>
      </div>

      {/* Items */}
      <div className="px-4 py-3 space-y-2 flex-1">
        {(order.items || []).map((item, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="shrink-0 w-6 h-6 rounded-full bg-gray-900 text-white text-xs font-black flex items-center justify-center">
              {item.quantity}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 leading-snug">{item.name_snapshot}</p>
              {item.notes && (
                <p className="text-xs text-amber-600 mt-0.5 italic">📝 {item.notes}</p>
              )}
            </div>
          </div>
        ))}
        {order.notes && (
          <div className="mt-2 px-3 py-2 bg-amber-50 rounded-xl text-xs text-amber-700 font-medium">
            💬 {order.notes}
          </div>
        )}
      </div>

      {/* Action */}
      {next && (
        <div className="px-4 pb-4">
          <button
            type="button"
            disabled={statusMutation.isPending}
            onClick={() => statusMutation.mutate(next.next)}
            className={`w-full py-2.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50 ${
              next.next === 'READY' ? 'bg-green-500' :
              next.next === 'SERVED' ? 'bg-teal-500' :
              next.next === 'PREPARING' ? 'bg-purple-500' : 'bg-blue-500'
            }`}
          >
            {statusMutation.isPending ? <Loader2 size={14} className="animate-spin mx-auto" /> : next.label}
          </button>
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  const { t, i18n } = useTranslation();
  const lang = ['fr', 'en', 'it', 'ar'].includes(i18n.language) ? i18n.language : 'fr';
  const { user } = useAuthStore();
  const restaurantId = user?.restaurant_id;
  const qc = useQueryClient();

  // 'orders' | 'kitchen'
  const [mode,          setMode]          = useState('orders');
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [tab,           setTab]           = useState('all');
  const [search,        setSearch]        = useState('');
  const [dateFrom,      setDateFrom]      = useState('');
  const [dateTo,        setDateTo]        = useState('');
  const [showDateFilter,setShowDateFilter]= useState(false);
  const [view,          setView]          = useState('grid');
  const [showNewOrder,  setShowNewOrder]  = useState(false);

  useOrdersSocket(restaurantId);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['orders', restaurantId],
    queryFn: () =>
      api.get(`/orders?status=${ACTIVE_STATUSES.join(',')}&limit=200`).then((r) => r.data),
    enabled:  !!restaurantId,
    refetchInterval: 10_000,
    staleTime: 0,
  });

  const orders = data?.data || [];
  const counts = STAT_CARDS.map((c) => orders.filter((o) => c.statuses.includes(o.status)).length);
  const pendingCount = counts[0];

  const visibleOrders = useMemo(() => {
    const activeTab = TABS.find((t) => t.value === tab) || TABS[0];
    let result = orders.filter((o) => activeTab.statuses.includes(o.status));
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((o) => {
        const id       = String(o.id).toLowerCase();
        const table    = (o.table?.name || '').toLowerCase();
        const customer = ((o.customer_name || '') + ' ' + (o.user?.first_name || '') + ' ' + (o.user?.last_name || '')).toLowerCase();
        const items    = (o.items || []).map((i) => i.name_snapshot || '').join(' ').toLowerCase();
        return id.includes(q) || table.includes(q) || customer.includes(q) || items.includes(q);
      });
    }
    if (dateFrom) result = result.filter((o) => new Date(o.created_at) >= new Date(dateFrom + 'T00:00:00'));
    if (dateTo)   result = result.filter((o) => new Date(o.created_at) <= new Date(dateTo   + 'T23:59:59'));
    return result;
  }, [orders, tab, search, dateFrom, dateTo]);

  const kitchenOrders = orders.filter((o) => KITCHEN_STATUSES.includes(o.status));
  const hasDateFilter = dateFrom || dateTo;

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* ── Page header ── */}
      <div className="px-6 py-4 bg-white border-b border-gray-100 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-lg font-black text-gray-900">
                {t('dashboard.nav.orders', { defaultValue: 'Commandes' })}
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">Gérer et suivre toutes les commandes</p>
            </div>
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold animate-pulse">
                {pendingCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowNewOrder(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors"
            >
              <Plus size={14} />
              Nouvelle commande
            </button>
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
              {t('common.refresh', { defaultValue: 'Actualiser' })}
            </button>
          </div>
        </div>

        {/* ── Sub-nav ── */}
        <div className="flex items-center gap-1 mt-3">
          <button
            type="button"
            onClick={() => setMode('orders')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              mode === 'orders'
                ? 'bg-gray-900 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <ClipboardList size={15} />
            Toutes les commandes
          </button>
          <button
            type="button"
            onClick={() => setMode('kitchen')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              mode === 'kitchen'
                ? 'bg-gray-900 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <ChefHat size={15} />
            Kitchen Queue
            {kitchenOrders.length > 0 && (
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                mode === 'kitchen' ? 'bg-white text-gray-900' : 'bg-gray-900 text-white'
              }`}>
                {kitchenOrders.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          MODE: All Orders
      ══════════════════════════════════════════ */}
      {mode === 'orders' && (
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 size={32} className="animate-spin text-orange-500" />
            </div>
          ) : (
            <>
              {/* Stat cards */}
              <div className="grid grid-cols-5 gap-3">
                {STAT_CARDS.map((card, i) => {
                  const isActive = tab === card.filterValue;
                  return (
                    <button
                      key={card.label}
                      type="button"
                      onClick={() => setTab((prev) => prev === card.filterValue ? 'all' : card.filterValue)}
                      className={`rounded-2xl border-2 shadow-sm p-4 text-center transition-all hover:shadow-md active:scale-[0.98] ${
                        isActive ? card.activeColor : 'bg-white border-transparent hover:border-gray-200'
                      }`}
                    >
                      <p className={`text-3xl font-black ${isActive ? 'text-white' : 'text-gray-900'}`}>{counts[i]}</p>
                      <p className={`text-xs mt-1 font-medium ${isActive ? 'text-white/80' : 'text-gray-400'}`}>{card.label}</p>
                    </button>
                  );
                })}
              </div>

              {/* Filter bar */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 flex items-center gap-3">
                {/* Status tabs */}
                <div className="flex items-center gap-1 flex-1 overflow-x-auto">
                  {TABS.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setTab(t.value)}
                      className={`shrink-0 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                        tab === t.value
                          ? 'bg-gray-900 text-white shadow-sm'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <div className="h-6 w-px bg-gray-200 shrink-0" />

                {/* Search */}
                <div className="relative shrink-0">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Rechercher..."
                    className="pl-8 pr-8 py-1.5 text-sm rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-200 w-44"
                  />
                  {search && (
                    <button type="button" onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      <X size={12} />
                    </button>
                  )}
                </div>

                {/* Date filter */}
                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowDateFilter((v) => !v)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${
                      hasDateFilter ? 'bg-orange-50 border-orange-300 text-orange-500' : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <CalendarDays size={14} />
                    {hasDateFilter ? 'Date active' : 'Date'}
                    {hasDateFilter && (
                      <span onClick={(e) => { e.stopPropagation(); setDateFrom(''); setDateTo(''); }} className="ml-1 text-orange-400 hover:text-red-500">
                        <X size={11} />
                      </span>
                    )}
                  </button>
                  {showDateFilter && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl border border-gray-100 shadow-xl z-20 p-4 space-y-3">
                      <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Filtrer par date</p>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Du</label>
                        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Au</label>
                        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200" />
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button type="button" onClick={() => { setDateFrom(''); setDateTo(''); }} className="flex-1 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-500 hover:bg-gray-50">Réinitialiser</button>
                        <button type="button" onClick={() => setShowDateFilter(false)} className="flex-1 py-2 rounded-xl bg-gray-900 text-white text-xs font-semibold hover:opacity-90">Appliquer</button>
                      </div>
                    </div>
                  )}
                </div>

                {/* View toggle */}
                <div className="flex items-center bg-gray-100 rounded-lg p-0.5 shrink-0">
                  <button type="button" onClick={() => setView('grid')} className={`p-1.5 rounded-md transition-all ${view === 'grid' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}>
                    <LayoutGrid size={15} />
                  </button>
                  <button type="button" onClick={() => setView('list')} className={`p-1.5 rounded-md transition-all ${view === 'list' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}>
                    <List size={15} />
                  </button>
                </div>
              </div>

              <p className="text-xs text-gray-400 px-1">
                {visibleOrders.length} commande{visibleOrders.length !== 1 ? 's' : ''}
                {hasDateFilter && ' · filtrées par date'}
                <span className="ml-3">Auto-actualisation toutes les 10 s</span>
              </p>

              {visibleOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
                    <ShoppingBag size={28} className="text-gray-300" />
                  </div>
                  <p className="text-sm font-semibold text-gray-500">Aucune commande trouvée</p>
                  <p className="text-xs text-gray-400">Modifiez les filtres ou attendez de nouvelles commandes.</p>
                </div>
              ) : (
                <div className={view === 'grid' ? 'grid grid-cols-3 gap-4' : 'space-y-2'}>
                  {visibleOrders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      restaurantId={restaurantId}
                      onViewDetail={(o) => setSelectedOrderId(o.id)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════
          MODE: Kitchen Queue
      ══════════════════════════════════════════ */}
      {mode === 'kitchen' && (
        <div className="flex-1 overflow-hidden bg-gray-100">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 size={32} className="animate-spin text-purple-500" />
            </div>
          ) : (
            <div className="flex gap-3 h-full p-4 overflow-x-auto">
              {KDS_COLUMNS.map((col) => {
                const colOrders = kitchenOrders.filter((o) => o.status === col.key);
                return (
                  <div
                    key={col.key}
                    className={`flex flex-col rounded-2xl border-t-4 ${col.color} bg-white shadow-sm min-w-[280px] flex-1 max-w-[340px]`}
                  >
                    {/* Column header */}
                    <div className={`px-4 py-3 flex items-center gap-2 rounded-t-xl ${col.bg}`}>
                      <span className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                      <span className={`text-sm font-bold flex-1 ${col.text}`}>{col.label}</span>
                      <span className={`text-xs font-black w-6 h-6 rounded-full flex items-center justify-center bg-white shadow-sm ${col.text}`}>
                        {colOrders.length}
                      </span>
                    </div>

                    {/* Cards */}
                    <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                      {colOrders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-300 gap-2">
                          <ChefHat size={28} />
                          <span className="text-xs">Vide</span>
                        </div>
                      ) : (
                        colOrders.map((order) => (
                          <KDSCard
                            key={order.id}
                            order={order}
                            restaurantId={restaurantId}
                            lang={lang}
                          />
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Order detail modal */}
      {selectedOrderId && (
        <OrderDetail
          orderId={selectedOrderId}
          restaurantId={restaurantId}
          onClose={() => setSelectedOrderId(null)}
        />
      )}

      {/* New order drawer */}
      {showNewOrder && (
        <NewOrderDrawer
          table={null}
          lang={lang}
          onClose={() => setShowNewOrder(false)}
          onOrderCreated={() => {
            setShowNewOrder(false);
            qc.invalidateQueries({ queryKey: ['orders', restaurantId] });
          }}
        />
      )}
    </div>
  );
}
