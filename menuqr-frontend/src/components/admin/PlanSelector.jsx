import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import api from '../../api/axios';
import { cn } from '../../lib/utils';

const PLAN_STYLE = {
  FREE:    { color: 'bg-gray-100 text-gray-700 border-gray-200',      ring: 'ring-gray-400'   },
  STARTER: { color: 'bg-blue-50 text-blue-700 border-blue-200',       ring: 'ring-blue-500'   },
  PRO:     { color: 'bg-purple-50 text-purple-700 border-purple-200', ring: 'ring-purple-500' },
  PREMIUM: { color: 'bg-amber-50 text-amber-700 border-amber-200',    ring: 'ring-amber-500'  },
};

const PLAN_EXTRA_FEATURES = {
  FREE:    ['QR Code', 'Menu digital'],
  STARTER: ['Call Waiter', 'Notifications email', 'Sous-domaine'],
  PRO:     ['Réservations', 'Analytics', 'Export CSV', 'Notifications SMS'],
  PREMIUM: ['POS Caisse', 'Clôture service', 'Support prioritaire', 'Toutes fonctionnalités'],
};

const ORDER = ['FREE', 'STARTER', 'PRO', 'PREMIUM'];

function buildFeatures(plan) {
  const lines = [];
  if (plan.max_menus === 0)  lines.push('Menus illimités');
  else lines.push(`${plan.max_menus} menu${plan.max_menus > 1 ? 's' : ''}`);

  if (plan.max_tables === 0) lines.push('Tables illimitées');
  else lines.push(`${plan.max_tables} tables max`);

  if (plan.max_staff === 0)  lines.push('Staff illimité');
  else lines.push(`${plan.max_staff} compte${plan.max_staff > 1 ? 's' : ''} staff`);

  (PLAN_EXTRA_FEATURES[plan.name] || []).forEach((f) => lines.push(f));
  return lines;
}

export default function PlanSelector({ value, onChange }) {
  const { data: plans, isLoading } = useQuery({
    queryKey: ['admin-plans'],
    queryFn: () => api.get('/admin/plans').then((r) => r.data.data),
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-24">
        <Loader2 size={20} className="animate-spin text-orange-400" />
      </div>
    );
  }

  const sorted = plans
    ? [...plans].sort((a, b) => ORDER.indexOf(a.name) - ORDER.indexOf(b.name))
    : [];

  return (
    <div className="grid grid-cols-2 gap-3">
      {sorted.map((plan) => {
        const style = PLAN_STYLE[plan.name] || PLAN_STYLE.FREE;
        const features = buildFeatures(plan);

        return (
          <button
            key={plan.id}
            type="button"
            onClick={() => onChange(plan.name)}
            className={cn(
              'text-left p-4 rounded-xl border-2 transition-all',
              style.color,
              value === plan.name ? `${style.ring} ring-2 ring-offset-1` : 'hover:border-gray-300'
            )}
          >
            <div className="font-bold text-sm mb-2">{plan.name}</div>
            <ul className="space-y-1">
              {features.map((f) => (
                <li key={f} className="text-xs flex items-center gap-1">
                  <span className="text-green-500">✓</span> {f}
                </li>
              ))}
            </ul>
          </button>
        );
      })}
    </div>
  );
}
