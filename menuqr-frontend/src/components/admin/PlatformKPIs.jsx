import { cn } from '../../lib/utils';

export default function PlatformKPIs({ stats }) {
  if (!stats) return null;

  const cards = [
    {
      label: 'Restaurants actifs',
      value: stats.active ?? 0,
      sub: `${stats.total ?? 0} au total`,
      color: 'bg-orange-500',
    },
    {
      label: 'Nouveaux ce mois',
      value: stats.newThisMonth ?? 0,
      sub: stats.newThisMonthDelta != null
        ? `${stats.newThisMonthDelta > 0 ? '+' : ''}${stats.newThisMonthDelta}% vs mois préc.`
        : null,
      color: 'bg-green-500',
    },
    {
      label: 'Abonnements expirés',
      value: stats.expiredSubs ?? 0,
      sub: 'Nécessitent un renouvellement',
      color: 'bg-amber-500',
    },
    {
      label: 'Owners — 1ère connexion en attente',
      value: stats.pendingLogin ?? 0,
      sub: 'Depuis plus de 7 jours',
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ label, value, sub, color }) => (
        <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4">
          <div className={cn('w-2.5 h-2.5 rounded-full shrink-0 mt-1.5', color)} />
          <div className="min-w-0">
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-sm font-medium text-gray-700 mt-0.5 leading-tight">{label}</div>
            {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
