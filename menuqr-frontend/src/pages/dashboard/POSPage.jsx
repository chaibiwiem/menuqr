import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import api from '../../api/axios';
import { formatDT } from '../../utils/currency';
import { useTranslation } from 'react-i18next';
import TableSelector from '../../components/pos/TableSelector';
import OrderSummary from '../../components/pos/OrderSummary';
import PaymentModal from '../../components/pos/PaymentModal';
import NewOrderDrawer from '../../components/pos/NewOrderDrawer';
import {
  ShoppingCart, Loader2, Printer, Plus, Users,
  Banknote, CreditCard, Smartphone, X,
} from 'lucide-react';
import toast from 'react-hot-toast';

/* ── Status config ── */
const STATUS_COLOR = {
  CONFIRMED:  { bg: '#fef3c7', text: '#92400e', label: 'Confirmée',   cardBg: '#fffbeb', cardBorder: '#fde68a' },
  READY:      { bg: '#ede9fe', text: '#6d28d9', label: 'Prête',        cardBg: '#f5f3ff', cardBorder: '#c4b5fd' },
  SERVED:     { bg: '#dcfce7', text: '#15803d', label: 'Servie',       cardBg: '#f0fdf4', cardBorder: '#86efac' },
  IN_KITCHEN: { bg: '#d1fae5', text: '#065f46', label: 'En cuisine',   cardBg: '#ecfdf5', cardBorder: '#6ee7b7' },
  PENDING:    { bg: '#f3f4f6', text: '#6b7280', label: 'En attente',   cardBg: '#fdf2f8', cardBorder: '#f9a8d4' },
};

const PAY_METHODS = [
  { key: 'cash',  label: 'Espèces', icon: <Banknote   size={14} /> },
  { key: 'card',  label: 'Carte',   icon: <CreditCard size={14} /> },
  { key: 'other', label: 'Autre',   icon: <Smartphone size={14} /> },
];

