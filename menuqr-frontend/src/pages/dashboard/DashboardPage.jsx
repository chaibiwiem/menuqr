import { useEffect } from 'react';
import { Routes, Route, NavLink, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import MenuPage from './MenuPage';
import OrdersPage from './OrdersPage';
import TablesPage from './TablesPage';
import ReservationsPage from './ReservationsPage';
import StaffPage from './StaffPage';
import CallWaiterPage from './CallWaiterPage';
import POSPage from './POSPage';
import ServiceClosePage from './ServiceClosePage';
import OrdersHistoryPage from './OrdersHistoryPage';
import BillingPage from './BillingPage';
import AnalyticsPage from './AnalyticsPage';
import NotificationSettingsPage from './NotificationSettingsPage';
import SettingsPage from './SettingsPage';
import {
  LayoutDashboard, UtensilsCrossed, ShoppingBag, QrCode, LayoutGrid,
  CalendarDays, Users, Settings, LogOut, Loader2,
  TrendingUp, Clock, Wallet, Calendar, Bell, Receipt, CreditCard, BarChart2, Lock,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { formatDT } from '../../utils/currency';
import api from '../../api/axios';
import { cn } from '../../lib/utils';
import CallWaiterWidget from '../../components/dashboard/CallWaiterWidget';
import { useNotifications } from '../../hooks/useNotifications';
import { unlockAudio } from '../../utils/sounds';
import NewOrderModal from '../../components/shared/NewOrderModal';
import CallWaiterModal from '../../components/shared/CallWaiterModal';
import NewReservationModal from '../../components/shared/NewReservationModal';
import NotificationBell from '../../components/shared/NotificationBell';
import { useDashboardSocket } from '../../hooks/useDashboardSocket';
import TopDishesWidget from '../../components/dashboard/TopDishesWidget';
import QRScansWidget from '../../components/dashboard/QRScansWidget';
import ReservationsWidget from '../../components/dashboard/ReservationsWidget';
import RevenueChartWidget from '../../components/dashboard/RevenueChartWidget';

// â"€â"€â"€ Smart index: renders the right section when served from an explicit route â"€
// When React Router mounts DashboardPage from /dashboard/menu (score 20, not via /dashboard/*)
// the internal <Routes> sees an empty remaining path and matches <Route index>.
// SmartIndex reads the full pathname and renders the correct section directly.

function SmartIndex({ role, plan, subStatus }) {
  const { pathname } = useLocation();
  const section = pathname.match(/^\/dashboard\/([^/]+)/)?.[1];

  if (!section) return <DashboardHome />;

  const ownerManager = ['OWNER', 'MANAGER'].includes(role);
  const canPOS       = ['OWNER', 'MANAGER', 'CASHIER', 'STAFF'].includes(role); // STAFF: lecture + pré-addition seulement
  const isExpired    = subStatus && !['ACTIVE', 'TRIAL'].includes(subStatus);

  function guard(requiredPlans, element) {
    if (role === 'OWNER' && plan && (!planAllows(plan, requiredPlans) || isExpired)) {
      return <UpgradeRequired plans={requiredPlans} />;
    }
    return element;
  }

  const sectionMap = {
    menu:            ownerManager ? <MenuPage />                                             : null,
    orders:          <OrdersPage />,
    'orders-history':<OrdersHistoryPage />,
    tables:          <TablesPage />,
    'call-waiter':   guard(['STARTER', 'PRO', 'PREMIUM'], <CallWaiterPage />),
    reservations:    guard(['PRO', 'PREMIUM'], <ReservationsPage />),
    pos:             canPOS ? guard(['PREMIUM'], <POSPage />)                                : null,
    'service-close': ownerManager ? guard(['PREMIUM'], <ServiceClosePage />)                : null,
    billing:         role === 'OWNER' ? <BillingPage />                                     : null,
    analytics:       ownerManager ? guard(['PRO', 'PREMIUM'], <AnalyticsPage />)            : null,
    notifications:   ownerManager ? <NotificationSettingsPage />                            : null,
    staff:           ownerManager ? guard(['STARTER', 'PRO', 'PREMIUM'], <StaffPage />)    : null,
    settings:        ownerManager ? <SettingsPage />                                        : null,
  };

  if (!(section in sectionMap)) return <DashboardHome />;
  return sectionMap[section] ?? <Navigate to="/dashboard" replace />;
}

// â"€â"€â"€ Sidebar nav config â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

const PLAN_ORDER = ['FREE', 'STARTER', 'PRO', 'PREMIUM'];

function planAllows(currentPlan, requiredPlans) {
  if (!requiredPlans) return true;
  return requiredPlans.includes(currentPlan);
}

function buildNav(role, plan = null, subStatus = null) {
  const isExpired = subStatus && !['ACTIVE', 'TRIAL'].includes(subStatus);

  const all = [
    { to: '/dashboard',                label: 'dashboard.nav.overview',     icon: LayoutDashboard, end: true },
    { to: '/dashboard/menu',           label: 'dashboard.nav.menu',         icon: UtensilsCrossed, roles: ['OWNER', 'MANAGER'] },
    { to: '/dashboard/orders',         label: 'dashboard.nav.orders',       icon: ShoppingBag },
    { to: '/dashboard/orders-history', label: 'Historique',                  icon: Receipt },
    { to: '/dashboard/tables',         label: 'dashboard.nav.tables',       icon: QrCode },
    { to: '/dashboard/call-waiter',    label: 'dashboard.nav.call_waiter',  icon: Bell,       plans: ['STARTER', 'PRO', 'PREMIUM'] },
    { to: '/dashboard/reservations',   label: 'dashboard.nav.reservations', icon: CalendarDays, plans: ['PRO', 'PREMIUM'] },
    { to: '/dashboard/pos',            label: 'POS Caisse',                  icon: Wallet,     roles: ['OWNER', 'MANAGER', 'CASHIER', 'STAFF'], plans: ['PREMIUM'] },
    { to: '/dashboard/service-close',  label: 'Clôture',                     icon: TrendingUp, roles: ['OWNER', 'MANAGER'], plans: ['PREMIUM'] },
    { to: '/dashboard/billing',        label: 'dashboard.billing',           icon: CreditCard, roles: ['OWNER'] },
    { to: '/dashboard/analytics',      label: 'Analytics',                   icon: BarChart2,  roles: ['OWNER', 'MANAGER'], plans: ['PRO', 'PREMIUM'] },
    { to: '/dashboard/staff',          label: 'dashboard.nav.staff',         icon: Users,      roles: ['OWNER', 'MANAGER'], plans: ['STARTER', 'PRO', 'PREMIUM'] },
    { to: '/dashboard/settings',       label: 'dashboard.nav.settings',      icon: Settings,   roles: ['OWNER', 'MANAGER'] },
  ];

  return all
    .filter((item) => !item.roles || item.roles.includes(role))
    .map((item) => {
      const locked =
        role === 'OWNER' &&
        plan !== null &&
        (isExpired || (item.plans && !planAllows(plan, item.plans)));
      return { ...item, locked: !!locked };
    });
}

function NavCallBadge({ restaurantId }) {
  const { data } = useQuery({
    queryKey: ['table-calls', restaurantId],
    queryFn: () => api.get('/tables/calls').then((r) => r.data.data),
    enabled: !!restaurantId,
    refetchInterval: 15_000,
  });
  const count = data?.length || 0;
  if (!count) return null;
  return (
    <span className="ml-auto shrink-0 px-1.5 min-w-[18px] text-center py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold leading-tight animate-pulse">
      {count}
    </span>
  );
}

// â"€â"€â"€ Dashboard Header (top bar with live icons) â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

function DashboardHeader({ restaurantId, unreadCount, role }) {
  const navigate = useNavigate();

  const { data: callsData } = useQuery({
    queryKey: ['table-calls', restaurantId],
    queryFn: () => api.get('/tables/calls').then((r) => r.data.data),
    enabled: !!restaurantId,
    refetchInterval: 15_000,
  });

  const { data: ordersData } = useQuery({
    queryKey: ['orders-pending-header', restaurantId],
    queryFn: () => api.get('/orders?status=PENDING&limit=100').then((r) => r.data),
    enabled: !!restaurantId,
    refetchInterval: 20_000,
  });

  const callCount    = callsData?.length || 0;
  const pendingCount = ordersData?.data?.length || 0;

  return (
    <header className="shrink-0 h-12 bg-white border-b border-gray-100 flex items-center justify-end px-3 md:px-4 gap-1">

      {/* â"€â"€ Call waiter icon â"€â"€ */}
      <button
        type="button"
        onClick={() => navigate('/dashboard/call-waiter')}
        className="relative flex items-center justify-center w-9 h-9 rounded-xl hover:bg-amber-50 transition-colors group"
        title="Appels salle"
      >
        <Bell size={18} className={cn('transition-colors', callCount > 0 ? 'text-amber-500' : 'text-gray-400 group-hover:text-amber-500')} />
        {callCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse leading-none">
            {callCount}
          </span>
        )}
      </button>

      {/* â"€â"€ Commandes en attente icon â"€â"€ */}
      <button
        type="button"
        onClick={() => navigate('/dashboard/orders')}
        className="relative flex items-center justify-center w-9 h-9 rounded-xl hover:bg-orange-50 transition-colors group"
        title="Commandes en attente"
      >
        <ShoppingBag size={18} className={cn('transition-colors', pendingCount > 0 ? 'text-orange-500' : 'text-gray-400 group-hover:text-orange-500')} />
        {pendingCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-orange-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse leading-none">
            {pendingCount}
          </span>
        )}
      </button>

      {/* â"€â"€ Notification bell (OWNER/MANAGER) â"€â"€ */}
      {['OWNER', 'MANAGER'].includes(role) && (
        <NotificationBell unreadCount={unreadCount} />
      )}
    </header>
  );
}

