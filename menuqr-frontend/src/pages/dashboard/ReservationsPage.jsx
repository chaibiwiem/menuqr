import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Loader2, Check, X, Trash2, ChevronLeft, ChevronRight,
  Users, Download, Search, Filter, Clock, MapPin,
  Phone, Mail, Plus, Minus, BellOff, Pencil, CalendarDays,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../lib/utils';

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_META = {
  EN_ATTENTE:         { label: 'En attente',       color: 'bg-amber-100 text-amber-700'    },
  CONFIRMEE:          { label: 'Confirmée',         color: 'bg-blue-100 text-blue-700'      },
  RAPPEL_ENVOYE:      { label: 'Rappel envoyé',     color: 'bg-purple-100 text-purple-700'  },
  ARRIVEE:            { label: 'Arrivée',           color: 'bg-orange-100 text-orange-600'  },
  TERMINEE:           { label: 'Terminée',          color: 'bg-green-100 text-green-700'    },
  ANNULEE:            { label: 'Annulée',           color: 'bg-red-100 text-red-500'        },
  ANNULEE_CLIENT:     { label: 'Annulée (client)',  color: 'bg-red-100 text-red-500'        },
  ANNULEE_RESTAURANT: { label: 'Annulée (resto)',   color: 'bg-orange-100 text-orange-600'  },
  NO_SHOW:            { label: 'No Show',           color: 'bg-gray-100 text-gray-500'      },
};

const STATUS_TRANSITIONS = {
  EN_ATTENTE:         ['CONFIRMEE', 'ANNULEE_RESTAURANT'],
  CONFIRMEE:          ['ARRIVEE', 'ANNULEE_RESTAURANT', 'NO_SHOW'],
  RAPPEL_ENVOYE:      ['ARRIVEE', 'ANNULEE_RESTAURANT', 'NO_SHOW'],
  ARRIVEE:            ['TERMINEE'],
  TERMINEE:           [],
  ANNULEE:            [],
  ANNULEE_CLIENT:     [],
  ANNULEE_RESTAURANT: [],
  NO_SHOW:            [],
};

const ZONES = [
  { value: 'SALLE',    label: 'Salle'    },
  { value: 'TERRASSE', label: 'Terrasse' },
  { value: 'ETAGE',    label: 'Étage'   },
];

const DOT_COLORS = {
  EN_ATTENTE: 'bg-amber-400',
  CONFIRMEE: 'bg-blue-500',
  RAPPEL_ENVOYE: 'bg-purple-500',
  ARRIVEE: 'bg-orange-500',
  TERMINEE: 'bg-green-500',
  ANNULEE: 'bg-red-400',
  ANNULEE_CLIENT: 'bg-red-400',
  ANNULEE_RESTAURANT: 'bg-orange-400',
  NO_SHOW: 'bg-gray-400',
};

const FR_MONTHS_LONG = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

function toISO(d) { return d.toISOString().split('T')[0]; }
function fmtDate(s) {
  if (!s) return '';
  const [y, m, d] = s.split('-');
  return `${d}/${m}/${y}`;
}
function fmtTime(t) { return t ? t.slice(0, 5) : ''; }

function getWeekRange(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const mon = new Date(d); mon.setDate(d.getDate() + diff);
  const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
  return { from: toISO(mon), to: toISO(sun) };
}

function getMonthRange(dateStr) {
  const [y, m] = dateStr.split('-').map(Number);
  const first = new Date(y, m - 1, 1);
  const last  = new Date(y, m, 0);
  return { from: toISO(first), to: toISO(last) };
}

function rangeLabelWeek(dateStr) {
  const { from, to } = getWeekRange(dateStr);
  return `${fmtDate(from)} – ${fmtDate(to)}`;
}

function rangeLabelMonth(dateStr) {
  const [y, m] = dateStr.split('-').map(Number);
  return `${FR_MONTHS_LONG[m - 1]} ${y}`;
}

// ─── Toggle (module-level, NOT inside any component) ─────────────────────────

function Toggle({ value, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={cn(
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0',
        value ? 'bg-orange-500' : 'bg-gray-200'
      )}
    >
      <span className={cn(
        'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
        value ? 'translate-x-6' : 'translate-x-1'
      )} />
    </button>
  );
}

// ─── Admin Calendar Picker ────────────────────────────────────────────────────

const CAL_DAY_HEADS = ['D','L','M','M','J','V','S'];

