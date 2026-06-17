import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Building2, Users, TrendingUp, AlertCircle, Plus, Loader2 } from 'lucide-react';
import api from '../../api/axios';
import { cn } from '../../lib/utils';

const PLAN_COLORS = {
  FREE:    '#9ca3af',
  STARTER: '#60a5fa',
  PRO:     '#a78bfa',
  PREMIUM: '#fbbf24',
};

const MONTHS_FR = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

function KpiCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4">
      <div className={cn('p-3 rounded-xl', color)}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900">{value ?? '—'}</div>
        <div className="text-sm font-medium text-gray-700 mt-0.5">{label}</div>
        {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 shadow-lg rounded-xl px-3 py-2 text-xs">
      <div className="font-semibold text-gray-700 mb-1">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ color: p.color }}>{p.name}: {p.value}</div>
      ))}
    </div>
  );
}

export default function AdminDashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.get('/admin/stats').then((r) => r.data.data),
    refetchInterval: 60_000,
  });

  const pieData = stats
    ? Object.entries(stats.byPlan || {}).map(([name, value]) => ({ name, value }))
    : [];

  const growthData = (stats?.growthLast12Months || []).map((d) => ({
    month: MONTHS_FR[d.month - 1],
    total: d.total,
    new: d.new,
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 size={32} className="animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Super Admin</h1>
          <p className="text-sm text-gray-500 mt-0.5">Vue d'ensemble de la plateforme MenuQR</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/admin/restaurants/new')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-medium hover:bg-orange-600"
        >
          <Plus size={16} /> Nouveau restaurant
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={Building2}
          label={t('admin.total_restaurants')}
          value={stats?.total}
          sub={`${stats?.active || 0} actifs`}
          color="bg-orange-500"
        />
        <KpiCard
          icon={TrendingUp}
          label="Nouveaux ce mois"
          value={stats?.newThisMonth}
          color="bg-green-500"
        />
        <KpiCard
          icon={AlertCircle}
          label="Abonnements expirés"
          value={stats?.expiredSubs}
          color="bg-amber-500"
        />
        <KpiCard
          icon={Users}
          label="En attente 1ère connexion"
          value={stats?.pendingLogin}
          color="bg-purple-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Croissance — 12 derniers mois</h2>
          {growthData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={growthData}>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="total" name="Total" stroke="#6366f1" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="new" name="Nouveaux" stroke="#22c55e" strokeWidth={2} dot={false} strokeDasharray="4 2" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">Pas encore de données</div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Répartition par plan</h2>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={75}>
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={PLAN_COLORS[entry.name] || '#d1d5db'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-3">
                {pieData.map((entry) => (
                  <div key={entry.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PLAN_COLORS[entry.name] }} />
                      <span className="text-gray-600">{entry.name}</span>
                    </div>
                    <span className="font-semibold text-gray-800">{entry.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">Aucun restaurant</div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Actions rapides</h2>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/restaurants')}
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Voir tous les restaurants
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/restaurants/new')}
            className="px-4 py-2 rounded-xl bg-orange-50 text-orange-600 text-sm font-medium hover:bg-orange-100 border border-orange-200"
          >
            Créer un restaurant
          </button>
        </div>
      </div>
    </div>
  );
}
