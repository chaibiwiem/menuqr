import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Filter, X, ChevronDown, ChevronRight, RotateCcw,
  Users, Table2, List, Receipt, TrendingUp,
  CreditCard, Banknote, Loader2, CheckCircle2,
  Clock, AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { formatDT } from '../../utils/currency';
import { useAuthStore } from '../../store/authStore';
import PaymentModal from '../../components/pos/PaymentModal';

// ─── Config ───────────────────────────────────────────────────────────────────

const ACTIVE_STATUSES = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED'];
const HISTORY_STATUSES = ['CLOSED', 'CANCELLED'];
const ALL_STATUSES = [...ACTIVE_STATUSES, ...HISTORY_STATUSES];

const VALID_TRANSITIONS = {
  PENDING:   ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY', 'CANCELLED'],
  READY:     ['SERVED'],
  SERVED:    ['CLOSED'],
  CLOSED:    [],
  CANCELLED: [],
};

const STATUS_CFG = {
  PENDING:   { label: 'En attente',  cls: 'bg-amber-100 text-amber-700',   dot: 'bg-amber-400'   },
  CONFIRMED: { label: 'Confirmée',   cls: 'bg-blue-100 text-blue-700',     dot: 'bg-blue-400'    },
  PREPARING: { label: 'En cuisine',  cls: 'bg-purple-100 text-purple-700', dot: 'bg-purple-400'  },
  READY:     { label: 'Prête',       cls: 'bg-green-100 text-green-700',   dot: 'bg-green-400'   },
  SERVED:    { label: 'Servie',      cls: 'bg-teal-100 text-teal-700',     dot: 'bg-teal-400'    },
  CLOSED:    { label: 'Payée',       cls: 'bg-gray-100 text-gray-600',     dot: 'bg-gray-400'    },
  CANCELLED: { label: 'Annulée',     cls: 'bg-red-100 text-red-600',       dot: 'bg-red-400'     },
};

const PAY_CFG = {
  CASH:    { label: 'Espèces',  cls: 'bg-green-100 text-green-700',   icon: Banknote   },
  CARD:    { label: 'Carte',    cls: 'bg-orange-100 text-orange-600',  icon: CreditCard },
  OTHER:   { label: 'Autre',    cls: 'bg-purple-100 text-purple-600',  icon: Banknote   },
  PENDING: { label: 'Non payé', cls: 'bg-red-50 text-red-400',         icon: Clock      },
  null:    { label: 'Non payé', cls: 'bg-red-50 text-red-400',         icon: Clock      },
};

function fmtDatetime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
    + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.PENDING;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ─── Payment Badge ────────────────────────────────────────────────────────────