/* ── Main POSPage ── */
export default function POSPage() {
  const { i18n } = useTranslation();
  const lang = ['fr', 'en', 'it', 'ar'].includes(i18n.language) ? i18n.language : 'fr';
  const { user } = useAuthStore();
  const restaurantId = user?.restaurant_id;
  const canCheckout    = ['OWNER', 'MANAGER', 'CASHIER'].includes(user?.role); // encaisser / reçu final
  const canRequestBill = ['OWNER', 'MANAGER', 'CASHIER', 'STAFF'].includes(user?.role); // pré-addition uniquement
  const canCreateOrder = ['OWNER', 'MANAGER', 'CASHIER'].includes(user?.role); // STAFF crée via Tables & QR, pas ici
  const qc = useQueryClient();

  const [selectedTableId, setSelectedTableId] = useState(null);
  const [showPayment,     setShowPayment]     = useState(false);
  const [paymentOrder,    setPaymentOrder]    = useState(null);
  const [showNewOrder,    setShowNewOrder]    = useState(false);
  const [payMethod,       setPayMethod]       = useState('cash');

  /* queries */
  const { data: tables = [], isLoading: tablesLoading } = useQuery({
    queryKey: ['pos-active-tables', restaurantId],
    queryFn:  () => api.get('/pos/active-tables').then((r) => r.data.data),
    enabled:  !!restaurantId,
    refetchInterval: 20_000,
    staleTime: 0,
  });

  const { data: order, isLoading: orderLoading } = useQuery({
    queryKey: ['pos-order', selectedTableId],
    queryFn:  () => api.get(`/pos/orders/${selectedTableId}`).then((r) => r.data.data),
    enabled:  !!selectedTableId,
    staleTime: 0,
  });

  const selectedTable = tables.find((t) => t.id === selectedTableId);

  async function handlePreCheck() {
    if (!order?.id) return;
    try {
      const res = await api.post(`/pos/print/pre-check/${order.id}`, {}, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      window.open(url, '_blank');
    } catch {
      toast.error('Impossible de générer la pré-addition');
    }
  }

  function openPayment() {
    if (!order) return;
    setPaymentOrder(order);
    setShowPayment(true);
  }

  function handlePaymentSuccess() {
    setShowPayment(false);
    setPaymentOrder(null);
    setSelectedTableId(null);
    qc.invalidateQueries({ queryKey: ['pos-active-tables'] });
    qc.invalidateQueries({ queryKey: ['tables'] });
    qc.invalidateQueries({ queryKey: ['rooms'] });
    toast.success('Table libérée');
  }

  const statusInfo = STATUS_COLOR[order?.status] || STATUS_COLOR.PENDING;
  const itemCount  = (order?.items || []).reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="flex h-full overflow-hidden bg-gray-50">

      {/* ── LEFT: table list ── */}
      <div className="w-64 shrink-0 border-r border-gray-200 bg-white flex flex-col shadow-sm">
        <div className="px-4 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-black text-gray-900">Tables actives</h2>
            <p className="text-xs text-gray-400 mt-0.5">{tables.length} occupée(s)</p>
          </div>
          {canCreateOrder && (
            <button
              type="button"
              onClick={() => setShowNewOrder(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-white text-xs font-bold hover:opacity-90 transition-all"
              style={{ backgroundColor: '#F97316' }}
            >
              <Plus size={13} />
              Nouvelle
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          <TableSelector
            tables={tables}
            isLoading={tablesLoading}
            selectedId={selectedTableId}
            onSelect={setSelectedTableId}
            lang={lang}
          />
        </div>
      </div>

      {/* ── RIGHT: popup area ── */}
      <div className="flex-1 flex items-stretch justify-end py-6 pr-8 pl-6 overflow-y-auto">

          {orderLoading ? (
            <div className="flex items-center justify-center w-full">
              <Loader2 size={28} className="animate-spin text-orange-500" />
            </div>

          ) : selectedTableId && order ? (
            /* ── Order popup card ── */
            <div
              className="flex flex-col rounded-3xl overflow-hidden"
              style={{
                width: 380,
                minWidth: 360,
                height: '100%',
                backgroundColor: '#ffffff',
                boxShadow: '0 8px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              {/* Card header */}
              <div className="px-5 pt-5 pb-4 border-b border-gray-100 shrink-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="text-xl font-black text-gray-900 leading-tight">
                      {selectedTable?.name || `Table ${selectedTable?.number}`}
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5 font-mono">
                      Commande #{String(order.id).slice(-6).toUpperCase()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {selectedTable?.capacity && (
                      <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gray-50 border border-gray-100">
                        <Users size={12} className="text-gray-400" />
                        <span className="text-xs font-bold text-gray-600">{selectedTable.capacity}</span>
                      </div>
                    )}
                    <span
                      className="text-[11px] font-bold px-2.5 py-1.5 rounded-xl"
                      style={{ backgroundColor: statusInfo.bg, color: statusInfo.text }}
                    >
                      {statusInfo.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedTableId(null)}
                      className="w-7 h-7 rounded-full flex items-center justify-center bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Items header */}
              <div className="flex items-center justify-between px-5 pt-4 pb-2 shrink-0">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Articles commandés
                </span>
                <span className="text-xs font-black text-white px-2 py-0.5 rounded-full bg-orange-500">
                  {itemCount}
                </span>
              </div>

              {/* Items list */}
              <div className="flex-1 px-5 pb-2 overflow-y-auto">
                <OrderSummary order={order} lang={lang} />
              </div>

              {/* Total */}
              <div className="mx-5 border-t border-gray-100 pt-3 pb-3 shrink-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 font-medium">Total commande</span>
                  <span className="text-2xl font-black text-orange-500">{formatDT(order.total, lang)}</span>
                </div>
              </div>


              {/* Buttons */}
              {(canRequestBill || canCheckout) && (
                <div className="px-5 pb-5 flex gap-2 shrink-0">
                  {canRequestBill && (
                    <button
                      type="button"
                      onClick={handlePreCheck}
                      className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      <Printer size={15} />
                      Pré-addition
                    </button>
                  )}
                  {canCheckout && (
                    <button
                      type="button"
                      onClick={openPayment}
                      className="flex-1 py-3 rounded-2xl text-white text-sm font-black tracking-wide transition-all hover:opacity-90"
                      style={{ backgroundColor: '#F97316', boxShadow: '0 4px 16px rgba(249,115,22,0.35)' }}
                    >
                      Encaisser
                    </button>
                  )}
                </div>
              )}
            </div>

          ) : (
            /* ── Empty state ── */
            <div className="flex flex-col items-center justify-center gap-5 text-center w-full">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center bg-gray-100">
                <ShoppingCart size={36} className="text-gray-300" />
              </div>
              <div>
                <p className="text-base font-bold text-gray-600">
                  {selectedTableId ? 'Aucune commande active' : 'Sélectionnez une table'}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  {selectedTableId
                    ? 'La commande a peut-être déjà été encaissée.'
                    : 'Cliquez sur une table dans la liste pour voir sa commande.'}
                </p>
              </div>
              {canCreateOrder && (
                <button
                  type="button"
                  onClick={() => setShowNewOrder(true)}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl text-white font-bold text-sm hover:opacity-90 transition-all"
                  style={{ backgroundColor: '#F97316', boxShadow: '0 4px 16px rgba(249,115,22,0.3)' }}
                >
                  <Plus size={16} />
                  Nouvelle commande
                </button>
              )}
            </div>
          )}
      </div>

      {/* Payment modal */}
      {showPayment && paymentOrder && (
        <PaymentModal
          order={paymentOrder}
          lang={lang}
          onClose={() => { setShowPayment(false); setPaymentOrder(null); }}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* New order drawer */}
      {showNewOrder && (
        <NewOrderDrawer
          table={selectedTable || null}
          lang={lang}
          onClose={() => setShowNewOrder(false)}
          onOrderCreated={() => {
            setShowNewOrder(false);
            qc.invalidateQueries({ queryKey: ['pos-active-tables'] });
            qc.invalidateQueries({ queryKey: ['pos-live-orders'] });
            qc.invalidateQueries({ queryKey: ['pos-order', selectedTableId] });
          }}
        />
      )}
    </div>
  );
}
