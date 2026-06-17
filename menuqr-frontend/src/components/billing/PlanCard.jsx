import { useTranslation } from 'react-i18next';
import { CheckCircle2, MessageCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

const PLAN_COLORS = {
  FREE:    { badge: 'bg-gray-100 text-gray-700', ring: 'ring-gray-200' },
  STARTER: { badge: 'bg-blue-100 text-blue-700', ring: 'ring-blue-200' },
  PRO:     { badge: 'bg-orange-100 text-orange-600', ring: 'ring-orange-300' },
  PREMIUM: { badge: 'bg-amber-100 text-amber-700', ring: 'ring-amber-300' },
};

const STATUS_COLORS = {
  ACTIVE:    'bg-green-100 text-green-700',
  TRIAL:     'bg-orange-100 text-orange-700',
  EXPIRED:   'bg-red-100 text-red-700',
  SUSPENDED: 'bg-gray-100 text-gray-600',
  CANCELLED: 'bg-gray-100 text-gray-600',
};

export default function PlanCard({ subscription, features = [] }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  if (!subscription) return null;

  const planStyle   = PLAN_COLORS[subscription.plan] || PLAN_COLORS.FREE;
  const statusLabel = t(`billing.status_${subscription.status?.toLowerCase()}`, subscription.status);
  const statusStyle = STATUS_COLORS[subscription.status] || STATUS_COLORS.ACTIVE;

  function fmtDate(d) {
    if (!d) return null;
    return new Date(d).toLocaleDateString(lang === 'ar' ? 'ar-TN' : `${lang}-TN`, {
      day: '2-digit', month: 'long', year: 'numeric',
    });
  }

  return (
    <div className={cn('bg-white rounded-2xl border shadow-sm p-6 ring-2', planStyle.ring)}>
      {/* Plan name + status */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <span className={cn('px-3 py-1 rounded-full text-sm font-bold', planStyle.badge)}>
            {subscription.plan}
          </span>
          <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-semibold', statusStyle)}>
            {statusLabel}
          </span>
        </div>
        <div className="text-right text-xs text-gray-400">
          {subscription.billing_period === 'ANNUAL' ? 'Annuel' : 'Mensuel'}
        </div>
      </div>

      {/* Expiry / Trial info */}
      <div className="mb-5 text-sm text-gray-500 space-y-1">
        {subscription.status === 'TRIAL' && subscription.trial_ends_at && (
          <p>{t('billing.trial_until', { date: fmtDate(subscription.trial_ends_at) })}</p>
        )}
        {subscription.ends_at && subscription.status !== 'TRIAL' && (
          <p>{t('billing.expires_on', { date: fmtDate(subscription.ends_at) })}</p>
        )}
      </div>

      {/* Features */}
      {features.length > 0 && (
        <div className="mb-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            {t('billing.features_included')}
          </p>
          <ul className="space-y-2">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Upgrade CTA */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-start gap-2 text-sm text-gray-500">
        <MessageCircle size={14} className="shrink-0 mt-0.5 text-orange-400" />
        <p>{t('billing.contact_upgrade')}</p>
      </div>
    </div>
  );
}