// â"€â"€â"€ KPI Card â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

function TrendBadge({ trend }) {
  if (trend === null || trend === undefined) return null;
  const up = trend > 0;
  const zero = trend === 0;
  return (
    <span
      className={cn(
        'text-xs font-semibold',
        zero  ? 'text-gray-400' :
        up    ? 'text-emerald-500' :
                'text-red-500'
      )}
    >
      {up ? '+' : ''}{trend.toFixed(2)}%
    </span>
  );
}

function KpiCard({ icon: Icon, label, value, iconColor, iconBg, trend, subtext, subtextColor, onExpand }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 md:p-5">
      {/* Top row: icon+label + expand */}
      <div className="flex items-start justify-between mb-2 md:mb-3">
        <div className="flex items-center gap-1.5 md:gap-2 min-w-0">
          <div className={cn('w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center shrink-0', iconBg)}>
            <Icon size={13} className={iconColor} />
          </div>
          <span className="text-[11px] md:text-xs text-gray-500 font-medium leading-tight truncate">{label}</span>
        </div>
        {onExpand && (
          <button onClick={onExpand} className="shrink-0 text-gray-300 hover:text-gray-500 transition-colors ml-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>
          </button>
        )}
      </div>

      {/* Value + trend */}
      <div className="flex items-end gap-1.5 md:gap-2">
        <div className="text-xl md:text-2xl font-black text-gray-900 leading-none">{value ?? '-'}</div>
        <TrendBadge trend={trend} />
      </div>

      {/* Optional subtext */}
      {subtext && (
        <div className={cn('text-[11px] md:text-xs mt-1 md:mt-1.5 font-medium', subtextColor || 'text-gray-400')}>{subtext}</div>
      )}
    </div>
  );
}

