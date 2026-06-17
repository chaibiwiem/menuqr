import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Check, Loader2 } from 'lucide-react';
import { formatDT } from '../../utils/currency';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../api/axios';

// ─── Floating animated square ─────────────────────────────────────────────────

function Square({ style }) {
  return (
    <span
      className="absolute block rounded-sm bg-gray-200 opacity-60"
      style={style}
    />
  );
}

// ─── NewOrderModal ─────────────────────────────────────────────────────────────

export default function NewOrderModal({ order, onClose, onStopSounds }) {
  const navigate  = useNavigate();
  const { i18n } = useTranslation();
  const lang      = ['fr', 'en', 'it', 'ar'].includes(i18n.language) ? i18n.language : 'fr';
  const qc        = useQueryClient();

  const [accepting, setAccepting] = useState(false);
  const [accepted,  setAccepted]  = useState(false);

  // Close on Escape
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

  if (!order) return null;

  const tableLabel = order.table_name || (order.table_number ? `Table ${order.table_number}` : null) || 'Commande en ligne';
  const totalLabel = order.total != null ? formatDT(order.total, lang) : null;

  async function handleAccept() {
    if (!order.order_id || accepting || accepted) return;
    onStopSounds?.();   // silence ALL sounds immediately on click
    setAccepting(true);
    try {
      await api.put(`/orders/${order.order_id}/status`, { status: 'CONFIRMED' });
      setAccepted(true);
      // Invalidate orders cache so Kanban reflects the change
      qc.invalidateQueries({ queryKey: ['orders'] });
      toast.success(`Commande acceptée — ${tableLabel}`);
      // Close modal after brief visual feedback
      setTimeout(onClose, 600);
    } catch (err) {
      const msg = err?.response?.data?.message;
      if (err?.response?.status === 422) {
        toast.error('Commande déjà prise en charge');
        onClose();
      } else {
        toast.error(msg || 'Impossible d\'accepter la commande');
        setAccepting(false);
      }
    }
  }

  function handleGoToOrders() {
    onClose();
    navigate('/dashboard/orders');
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(2px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative bg-white rounded-3xl shadow-2xl w-80 mx-4 overflow-hidden"
        style={{ animation: 'orderModalIn 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}
      >
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
        >
          <X size={14} className="text-gray-500" />
        </button>

        {/* Decorative top zone with floating squares */}
        <div className="relative flex items-center justify-center pt-10 pb-6 overflow-hidden">

          {/* Floating squares — like the image */}
          <Square style={{ width: 36, height: 36, top: 10, left: 22, transform: 'rotate(15deg)', animation: 'floatA 3s ease-in-out infinite' }} />
          <Square style={{ width: 22, height: 22, top: 28, left: 68, transform: 'rotate(-10deg)', animation: 'floatB 3.5s ease-in-out infinite' }} />
          <Square style={{ width: 30, height: 30, top: 6,  right: 30, transform: 'rotate(25deg)', animation: 'floatC 4s ease-in-out infinite' }} />
          <Square style={{ width: 18, height: 18, top: 36, right: 72, transform: 'rotate(-18deg)', animation: 'floatA 2.8s ease-in-out infinite 0.5s' }} />
          <Square style={{ width: 14, height: 14, bottom: 12, left: 44, transform: 'rotate(8deg)', animation: 'floatB 3.2s ease-in-out infinite 1s' }} />

          {/* Central icon — turns green when accepted */}
          <div
            className="relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-colors duration-300"
            style={{
              backgroundColor: accepted ? '#10b981' : '#6366f1',
              animation: accepted ? 'none' : 'iconPulse 2s ease-in-out infinite',
            }}
          >
            {accepted
              ? <Check size={28} className="text-white" />
              : <ShoppingBag size={28} className="text-white" />
            }
          </div>
        </div>

        {/* Text content */}
        <div className="px-6 pb-2 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            {accepted ? 'Commande acceptée !' : 'Nouvelle commande'}
          </h2>
          <p className="text-sm text-orange-500 font-medium">
            {tableLabel}
            {order.items_count != null && ` — ${order.items_count} article${order.items_count > 1 ? 's' : ''}`}
          </p>
          {totalLabel && (
            <p className="text-xs text-gray-400 mt-0.5">{totalLabel}</p>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 pt-3 pb-6 space-y-2">

          {/* Primary: Accepter */}
          {order.order_id && !accepted && (
            <button
              type="button"
              onClick={handleAccept}
              disabled={accepting}
              className="w-full py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              {accepting
                ? <><Loader2 size={15} className="animate-spin" /> Acceptation…</>
                : <><Check size={15} /> Accepter</>
              }
            </button>
          )}

          {/* Secondary: Voir les commandes */}
          <button
            type="button"
            onClick={handleGoToOrders}
            className="w-full py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm transition-colors"
          >
            Voir les commandes
          </button>
        </div>

        {/* Bottom progress bar — auto-close countdown */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-100">
          <div
            className="h-full bg-orange-400 origin-left"
            style={{ animation: 'countdown 12s linear forwards' }}
          />
        </div>
      </div>

      <style>{`
        @keyframes orderModalIn {
          from { opacity: 0; transform: scale(0.8) translateY(20px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes floatA {
          0%, 100% { transform: rotate(15deg)  translateY(0px);  }
          50%       { transform: rotate(15deg)  translateY(-8px); }
        }
        @keyframes floatB {
          0%, 100% { transform: rotate(-10deg) translateY(0px);  }
          50%       { transform: rotate(-10deg) translateY(-6px); }
        }
        @keyframes floatC {
          0%, 100% { transform: rotate(25deg)  translateY(0px);  }
          50%       { transform: rotate(25deg)  translateY(-10px);}
        }
        @keyframes iconPulse {
          0%, 100% { box-shadow: 0 8px 25px rgba(99,102,241,0.4); }
          50%       { box-shadow: 0 8px 40px rgba(99,102,241,0.7); }
        }
        @keyframes countdown {
          from { transform: scaleX(1); }
          to   { transform: scaleX(0); }
        }
      `}</style>
    </div>
  );
}
