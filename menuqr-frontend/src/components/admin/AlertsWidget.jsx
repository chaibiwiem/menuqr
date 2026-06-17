import { useNavigate } from 'react-router-dom';
import { AlertCircle, Clock, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function AlertsWidget({ stats }) {
  const navigate = useNavigate();

  const alerts = [];

  if (stats?.expiredSubs > 0) {
    alerts.push({
      id: 'expired',
      icon: AlertCircle,
      color: 'text-red-500 bg-red-50',
      title: `${stats.expiredSubs} abonnement${stats.expiredSubs > 1 ? 's' : ''} expiré${stats.expiredSubs > 1 ? 's' : ''}`,
      desc: 'Ces restaurants n\'ont plus accès aux fonctionnalités premium.',
      action: () => navigate('/admin/restaurants?status=expired'),
      actionLabel: 'Voir →',
    });
  }

  if (stats?.pendingLogin > 0) {
    alerts.push({
      id: 'pending-login',
      icon: Clock,
      color: 'text-amber-500 bg-amber-50',
      title: `${stats.pendingLogin} owner${stats.pendingLogin > 1 ? 's' : ''} sans 1ère connexion`,
      desc: 'Compte créé depuis plus de 7 jours, identifiants non utilisés.',
      action: () => navigate('/admin/users?filter=pending_login'),
      actionLabel: 'Voir →',
    });
  }

  if (alerts.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Alertes</h2>
        <p className="text-xs text-gray-400 italic">Aucune alerte — tout est en ordre ✓</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h2 className="text-sm font-semibold text-gray-700 mb-3">Alertes</h2>
      <div className="space-y-3">
        {alerts.map(({ id, icon: Icon, color, title, desc, action, actionLabel }) => (
          <div key={id} className={cn('flex items-start gap-3 p-3 rounded-xl', color.split(' ')[1])}>
            <Icon size={16} className={cn('shrink-0 mt-0.5', color.split(' ')[0])} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-gray-800">{title}</div>
              <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
            </div>
            <button
              type="button"
              onClick={action}
              className="shrink-0 flex items-center gap-0.5 text-xs font-medium text-gray-600 hover:text-orange-500"
            >
              {actionLabel} <ChevronRight size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
