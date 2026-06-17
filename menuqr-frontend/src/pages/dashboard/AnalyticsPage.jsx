import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import {
  TrendingUp, TrendingDown, Download, BarChart2,
  Clock, CalendarDays,
  Banknote, ShoppingBag, Receipt, Loader2, List,
} from 'lucide-react';
import { format, subDays, startOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { formatDT } from '../../utils/currency';
import { cn } from '../../lib/utils';

// ─── Config ───────────────────────────────────────────────────────────────────

const PERIODS = [
  { key: '7d',     label: '7 jours'      },
  { key: '30d',    label: '30 jours'     },
  { key: 'month',  label: 'Ce mois'      },
  { key: 'custom', label: 'Personnalisé' },
];


function periodToRange(period, custom) {
  const today = format(new Date(), 'yyyy-MM-dd');
  if (period === '7d')    return { from: format(subDays(new Date(), 6),  'yyyy-MM-dd'), to: today };
  if (period === '30d')   return { from: format(subDays(new Date(), 29), 'yyyy-MM-dd'), to: today };
  if (period === 'month') return { from: format(startOfMonth(new Date()), 'yyyy-MM-dd'), to: today };
  return { from: custom.from, to: custom.to };
}

// ─── Small helpers ────────────────────────────────────────────────────────────

const STATUS_STYLE = {
  CONFIRMEE:        { label: 'Confirmée',  cls: 'text-teal-600'  },
  RAPPEL_ENVOYE:    { label: 'Rappel',     cls: 'text-blue-500'  },
  EN_ATTENTE:       { label: 'En attente', cls: 'text-amber-500' },
  ARRIVEE:          { label: 'Arrivée',    cls: 'text-green-600' },
  TERMINEE:         { label: 'Terminée',   cls: 'text-gray-400'  },
  ANNULEE:          { label: 'Annulée',    cls: 'text-red-400'   },
  ANNULEE_CLIENT:   { label: 'Annulée',    cls: 'text-red-400'   },
  ANNULEE_RESTAURANT: { label: 'Annulée', cls: 'text-red-400'   },
  NO_SHOW:          { label: 'No-show',    cls: 'text-red-500'   },
};

const ZONE_LABEL = { SALLE: 'Salle', TERRASSE: 'Terrasse', ETAGE: 'Étage' };

const ORDER_STATUS_CFG = {
  PENDING:   { label: 'En attente',  cls: 'bg-amber-100 text-amber-700',   dot: 'bg-amber-400'   },
  CONFIRMED: { label: 'Confirmée',   cls: 'bg-blue-100 text-blue-700',     dot: 'bg-blue-400'    },
  PREPARING: { label: 'En cuisine',  cls: 'bg-purple-100 text-purple-700', dot: 'bg-purple-400'  },
  READY:     { label: 'Prête',       cls: 'bg-green-100 text-green-700',   dot: 'bg-green-400'   },
  SERVED:    { label: 'Servie',      cls: 'bg-teal-100 text-teal-700',     dot: 'bg-teal-400'    },
  CLOSED:    { label: 'Payée',       cls: 'bg-gray-100 text-gray-600',     dot: 'bg-gray-400'    },
  CANCELLED: { label: 'Annulée',     cls: 'bg-red-100 text-red-600',       dot: 'bg-red-400'     },
};

const KPI_DEFS = [
  { key: 'revenue',      label: "Chiffre d'affaires", deltaKey: 'delta_revenue', icon: Banknote,     fmt: (v, l) => formatDT(v, l) },
  { key: 'orders_count', label: 'Commandes',           deltaKey: 'delta_orders',  icon: ShoppingBag,  fmt: (v)    => v              },
  { key: 'avg_order',    label: 'Ticket moyen',         deltaKey: null,            icon: Receipt,      fmt: (v, l) => formatDT(v, l) },
  { key: 'resv_count',   label: 'Réservations',         deltaKey: null,            icon: CalendarDays, fmt: (v)    => v              },
];

function KpiCard({ def, kpis, lang }) {
  const raw   = kpis?.[def.key] ?? 0;
  const delta = def.deltaKey ? kpis?.[def.deltaKey] : null;
  const Icon  = def.icon;
  const up    = delta >= 0;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-500">{def.label}</span>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-orange-500">
          <Icon size={15} className="text-white" />
        </div>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-gray-900">{def.fmt(raw, lang)}</span>
        {delta !== null && delta !== undefined && (
          <span className={cn('text-sm font-semibold mb-0.5', up ? 'text-green-500' : 'text-red-500')}>
            {up ? '+' : ''}{delta}%
          </span>
        )}
      </div>
    </div>
  );
}

