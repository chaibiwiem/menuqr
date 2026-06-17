import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Bell, CheckCircle, Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const TYPE_LABELS = { WAITER: 'Appel serveur', CHECK: 'Demande d\'addition', OTHER: 'Autre demande' };
const TYPE_ICONS  = { WAITER: '🔔', CHECK: '💳', OTHER: '💬' };

function Square({ style }) {
  return (
    <span
      className="absolute block rounded-sm bg-amber-200 opacity-50"
      style={style}
    />
  );
}

export default function CallWaiterModal({ call, onClose, onStopSounds }) {
  const navigate = useNavigate();
  const qc       = useQueryClient();
  const [resolved, setResolved] = useState(false);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Auto-close after 60 s
  useEffect(() => {
    const timer = setTimeout(onClose, 60_000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!call) return null;

  const tableLabel = call.table_name || (call.table_number ? `Table ${call.table_number}` : 'Table inconnue');
  const typeLabel  = TYPE_LABELS[call.type] || 'Appel serveur';
  const typeIcon   = TYPE_ICONS[call.type]  || '🔔';

  const resolveMutation = useMutation({
    mutationFn: () => {
      onStopSounds?.();   // silence ALL sounds immediately on click
      return api.put(`/call-waiter/${call.id}/resolve`);
    },
    onSuccess: () => {
      setResolved(true);
      qc.invalidateQueries({ queryKey: ['table-calls'] });
      qc.invalidateQueries({ queryKey: ['call-waiter-stats'] });
      toast.success(`Appel résolu — ${tableLabel}`);
      setTimeout(onClose, 600);
    },
    onError: (err) => {
      if (err?.response?.status === 404) {
        toast('Appel déjà résolu', { icon: '✓' });
        onClose();
      } else {
        toast.error('Impossible de résoudre l\'appel');
      }
    },
  });

  function handleGoToCalls() {
    onClose();
    navigate('/dashboard/call-waiter');
  }

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.30)', backdropFilter: 'blur(2px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative bg-white rounded-3xl shadow-2xl w-80 mx-4 overflow-hidden"
        style={{ animation: 'callModalIn 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}
      >
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
        >
          <X size={14} className="text-gray-500" />
        </button>

        {/* Decorative top zone */}
        <div className="relative flex items-center justify-center pt-10 pb-6 overflow-hidden">
          <Square style={{ width: 34, height: 34, top: 10, left: 20, transform: 'rotate(12deg)', animation: 'floatA 3s ease-in-out infinite' }} />
          <Square style={{ width: 20, height: 20, top: 28, left: 66, transform: 'rotate(-8deg)',  animation: 'floatB 3.5s ease-in-out infinite' }} />
          <Square style={{ width: 28, height: 28, top: 6,  right: 28, transform: 'rotate(22deg)', animation: 'floatC 4s ease-in-out infinite' }} />
          <Square style={{ width: 16, height: 16, top: 34, right: 70, transform: 'rotate(-15deg)', animation: 'floatA 2.8s ease-in-out infinite 0.5s' }} />
          <Square style={{ width: 12, height: 12, bottom: 12, left: 42, transform: 'rotate(6deg)',  animation: 'floatB 3.2s ease-in-out infinite 1s' }} />

          {/* Bell icon — turns green when resolved */}
          <div
            className="relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-colors duration-300 text-2xl"
            style={{
              backgroundColor: resolved ? '#10b981' : '#f59e0b',
              animation: resolved ? 'none' : 'bellPulse 2s ease-in-out infinite',
            }}
          >
            {resolved
              ? <CheckCircle size={28} className="text-white" />
              : <span>{typeIcon}</span>
            }
          </div>
        </div>

        {/* Text content */}
        <div className="px-6 pb-2 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            {resolved ? 'Appel résolu !' : typeLabel}
          </h2>
          <p className="text-sm text-amber-600 font-medium">
            {tableLabel}
          </p>
          {call.message && (
            <p className="text-xs text-gray-400 mt-0.5 italic">"{call.message}"</p>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 pt-3 pb-6 space-y-2">
          {call.id && !resolved && (
            <button
              type="button"
              onClick={() => resolveMutation.mutate()}
              disabled={resolveMutation.isPending}
              className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              {resolveMutation.isPending
                ? <><Loader2 size={15} className="animate-spin" /> Résolution…</>
                : <><CheckCircle size={15} /> OK, j'y vais</>
              }
            </button>
          )}

          <button
            type="button"
            onClick={handleGoToCalls}
            className="w-full py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm transition-colors"
          >
            Voir les appels
          </button>
        </div>

        {/* Bottom progress bar — 60s auto-close */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-100">
          <div
            className="h-full bg-amber-400 origin-left"
            style={{ animation: 'countdown60 60s linear forwards' }}
          />
        </div>
      </div>

      <style>{`
        @keyframes callModalIn {
          from { opacity: 0; transform: scale(0.8) translateY(20px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes floatA {
          0%, 100% { transform: rotate(12deg)  translateY(0px);  }
          50%       { transform: rotate(12deg)  translateY(-8px); }
        }
        @keyframes floatB {
          0%, 100% { transform: rotate(-8deg)  translateY(0px);  }
          50%       { transform: rotate(-8deg)  translateY(-6px); }
        }
        @keyframes floatC {
          0%, 100% { transform: rotate(22deg)  translateY(0px);  }
          50%       { transform: rotate(22deg)  translateY(-10px);}
        }
        @keyframes bellPulse {
          0%, 100% { box-shadow: 0 8px 25px rgba(245,158,11,0.4); }
          50%       { box-shadow: 0 8px 40px rgba(245,158,11,0.7); }
        }
        @keyframes countdown60 {
          from { transform: scaleX(1); }
          to   { transform: scaleX(0); }
        }
      `}</style>
    </div>
  );
}
