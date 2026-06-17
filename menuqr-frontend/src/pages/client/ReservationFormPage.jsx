import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, ChevronLeft, ChevronRight, ArrowLeft, Clock, Users } from 'lucide-react';
import api from '../../api/axios';

function applyTheme(restaurant) {
  if (!restaurant) return;
  const { template_id, custom_colors, custom_font } = restaurant;
  if (template_id) document.documentElement.setAttribute('data-template', template_id);
  const styleId = 'menuqr-custom-theme';
  let tag = document.getElementById(styleId);
  if (!tag) { tag = document.createElement('style'); tag.id = styleId; document.head.appendChild(tag); }
  const rules = [];
  if (custom_colors && typeof custom_colors === 'object') {
    Object.entries(custom_colors).forEach(([k, v]) => { if (v) rules.push(`--${k}: ${v};`); });
  }
  if (custom_font) rules.push(`--font-family: '${custom_font}', sans-serif;`);
  tag.textContent = rules.length ? `html[data-template] { ${rules.join(' ')} }` : '';
}

const ZONES = [
  { value: 'SALLE',    labelKey: 'reservation.zone_salle' },
  { value: 'TERRASSE', labelKey: 'reservation.zone_terrasse' },
  { value: 'ETAGE',    labelKey: 'reservation.zone_etage' },
];

function buildSchema(t) {
  return z.object({
    first_name: z.string().min(2, t('reservation.error_first_name')),
    last_name:  z.string().min(2, t('reservation.error_last_name')),
    email:      z.string().email(t('reservation.error_email')),
    phone:      z.string().min(8, t('reservation.error_phone')),
    date:       z.string().min(1, t('reservation.error_date')),
    zone:       z.enum(['SALLE', 'TERRASSE', 'ETAGE'], { required_error: t('reservation.error_zone') }),
    time_slot:  z.string().min(1, t('reservation.error_time_slot')),
    covers:     z.coerce.number().int().min(1, t('reservation.error_covers')).max(50),
    notes:      z.string().max(500).optional(),
  });
}

/* ── PageHeader — defined OUTSIDE to avoid remount on every render ── */
function PageHeader({ title, onBack }) {
  return (
    <div className="flex items-center px-4 pt-6 pb-4">
      <button
        type="button"
        onClick={onBack}
        className="w-9 h-9 flex items-center justify-center rounded-full"
        style={{ backgroundColor: 'var(--bg-secondary, #f3f4f6)' }}
      >
        <ArrowLeft size={18} style={{ color: 'var(--text-primary, #111)' }} />
      </button>
      <h1
        className="flex-1 text-center text-xs font-black tracking-[0.18em] uppercase"
        style={{ color: 'var(--text-primary, #111)' }}
      >
        {title}
      </h1>
      <div className="w-9" />
    </div>
  );
}

