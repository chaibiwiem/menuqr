import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, CalendarDays, Clock, Users, MapPin } from 'lucide-react';

const ZONE_LABELS = { SALLE: 'Salle', TERRASSE: 'Terrasse', ETAGE: 'Étage' };

function fmtDate(s) {
  if (!s) return '';
  const [y, m, d] = s.split('-');
  return `${d}/${m}/${y}`;
}

function fmtTime(t) {
  return t ? t.slice(0, 5) : '';
}

export default function NewReservationModal({ reservation, onClose }) {
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Auto-close after 12 s
  useEffect(() => {
    const timer = setTimeout(onClose, 12_000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!reservation) return null;

  const { first_name, last_name, covers, reservation_date, reservation_time, zone } = reservation;
  const fullName = `${first_name} ${last_name}`;
  const zoneLabel = ZONE_LABELS[zone] || zone;

  function handleView() {
    onClose();
    navigate('/dashboard/reservations');
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-end p-4 pointer-events-none">
      <div
        className="pointer-events-auto bg-white rounded-2xl shadow-2xl border border-purple-100 w-80 overflow-hidden"
        style={{ animation: 'reservationSlideIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-600 to-orange-500">
          <div className="flex items-center gap-2">
            <CalendarDays size={16} className="text-white" />
            <span className="text-sm font-semibold text-white">Nouvelle réservation</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/20 text-white transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="px-4 py-4 space-y-3">
          <p className="text-base font-bold text-gray-900">{fullName}</p>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <CalendarDays size={13} className="text-purple-500 shrink-0" />
              {fmtDate(reservation_date)}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <Clock size={13} className="text-purple-500 shrink-0" />
              {fmtTime(reservation_time)}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <Users size={13} className="text-purple-500 shrink-0" />
              {covers} couvert{covers > 1 ? 's' : ''}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <MapPin size={13} className="text-purple-500 shrink-0" />
              {zoneLabel}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-4 pb-4 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Ignorer
          </button>
          <button
            type="button"
            onClick={handleView}
            className="flex-1 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-orange-500 text-white text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            Voir →
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-orange-500"
            style={{ animation: 'reservationProgress 12s linear forwards' }}
          />
        </div>
      </div>

      <style>{`
        @keyframes reservationSlideIn {
          from { opacity: 0; transform: translateY(30px) scale(0.92); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes reservationProgress {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
    </div>
  );
}