function SectionTitle({ icon: Icon, children }) {
  return (
    <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-1.5">
      <Icon size={14} className="text-gray-400" />
      {children}
    </h2>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const { i18n } = useTranslation();
  const lang = ['fr', 'en', 'it', 'ar'].includes(i18n.language) ? i18n.language : 'fr';

  const [period, setPeriod] = useState('30d');
  const [custom, setCustom] = useState({ from: '', to: '' });
  const [topPeriod, setTopPeriod] = useState('weekly');
  const [revPeriod,  setRevPeriod]  = useState('weekly');
  const [daysPeriod, setDaysPeriod] = useState('weekly');
  const [resvPeriod, setResvPeriod] = useState('weekly');
  const [payPeriod,    setPayPeriod]    = useState('weekly');
  const [recentPeriod, setRecentPeriod] = useState('weekly');

  const range        = useMemo(() => periodToRange(period, custom), [period, custom]);
  const queryParams  = range.from && range.to ? `?from=${range.from}&to=${range.to}` : '';
  const enabled      = !!queryParams;

  const topRange = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return topPeriod === 'weekly'
      ? { from: format(subDays(new Date(), 6), 'yyyy-MM-dd'), to: today }
      : { from: format(subDays(new Date(), 29), 'yyyy-MM-dd'), to: today };
  }, [topPeriod]);

  const revRange = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return revPeriod === 'weekly'
      ? { from: format(subDays(new Date(), 6), 'yyyy-MM-dd'), to: today }
      : { from: format(subDays(new Date(), 29), 'yyyy-MM-dd'), to: today };
  }, [revPeriod]);

  const resvRange = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return resvPeriod === 'weekly'
      ? { from: format(subDays(new Date(), 6), 'yyyy-MM-dd'), to: today }
      : { from: format(subDays(new Date(), 29), 'yyyy-MM-dd'), to: today };
  }, [resvPeriod]);

  const daysRange = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return daysPeriod === 'weekly'
      ? { from: format(subDays(new Date(), 6), 'yyyy-MM-dd'), to: today }
      : { from: format(subDays(new Date(), 29), 'yyyy-MM-dd'), to: today };
  }, [daysPeriod]);

  const payRange = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    if (payPeriod === 'today')   return { from: today, to: today };
    if (payPeriod === 'weekly')  return { from: format(subDays(new Date(), 6), 'yyyy-MM-dd'), to: today };
    return { from: format(subDays(new Date(), 29), 'yyyy-MM-dd'), to: today };
  }, [payPeriod]);

  const recentRange = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    if (recentPeriod === 'today')   return { from: today, to: today };
    if (recentPeriod === 'weekly')  return { from: format(subDays(new Date(), 6), 'yyyy-MM-dd'), to: today };
    return { from: format(subDays(new Date(), 29), 'yyyy-MM-dd'), to: today };
  }, [recentPeriod]);

  // ── Queries ────────────────────────────────────────────────────────────────

  const { data: kpis, isLoading: kpisLoading } = useQuery({
    queryKey: ['analytics-kpis', range],
    queryFn:  () => api.get(`/analytics/kpis${queryParams}`).then((r) => r.data.data),
    enabled,
  });

  const { data: chart = [] } = useQuery({
    queryKey: ['analytics-chart', revRange],
    queryFn:  () => api.get(`/analytics/revenue-chart?from=${revRange.from}&to=${revRange.to}`).then((r) => r.data.data),
  });

  const { data: topDishes = [] } = useQuery({
    queryKey: ['analytics-top', topRange],
    queryFn:  () => api.get(`/analytics/top-dishes?from=${topRange.from}&to=${topRange.to}`).then((r) => r.data.data),
  });

  const { data: byDay = [] } = useQuery({
    queryKey: ['analytics-day', daysRange],
    queryFn:  () => api.get(`/analytics/revenue-chart?from=${daysRange.from}&to=${daysRange.to}`).then((r) => r.data.data),
  });