/* ── CalendarPicker — defined OUTSIDE ── */
function CalendarPicker({ selectedDate, onChange, lang, accentColor }) {
  const todayStr = new Date().toISOString().split('T')[0];
  const maxD = new Date();
  maxD.setDate(maxD.getDate() + 30);
  const maxStr = maxD.toISOString().split('T')[0];

  const now = new Date();
  const [calYear,  setCalYear]  = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());

  const daysInMonth    = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(calYear, calMonth, 1).getDay();

  const dayHeaders = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(2024, 0, 7 + i);
    return new Intl.DateTimeFormat(lang, { weekday: 'narrow' }).format(d);
  });

  const monthLabel = new Intl.DateTimeFormat(lang, { month: 'long', year: 'numeric' }).format(
    new Date(calYear, calMonth, 1)
  );

  function prevMonth() {
    if (calMonth === 0) { setCalYear((y) => y - 1); setCalMonth(11); }
    else setCalMonth((m) => m - 1);
  }
  function nextMonth() {
    if (calMonth === 11) { setCalYear((y) => y + 1); setCalMonth(0); }
    else setCalMonth((m) => m + 1);
  }

  const cells = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="px-4 pt-2 pb-4">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={prevMonth}
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'var(--bg-secondary, #f3f4f6)', color: 'var(--text-primary, #111)' }}
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm font-bold capitalize" style={{ color: 'var(--text-primary, #111)' }}>
          {monthLabel}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'var(--bg-secondary, #f3f4f6)', color: 'var(--text-primary, #111)' }}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {dayHeaders.map((d, i) => (
          <div key={i} className="text-center text-xs font-semibold py-1" style={{ color: 'var(--text-secondary, #9ca3af)' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-y-2">
        {cells.map((day, idx) => {
          if (!day) return <div key={idx} />;
          const dateStr    = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isPast     = dateStr < todayStr;
          const isTooFar   = dateStr > maxStr;
          const isDisabled = isPast || isTooFar;
          const isToday    = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;

          let bg = 'transparent', color = 'var(--text-primary, #1a1a1a)', border = 'none', fw = 500;

          if (isSelected)     { bg = accentColor;               color = '#fff';      fw = 700; }
          else if (isToday)   { border = '2px solid #ef4444';  color = '#ef4444';   fw = 700; }
          else if (isPast)    { bg = '#e5e7eb';                color = '#9ca3af';   fw = 400; }
          else if (isTooFar)  { bg = '#f3f4f6';                color = '#d1d5db';   fw = 400; }

          return (
            <button
              key={idx}
              type="button"
              disabled={isDisabled}
              onClick={() => onChange(dateStr)}
              className="mx-auto flex items-center justify-center transition-all active:scale-90"
              style={{ width: 36, height: 36, borderRadius: '50%', fontSize: 13, fontWeight: fw, backgroundColor: bg, color, border, cursor: isDisabled ? 'default' : 'pointer' }}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Main page ── */
export default function ReservationFormPage() {
  const { slug }     = useParams();
  const { t, i18n } = useTranslation();
  const navigate     = useNavigate();
  const lang         = ['fr', 'en', 'it', 'ar'].includes(i18n.language) ? i18n.language : 'fr';
  const isRTL        = lang === 'ar';

  const [step,         setStep]         = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [successData,  setSuccessData]  = useState(null);

  const { data: restaurant } = useQuery({
    queryKey: ['public-restaurant', slug],
    queryFn:  () => api.get(`/public/${slug}`).then((r) => r.data.data),
    staleTime: 0,
  });

  useEffect(() => {
    if (restaurant) applyTheme(restaurant);
    return () => {
      document.documentElement.removeAttribute('data-template');
      const tag = document.getElementById('menuqr-custom-theme');
      if (tag) tag.textContent = '';
    };
  }, [restaurant]);

  // Use accent color directly — never rely on CSS var alone (may not be set yet)
  const accentColor = restaurant?.custom_colors?.accent || '#6c47ff';

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver:      zodResolver(buildSchema(t)),
    defaultValues: { covers: 2, zone: 'SALLE' },
  });

  const watchZone     = watch('zone');
  const watchTimeSlot = watch('time_slot');

  // Load slots in step 1 (default zone SALLE) and step 2 (selected zone)
  const { data: slots, isLoading: slotsLoading } = useQuery({
    queryKey: ['reservation-slots', slug, selectedDate, step === 1 ? 'SALLE' : watchZone],
    queryFn:  () =>
      api.get(`/public/${slug}/reservations/slots`, {
        params: { date: selectedDate, zone: step === 1 ? 'SALLE' : watchZone },
      }).then((r) => r.data.data),
    enabled: !!selectedDate && step >= 1,
  });

  const submitMutation = useMutation({
    mutationFn: (data) =>
      api.post(`/public/${slug}/reservations`, {
        first_name:       data.first_name,
        last_name:        data.last_name,
        email:            data.email,
        phone:            data.phone,
        reservation_date: data.date,
        reservation_time: data.time_slot,
        covers:           data.covers,
        zone:             data.zone,
        notes:            data.notes,
      }),
    onSuccess: (_, variables) => { setSuccessData(variables); setStep(3); },
  });

  function goToForm() {
    if (!selectedDate || !selectedTime) return;
    setValue('date', selectedDate);
    setValue('time_slot', selectedTime);
    setStep(2);
  }

  const pageTitle = t('reservation.page_title', { defaultValue: 'Réservation en ligne' });

  /* ── Step 3: Success ── */
  if (step === 3 && successData) {
    return (
      <div
        className="min-h-svh flex flex-col"
        style={{ backgroundColor: 'var(--bg-primary, white)' }}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <PageHeader title={pageTitle} onBack={() => navigate(`/${slug}`)} />

        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5 text-center pb-24">
          {restaurant?.logo_url ? (
            <img
              src={restaurant.logo_url}
              alt="logo"
              className="w-24 h-24 rounded-full object-cover shadow-lg"
              style={{ border: '4px solid var(--bg-secondary, #f3f4f6)' }}
            />
          ) : (
            <div className="w-24 h-24 rounded-full flex items-center justify-center text-4xl shadow"
              style={{ backgroundColor: 'var(--bg-secondary, #f3f4f6)' }}>✅</div>
          )}
          <div>
            <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary, #111)' }}>
              {t('reservation.success_title')}
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary, #6b7280)' }}>
              {t('reservation.success_msg')}
            </p>
          </div>
          <div className="flex flex-col gap-1.5 py-4 px-6 rounded-2xl w-full max-w-xs"
            style={{ backgroundColor: 'var(--bg-secondary, #f3f4f6)' }}>
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary, #111)' }}>📅 {successData.date}</span>
            <span className="text-sm" style={{ color: 'var(--text-secondary, #6b7280)' }}>🕐 {successData.time_slot}</span>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-secondary, #9ca3af)' }}>{t('reservation.email_sent')}</p>
        </div>

        {/* Fixed CTA */}
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '12px 24px 32px', background: 'linear-gradient(to top, white 70%, transparent)' }}>
          <button
            type="button"
            onClick={() => navigate(`/${slug}/menu`)}
            className="w-full max-w-md mx-auto flex items-center justify-center py-4 rounded-2xl text-white font-black text-sm tracking-widest uppercase"
            style={{ display: 'flex', backgroundColor: accentColor, boxShadow: `0 6px 24px ${accentColor}66` }}
          >
            {t('client.view_menu', { defaultValue: 'Voir le menu' })}
          </button>
        </div>
      </div>
    );
  }

  /* ── Step 1: Calendar + Time ── */
  if (step === 1) {
    const canProceed = !!selectedDate && !!selectedTime;
    return (
      <div
        className="min-h-svh"
        style={{ backgroundColor: 'var(--bg-primary, white)', paddingBottom: 120 }}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <PageHeader title={pageTitle} onBack={() => navigate(`/${slug}`)} />

        <div className="max-w-sm mx-auto w-full px-4 space-y-5">
          {/* Calendar */}
          <CalendarPicker selectedDate={selectedDate} onChange={(d) => { setSelectedDate(d); setSelectedTime(''); }} lang={lang} accentColor={accentColor} />

          {/* Time slots — shown once date is selected */}
          {selectedDate && (
            <div>
              <p className="text-xs font-bold mb-3 uppercase tracking-wider" style={{ color: 'var(--text-secondary, #6b7280)' }}>
                🕐 {t('reservation.time_slot', { defaultValue: 'Créneau horaire' })}
              </p>

              {slotsLoading ? (
                <div className="flex items-center gap-2 py-3">
                  <Loader2 size={14} className="animate-spin" style={{ color: accentColor }} />
                  <span className="text-xs" style={{ color: 'var(--text-secondary, #6b7280)' }}>{t('common.loading')}</span>
                </div>
              ) : (() => {
                // Use API slots if available, otherwise fall back to static grid
                const apiSlots = (slots || []).filter((s) => !s.is_full);
                const useStatic = apiSlots.length === 0;
                const todayStr = new Date().toISOString().split('T')[0];
                const isToday = selectedDate === todayStr;
                const minHoursBefore = 2;
                const cutoffMs = Date.now() + minHoursBefore * 3600 * 1000;

                const staticSlots = [];
                if (useStatic) {
                  for (let h = 7; h <= 23; h++) {
                    staticSlots.push(`${String(h).padStart(2, '0')}:00`);
                    if (h < 23) staticSlots.push(`${String(h).padStart(2, '0')}:30`);
                  }
                }

                // Filter slots too close to now when today is selected
                function isTooSoon(timeStr) {
                  if (!isToday) return false;
                  const [hh, mm] = timeStr.split(':').map(Number);
                  const slotMs = new Date().setHours(hh, mm, 0, 0);
                  return slotMs < cutoffMs;
                }

                const displaySlots = useStatic
                  ? staticSlots.filter((s) => !isTooSoon(s)).map((s) => ({ time: s, is_full: false }))
                  : (slots || []).filter((s) => !isTooSoon(s.time));

                return (
                  <div className="grid grid-cols-4 gap-2">
                    {displaySlots.map((slot) => {
                      const timeVal = typeof slot === 'string' ? slot : slot.time;
                      const isFull  = typeof slot === 'string' ? false : slot.is_full;
                      const active  = selectedTime === timeVal;
                      return (
                        <button
                          key={timeVal}
                          type="button"
                          disabled={isFull}
                          onClick={() => setSelectedTime(timeVal)}
                          className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${isFull ? 'opacity-40 cursor-not-allowed' : ''}`}
                          style={{
                            borderColor:     active ? accentColor : 'var(--card-border, #e5e7eb)',
                            backgroundColor: active ? accentColor : 'var(--card-bg, white)',
                            color:           active ? '#fff'      : 'var(--text-primary, #111)',
                          }}
                        >
                          {timeVal.slice(0, 5)}
                        </button>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* Fixed NEXT STEP */}
        <div
          style={{
            position: 'fixed', bottom: 0, left: 0, right: 0,
            padding: '12px 24px 32px',
            background: 'linear-gradient(to top, var(--bg-primary, white) 65%, transparent)',
          }}
        >
          <button
            type="button"
            onClick={goToForm}
            className="w-full max-w-sm mx-auto flex items-center justify-center py-4 rounded-2xl font-black text-sm tracking-widest uppercase transition-all"
            style={{
              display: 'flex',
              backgroundColor: canProceed ? accentColor : '#e5e7eb',
              color:           canProceed ? '#ffffff'   : '#9ca3af',
              boxShadow:       canProceed ? `0 6px 24px ${accentColor}66` : 'none',
            }}
          >
            {!selectedDate ? 'Choisissez une date' : !selectedTime ? 'Choisissez un créneau' : 'Étape suivante'}
          </button>
          {canProceed && (
            <p className="text-center text-xs mt-2 font-semibold" style={{ color: accentColor }}>
              📅 {selectedDate} &nbsp;·&nbsp; 🕐 {selectedTime}
            </p>
          )}
        </div>
      </div>
    );
  }

  /* ── Step 2: Form ── */
  return (
    <div
      className="min-h-svh"
      style={{ backgroundColor: 'var(--bg-primary, white)', paddingBottom: 110 }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <PageHeader title={pageTitle} onBack={() => setStep(1)} />

      <form
        id="reservation-form"
        onSubmit={handleSubmit((data) => submitMutation.mutate(data))}
        className="px-5 space-y-4 max-w-md mx-auto w-full"
      >
        {/* Date badge */}
        <div
          className="flex items-center gap-2 py-2.5 px-4 rounded-2xl text-sm font-semibold"
          style={{ backgroundColor: `${accentColor}14`, color: accentColor }}
        >
          <span>📅</span>
          <span>{selectedDate}</span>
        </div>

        {/* Name */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary, #6b7280)' }}>
              {t('reservation.first_name')} *
            </label>
            <input
              {...register('first_name')}
              placeholder="Jean"
              className="w-full px-3 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2"
              style={{ borderColor: errors.first_name ? '#ef4444' : 'var(--card-border, #e5e7eb)', backgroundColor: 'var(--card-bg, white)', color: 'var(--text-primary, #111)' }}
            />
            {errors.first_name && <p className="text-xs text-red-500 mt-1">{errors.first_name.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary, #6b7280)' }}>
              {t('reservation.last_name')} *
            </label>
            <input
              {...register('last_name')}
              placeholder="Dupont"
              className="w-full px-3 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2"
              style={{ borderColor: errors.last_name ? '#ef4444' : 'var(--card-border, #e5e7eb)', backgroundColor: 'var(--card-bg, white)', color: 'var(--text-primary, #111)' }}
            />
            {errors.last_name && <p className="text-xs text-red-500 mt-1">{errors.last_name.message}</p>}
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary, #6b7280)' }}>
            {t('common.email')} *
          </label>
          <input
            {...register('email')}
            type="email"
            placeholder="jean@example.com"
            className="w-full px-3 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2"
            style={{ borderColor: errors.email ? '#ef4444' : 'var(--card-border, #e5e7eb)', backgroundColor: 'var(--card-bg, white)', color: 'var(--text-primary, #111)' }}
          />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary, #6b7280)' }}>
            {t('common.phone')} *
          </label>
          <input
            {...register('phone')}
            type="tel"
            placeholder="+216 XX XXX XXX"
            className="w-full px-3 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2"
            style={{ borderColor: errors.phone ? '#ef4444' : 'var(--card-border, #e5e7eb)', backgroundColor: 'var(--card-bg, white)', color: 'var(--text-primary, #111)' }}
          />
          {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
        </div>

        {/* Zone */}
        <div>
          <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary, #6b7280)' }}>
            {t('reservation.zone')} *
          </label>
          <div className="flex gap-2">
            {ZONES.map((z) => {
              const active = watchZone === z.value;
              return (
                <label
                  key={z.value}
                  className="flex-1 flex items-center justify-center py-2.5 rounded-xl border cursor-pointer text-xs font-semibold transition-all"
                  style={{
                    borderColor:     active ? accentColor : 'var(--card-border, #e5e7eb)',
                    backgroundColor: active ? `${accentColor}14` : 'var(--card-bg, white)',
                    color:           active ? accentColor : 'var(--text-secondary, #6b7280)',
                  }}
                >
                  <input type="radio" {...register('zone')} value={z.value} className="sr-only" />
                  {t(z.labelKey)}
                </label>
              );
            })}
          </div>
          {errors.zone && <p className="text-xs text-red-500 mt-1">{errors.zone.message}</p>}
        </div>

        {/* Date + Time summary badge — read-only, set in step 1 */}
        <div
          className="flex items-center gap-3 py-2.5 px-4 rounded-2xl text-sm font-semibold"
          style={{ backgroundColor: `${accentColor}14`, color: accentColor }}
        >
          <span>📅 {selectedDate}</span>
          <span>·</span>
          <span>🕐 {selectedTime}</span>
          <button
            type="button"
            onClick={() => setStep(1)}
            className="ml-auto text-xs underline opacity-70"
          >
            Modifier
          </button>
        </div>
        {/* time_slot is set in form state by setValue() in goToForm() */}

        {/* Covers */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary, #6b7280)' }}>
            <Users size={13} /> {t('reservation.covers')} *
          </label>
          <input
            {...register('covers')}
            type="number"
            min="1"
            max="50"
            className="w-full px-3 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2"
            style={{ borderColor: errors.covers ? '#ef4444' : 'var(--card-border, #e5e7eb)', backgroundColor: 'var(--card-bg, white)', color: 'var(--text-primary, #111)' }}
          />
          {errors.covers && <p className="text-xs text-red-500 mt-1">{errors.covers.message}</p>}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary, #6b7280)' }}>
            {t('reservation.notes')}{' '}
            <span style={{ color: 'var(--text-secondary, #9ca3af)', fontWeight: 400 }}>({t('common.optional')})</span>
          </label>
          <textarea
            {...register('notes')}
            placeholder={t('reservation.notes_placeholder')}
            rows={2}
            maxLength={500}
            className="w-full px-3 py-2.5 text-sm rounded-xl border resize-none focus:outline-none"
            style={{ borderColor: 'var(--card-border, #e5e7eb)', backgroundColor: 'var(--card-bg, white)', color: 'var(--text-primary, #111)' }}
          />
        </div>

        {submitMutation.isError && (
          <p className="text-xs text-red-500 text-center">
            {(() => {
              const code = submitMutation.error?.response?.data?.message;
              const MAP = {
                reservations_not_configured: 'Les réservations ne sont pas disponibles pour ce restaurant.',
                too_late_to_book:            'Ce créneau est trop proche — veuillez réserver plus tôt.',
                zone_not_available:          'Cette zone n\'est pas disponible. Essayez une autre zone.',
                date_too_far:                'Cette date dépasse la limite de réservation.',
                slot_full:                   'Ce créneau est complet. Veuillez en choisir un autre.',
                missing_required_fields:     'Des champs requis sont manquants.',
                invalid_covers:              'Nombre de personnes invalide (1-50).',
              };
              return MAP[code] || `Erreur : ${code || 'Veuillez réessayer.'}`;
            })()}
          </p>
        )}
      </form>

      {/* Copyright footer */}
      <div className="py-5 px-4 text-center">
        <p className="text-[11px]" style={{ color: 'var(--text-secondary, #9ca3af)' }}>
          Copyright © 2026{' '}
          <a
            href="https://www.hannibaladvanced.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold hover:underline"
            style={{ color: 'var(--accent, #6c47ff)' }}
          >
            Hannibal Advanced
          </a>
          . All Rights Reserved.
        </p>
      </div>

      {/* Fixed submit button */}
      <div
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          padding: '12px 20px 32px',
          background: 'linear-gradient(to top, white 65%, transparent)',
        }}
      >
        <button
          type="submit"
          form="reservation-form"
          disabled={submitMutation.isPending}
          className="w-full max-w-md mx-auto flex items-center justify-center gap-2 py-4 rounded-2xl text-white font-black text-sm tracking-widest uppercase disabled:opacity-60"
          style={{
            display: 'flex',
            backgroundColor: accentColor,
            boxShadow: `0 6px 24px ${accentColor}66`,
          }}
        >
          {submitMutation.isPending && <Loader2 size={15} className="animate-spin" />}
          {t('reservation.submit')}
        </button>
      </div>
    </div>
  );
}
