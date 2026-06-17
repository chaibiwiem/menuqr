import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, CalendarDays, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const STATUS_STYLES = {
  CONFIRMEE:          { label: 'Confirmée',  cls: 'bg-emerald-50 text-emerald-600' },
  EN_ATTENTE:         { label: 'En attente', cls: 'bg-amber-50 text-amber-600'     },
  RAPPEL_ENVOYE:      { label: 'Rappel',     cls: 'bg-blue-50 text-blue-600'       },
  ARRIVEE:            { label: 'Arrivée',    cls: 'bg-orange-50 text-orange-500'   },
  TERMINEE:           { label: 'Terminée',   cls: 'bg-gray-100 text-gray-500'      },
  ANNULEE:            { label: 'Annulée',    cls: 'bg-red-50 text-red-500'         },
  ANNULEE_CLIENT:     { label: 'Annulée',    cls: 'bg-red-50 text-red-500'         },
  ANNULEE_RESTAURANT: { label: 'Annulée',    cls: 'bg-red-50 text-red-500'         },
  NO_SHOW:            { label: 'No-show',    cls: 'bg-orange-50 text-orange-500'   },
};

const AVATAR_COLORS = [
  'bg-orange-100 text-orange-500',
  'bg-emerald-100 text-emerald-600',
  'bg-pink-100 text-pink-600',
  'bg-amber-100 text-amber-600',
  'bg-cyan-100 text-cyan-600',
  'bg-violet-100 text-violet-600',
];

function Avatar({ firstName, lastName }) {
  const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  const color = AVATAR_COLORS[(firstName?.charCodeAt(0) || 0) % AVATAR_COLORS.length];
  return (
    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${color}`}>
      {initials}
    </div>
  );
}

function getWeekRange() {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const fmt = (d) => d.toISOString().split('T')[0];
  return { from: fmt(monday), to: fmt(sunday) };
}

function toISO(d) { return d.toISOString().split('T')[0]; }

export default function ReservationsWidget({ restaurantId }) {
  const navigate = useNavigate();
  const [period, setPeriod] = useState('day');

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-reservations', restaurantId, period],
    queryFn: () => {
      if (period === 'day') {
        // Show upcoming reservations starting from today (not just today)
        const today = toISO(new Date());
        return api
          .get(`/reservations?date_from=${today}&limit=50`)
          .then((r) => r.data.data);
      }
      const { from, to } = getWeekRange();
      return api
        .get(`/reservations?date_from=${from}&date_to=${to}&limit=50`)
        .then((r) => r.data.data);
    },
    refetchInterval: 60_000,
    staleTime: 0,
    enabled: !!restaurantId,
  });

  const reservations = (data || []).slice(0, 6);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <CalendarDays size={15} className="text-violet-500" />
          Réservations
        </h2>

        <div className="flex items-center gap-3">
          {/* Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5 gap-0.5">
            <button
              onClick={() => setPeriod('day')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                period === 'day'
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              À venir
            </button>
            <button
              onClick={() => setPeriod('week')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                period === 'week'
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Semaine
            </button>
          </div>

          <button
            onClick={() => navigate('/dashboard/reservations')}
            className="text-xs text-orange-500 font-medium hover:text-orange-600 transition-colors"
          >
            Voir tout →
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 size={22} className="animate-spin text-violet-400" />
        </div>
      ) : reservations.length === 0 ? (
        <div className="h-32 flex items-center justify-center">
          <p className="text-xs text-gray-400 italic">
            {period === 'day' ? 'Aucune réservation à venir' : 'Aucune réservation cette semaine'}
          </p>
        </div>
      ) : (
        <>
          {/* Column headers */}
          <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-2 px-1 mb-1">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Client</span>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide text-center">Date</span>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide text-center">Heure</span>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide text-center">Table</span>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide text-center">Pers.</span>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide text-center">Statut</span>
            <span />
          </div>

          <div className="divide-y divide-gray-50">
            {reservations.map((r) => {
              const status = STATUS_STYLES[r.status] || { label: r.status, cls: 'bg-gray-100 text-gray-500' };
              const time = r.reservation_time?.slice(0, 5) || '';
              const tableName = r.table ? (r.table.name || `T-${r.table.number}`) : '—';
              const dateStr = r.reservation_date
                ? new Date(r.reservation_date + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
                : '—';

              return (
                <div key={r.id} className="flex items-center gap-2 py-2.5">
                  <Avatar firstName={r.first_name} lastName={r.last_name} />

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800 truncate">
                      {r.first_name} {r.last_name}
                    </div>
                  </div>

                  {/* Date — always shown */}
                  <span className="text-xs text-gray-500 shrink-0 capitalize">{dateStr}</span>

                  {/* Time */}
                  <span className="text-xs text-gray-500 shrink-0">{time}</span>

                  {/* Table */}
                  <span className="text-xs text-gray-500 shrink-0 w-10 text-center">{tableName}</span>

                  {/* Covers */}
                  <span className="text-xs text-gray-500 shrink-0 w-10 text-center">{r.covers}</span>

                  {/* Status */}
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${status.cls}`}>
                    {status.label}
                  </span>

                  {/* Edit */}
                  <button
                    onClick={() => navigate('/dashboard/reservations')}
                    className="shrink-0 text-gray-300 hover:text-orange-500 transition-colors"
                  >
                    <Pencil size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