const { data: resvStats } = useQuery({
    queryKey: ['analytics-reservations', range],
    queryFn:  () => api.get(`/analytics/reservations${queryParams}`).then((r) => r.data.data),
    enabled,
  });

  const { data: resvList = [] } = useQuery({
    queryKey: ['analytics-resv-list', resvRange],
    queryFn:  () => api.get(`/analytics/reservations-list?from=${resvRange.from}&to=${resvRange.to}`).then((r) => r.data.data),
  });

  const { data: recentOrders = [] } = useQuery({
    queryKey: ['analytics-recent-orders', recentRange],
    queryFn:  () => api.get(`/orders?limit=20&from=${recentRange.from}&to=${recentRange.to}`).then((r) => r.data.data ?? []),
    refetchInterval: 30_000,
  });

  const { data: paymentStats } = useQuery({
    queryKey: ['analytics-payments', payRange],
    queryFn:  () => api.get(`/analytics/payments?from=${payRange.from}&to=${payRange.to}`).then((r) => r.data),
  });

  // ── CSV export (with auth header via api instance) ─────────────────────────

  async function exportCSV() {
    try {
      const res = await api.get(`/analytics/export/csv${queryParams}`, { responseType: 'blob' });
      const url  = URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href  = url;
      link.setAttribute('download', `analytics-${range.from}-${range.to}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Erreur lors de l\'export CSV');
    }
  }

  const fmtDate = (d) => {
    if (!d) return '';
    try { return format(new Date(d), 'd MMM', { locale: fr }); } catch { return d; }
  };

  const hasAnyData = chart.length > 0 || topDishes.length > 0;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart2 size={22} className="text-orange-500" />
            Analytics & Rapports
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Analyse des ventes et performances</p>
        </div>
        <button
          type="button"
          onClick={exportCSV}
          disabled={!enabled}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-40"
        >
          <Download size={15} />
          Export CSV
        </button>
      </div>

      {/* ── Period selector ── */}
      <div className="flex items-center gap-2 flex-wrap">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => setPeriod(p.key)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium border transition-colors',
              period === p.key
                ? 'bg-orange-500 text-white border-orange-500'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300',
            )}
          >
            {p.label}
          </button>
        ))}
        {period === 'custom' && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={custom.from}
              onChange={(e) => setCustom((c) => ({ ...c, from: e.target.value }))}
              className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-orange-300"
            />
            <span className="text-gray-400 text-sm">→</span>
            <input
              type="date"
              value={custom.to}
              onChange={(e) => setCustom((c) => ({ ...c, to: e.target.value }))}
              className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-orange-300"
            />
          </div>
        )}
      </div>

      {/* ── KPI Cards ── */}
      {kpisLoading ? (
        <div className="flex items-center justify-center h-28">
          <Loader2 size={28} className="animate-spin text-orange-400" />
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {KPI_DEFS.map((def) => (
            <KpiCard key={def.key} def={def} kpis={kpis} lang={lang} />
          ))}
        </div>
      )}

      {/* ── Row 1 : Revenue chart + Top dishes ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Revenue Area Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
              <TrendingUp size={14} className="text-gray-400" />
              Revenus
            </h2>
            <div className="flex items-center bg-gray-100 rounded-lg p-0.5 gap-0.5">
              {[{ key: 'weekly', label: 'Semaine' }, { key: 'monthly', label: 'Mois' }].map(({ key, label }) => (
                <button key={key} type="button" onClick={() => setRevPeriod(key)}
                  className={cn('px-3 py-1 text-xs font-medium rounded-md transition-all',
                    revPeriod === key ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  )}
                >{label}</button>
              ))}
            </div>
          </div>
          {chart.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-6">Aucune donnée</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F97316" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#F97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#f3f4f6" strokeDasharray="4 4" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(d) => {
                    try {
                      return revPeriod === 'weekly'
                        ? format(new Date(d), 'EEE', { locale: fr })
                        : format(new Date(d), 'd MMM', { locale: fr });
                    } catch { return d; }
                  }}
                  interval={revPeriod === 'monthly' ? 4 : 0}
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                  dy={8}
                />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={(v) => `${v}`} axisLine={false} tickLine={false} width={42} />
                <Tooltip
                  cursor={{ stroke: '#F97316', strokeWidth: 1, strokeDasharray: '4 4' }}
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="bg-white border border-gray-100 shadow-lg rounded-xl px-4 py-2.5 text-sm">
                        <p className="text-gray-400 text-xs mb-0.5">{fmtDate(label)}</p>
                        <p className="font-bold text-orange-500">{formatDT(payload[0].value, lang)}</p>
                      </div>
                    );
                  }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#F97316" strokeWidth={2.5} fill="url(#revenueGradient)" dot={false} activeDot={{ r: 5, fill: '#F97316', stroke: '#fff', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top dishes */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-800">Plats les plus populaires</h2>
            <div className="flex items-center bg-gray-100 rounded-lg p-0.5 gap-0.5">
              {[{ key: 'weekly', label: 'Semaine' }, { key: 'monthly', label: 'Mois' }].map(({ key, label }) => (
                <button key={key} type="button" onClick={() => setTopPeriod(key)}
                  className={cn('px-3 py-1 text-xs font-medium rounded-md transition-all',
                    topPeriod === key ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  )}
                >{label}</button>
              ))}
            </div>
          </div>
          {topDishes.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-6">Aucune donnée</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left text-xs text-gray-400 font-medium pb-3 pr-3">Nom du plat</th>
                  <th className="text-right text-xs text-gray-400 font-medium pb-3 pr-3">Prix</th>
                  <th className="text-right text-xs text-gray-400 font-medium pb-3">CA</th>
                </tr>
              </thead>
              <tbody>
                {topDishes.map((d) => {
                  const hue = (d.rank * 47 + 120) % 360;
                  return (
                    <tr key={d.name} className="border-t border-gray-50">
                      <td className="py-2.5 pr-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold" style={{ backgroundColor: `hsl(${hue},55%,60%)` }}>
                            {d.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <span className="text-sm font-medium text-gray-800 truncate">{d.name}</span>
                        </div>
                      </td>
                      <td className="text-right text-sm text-gray-600 pr-3 whitespace-nowrap">{d.price > 0 ? formatDT(d.price, lang) : '—'}</td>
                      <td className="text-right text-sm font-bold text-gray-900 whitespace-nowrap">{formatDT(d.revenue, lang)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Row 2 : Commandes + Réservations ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Commandes par jour */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
              <Clock size={14} className="text-gray-400" />
              Commandes
            </h2>
            <div className="flex items-center bg-gray-100 rounded-lg p-0.5 gap-0.5">
              {[{ key: 'weekly', label: 'Semaine' }, { key: 'monthly', label: 'Mois' }].map(({ key, label }) => (
                <button key={key} type="button" onClick={() => setDaysPeriod(key)}
                  className={cn('px-3 py-1 text-xs font-medium rounded-md transition-all',
                    daysPeriod === key ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  )}
                >{label}</button>
              ))}
            </div>
          </div>
          {byDay.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-6">Aucune donnée</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={byDay} margin={{ top: 8, right: 8, left: -10, bottom: 0 }} barCategoryGap="30%">
                <defs>
                  <pattern id="hatchGreen" patternUnits="userSpaceOnUse" width="10" height="10">
                    <rect width="10" height="10" fill="#3d9d7e" />
                    <line x1="0" y1="10" x2="10" y2="0" stroke="#2b7a60" strokeWidth="4.5" />
                    <line x1="-5" y1="5" x2="5" y2="-5" stroke="#2b7a60" strokeWidth="4.5" />
                    <line x1="5" y1="15" x2="15" y2="5" stroke="#2b7a60" strokeWidth="4.5" />
                  </pattern>
                </defs>
                <CartesianGrid vertical={false} stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(d) => {
                    try {
                      return daysPeriod === 'weekly'
                        ? format(new Date(d), 'EEE', { locale: fr })
                        : format(new Date(d), 'd MMM', { locale: fr });
                    } catch { return d; }
                  }}
                  interval={daysPeriod === 'monthly' ? 4 : 0}
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                  dy={6}
                />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} width={28} />
                <Tooltip cursor={false} content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="bg-white border border-gray-100 shadow-lg rounded-xl px-4 py-2.5 text-sm min-w-[130px]">
                      <p className="text-gray-800 font-semibold mb-0.5">{fmtDate(label)}</p>
                      <p style={{ color: '#3d9d7e' }} className="font-medium">Commandes : {payload[0].value}</p>
                    </div>
                  );
                }} />
                <Bar dataKey="orders" fill="url(#hatchGreen)" background={{ fill: '#efefef', radius: [5, 5, 0, 0] }} radius={[5, 5, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Reservations list */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-800">Réservations</h2>
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-gray-100 rounded-lg p-0.5 gap-0.5">
                {[{ key: 'weekly', label: 'Semaine' }, { key: 'monthly', label: 'Mois' }].map(({ key, label }) => (
                  <button key={key} type="button" onClick={() => setResvPeriod(key)}
                    className={cn('px-3 py-1 text-xs font-medium rounded-md transition-all',
                      resvPeriod === key ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    )}
                  >{label}</button>
                ))}
              </div>
            </div>
          </div>

          {resvList.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-6">Aucune réservation</p>
          ) : (
            <div className="space-y-0">
              {resvList.map((r) => {
                const initials = `${r.name?.charAt(0) ?? '?'}`.toUpperCase();
                const hue = r.name?.charCodeAt(0) * 37 % 360;
                const st = STATUS_STYLE[r.status] ?? { label: r.status, cls: 'text-gray-400' };
                return (
                  <div key={r.id} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                    {/* Avatar */}
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold"
                      style={{ backgroundColor: `hsl(${hue},50%,55%)` }}
                    >
                      {initials}
                    </div>
                    {/* Name */}
                    <span className="text-sm font-medium text-gray-800 min-w-[100px] truncate">{r.name}</span>
                    {/* Time */}
                    <span className="text-xs text-gray-500 shrink-0">{r.time}</span>
                    {/* Zone */}
                    <span className="text-xs text-gray-400 shrink-0">{ZONE_LABEL[r.zone] ?? r.zone}</span>
                    {/* Covers */}
                    <span className="text-xs text-gray-500 shrink-0">{r.covers} pers.</span>
                    {/* Status */}
                    <span className={`text-xs font-semibold ml-auto shrink-0 ${st.cls}`}>{st.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Paiements + Commandes récentes (2 columns) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Paiements */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 self-start">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold text-gray-800">Paiements</h2>
              <p className="text-xs text-gray-400 mt-0.5">Répartition des paiements</p>
            </div>
            <div className="flex items-center bg-gray-100 rounded-lg p-0.5 gap-0.5">
              {[{ key: 'today', label: 'Jour' }, { key: 'weekly', label: 'Semaine' }, { key: 'monthly', label: 'Mois' }].map(({ key, label }) => (
                <button key={key} type="button" onClick={() => setPayPeriod(key)}
                  className={cn('px-2.5 py-1 text-xs font-medium rounded-md transition-all',
                    payPeriod === key ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  )}
                >{label}</button>
              ))}
            </div>
          </div>
          {paymentStats?.data?.length > 0 ? (
            <>
              <div className="flex rounded-full overflow-hidden h-2.5 mb-4 gap-0.5">
                {paymentStats.data.map((item) => (
                  <div key={item.method} style={{ width: `${item.pct}%`, backgroundColor: item.color }} className="h-full transition-all" />
                ))}
              </div>
              <div className="space-y-2.5">
                {paymentStats.data.map((item) => (
                  <div key={item.method} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-xs text-gray-700">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="font-bold text-gray-900">{item.pct}%</span>
                      <span className="text-gray-300">·</span>
                      <span className="text-gray-500">{formatDT(item.total, lang)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-center text-xs text-gray-400 py-4">Aucune donnée</p>
          )}
        </div>

        {/* Commandes récentes */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
            <List size={14} className="text-gray-400" />
            Commandes récentes
          </h2>
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5 gap-0.5">
            {[{ key: 'today', label: 'Jour' }, { key: 'weekly', label: 'Semaine' }, { key: 'monthly', label: 'Mois' }].map(({ key, label }) => (
              <button key={key} type="button" onClick={() => setRecentPeriod(key)}
                className={cn('px-2.5 py-1 text-xs font-medium rounded-md transition-all',
                  recentPeriod === key ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                )}
              >{label}</button>
            ))}
          </div>
        </div>
        {recentOrders.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-6">Aucune commande</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left font-semibold text-gray-400 uppercase tracking-wide pb-2 pr-2">#CMD</th>
                  <th className="text-left font-semibold text-gray-400 uppercase tracking-wide pb-2 pr-2">SERVEUR</th>
                  <th className="text-left font-semibold text-gray-400 uppercase tracking-wide pb-2 pr-2">TABLE</th>
                  <th className="text-right font-semibold text-gray-400 uppercase tracking-wide pb-2 pr-2">MONTANT</th>
                  <th className="text-left font-semibold text-gray-400 uppercase tracking-wide pb-2">STATUT</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => {
                  const st = ORDER_STATUS_CFG[order.status] ?? ORDER_STATUS_CFG.PENDING;
                  const serverName = order.staff?.name ?? null;
                  const initials = serverName ? serverName.charAt(0).toUpperCase() : '?';
                  const hue = serverName ? serverName.charCodeAt(0) * 47 % 360 : 200;
                  return (
                    <tr key={order.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="py-2 pr-2">
                        <span className="font-semibold text-gray-800">#{String(order.id).slice(0, 8)}</span>
                      </td>
                      <td className="py-2 pr-2">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-white font-bold"
                            style={{ fontSize: 10, backgroundColor: `hsl(${hue},50%,55%)` }}
                          >
                            {initials}
                          </div>
                          {serverName
                            ? <span className="text-gray-700 truncate max-w-[60px]">{serverName}</span>
                            : <span className="font-semibold px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-600 whitespace-nowrap">En ligne</span>
                          }
                        </div>
                      </td>
                      <td className="py-2 pr-2 text-gray-600 whitespace-nowrap">
                        {order.table?.number != null ? `T${order.table.number}` : '—'}
                      </td>
                      <td className="py-2 pr-2 text-right font-semibold text-gray-900 whitespace-nowrap">
                        {formatDT(order.total ?? 0, lang)}
                      </td>
                      <td className="py-2">
                        <span className={`inline-flex items-center gap-1 font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap ${st.cls}`} style={{ fontSize: 10 }}>
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${st.dot}`} />
                          {st.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        </div>
      </div>

      {/* ── Empty state ── */}
      {!kpisLoading && !hasAnyData && enabled && (
        <div className="text-center py-16 text-gray-400">
          <BarChart2 size={36} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium text-gray-500">Aucune donnée pour la période sélectionnée</p>
          <p className="text-xs mt-1">Essayez une période plus longue ou vérifiez que des commandes ont été encaissées.</p>
        </div>
      )}
    </div>
  );
}
