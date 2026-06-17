import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import api from '../../api/axios';
import { formatDT } from '../../utils/currency';
import toast from 'react-hot-toast';
import {
  X, Banknote, CreditCard,
  Receipt, Check, Tag, Delete,
} from 'lucide-react';

const ORANGE = '#f97316';

export default function PaymentModal({ order, lang, onClose, onSuccess }) {
  const { user } = useAuthStore();
  const canDiscount = ['OWNER', 'MANAGER'].includes(user?.role);

  const [method,        setMethod]        = useState('CASH');
  const [amountStr,     setAmountStr]     = useState('0');
  const [discountAmount,setDiscountAmount]= useState('');
  const [discountType,  setDiscountType]  = useState('PERCENT');
  const [showDiscount,  setShowDiscount]  = useState(false);
  const [paid,          setPaid]          = useState(null);

  const orderTotal = Number(order.total);

  let finalTotal = orderTotal;
  if (showDiscount && Number(discountAmount) > 0) {
    finalTotal = discountType === 'PERCENT'
      ? orderTotal * (1 - Math.min(100, Number(discountAmount)) / 100)
      : Math.max(0, orderTotal - Number(discountAmount));
    finalTotal = Math.round(finalTotal * 1000) / 1000;
  }

  const amountPaid   = parseFloat(amountStr) || 0;
  const dueAmount    = Math.max(0, Math.round((finalTotal - amountPaid) * 1000) / 1000);
  const change       = method === 'CASH' ? Math.max(0, Math.round((amountPaid - finalTotal) * 1000) / 1000) : 0;
  const canPay       = method === 'CARD' || amountPaid >= finalTotal;

  // Quick amount buttons — round numbers near the total
  const quickAmounts = (() => {
    const base = Math.ceil(finalTotal);
    const step = finalTotal > 50 ? 10 : finalTotal > 20 ? 5 : 2;
    return [
      Math.ceil(finalTotal / step) * step,
      Math.ceil(finalTotal / step) * step + step,
      Math.ceil(finalTotal / step) * step + step * 2,
      Math.ceil(finalTotal / step) * step + step * 3,
    ].map((v) => Math.round(v * 1000) / 1000);
  })();

  function pressKey(k) {
    setAmountStr((prev) => {
      if (k === 'x') {
        const next = prev.slice(0, -1);
        return next === '' || next === '-' ? '0' : next;
      }
      if (k === '.') {
        if (prev.includes('.')) return prev;
        return prev + '.';
      }
      if (prev === '0') return String(k);
      if (prev.includes('.') && prev.split('.')[1]?.length >= 3) return prev;
      return prev + k;
    });
  }

  const mutation = useMutation({
    mutationFn: (data) => api.post('/pos/payments', data).then((r) => r.data),
    onSuccess: (res) => {
      setPaid(res.data);
      toast.success(`Paiement validé — ${formatDT(finalTotal, lang)}`);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Erreur lors du paiement'),
  });

  function handleSubmit() {
    mutation.mutate({
      order_id:        order.id,
      method,
      amount_received: method === 'CASH' ? amountPaid : finalTotal,
      discount_amount: showDiscount ? Number(discountAmount) || 0 : 0,
      discount_type:   showDiscount && Number(discountAmount) > 0 ? discountType : null,
    });
  }

  async function handlePrintReceipt() {
    const id = paid?.payment?.id;
    if (!id) { toast.error('ID du paiement introuvable'); return; }
    try {
      const res = await api.post(`/pos/print/receipt/${id}`, {}, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      window.open(url, '_blank');
    } catch {
      toast.error('Impossible de générer le reçu');
    }
  }

  const METHODS = [
    { value: 'CASH', label: 'Cash',  icon: <Banknote   size={20} className="mx-auto mb-1" /> },
    { value: 'CARD', label: 'Carte', icon: <CreditCard size={20} className="mx-auto mb-1" /> },
  ];

  const NUMPAD = [
    ['1','2','3'],
    ['4','5','6'],
    ['7','8','9'],
    ['.','0','x'],
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-start justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#fff7ed' }}>
              <Banknote size={18} style={{ color: ORANGE }} />
            </div>
            <div>
              <h2 className="text-base font-black text-gray-900">Encaissement</h2>
              <p className="text-[11px] text-gray-400 font-mono">
                Commande #{String(order.id).slice(-6).toUpperCase()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">Total</p>
              <p className="text-lg font-black" style={{ color: ORANGE }}>{formatDT(finalTotal, lang)}</p>
            </div>
            <button type="button" onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors">
              <X size={14} className="text-gray-500" />
            </button>
          </div>
        </div>

        {!paid ? (
          <div className="px-5 pb-5 space-y-4">

            {/* ── Payment method icons ── */}
            <div className="flex justify-center gap-4">
              {METHODS.map(({ value, label, icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => { setMethod(value); if (value !== 'CASH') setAmountStr(String(finalTotal)); }}
                  className="flex flex-col items-center py-3 rounded-2xl border-2 text-xs font-semibold transition-all w-28"
                  style={method === value
                    ? { borderColor: ORANGE, backgroundColor: '#fff7ed', color: ORANGE }
                    : { borderColor: '#e5e7eb', backgroundColor: 'white', color: '#6b7280' }
                  }
                >
                  {icon}
                  {label}
                </button>
              ))}
            </div>

            {/* ── Amount display ── */}
            <div
              className="w-full rounded-2xl border-2 px-4 py-3 text-center"
              style={{ borderColor: '#e5e7eb' }}
            >
              <p className="text-3xl font-black text-gray-900 tracking-wider">
                {amountStr || '0'}
              </p>
            </div>

            {/* ── Bill summary ── */}
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Total commande</span>
                <span className="font-semibold text-gray-700">{formatDT(finalTotal, lang)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Montant reçu</span>
                <span className="font-semibold text-gray-700">{formatDT(amountPaid, lang)}</span>
              </div>
              <div className="flex justify-between font-bold border-t border-gray-100 pt-1.5">
                <span style={{ color: dueAmount > 0 ? '#ef4444' : '#10b981' }}>
                  {dueAmount > 0 ? 'Reste à payer' : 'Monnaie à rendre'}
                </span>
                <span style={{ color: dueAmount > 0 ? '#ef4444' : '#10b981' }}>
                  {dueAmount > 0 ? formatDT(dueAmount, lang) : formatDT(change, lang)}
                </span>
              </div>
            </div>

            {/* ── Quick amounts ── */}
            {method === 'CASH' && (
              <div className="grid grid-cols-4 gap-1.5">
                {quickAmounts.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAmountStr(String(amt))}
                    className="py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 transition-all"
                  >
                    {amt} DT
                  </button>
                ))}
              </div>
            )}

            {/* ── Numpad ── */}
            {method === 'CASH' && (
              <div className="grid grid-cols-3 gap-2">
                {NUMPAD.flat().map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => pressKey(k)}
                    className="py-3.5 rounded-2xl text-sm font-black transition-all active:scale-95 flex items-center justify-center"
                    style={k === 'x'
                      ? { backgroundColor: '#fee2e2', color: '#ef4444' }
                      : { backgroundColor: '#f3f4f6', color: '#1f2937' }
                    }
                  >
                    {k === 'x' ? <Delete size={16} /> : k}
                  </button>
                ))}
              </div>
            )}

            {/* ── Discount (OWNER/MANAGER) ── */}
            {canDiscount && (
              <div className="border-t border-gray-100 pt-3">
                <button
                  type="button"
                  onClick={() => { setShowDiscount((v) => !v); setDiscountAmount(''); }}
                  className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-orange-500 transition-colors"
                >
                  <Tag size={12} />
                  {showDiscount ? 'Retirer la remise' : 'Appliquer une remise'}
                </button>
                {showDiscount && (
                  <div className="mt-2 flex gap-2">
                    <select
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value)}
                      className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none"
                    >
                      <option value="PERCENT">%</option>
                      <option value="FIXED">DT fixe</option>
                    </select>
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      max={discountType === 'PERCENT' ? 100 : orderTotal}
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(e.target.value)}
                      placeholder={discountType === 'PERCENT' ? 'Ex: 10' : 'Ex: 5.000'}
                      className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
                    />
                  </div>
                )}
              </div>
            )}

            {/* ── Actions ── */}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-2xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canPay || mutation.isPending}
                className="flex-1 py-3 rounded-2xl text-white text-sm font-black transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ backgroundColor: ORANGE, boxShadow: canPay ? `0 4px 16px ${ORANGE}55` : 'none' }}
              >
                {mutation.isPending ? 'Traitement…' : 'Valider le paiement'}
              </button>
            </div>
          </div>

        ) : (
          /* ── Success screen ── */
          <div className="px-5 pb-6 text-center space-y-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
              style={{ backgroundColor: '#dcfce7' }}
            >
              <Check size={32} style={{ color: '#16a34a' }} />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900">Paiement validé !</h3>
              <p className="text-sm text-gray-400 mt-0.5">
                {method === 'CASH' ? 'Espèces' : 'Carte bancaire'} — {formatDT(finalTotal, lang)}
              </p>
            </div>
            {method === 'CASH' && change > 0 && (
              <div className="rounded-2xl p-4" style={{ backgroundColor: '#f0fdf4', border: '1.5px solid #86efac' }}>
                <p className="text-xs font-semibold text-green-600">Monnaie à rendre</p>
                <p className="text-3xl font-black text-green-700 mt-1">{formatDT(change, lang)}</p>
              </div>
            )}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={handlePrintReceipt}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                <Receipt size={14} /> Reçu
              </button>
              <button
                type="button"
                onClick={onSuccess}
                className="flex-1 py-2.5 rounded-2xl text-white text-sm font-black hover:opacity-90"
                style={{ backgroundColor: ORANGE }}
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