function AdminCalendar({ value, onChange, allowPast = false }) {
  const todayStr = toISO(new Date());
  const init = value ? new Date(value + 'T00:00:00') : new Date();
  const [cy, setCy] = useState(init.getFullYear());
  const [cm, setCm] = useState(init.getMonth());

  const daysInMonth = new Date(cy, cm + 1, 0).getDate();
  const firstDay    = new Date(cy, cm, 1).getDay();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  function prev() { if (cm === 0) { setCy((y) => y - 1); setCm(11); } else setCm((m) => m - 1); }
  function next() { if (cm === 11) { setCy((y) => y + 1); setCm(0); } else setCm((m) => m + 1); }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 select-none">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-3">
        <button type="button" onClick={prev}
          className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500">
          <ChevronLeft size={14} />
        </button>
        <span className="text-xs font-bold text-gray-700 capitalize">
          {FR_MONTHS_LONG[cm]} {cy}
        </span>
        <button type="button" onClick={next}
          className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500">
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {CAL_DAY_HEADS.map((d, i) => (
          <div key={i} className="text-center text-[10px] font-semibold text-gray-400 py-0.5">{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const ds = `${cy}-${String(cm + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isPast     = !allowPast && ds < todayStr;
          const isToday    = ds === todayStr;
          const isSelected = ds === value;

          let bg = 'transparent', color = '#374151', border = 'none', fw = 400;
          if (isSelected)     { bg = '#F97316'; color = '#fff'; fw = 700; }
          else if (isToday)   { border = '2px solid #ef4444'; color = '#ef4444'; fw = 700; }
          else if (isPast)    { bg = '#f3f4f6'; color = '#d1d5db'; }

          return (
            <button key={i} type="button" disabled={isPast}
              onClick={() => onChange(ds)}
              className="mx-auto flex items-center justify-center transition-all"
              style={{ width: 30, height: 30, borderRadius: '50%', fontSize: 11, fontWeight: fw, backgroundColor: bg, color, border, cursor: isPast ? 'default' : 'pointer' }}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Time Slot Picker ─────────────────────────────────────────────────────────

const TIME_SLOTS = (() => {
  const slots = [];
  for (let h = 7; h <= 23; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`);
    if (h < 23) slots.push(`${String(h).padStart(2, '0')}:30`);
  }
  return slots;
})();

function TimePicker({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
      {TIME_SLOTS.map((slot) => {
        const active = value === slot;
        return (
          <button
            key={slot}
            type="button"
            onClick={() => onChange(slot)}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all"
            style={{
              borderColor:     active ? '#F97316' : '#e5e7eb',
              backgroundColor: active ? '#F97316' : '#fff',
              color:           active ? '#fff'    : '#4b5563',
            }}
          >
            {slot}
          </button>
        );
      })}
    </div>
  );
}

// ─── Reservation Form Modal (create + edit) ───────────────────────────────────

function ReservationFormModal({ reservation, onClose, onSaved }) {
  const qc = useQueryClient();
  const isEdit = !!reservation;
  const today = toISO(new Date());

  const [form, setForm] = useState({
    first_name:       reservation?.first_name       || '',
    last_name:        reservation?.last_name        || '',
    email:            reservation?.email            || '',
    phone:            reservation?.phone            || '',
    reservation_date: reservation?.reservation_date || today,
    reservation_time: reservation?.reservation_time ? fmtTime(reservation.reservation_time) : '12:00',
    covers:           reservation?.covers           ?? 2,
    zone:             reservation?.zone             || 'SALLE',
    notes:            reservation?.notes            || '',
  });
  const [errors, setErrors] = useState({});

  const mutation = useMutation({
    mutationFn: (data) => isEdit
      ? api.put(`/reservations/${reservation.id}`, data)
      : api.post('/reservations', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reservations'] });
      qc.invalidateQueries({ queryKey: ['reservations-month'] });
      toast.success(isEdit ? 'Réservation modifiée' : 'Réservation créée');
      onSaved();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Erreur'),
  });

  function validate() {
    const e = {};
    if (!form.first_name.trim()) e.first_name = 'Requis';
    if (!form.last_name.trim())  e.last_name  = 'Requis';
    if (!form.phone.trim())      e.phone      = 'Requis';
    if (!form.reservation_date)  e.reservation_date = 'Requis';
    if (!form.reservation_time)  e.reservation_time = 'Requis';
    if (form.covers < 1)         e.covers = 'Min 1';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function submit(e) {
    e.preventDefault();
    if (!validate()) return;
    mutation.mutate({ ...form, covers: parseInt(form.covers) });
  }

  function inp(key, label, type = 'text', required = false) {
    return (
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          {label}{required && ' *'}
        </label>
        <input
          type={type}
          value={form[key]}
          onChange={(ev) => setForm((f) => ({ ...f, [key]: ev.target.value }))}
          className={cn(
            'w-full px-3 py-2 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-orange-300',
            errors[key] ? 'border-red-400' : 'border-gray-200'
          )}
        />
        {errors[key] && <p className="text-xs text-red-500 mt-0.5">{errors[key]}</p>}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">
            {isEdit ? 'Modifier la réservation' : 'Nouvelle réservation'}
          </h2>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {inp('first_name', 'Prénom', 'text', true)}
            {inp('last_name',  'Nom',    'text', true)}
          </div>
          {inp('phone', 'Téléphone', 'tel', true)}
          {inp('email', 'Email', 'email')}

          {/* Date — calendar picker */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Date *
              {form.reservation_date && (
                <span className="ml-2 font-normal text-orange-500">{fmtDate(form.reservation_date)}</span>
              )}
            </label>
            {errors.reservation_date && <p className="text-xs text-red-500 mb-1">{errors.reservation_date}</p>}
            <AdminCalendar
              value={form.reservation_date}
              onChange={(ds) => setForm((f) => ({ ...f, reservation_date: ds }))}
              allowPast={isEdit}
            />
          </div>

          {/* Time — slot grid */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Heure *
              {form.reservation_time && (
                <span className="ml-2 font-normal text-orange-500">{form.reservation_time}</span>
              )}
            </label>
            {errors.reservation_time && <p className="text-xs text-red-500 mb-1">{errors.reservation_time}</p>}
            <TimePicker
              value={form.reservation_time}
              onChange={(t) => setForm((f) => ({ ...f, reservation_time: t }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Couverts *</label>
              <input
                type="number" min="1" max="50"
                value={form.covers}
                onChange={(ev) => setForm((f) => ({ ...f, covers: ev.target.value }))}
                className={cn('w-full px-3 py-2 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-orange-300', errors.covers ? 'border-red-400' : 'border-gray-200')}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Zone *</label>
              <select
                value={form.zone}
                onChange={(ev) => setForm((f) => ({ ...f, zone: ev.target.value }))}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300"
              >
                {ZONES.map((z) => <option key={z.value} value={z.value}>{z.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Notes</label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={(ev) => setForm((f) => ({ ...f, notes: ev.target.value }))}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none resize-none"
              placeholder="Demandes spéciales..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600">
              Annuler
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex-1 px-4 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {mutation.isPending && <Loader2 size={14} className="animate-spin" />}
              {isEdit ? 'Enregistrer' : 'Créer la réservation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Assign Table Modal ───────────────────────────────────────────────────────

function AssignTableModal({ reservation, onClose }) {
  const qc = useQueryClient();

  const { data: tables = [] } = useQuery({
    queryKey: ['reservation-tables'],
    queryFn: () => api.get('/reservations/tables').then((r) => r.data.data),
  });

  const mutation = useMutation({
    mutationFn: ({ id, table_id }) => api.put(`/reservations/${id}/assign-table`, { table_id }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reservations'] });
      qc.invalidateQueries({ queryKey: ['tables'] });
      qc.invalidateQueries({ queryKey: ['rooms'] });
      toast.success('Table assignée');
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Erreur'),
  });

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-gray-900">Assigner une table</h3>
          <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100">
            <X size={16} />
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-3">{reservation.first_name} {reservation.last_name}</p>
        <div className="space-y-1.5 max-h-64 overflow-y-auto mb-4">
          <button
            type="button"
            onClick={() => mutation.mutate({ id: reservation.id, table_id: null })}
            className="w-full text-left px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50"
          >
            Aucune table
          </button>
          {tables.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => mutation.mutate({ id: reservation.id, table_id: t.id })}
              className={cn(
                'w-full text-left px-3 py-2.5 rounded-xl border text-sm hover:bg-orange-50 transition-colors',
                reservation.table_id === t.id
                  ? 'border-orange-400 bg-orange-50 text-orange-600 font-semibold'
                  : 'border-gray-200 text-gray-700'
              )}
            >
              <span className="font-medium">{t.name}</span>
              <span className="text-xs text-gray-400 ml-2">
                ({t.capacity} pers.)
                {t.room ? ` — ${t.room.name || t.room.zone}` : ''}
              </span>
            </button>
          ))}
        </div>
        <button type="button" onClick={onClose}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium">
          Fermer
        </button>
      </div>
    </div>
  );
}

// ─── Calendar Tab ─────────────────────────────────────────────────────────────

const FR_MONTHS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const FR_DAYS_SHORT = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];

function CalendarTab({ restaurantId, onSelectDate }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth()); // 0-indexed

  const firstDay = new Date(year, month, 1);
  const lastDay  = new Date(year, month + 1, 0);
  const startISO = toISO(firstDay);
  const endISO   = toISO(lastDay);

  const { data: reservations = [], isLoading } = useQuery({
    queryKey: ['reservations-month', restaurantId, year, month],
    queryFn: () => api.get('/reservations', {
      params: { date_from: startISO, date_to: endISO, limit: 500 },
    }).then((r) => r.data.data || []),
    enabled: !!restaurantId,
    staleTime: 0,
  });

  // Group by date
  const byDate = {};
  reservations.forEach((r) => {
    const d = r.reservation_date;
    if (!byDate[d]) byDate[d] = [];
    byDate[d].push(r);
  });

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  }
  function goToday() { setYear(now.getFullYear()); setMonth(now.getMonth()); }

  // Build calendar grid (Mon-Sun)
  const startDow = (firstDay.getDay() + 6) % 7; // 0=Mon
  const totalCells = Math.ceil((startDow + lastDay.getDate()) / 7) * 7;
  const cells = [];
  for (let i = 0; i < totalCells; i++) {
    const dayNum = i - startDow + 1;
    if (dayNum < 1 || dayNum > lastDay.getDate()) { cells.push(null); continue; }
    const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    cells.push({ dayNum, iso, entries: byDate[iso] || [] });
  }

  const todayISO = toISO(now);

  return (
    <div className="flex-1 overflow-auto p-6">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <button type="button" onClick={prevMonth}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"><ChevronLeft size={18} /></button>
          <span className="text-base font-bold text-gray-900 min-w-[160px] text-center">
            {FR_MONTHS[month]} {year}
          </span>
          <button type="button" onClick={nextMonth}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"><ChevronRight size={18} /></button>
        </div>
        <button type="button" onClick={goToday}
          className="px-3 py-1.5 rounded-lg bg-orange-50 text-orange-600 text-xs font-medium hover:bg-orange-100">
          Ce mois
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 size={28} className="animate-spin text-orange-500" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-gray-100">
            {FR_DAYS_SHORT.map((d) => (
              <div key={d} className="py-2 text-center text-xs font-semibold text-gray-500">{d}</div>
            ))}
          </div>
          {/* Cells */}
          <div className="grid grid-cols-7">
            {cells.map((cell, idx) => {
              if (!cell) {
                return <div key={`empty-${idx}`} className="min-h-[90px] border-b border-r border-gray-50 bg-gray-50/30" />;
              }
              const isToday = cell.iso === todayISO;
              const total = cell.entries.length;
              const activeEntries = cell.entries.filter((e) => !['TERMINEE','ANNULEE','ANNULEE_CLIENT','ANNULEE_RESTAURANT','NO_SHOW'].includes(e.status));
              return (
                <button
                  key={cell.iso}
                  type="button"
                  onClick={() => onSelectDate(cell.iso)}
                  className={cn(
                    'min-h-[90px] p-2 border-b border-r border-gray-100 text-left transition-colors hover:bg-orange-50/40 group',
                    isToday && 'bg-orange-50/60'
                  )}
                >
                  <span className={cn(
                    'inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold mb-1',
                    isToday ? 'bg-orange-500 text-white' : 'text-gray-600 group-hover:text-orange-600'
                  )}>
                    {cell.dayNum}
                  </span>
                  {total > 0 && (
                    <div className="space-y-0.5">
                      <div className="text-xs font-semibold text-gray-700">
                        {total} rés.
                      </div>
                      <div className="flex flex-wrap gap-0.5">
                        {cell.entries.slice(0, 4).map((e) => (
                          <span
                            key={e.id}
                            className={cn('w-2 h-2 rounded-full shrink-0', DOT_COLORS[e.status] || 'bg-gray-400')}
                            title={`${e.first_name} ${e.last_name} — ${fmtTime(e.reservation_time)}`}
                          />
                        ))}
                        {total > 4 && <span className="text-xs text-gray-400">+{total - 4}</span>}
                      </div>
                      {activeEntries.length > 0 && (
                        <div className="text-xs text-orange-500 font-medium">{activeEntries.length} actives</div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3">
        {Object.entries(STATUS_META).map(([k, v]) => (
          <div key={k} className="flex items-center gap-1.5">
            <span className={cn('w-2.5 h-2.5 rounded-full', DOT_COLORS[k])} />
            <span className="text-xs text-gray-500">{v.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Settings Tab ─────────────────────────────────────────────────────────────

const DEFAULT_SETTINGS = {
  zones_enabled: ['SALLE'],
  capacity_salle: 50,
  capacity_terrasse: 30,
  capacity_etage: 20,
  open_slots: [{ start: '12:00', end: '14:30' }, { start: '19:00', end: '22:30' }],
  service_duration_min: 90,
  min_hours_before: 2,
  max_days_ahead: 30,
  auto_confirm: 0,
  reminder_j1_enabled: 1,
  is_active: 1,
};

function SettingsTab() {
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const canManage = ['OWNER', 'MANAGER'].includes(user?.role);
  const [form, setForm] = useState(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['reservation-settings'],
    queryFn: () => api.get('/reservations/settings').then((r) => r.data.data),
    enabled: canManage,
  });

  useEffect(() => {
    if (settings && !loaded) {
      const raw = settings.open_slots;
      const open_slots = Array.isArray(raw)
        ? raw
        : (typeof raw === 'string' ? JSON.parse(raw) : DEFAULT_SETTINGS.open_slots);
      const zones = Array.isArray(settings.zones_enabled)
        ? settings.zones_enabled
        : (typeof settings.zones_enabled === 'string' ? JSON.parse(settings.zones_enabled) : ['SALLE']);

      setForm({
        zones_enabled:        zones,
        capacity_salle:       settings.capacity_salle      ?? 50,
        capacity_terrasse:    settings.capacity_terrasse   ?? 30,
        capacity_etage:       settings.capacity_etage      ?? 20,
        open_slots,
        service_duration_min: settings.service_duration_min ?? 90,
        min_hours_before:     settings.min_hours_before    ?? 2,
        max_days_ahead:       settings.max_days_ahead      ?? 30,
        auto_confirm:         settings.auto_confirm        ?? 0,
        reminder_j1_enabled:  settings.reminder_j1_enabled ?? 1,
        is_active:            settings.is_active           ?? 1,
      });
      setLoaded(true);
    }
  }, [settings, loaded]);

  const saveMutation = useMutation({
    mutationFn: (data) => api.put('/reservations/settings', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reservation-settings'] });
      toast.success('Paramètres sauvegardés');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Erreur'),
  });

  function toggleZone(zone) {
    setForm((f) => {
      const zones = f.zones_enabled.includes(zone)
        ? f.zones_enabled.filter((z) => z !== zone)
        : [...f.zones_enabled, zone];
      return { ...f, zones_enabled: zones };
    });
  }
  function addSlot()       { setForm((f) => ({ ...f, open_slots: [...f.open_slots, { start: '12:00', end: '14:00' }] })); }
  function removeSlot(i)   { setForm((f) => ({ ...f, open_slots: f.open_slots.filter((_, idx) => idx !== i) })); }
  function updateSlot(i, field, val) {
    setForm((f) => ({
      ...f,
      open_slots: f.open_slots.map((s, idx) => idx === i ? { ...s, [field]: val } : s),
    }));
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 size={28} className="animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-xl space-y-5">

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">Module réservations actif</p>
              <p className="text-xs text-gray-400 mt-0.5">Afficher le formulaire de réservation en ligne</p>
            </div>
            <Toggle value={!!form.is_active} onChange={(v) => setForm((f) => ({ ...f, is_active: v ? 1 : 0 }))} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">Zones &amp; Capacités</h3>
          <div className="flex gap-2">
            {ZONES.map((z) => (
              <button key={z.value} type="button" onClick={() => toggleZone(z.value)}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-sm font-medium border transition-colors',
                  form.zones_enabled.includes(z.value)
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                )}>
                {z.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { key: 'capacity_salle',    label: 'Salle'    },
              { key: 'capacity_terrasse', label: 'Terrasse' },
              { key: 'capacity_etage',    label: 'Étage'   },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-xs text-gray-500 mb-1">{label}</label>
                <input type="number" min="1" max="999"
                  value={form[key]}
                  onChange={(ev) => setForm((f) => ({ ...f, [key]: parseInt(ev.target.value) || 1 }))}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Créneaux horaires</h3>
            <button type="button" onClick={addSlot}
              className="flex items-center gap-1 text-xs text-orange-500 hover:text-indigo-800 px-2 py-1 rounded-lg hover:bg-orange-50">
              <Plus size={12} /> Ajouter
            </button>
          </div>
          {form.open_slots.map((slot, i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="time" value={slot.start}
                onChange={(ev) => updateSlot(i, 'start', ev.target.value)}
                className="px-2.5 py-1.5 text-sm rounded-lg border border-gray-200 focus:outline-none"
              />
              <span className="text-gray-400 text-xs">→</span>
              <input type="time" value={slot.end}
                onChange={(ev) => updateSlot(i, 'end', ev.target.value)}
                className="px-2.5 py-1.5 text-sm rounded-lg border border-gray-200 focus:outline-none"
              />
              {form.open_slots.length > 1 && (
                <button type="button" onClick={() => removeSlot(i)} className="p-1 text-red-400 hover:text-red-600">
                  <Minus size={13} />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">Règles</h3>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Durée service (min)</label>
              <input type="number" min="30" max="480" step="15"
                value={form.service_duration_min}
                onChange={(ev) => setForm((f) => ({ ...f, service_duration_min: parseInt(ev.target.value) || 90 }))}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Délai min (h)</label>
              <input type="number" min="0" max="72"
                value={form.min_hours_before}
                onChange={(ev) => setForm((f) => ({ ...f, min_hours_before: parseInt(ev.target.value) || 0 }))}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Max jours avance</label>
              <input type="number" min="1" max="365"
                value={form.max_days_ahead}
                onChange={(ev) => setForm((f) => ({ ...f, max_days_ahead: parseInt(ev.target.value) || 30 }))}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Confirmation automatique</p>
              <p className="text-xs text-gray-400">Réservations directement confirmées</p>
            </div>
            <Toggle value={!!form.auto_confirm} onChange={(v) => setForm((f) => ({ ...f, auto_confirm: v ? 1 : 0 }))} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Rappel J-1</p>
              <p className="text-xs text-gray-400">Envoi automatique à 10h la veille</p>
            </div>
            <Toggle value={!!form.reminder_j1_enabled} onChange={(v) => setForm((f) => ({ ...f, reminder_j1_enabled: v ? 1 : 0 }))} />
          </div>
        </div>

        <button
          type="button"
          onClick={() => saveMutation.mutate(form)}
          disabled={saveMutation.isPending}
          className="w-full py-3.5 rounded-2xl bg-orange-500 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-orange-600 disabled:opacity-60"
        >
          {saveMutation.isPending && <Loader2 size={15} className="animate-spin" />}
          Sauvegarder
        </button>
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function ReservationsPage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const role = user?.role;
  const canCreate       = ['OWNER', 'MANAGER', 'STAFF', 'CASHIER'].includes(role); // tous peuvent créer
  const canChangeStatus = ['OWNER', 'MANAGER', 'STAFF', 'CASHIER'].includes(role); // tous peuvent changer le statut
  const isLimitedStatus = ['STAFF', 'CASHIER'].includes(role);                    // staff/caissier: confirmer/arrivée/no-show/terminée, pas d'annulation
  const canEditFields   = ['OWNER', 'MANAGER'].includes(role);                     // modification réservée à MGMT
  const canAssignTable  = ['OWNER', 'MANAGER', 'STAFF'].includes(role);            // CASHIER exclu
  const canDelete       = ['OWNER', 'MANAGER'].includes(role);
  const restaurantId = user?.restaurant_id;

  const [tab, setTab] = useState('list');
  const [viewMode, setViewMode] = useState('day');
  const [selectedDate, setSelectedDate] = useState(toISO(new Date()));
  const [filterStatus, setFilterStatus] = useState('');
  const [filterZone, setFilterZone] = useState('');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm]   = useState(false);   // new reservation
  const [editTarget, setEditTarget]   = useState(null);  // edit reservation
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [assignTarget, setAssignTarget] = useState(null);

  const today = toISO(new Date());

  function shiftDate(n) {
    const d = new Date(selectedDate + 'T00:00:00');
    if (viewMode === 'week')       d.setDate(d.getDate() + n * 7);
    else if (viewMode === 'month') d.setMonth(d.getMonth() + n);
    else                           d.setDate(d.getDate() + n);
    setSelectedDate(toISO(d));
  }

  const queryRange = viewMode === 'week'
    ? getWeekRange(selectedDate)
    : viewMode === 'month'
      ? getMonthRange(selectedDate)
      : { from: selectedDate, to: selectedDate };

  // Calendar → list navigation
  function handleCalendarSelectDate(iso) {
    setSelectedDate(iso);
    setTab('list');
  }

  const { data: listData, isLoading } = useQuery({
    queryKey: ['reservations', restaurantId, viewMode, queryRange, filterStatus, filterZone, search],
    queryFn: () => api.get('/reservations', {
      params: {
        date_from: queryRange.from,
        date_to:   queryRange.to,
        ...(filterStatus && { status: filterStatus }),
        ...(filterZone   && { zone: filterZone }),
        ...(search       && { search }),
      },
    }).then((r) => r.data.data || []),
    enabled: !!restaurantId,
    staleTime: 0,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => api.put(`/reservations/${id}/status`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reservations'] });
      toast.success('Statut mis à jour');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Erreur'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/reservations/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reservations'] });
      qc.invalidateQueries({ queryKey: ['reservations-month'] });
      toast.success('Supprimée');
      setDeleteTarget(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Erreur'),
  });

  const reservations = listData || [];

  function exportCSV() {
    const header = 'Date,Heure,Prénom,Nom,Email,Téléphone,Couverts,Zone,Statut,Table\n';
    const rows = reservations.map((r) =>
      [fmtDate(r.reservation_date), fmtTime(r.reservation_time), r.first_name, r.last_name,
       r.email || '', r.phone, r.covers, r.zone, STATUS_META[r.status]?.label || r.status, r.table?.name || '']
        .join(',')
    ).join('\n');
    const blob = new Blob(['﻿' + header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `reservations-${selectedDate}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  const TABS = [
    { id: 'list',     label: 'Liste'      },
    { id: 'calendar', label: 'Calendrier' },
    ...(canDelete ? [{ id: 'settings', label: 'Paramètres' }] : []),
  ].filter((tb) => !tb.hide);

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-white shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-bold text-gray-900">
            {t('dashboard.nav.reservations')}
          </h1>
          {canCreate && tab === 'list' && (
            <button type="button" onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600">
              <Plus size={15} /> Nouvelle réservation
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-3">
          {TABS.map((tb) => (
            <button key={tb.id} type="button" onClick={() => setTab(tb.id)}
              className={cn(
                'px-3 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5',
                tab === tb.id ? 'bg-orange-50 text-orange-600' : 'text-gray-500 hover:bg-gray-50'
              )}>
              {tb.id === 'calendar' && <CalendarDays size={14} />}
              {tb.label}
            </button>
          ))}
        </div>

        {/* Filters (list only) */}
        {tab === 'list' && (
          <div className="space-y-2">
            {/* Period toggle + navigation */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Jour / Semaine / Mois */}
              <div className="flex items-center bg-gray-100 rounded-xl p-0.5 gap-0.5">
                {[
                  { key: 'day',   label: 'Jour'    },
                  { key: 'week',  label: 'Semaine' },
                  { key: 'month', label: 'Mois'    },
                ].map(({ key, label }) => (
                  <button key={key} type="button"
                    onClick={() => setViewMode(key)}
                    className={cn(
                      'px-3 py-1.5 text-sm font-medium rounded-lg transition-all',
                      viewMode === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    )}
                  >{label}</button>
                ))}
              </div>

              {/* Navigation */}
              <button type="button" onClick={() => shiftDate(-1)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
                <ChevronLeft size={18} />
              </button>

              {viewMode === 'day' ? (
                <input type="date" value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
              ) : (
                <span className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 min-w-[160px] text-center">
                  {viewMode === 'week' ? rangeLabelWeek(selectedDate) : rangeLabelMonth(selectedDate)}
                </span>
              )}

              <button type="button" onClick={() => shiftDate(1)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
                <ChevronRight size={18} />
              </button>

              <button type="button" onClick={() => setSelectedDate(today)}
                className="px-3 py-1.5 rounded-lg bg-orange-50 text-orange-600 text-xs font-medium hover:bg-orange-100">
                Aujourd'hui
              </button>

              <span className="ml-auto text-xs text-gray-400">
                {reservations.length} résultat{reservations.length !== 1 ? 's' : ''}
              </span>
              <button type="button" onClick={exportCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50">
                <Download size={13} /> CSV
              </button>
            </div>

            {/* Status / zone / search filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <Filter size={13} className="text-gray-400 shrink-0" />
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none">
                <option value="">Tous les statuts</option>
                {Object.entries(STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
              <select value={filterZone} onChange={(e) => setFilterZone(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none">
                <option value="">Toutes les zones</option>
                {ZONES.map((z) => <option key={z.value} value={z.value}>{z.label}</option>)}
              </select>
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Nom, email, tél…" value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 w-44"
                />
              </div>
              {(filterStatus || filterZone || search) && (
                <button type="button" onClick={() => { setFilterStatus(''); setFilterZone(''); setSearch(''); }}
                  className="text-xs text-orange-500 hover:text-indigo-800 px-2 py-1.5 rounded-lg hover:bg-orange-50">
                  Réinitialiser
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      {tab === 'settings' ? (
        <SettingsTab />
      ) : tab === 'calendar' ? (
        <CalendarTab restaurantId={restaurantId} onSelectDate={handleCalendarSelectDate} />
      ) : (
        <div className="flex-1 overflow-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 size={28} className="animate-spin text-orange-500" />
            </div>
          ) : reservations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
              <BellOff size={40} />
              <div className="text-center">
                <p className="font-medium text-gray-600">Aucune réservation</p>
                <p className="text-sm mt-1">{fmtDate(selectedDate)}</p>
              </div>
              {canCreate && (
                <button type="button" onClick={() => setShowForm(true)}
                  className="mt-2 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600">
                  <Plus size={15} /> Créer une réservation
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {reservations.map((r) => {
                const meta = STATUS_META[r.status] || STATUS_META.EN_ATTENTE;
                const transitions = STATUS_TRANSITIONS[r.status] || [];
                return (
                  <div key={r.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-gray-900">{r.first_name} {r.last_name}</span>
                          <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', meta.color)}>{meta.label}</span>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            {ZONES.find((z) => z.value === r.zone)?.label || r.zone}
                          </span>
                          {r.table && (
                            <span className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full">
                              Table {r.table.name}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-1.5 text-sm text-gray-500 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Clock size={13} />{fmtDate(r.reservation_date)} à {fmtTime(r.reservation_time)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users size={13} />{r.covers} couvert{r.covers > 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                          {r.phone && <span className="flex items-center gap-1"><Phone size={11} />{r.phone}</span>}
                          {r.email && <span className="flex items-center gap-1"><Mail size={11} />{r.email}</span>}
                        </div>
                        {r.notes && (
                          <div className="mt-2 text-xs text-gray-500 italic bg-gray-50 rounded-lg px-3 py-2">
                            {r.notes}
                          </div>
                        )}
                      </div>

                      {(canChangeStatus || canEditFields || canAssignTable || canDelete) && (
                        <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                          {canChangeStatus && (isLimitedStatus
                            ? transitions.filter((s) => ['CONFIRMEE', 'ARRIVEE', 'NO_SHOW', 'TERMINEE'].includes(s))
                            : transitions
                          ).map((nextStatus) => {
                            const nm = STATUS_META[nextStatus];
                            return (
                              <button key={nextStatus} type="button" title={nm?.label}
                                onClick={() => statusMutation.mutate({ id: r.id, status: nextStatus })}
                                disabled={statusMutation.isPending}
                                className={cn('px-2.5 py-1.5 rounded-lg text-xs font-medium border disabled:opacity-50', nm?.color || 'bg-gray-100 text-gray-600')}>
                                {nextStatus === 'CONFIRMEE'          ? <Check size={12} />  :
                                 nextStatus === 'ANNULEE_RESTAURANT' ? <X size={12} />      :
                                 nm?.label}
                              </button>
                            );
                          })}
                          {canEditFields && (
                            <button type="button" title="Modifier"
                              onClick={() => setEditTarget(r)}
                              className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">
                              <Pencil size={13} />
                            </button>
                          )}
                          {canAssignTable && (
                            <button type="button" title="Assigner une table"
                              onClick={() => setAssignTarget(r)}
                              className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">
                              <MapPin size={13} />
                            </button>
                          )}
                          {canDelete && (
                            <button type="button" onClick={() => setDeleteTarget(r)}
                              className="p-1.5 rounded-lg border border-red-100 text-red-400 hover:bg-red-50">
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showForm && (
        <ReservationFormModal
          onClose={() => setShowForm(false)}
          onSaved={() => setShowForm(false)}
        />
      )}

      {editTarget && (
        <ReservationFormModal
          reservation={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={() => setEditTarget(null)}
        />
      )}

      {assignTarget && (
        <AssignTableModal
          reservation={assignTarget}
          onClose={() => setAssignTarget(null)}
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-base font-bold text-gray-900 mb-2">
              Supprimer la réservation de {deleteTarget.first_name} {deleteTarget.last_name} ?
            </h3>
            <p className="text-sm text-gray-500 mb-5">Cette action est irréversible.</p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setDeleteTarget(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium">
                Annuler
              </button>
              <button type="button" onClick={() => deleteMutation.mutate(deleteTarget.id)}
                disabled={deleteMutation.isPending}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2">
                {deleteMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
