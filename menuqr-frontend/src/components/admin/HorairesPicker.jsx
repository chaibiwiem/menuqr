import { useTranslation } from 'react-i18next';

const DAYS_FR = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const DEFAULT_HORAIRES = DAYS_FR.map((_, i) => ({
  day_of_week: i,
  is_closed: i === 0,
  open_time: '09:00',
  close_time: '22:00',
}));

export default function HorairesPicker({ value = DEFAULT_HORAIRES, onChange }) {
  const { t } = useTranslation();

  function update(index, field, val) {
    const next = value.map((d, i) => (i === index ? { ...d, [field]: val } : d));
    onChange(next);
  }

  return (
    <div className="space-y-2">
      {value.map((day, i) => (
        <div key={i} className="flex items-center gap-3 py-1.5">
          <span className="w-24 text-sm font-medium text-gray-700 shrink-0">{DAYS_FR[i]}</span>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={day.is_closed}
              onChange={(e) => update(i, 'is_closed', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <span className="text-xs text-gray-500">Fermé</span>
          </label>

          {!day.is_closed && (
            <>
              <input
                type="time"
                value={day.open_time}
                onChange={(e) => update(i, 'open_time', e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
              <span className="text-gray-400 text-sm">→</span>
              <input
                type="time"
                value={day.close_time}
                onChange={(e) => update(i, 'close_time', e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </>
          )}
        </div>
      ))}
    </div>
  );
}
