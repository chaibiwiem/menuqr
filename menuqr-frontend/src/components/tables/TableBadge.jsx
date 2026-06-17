import { useTranslation } from 'react-i18next';
import { Users } from 'lucide-react';

export const STATUS_COLORS = {
  LIBRE:      { bg: '#27AE60', text: '#fff', ring: '#1e8449' },
  OCCUPEE:    { bg: '#E67E22', text: '#fff', ring: '#ca6f1e' },
  RESERVEE:   { bg: '#3498DB', text: '#fff', ring: '#2e86c1' },
  EN_ATTENTE: { bg: '#F1C40F', text: '#000', ring: '#d4ac0d' },
  DESACTIVEE: { bg: '#95A5A6', text: '#fff', ring: '#7f8c8d' },
};

const STATUS_ICONS = {
  LIBRE:      '🟢',
  OCCUPEE:    '🟠',
  RESERVEE:   '🔵',
  EN_ATTENTE: '🔔',
  DESACTIVEE: '⭕',
};

export default function TableBadge({ table, onClick, size = 'md', selected = false }) {
  const { t } = useTranslation();
  const colors = STATUS_COLORS[table.status] || STATUS_COLORS.LIBRE;
  const isWaiting = table.status === 'EN_ATTENTE';

  const sizes = {
    sm: 'w-14 h-14 text-xs',
    md: 'w-20 h-20 text-sm',
    lg: 'w-24 h-24 text-base',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${sizes[size]} rounded-2xl flex flex-col items-center justify-center gap-1
        font-semibold shadow-md transition-transform active:scale-95 select-none
        ${isWaiting ? 'animate-pulse' : ''}
        ${selected ? 'ring-4 ring-offset-2' : ''}`}
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        ringColor: colors.ring,
      }}
      title={`${table.name} — ${t(`tables.status_${table.status.toLowerCase()}`)}`}
    >
      <span className="text-base leading-none">{STATUS_ICONS[table.status]}</span>
      <span className="font-bold leading-none truncate max-w-[72px] px-1 text-center">
        {table.name}
      </span>
      <span className="flex items-center gap-0.5 opacity-80 text-xs leading-none">
        <Users size={10} />
        {table.capacity}
      </span>
    </button>
  );
}