// â"€â"€â"€ Dashboard Home (overview) â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

function DashboardHome() {
  const { t, i18n } = useTranslation();
  const lang = ['fr', 'en', 'it', 'ar'].includes(i18n.language) ? i18n.language : 'fr';
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Real-time widget refresh (sounds/modals handled by useNotifications in layout)
  useDashboardSocket(user?.restaurant_id);

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats', user?.restaurant_id],
    queryFn: () => api.get('/dashboard/stats').then((r) => r.data.data),
    refetchInterval: 60_000,
    enabled: !!user?.restaurant_id,
  });

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6 md:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">
          {t('dashboard.welcome', { name: user?.name || '' })}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">{t('dashboard.subtitle')}</p>
      </div>

      {/* KPIs */}
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 size={28} className="animate-spin text-orange-500" />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {/* Row 1 */}
          <KpiCard
            icon={ShoppingBag}
            label={t('dashboard.stats.orders_today')}
            value={stats?.ordersToday ?? 0}
            iconBg="bg-orange-100" iconColor="text-orange-500"
            trend={stats?.trends?.ordersToday}
            onExpand={() => navigate('/dashboard/orders')}
          />
          <KpiCard
            icon={Clock}
            label="Commandes en attente"
            value={stats?.ordersPending ?? 0}
            iconBg="bg-amber-100" iconColor="text-amber-600"
            subtext={stats?.ordersToday ? `${Math.round((stats.ordersPending / stats.ordersToday) * 100)}% du total` : null}
            subtextColor="text-amber-500"
            onExpand={() => navigate('/dashboard/orders')}
          />
          <KpiCard
            icon={Wallet}
            label={t('dashboard.stats.revenue_today')}
            value={formatDT(stats?.revenueToday ?? 0, lang)}
            iconBg="bg-emerald-100" iconColor="text-emerald-600"
            trend={stats?.trends?.revenueToday}
            onExpand={() => navigate('/dashboard/analytics')}
          />
          <KpiCard
            icon={Calendar}
            label={t('dashboard.stats.reservations_today')}
            value={stats?.reservationsToday ?? 0}
            iconBg="bg-violet-100" iconColor="text-violet-600"
            trend={stats?.trends?.reservationsToday}
            onExpand={() => navigate('/dashboard/reservations')}
          />
          {/* Row 2 */}
          <KpiCard
            icon={QrCode}
            label={t('dashboard.stats.scans_today')}
            value={stats?.scansToday ?? 0}
            iconBg="bg-pink-100" iconColor="text-pink-600"
            trend={stats?.trends?.scansToday}
          />
          <KpiCard
            icon={TrendingUp}
            label="Commandes en cours"
            value={stats?.ordersInProgress ?? 0}
            iconBg="bg-orange-100" iconColor="text-orange-600"
            subtext={stats?.ordersInProgress > 0 ? 'En préparation' : 'Aucune en cours'}
            subtextColor={stats?.ordersInProgress > 0 ? 'text-orange-500' : 'text-gray-400'}
            onExpand={() => navigate('/dashboard/orders')}
          />
          <KpiCard
            icon={LayoutGrid}
            label="Tables disponibles"
            value={`${stats?.tablesAvailable ?? 0}/${stats?.tablesAllCount ?? 0}`}
            iconBg="bg-cyan-100" iconColor="text-cyan-600"
            subtext={stats?.bookedPct != null ? `${stats.bookedPct}% occupées` : null}
            subtextColor={stats?.bookedPct >= 80 ? 'text-red-500' : stats?.bookedPct >= 50 ? 'text-amber-500' : 'text-emerald-500'}
            onExpand={() => navigate('/dashboard/tables')}
          />
          <KpiCard
            icon={Users}
            label={t('dashboard.stats.tables_total')}
            value={stats?.tablesOccupied ?? 0}
            iconBg="bg-rose-100" iconColor="text-rose-600"
          />
        </div>
      )}

      {/* Call Waiter live widget */}
      <CallWaiterWidget restaurantId={user?.restaurant_id} />

      {/* Charts - 2 per row from md (tablet) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <RevenueChartWidget restaurantId={user?.restaurant_id} />
        <TopDishesWidget    restaurantId={user?.restaurant_id} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ReservationsWidget restaurantId={user?.restaurant_id} />
        <QRScansWidget      restaurantId={user?.restaurant_id} />
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">{t('dashboard.quick_actions')}</h2>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => navigate('/dashboard/menu')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-50 text-orange-600 text-sm font-medium hover:bg-orange-100 border border-orange-200 transition-colors"
          >
            <UtensilsCrossed size={15} />
            {t('dashboard.quick_actions_menu')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard/orders')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <ShoppingBag size={15} />
            {t('dashboard.quick_actions_orders')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard/tables')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <QrCode size={15} />
            {t('dashboard.quick_actions_tables')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard/reservations')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <CalendarDays size={15} />
            {t('dashboard.quick_actions_reservations')}
          </button>
        </div>
      </div>
    </div>
  );
}

// â"€â"€â"€ Coming Soon placeholder â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

function ComingSoon({ icon: Icon, label }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4">
      <div className="p-5 bg-gray-100 rounded-2xl">
        <Icon size={36} className="text-gray-400" />
      </div>
      <div className="text-center">
        <h2 className="text-lg font-semibold text-gray-700">{label}</h2>
        <p className="text-sm text-gray-400 mt-1 max-w-xs">{t('dashboard.coming_soon_desc')}</p>
      </div>
    </div>
  );
}

// â"€â"€â"€ Upgrade Required ─────────────────────────────────────────────────────────

function UpgradeRequired({ plans = [] }) {
  const navigate = useNavigate();
  const planLabel = plans.join(' ou ');
  return (
    <div className={"flex flex-col items-center justify-center h-full min-h-[400px] gap-4 p-6"}>
      <div className={"p-5 bg-orange-50 rounded-2xl"}>
        <Lock size={36} className={"text-orange-400"} />
      </div>
      <div className={"text-center max-w-sm"}>
        <h2 className={"text-lg font-semibold text-gray-800"}>{"Fonctionnalite non disponible"}</h2>
        <p className={"text-sm text-gray-500 mt-2"}>
          {"Cette fonctionnalite necessite le plan "}
          <span className={"font-bold text-orange-500"}>{planLabel}</span>
          {". Contactez Hannibal Advanced Solutions pour mettre a niveau votre abonnement."}
        </p>
      </div>
      <button
        type="button"
        onClick={() => navigate('/dashboard/billing')}
        className={"px-4 py-2 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors"}
      >
        {"Voir mon abonnement"}
      </button>
    </div>
  );
}

// â"€â"€â"€ Dashboard Layout (sidebar + content) â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

const RESTAURANT_ROLES = ['OWNER', 'MANAGER', 'STAFF', 'CASHIER'];

export default function DashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuthStore();
  const role = user?.role || 'STAFF';

  // Sync user data from server on mount — ensures restaurant_id is always current
  // (handles stale Zustand store or old JWT where restaurant_id was null)
  const { data: meData, isLoading: isLoadingMe } = useQuery({
    queryKey: ['auth-me-sync'],
    queryFn: () => api.get('/auth/me').then((r) => r.data.data),
    enabled: RESTAURANT_ROLES.includes(role),
    staleTime: 2 * 60 * 1000,
  });
  useEffect(() => {
    if (!meData) return;
    const serverRestaurantId = meData.restaurant_id || meData.restaurant?.id || null;
    if (serverRestaurantId && serverRestaurantId !== user?.restaurant_id) {
      updateUser({
        restaurant_id:   serverRestaurantId,
        restaurant_name: meData.restaurant?.name || user?.restaurant_name || null,
        restaurant_slug: meData.restaurant?.slug || user?.restaurant_slug || null,
      });
    }
  }, [meData]); // eslint-disable-line react-hooks/exhaustive-deps

  // Use synced restaurant_id: prefer store (updated by effect above) then meData fallback
  const restaurantId = user?.restaurant_id || meData?.restaurant_id || null;

  const { data: planData } = useQuery({
    queryKey: ['billing-plan-nav', restaurantId],
    queryFn: () => api.get('/billing/plan').then((r) => r.data.data),
    enabled: role === 'OWNER' && !!restaurantId,
    staleTime: 5 * 60 * 1000,
  });

  const currentPlan  = planData?.subscription?.plan   || null;
  const subStatus    = planData?.subscription?.status || null;
  const navItems     = buildNav(role, currentPlan, subStatus);

  // Guard: wait for /auth/me before deciding restaurant is missing — prevents
  // race condition where stale store triggers logout before server sync completes
  const missingRestaurant = RESTAURANT_ROLES.includes(role) && !restaurantId && !isLoadingMe;

  useEffect(() => {
    if (missingRestaurant) {
      logout();
      navigate('/login?error=no_restaurant', { replace: true });
    }
  }, [missingRestaurant]); // eslint-disable-line react-hooks/exhaustive-deps

  // â"€â"€ Unlock Web Audio on first user interaction (browser autoplay policy) â"€
  useEffect(() => {
    const unlock = () => { unlockAudio(); window.removeEventListener('click', unlock); };
    window.addEventListener('click', unlock);
    return () => window.removeEventListener('click', unlock);
  }, []);

  // â"€â"€ Global notifications (socket + sounds + modals) â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
  const {
    modalOrder, dismissModal,
    modalCallWaiter, dismissCallWaiterModal,
    modalReservation, dismissReservationModal,
    stopAllSounds,
    unreadCount,
  } = useNotifications(restaurantId);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* â"€â"€ New order modal â"€â"€ */}
      {modalOrder && <NewOrderModal order={modalOrder} onClose={dismissModal} onStopSounds={stopAllSounds} />}
      {/* â"€â"€ Call waiter modal â"€â"€ */}
      {modalCallWaiter && <CallWaiterModal call={modalCallWaiter} onClose={dismissCallWaiterModal} onStopSounds={stopAllSounds} />}
      {/* â"€â"€ New reservation modal â"€â"€ */}
      {modalReservation && <NewReservationModal reservation={modalReservation} onClose={dismissReservationModal} />}
      {/* Sidebar — icon-only on md (768-1023px), full on lg (1024px+) */}
      <aside className="w-14 lg:w-56 shrink-0 bg-white border-r border-gray-100 flex flex-col transition-all duration-200">
        {/* Brand */}
        <div className="px-2 lg:px-5 py-4 lg:py-5 border-b border-gray-100 flex items-center justify-center lg:justify-start">
          <div className="text-base lg:text-lg font-bold text-orange-500">
            <span className="lg:hidden">M</span>
            <span className="hidden lg:inline">MenuHAS</span>
          </div>
          <div className="hidden lg:block ml-0">
            <div className="text-xs text-gray-400 mt-0.5 truncate">{user?.name}</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 lg:p-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon, end, badge, locked }) =>
            locked ? (
              <div
                key={to}
                className="flex items-center justify-center lg:justify-start gap-3 px-2 lg:px-3 py-2.5 rounded-xl text-sm font-medium text-gray-300 cursor-not-allowed select-none"
                title={t(label)}
              >
                <Icon size={18} className="shrink-0" />
                <span className="hidden lg:block truncate flex-1">{t(label)}</span>
                <Lock size={11} className="hidden lg:block shrink-0" />
              </div>
            ) : (
              <NavLink
                key={to}
                to={to}
                end={end}
                title={t(label)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center justify-center lg:justify-start gap-3 px-2 lg:px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-orange-50 text-orange-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )
                }
              >
                <Icon size={18} className="shrink-0" />
                <span className="hidden lg:block truncate flex-1">{t(label)}</span>
                {badge && <span className="hidden lg:block"><NavCallBadge restaurantId={restaurantId} /></span>}
              </NavLink>
            )
          )}
        </nav>

        {/* User + logout */}
        <div className="p-2 lg:p-3 border-t border-gray-100 space-y-1">
          <div className="hidden lg:block px-3 py-2">
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">{role}</div>
            {user?.restaurant_name && (
              <div className="text-xs font-semibold text-orange-500 truncate mt-0.5">{user.restaurant_name}</div>
            )}
            <div className="text-xs text-gray-500 truncate mt-0.5">{user?.email}</div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            title="Deconnexion"
            className="w-full flex items-center justify-center lg:justify-start gap-3 px-2 lg:px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-red-600 transition-colors"
          >
            <LogOut size={16} />
            <span className="hidden lg:block">{t('dashboard.logout')}</span>
          </button>
        </div>

        {/* Copyright footer — hidden on icon-only sidebar */}
        <div className="hidden lg:block px-3 py-2.5 border-t border-gray-100">
          <p className="text-[10px] text-gray-400 leading-snug text-center">
            © 2026 Hannibal Advanced Solutions
          </p>
          <p className="text-[10px] text-gray-400 leading-snug text-center">
            Agence web. All rights reserved.
          </p>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden h-full">
        <DashboardHeader restaurantId={restaurantId} unreadCount={unreadCount} role={role} />

        {/* Missing restaurant_id warning */}
        {missingRestaurant && (
          <div className="mx-4 mt-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-sm text-red-700 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <div>
              <strong>Compte non lié à un restaurant.</strong> Votre compte n&apos;est pas associé à un restaurant — contactez votre administrateur.
              Déconnectez-vous et reconnectez-vous après correction.
              <button type="button" onClick={() => { logout(); navigate('/login'); }} className="ml-2 underline font-semibold">
                Se déconnecter
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-auto">
        <Routes>
          <Route index element={<SmartIndex role={role} plan={currentPlan} subStatus={subStatus} />} />
          <Route
            path="menu"
            element={
              ['OWNER', 'MANAGER'].includes(role)
                ? <MenuPage />
                : <Navigate to="/dashboard" replace />
            }
          />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders-history" element={<OrdersHistoryPage />} />
          <Route path="tables" element={<TablesPage />} />
          <Route
            path="call-waiter"
            element={
              role === 'OWNER' && currentPlan && !planAllows(currentPlan, ['STARTER', 'PRO', 'PREMIUM'])
                ? <UpgradeRequired plans={['STARTER', 'PRO', 'PREMIUM']} />
                : <CallWaiterPage />
            }
          />
          <Route
            path="reservations"
            element={
              role === 'OWNER' && currentPlan && !planAllows(currentPlan, ['PRO', 'PREMIUM'])
                ? <UpgradeRequired plans={['PRO', 'PREMIUM']} />
                : <ReservationsPage />
            }
          />
          <Route
            path="pos"
            element={
              role === 'OWNER' && currentPlan && !planAllows(currentPlan, ['PREMIUM'])
                ? <UpgradeRequired plans={['PREMIUM']} />
                : ['OWNER', 'MANAGER', 'CASHIER', 'STAFF'].includes(role)
                  ? <POSPage />
                  : <Navigate to="/dashboard" replace />
            }
          />
          <Route
            path="service-close"
            element={
              role === 'OWNER' && currentPlan && !planAllows(currentPlan, ['PREMIUM'])
                ? <UpgradeRequired plans={['PREMIUM']} />
                : ['OWNER', 'MANAGER'].includes(role)
                  ? <ServiceClosePage />
                  : <Navigate to="/dashboard" replace />
            }
          />
          <Route
            path="billing"
            element={
              role === 'OWNER'
                ? <BillingPage />
                : <Navigate to="/dashboard" replace />
            }
          />
          <Route
            path="analytics"
            element={
              role === 'OWNER' && currentPlan && !planAllows(currentPlan, ['PRO', 'PREMIUM'])
                ? <UpgradeRequired plans={['PRO', 'PREMIUM']} />
                : ['OWNER', 'MANAGER'].includes(role)
                  ? <AnalyticsPage />
                  : <Navigate to="/dashboard" replace />
            }
          />
          <Route
            path="notifications"
            element={
              ['OWNER', 'MANAGER'].includes(role)
                ? <NotificationSettingsPage />
                : <Navigate to="/dashboard" replace />
            }
          />
          <Route
            path="staff"
            element={
              role === 'OWNER' && currentPlan && !planAllows(currentPlan, ['STARTER', 'PRO', 'PREMIUM'])
                ? <UpgradeRequired plans={['STARTER', 'PRO', 'PREMIUM']} />
                : ['OWNER', 'MANAGER'].includes(role)
                  ? <StaffPage />
                  : <Navigate to="/dashboard" replace />
            }
          />
          <Route
            path="settings"
            element={
              ['OWNER', 'MANAGER'].includes(role)
                ? <SettingsPage />
                : <Navigate to="/dashboard" replace />
            }
          />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        </div>
      </main>
    </div>
  );
}