function PayBadge({ method }) {
  const cfg = PAY_CFG[method ?? 'null'] || PAY_CFG.PENDING;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${cfg.cls}`}>
      <Icon size={10} /> {cfg.label}
    </span>
  );
}

// ─── Filter Bar ───────────────────────────────────────────────────────────────

function FilterBar({ filters, setFilters, rooms, staff, tables, tab, activeCount }) {
  function set(key, val) { setFilters((p) => ({ ...p, [key]: val })); }
  function reset() {
    setFilters({ from: '', to: '', status: [], room_id: '', staff_id: '', table_id: '', payment_method: '' });
  }

  const statuses = tab === 'active' ? ACTIVE_STATUSES : HISTORY_STATUSES;

  return (
    <div className="bg-white border-b border-gray-100 px-6 py-3">
      <div className="flex flex-wrap items-center gap-3">
        {/* Dates */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500 shrink-0">Du</span>
          <input type="date" value={filters.from} onChange={(e) => set('from', e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-orange-300" />
          <span className="text-xs text-gray-500">Au</span>
          <input type="date" value={filters.to} onChange={(e) => set('to', e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-orange-300" />
        </div>

        {/* Room */}
        <select value={filters.room_id} onChange={(e) => set('room_id', e.target.value)}
          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-orange-300 bg-white">
          <option value="">Toutes les salles</option>
          {rooms.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>

        {/* Staff */}
        <select value={filters.staff_id} onChange={(e) => set('staff_id', e.target.value)}
          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-orange-300 bg-white">
          <option value="">Tous les serveurs</option>
          {staff.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.role})</option>)}
        </select>

        {/* Table */}
        <select value={filters.table_id} onChange={(e) => set('table_id', e.target.value)}
          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-orange-300 bg-white">
          <option value="">Toutes les tables</option>
          {tables.map((t) => <option key={t.id} value={t.id}>{t.name}{t.room ? ` (${t.room.name})` : ''}</option>)}
        </select>

        {/* Payment method */}
        <select value={filters.payment_method} onChange={(e) => set('payment_method', e.target.value)}
          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-orange-300 bg-white">
          <option value="">Tout paiement</option>
          <option value="CASH">Espèces</option>
          <option value="CARD">Carte bancaire</option>
          <option value="OTHER">Autre</option>
          <option value="PENDING">Non payé / Sans paiement</option>
        </select>

        {/* Status chips */}
        <div className="flex items-center gap-1 flex-wrap">
          {statuses.map((s) => {
            const active = filters.status.includes(s);
            const cfg = STATUS_CFG[s];
            return (
              <button key={s} type="button"
                onClick={() => set('status', active ? filters.status.filter(x => x !== s) : [...filters.status, s])}
                className={`text-[11px] font-medium px-2 py-0.5 rounded-full border transition-colors ${
                  active ? `${cfg.cls} border-transparent` : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}>
                {cfg.label}
              </button>
            );
          })}
        </div>

        {/* Reset */}
        {activeCount > 0 && (
          <button type="button" onClick={reset}
            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium ml-auto">
            <RotateCcw size={12} /> Réinitialiser ({activeCount})
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Summary strip ────────────────────────────────────────────────────────────

function SummaryStrip({ orders, lang }) {
  const closed = orders.filter((o) => o.status === 'CLOSED');
  const ca = closed.reduce((s, o) => s + Number(o.total), 0);
  const cash = closed.filter((o) => o.payment_method === 'CASH').reduce((s, o) => s + Number(o.total), 0);
  const card = closed.filter((o) => o.payment_method === 'CARD').reduce((s, o) => s + Number(o.total), 0);
  const active = orders.filter((o) => ACTIVE_STATUSES.includes(o.status));
  const activeCA = active.reduce((s, o) => s + Number(o.total), 0);

  return (
    <div className="flex flex-wrap items-center gap-3 px-6 py-2 bg-gray-50 border-b border-gray-100 text-sm">
      <div className="flex items-center gap-1.5 text-gray-600">
        <Receipt size={14} className="text-orange-500" />
        <span className="font-semibold">{orders.length}</span> commande(s)
      </div>
      {ca > 0 && (
        <div className="flex items-center gap-1.5 text-gray-600">
          <TrendingUp size={14} className="text-green-500" />
          CA payé : <span className="font-bold text-gray-900">{formatDT(ca, lang)}</span>
        </div>
      )}
      {cash > 0 && (
        <div className="flex items-center gap-1.5 text-gray-600">
          <Banknote size={14} className="text-green-600" />
          <span className="font-semibold">{formatDT(cash, lang)}</span>
        </div>
      )}
      {card > 0 && (
        <div className="flex items-center gap-1.5 text-gray-600">
          <CreditCard size={14} className="text-orange-500" />
          <span className="font-semibold">{formatDT(card, lang)}</span>
        </div>
      )}
      {activeCA > 0 && (
        <div className="flex items-center gap-1.5 text-amber-600 ml-auto">
          <Clock size={14} />
          En cours : <span className="font-bold">{formatDT(activeCA, lang)}</span>
        </div>
      )}
    </div>
  );
}

// ─── Order Row ────────────────────────────────────────────────────────────────

function OrderRow({ order, lang, canManage, canCashier, expanded, onToggle, onPay, onStatusChange }) {
  const itemCount = order.items?.length || 0;
  const itemNames = (order.items || []).slice(0, 2).map((i) => i.name_snapshot).join(', ');
  const more = itemCount > 2 ? ` +${itemCount - 2}` : '';

  return (
    <>
      <tr
        className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${expanded ? 'bg-orange-50/40' : ''}`}
        onClick={onToggle}
      >
        {/* Expand */}
        <td className="w-8 pl-4 py-3 text-gray-400">
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </td>
        {/* Date */}
        <td className="py-3 pr-3 text-xs text-gray-500 whitespace-nowrap">{fmtDatetime(order.created_at)}</td>
        {/* Table + Salle */}
        <td className="py-3 pr-4">
          <div className="text-sm font-semibold text-gray-800">{order.table?.name || <span className="text-gray-400">—</span>}</div>
          {order.table?.room && <div className="text-xs text-gray-400">{order.table.room.name}</div>}
        </td>
        {/* Serveur */}
        <td className="py-3 pr-4 text-sm text-gray-700">
          {order.staff?.name || <span className="text-xs text-orange-500 font-medium">En ligne</span>}
        </td>
        {/* Articles */}
        <td className="py-3 pr-4 max-w-[180px]">
          <div className="text-xs text-gray-600 truncate">{itemNames}{more}</div>
          <div className="text-[10px] text-gray-400">{itemCount} article(s)</div>
        </td>
        {/* Total */}
        <td className="py-3 pr-4 text-sm font-bold text-gray-900 whitespace-nowrap">
          {formatDT(order.total, lang)}
        </td>
        {/* Payment */}
        <td className="py-3 pr-4"><PayBadge method={order.payment_method} /></td>
        {/* Status */}
        <td className="py-3 pr-4"><StatusBadge status={order.status} /></td>
        {/* Actions */}
        <td className="py-3 pr-4" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-1.5">
            {canCashier && order.status === 'SERVED' && (
              <button type="button" onClick={() => onPay(order)}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-orange-500 text-white hover:bg-orange-600">
                Encaisser
              </button>
            )}
            {canManage && (VALID_TRANSITIONS[order.status] || []).length > 0 && (
              <select
                value=""
                onChange={(e) => { if (e.target.value) onStatusChange(order.id, e.target.value); }}
                className="text-[11px] border border-gray-200 rounded-lg px-1.5 py-1 bg-white focus:outline-none"
                onClick={(e) => e.stopPropagation()}
              >
                <option value="">Changer…</option>
                {(VALID_TRANSITIONS[order.status] || []).map((s) => (
                  <option key={s} value={s}>{STATUS_CFG[s]?.label || s}</option>
                ))}
              </select>
            )}
          </div>
        </td>
      </tr>

      {/* Expanded detail */}
      {expanded && (
        <tr>
          <td colSpan={9} className="bg-orange-50/20 px-10 py-4">
            <div className="space-y-1">
              {(order.items || []).map((item) => (
                <div key={item.id} className="flex items-start gap-3 text-sm">
                  <span className="text-gray-500 w-5 text-right shrink-0">{item.quantity}×</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-gray-800 font-medium">{item.name_snapshot}</span>
                    {(item.supplements || []).map((s, i) => (
                      <span key={i} className="text-xs text-gray-400 ml-1.5">+{s.option_name_snapshot}</span>
                    ))}
                  </div>
                  <span className="text-gray-700 font-semibold shrink-0">
                    {formatDT(Number(item.unit_price) * item.quantity, lang)}
                  </span>
                </div>
              ))}
              <div className="flex justify-between pt-2 border-t border-orange-100 mt-2">
                <span className="text-xs text-gray-500">
                  {order.payment?.processed_at
                    ? `Payé le ${fmtDatetime(order.payment.processed_at)}`
                    : order.notes || ''}
                </span>
                <span className="text-sm font-bold text-gray-900">Total : {formatDT(order.total, lang)}</span>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Group Section (by server / by table) ─────────────────────────────────────

function GroupSection({ groupKey, label, subtitle, orders, lang, canManage, canCashier, expandedId, onToggle, onPay, onStatusChange }) {
  const [open, setOpen] = useState(true);
  const total = orders.reduce((s, o) => s + Number(o.total), 0);

  return (
    <div className="mb-4">
      <button type="button" onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center gap-3 px-6 py-2.5 bg-gray-100 hover:bg-gray-200 transition-colors rounded-t-xl text-left">
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        <span className="font-semibold text-gray-800 flex-1">{label}</span>
        {subtitle && <span className="text-xs text-gray-500">{subtitle}</span>}
        <span className="text-xs font-bold text-orange-500 mr-2">{formatDT(total, lang)}</span>
        <span className="text-xs text-gray-500">{orders.length} cmd</span>
      </button>
      {open && (
        <div className="overflow-x-auto bg-white rounded-b-xl border border-gray-100 border-t-0">
          <table className="w-full text-left">
            <tbody>
              {orders.map((order) => (
                <OrderRow
                  key={order.id}
                  order={order}
                  lang={lang}
                  canManage={canManage}
                  canCashier={canCashier}
                  expanded={expandedId === order.id}
                  onToggle={() => onToggle(order.id)}
                  onPay={onPay}
                  onStatusChange={onStatusChange}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OrdersHistoryPage() {
  const { i18n } = useTranslation();
  const lang = ['fr', 'en', 'it', 'ar'].includes(i18n.language) ? i18n.language : 'fr';
  const { user } = useAuthStore();
  const restaurantId = user?.restaurant_id;
  const qc = useQueryClient();
  const canManage  = ['OWNER', 'MANAGER'].includes(user?.role);
  const canCashier = ['OWNER', 'MANAGER', 'CASHIER'].includes(user?.role);

  const [tab,        setTab]        = useState('active');   // 'active' | 'history'
  const [view,       setView]       = useState('list');      // 'list' | 'server' | 'table'
  const [expandedId, setExpandedId] = useState(null);
  const [payOrder,   setPayOrder]   = useState(null);

  const [filters, setFilters] = useState({
    from: '', to: '', status: [], room_id: '', staff_id: '', table_id: '', payment_method: '',
  });

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (filters.from || filters.to) n++;
    if (filters.status.length)    n += filters.status.length;
    if (filters.room_id)          n++;
    if (filters.staff_id)         n++;
    if (filters.table_id)         n++;
    if (filters.payment_method)   n++;
    return n;
  }, [filters]);

  // Build query string
  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    // Tab default statuses
    const defaultStatuses = tab === 'active' ? ACTIVE_STATUSES : HISTORY_STATUSES;
    const statuses = filters.status.length > 0 ? filters.status : defaultStatuses;
    params.set('status', statuses.join(','));
    if (filters.from)           params.set('from', filters.from);
    if (filters.to)             params.set('to',   filters.to);
    if (filters.room_id)        params.set('room_id',        filters.room_id);
    if (filters.staff_id)       params.set('staff_id',       filters.staff_id);
    if (filters.table_id)       params.set('table_id',       filters.table_id);
    if (filters.payment_method) params.set('payment_method', filters.payment_method);
    params.set('limit', '500');
    return params.toString();
  }, [tab, filters]);

  // Orders query
  const { data: ordersResp, isLoading } = useQuery({
    queryKey: ['orders-history', restaurantId, queryString],
    queryFn: () => api.get(`/orders?${queryString}`).then((r) => r.data),
    enabled: !!restaurantId,
    staleTime: 0,
  });
  const orders = ordersResp?.data || [];
  const total  = ordersResp?.total || 0;

  // Filter option queries
  const { data: roomsData }  = useQuery({ queryKey: ['rooms',  restaurantId], queryFn: () => api.get('/tables/rooms').then(r => r.data.data), enabled: !!restaurantId, staleTime: 60_000 });
  const { data: staffData }  = useQuery({ queryKey: ['staff',  restaurantId], queryFn: () => api.get('/staff').then(r => r.data.data).catch(() => []), enabled: !!restaurantId && canManage, staleTime: 60_000 });
  const { data: tablesData } = useQuery({ queryKey: ['tables', restaurantId], queryFn: () => api.get('/tables').then(r => r.data.data), enabled: !!restaurantId, staleTime: 60_000 });

  const rooms  = roomsData  || [];
  const staff  = staffData  || [];
  const tables = (tablesData || []).map(t => ({ ...t, room: rooms.find(r => r.id === t.room_id) }));

  // Status change mutation
  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => api.put(`/orders/${id}/status`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders-history'] });
      toast.success('Statut mis à jour');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Erreur'),
  });

  function handleStatusChange(id, status) {
    statusMutation.mutate({ id, status });
  }

  function handlePaySuccess() {
    setPayOrder(null);
    qc.invalidateQueries({ queryKey: ['orders-history'] });
    qc.invalidateQueries({ queryKey: ['pos-active-tables'] });
    qc.invalidateQueries({ queryKey: ['tables'] });
  }

  function toggleExpand(id) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  // ── Grouping ──────────────────────────────────────────────────────────────

  const groupedByServer = useMemo(() => {
    const map = new Map();
    orders.forEach((o) => {
      const key = o.staff_id || '__none__';
      const label = o.staff?.name || 'Sans serveur';
      if (!map.has(key)) map.set(key, { label, orders: [] });
      map.get(key).orders.push(o);
    });
    return [...map.entries()].map(([key, val]) => ({ key, ...val }));
  }, [orders]);

  const groupedByTable = useMemo(() => {
    const map = new Map();
    orders.forEach((o) => {
      const key = o.table_id || '__none__';
      const label = o.table?.name || 'Sans table';
      const sub   = o.table?.room?.name || '';
      if (!map.has(key)) map.set(key, { label, sub, orders: [] });
      map.get(key).orders.push(o);
    });
    return [...map.entries()].map(([key, val]) => ({ key, ...val }));
  }, [orders]);

  // ── Render ────────────────────────────────────────────────────────────────

  const tableHeaders = ['', 'Date / Heure', 'Table · Salle', 'Serveur', 'Articles', 'Total', 'Paiement', 'Statut', 'Actions'];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-white shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Receipt size={20} className="text-orange-500" /> Commandes & Historique
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {total > 0 ? `${total} résultat(s)` : 'Aucun résultat'}
            </p>
          </div>

          {/* View toggles */}
          <div className="flex items-center gap-2">
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              {[
                { k: 'list',   icon: List,   title: 'Liste' },
                { k: 'server', icon: Users,  title: 'Par serveur' },
                { k: 'table',  icon: Table2, title: 'Par table' },
              ].map(({ k, icon: Icon, title }) => (
                <button key={k} type="button" title={title}
                  onClick={() => setView(k)}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
                    view === k ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
                  }`}>
                  <Icon size={14} /><span className="hidden sm:inline">{title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-3">
          {[
            { k: 'active',  label: 'En cours',   icon: Clock,         cls: 'text-amber-600' },
            { k: 'history', label: 'Historique',  icon: CheckCircle2,  cls: 'text-green-600' },
          ].map(({ k, label, icon: Icon, cls }) => (
            <button key={k} type="button"
              onClick={() => { setTab(k); setFilters(p => ({ ...p, status: [] })); setExpandedId(null); }}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                tab === k
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}>
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <FilterBar
        filters={filters}
        setFilters={setFilters}
        rooms={rooms}
        staff={staff}
        tables={tables}
        tab={tab}
        activeCount={activeFilterCount}
      />

      {/* Summary */}
      <SummaryStrip orders={orders} lang={lang} />

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <div className="flex justify-center pt-16">
            <Loader2 size={28} className="animate-spin text-orange-500" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
            <AlertCircle size={36} className="text-gray-300" />
            <p className="font-medium text-gray-500">Aucune commande trouvée</p>
            <p className="text-sm">Modifiez les filtres ou la période.</p>
          </div>
        ) : view === 'list' ? (
          <div className="overflow-x-auto bg-white rounded-2xl border border-gray-100 shadow-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  {tableHeaders.map((h) => (
                    <th key={h} className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-3 py-2.5 first:pl-4 last:pr-4 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <OrderRow
                    key={order.id}
                    order={order}
                    lang={lang}
                    canManage={canManage}
                    canCashier={canCashier}
                    expanded={expandedId === order.id}
                    onToggle={() => toggleExpand(order.id)}
                    onPay={setPayOrder}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </tbody>
            </table>
          </div>
        ) : view === 'server' ? (
          <div>
            {groupedByServer.map(({ key, label, orders: grpOrders }) => (
              <GroupSection
                key={key}
                groupKey={key}
                label={label}
                subtitle={`${grpOrders.length} commande(s)`}
                orders={grpOrders}
                lang={lang}
                canManage={canManage}
                canCashier={canCashier}
                expandedId={expandedId}
                onToggle={toggleExpand}
                onPay={setPayOrder}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        ) : (
          <div>
            {groupedByTable.map(({ key, label, sub, orders: grpOrders }) => (
              <GroupSection
                key={key}
                groupKey={key}
                label={label}
                subtitle={sub}
                orders={grpOrders}
                lang={lang}
                canManage={canManage}
                canCashier={canCashier}
                expandedId={expandedId}
                onToggle={toggleExpand}
                onPay={setPayOrder}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </div>

      {/* Payment modal */}
      {payOrder && (
        <PaymentModal
          order={payOrder}
          lang={lang}
          onClose={() => setPayOrder(null)}
          onSuccess={handlePaySuccess}
        />
      )}
    </div>
  );
}
