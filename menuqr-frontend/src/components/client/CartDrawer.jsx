import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Minus, Plus, Trash2, Loader2, ShoppingBag } from 'lucide-react';
import api from '../../api/axios';
import useCart from '../../hooks/useCart';
import { formatDT } from '../../utils/currency';

export default function CartDrawer({ slug, tableId, open, setOpen }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const lang = ['fr', 'en', 'it', 'ar'].includes(i18n.language) ? i18n.language : 'fr';
  const isRTL = lang === 'ar';

  const { items, removeFromCart, updateQuantity, clearCart } = useCart();
  const [globalNote, setGlobalNote] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(null);

  const orderMutation = useMutation({
    mutationFn: () =>
      api.post(`/public/${slug}/orders`, {
        table_id: tableId || null,
        notes: globalNote.trim() || null,
        items: items.map((line) => ({
          menu_item_id: line.item.id,
          quantity: line.quantity,
          variant_id: line.variant?.id || null,
          notes: line.note || null,
          supplements: line.supplements || [],
        })),
      }).then((r) => r.data.data),
    onSuccess: (data) => {
      clearCart();
      setOrderSuccess(data.id);
      if (tableId) localStorage.setItem(`menuqr_order_${slug}_${tableId}`, data.id);
    },
  });

  // Success screen
  if (orderSuccess) {
    return (
      <>
        <div className="fixed inset-0 bg-black/60 z-50" onClick={() => navigate(`/${slug}/order/${orderSuccess}`)} />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="w-full max-w-sm rounded-2xl shadow-2xl p-8 text-center"
            style={{ backgroundColor: 'var(--bg-primary, white)' }}
          >
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary, #111)' }}>
              {t('cart.order_success')}
            </h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary, #6b7280)' }}>
              {t('cart.order_preparing')}
            </p>
            <button
              type="button"
              onClick={() => navigate(`/${slug}/order/${orderSuccess}`)}
              className="w-full py-3 rounded-2xl text-white font-bold text-sm"
              style={{ backgroundColor: 'var(--accent, #6c47ff)' }}
            >
              {t('cart.track_order')}
            </button>
          </div>
        </div>
      </>
    );
  }

  const cartCount = items.reduce((acc, i) => acc + i.quantity, 0);
  const cartTotal = items.reduce((acc, line) => acc + (line.unitTotal || 0) * line.quantity, 0);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setOpen(false)} />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div
          className="relative w-full max-w-md max-h-[90dvh] flex flex-col rounded-3xl shadow-2xl overflow-hidden"
          style={{ backgroundColor: '#f5f5f5' }}
        >
          {/* ── Header ── */}
          <div className="flex items-center justify-between px-5 pt-5 pb-4 shrink-0"
            style={{ backgroundColor: '#f5f5f5' }}
          >
            {/* Back / close */}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={18} />
            </button>

            <h2 className="text-base font-bold text-gray-900">
              {t('cart.title')} ({cartCount})
            </h2>

            {/* Clear all */}
            <button
              type="button"
              onClick={clearCart}
              disabled={items.length === 0}
              className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors disabled:opacity-30"
            >
              <Trash2 size={16} />
            </button>
          </div>

          {/* ── Items list ── */}
          <div className="flex-1 overflow-y-auto px-4 space-y-3 pb-3">
            {items.map((line) => {
              const name = line.item[`name_${lang}`] || line.item.name_fr;
              const lineTotal = (line.unitTotal || 0) * line.quantity;
              const variantLabel = line.variant?.label || null;
              const supps = (line.supplements || []).map((s) => s.name).join(', ');

              return (
                <div
                  key={line.id}
                  className="flex items-center gap-3 bg-white rounded-2xl p-3 shadow-sm"
                >
                  {/* Image */}
                  {line.item.image_url ? (
                    <img
                      src={line.item.image_url}
                      alt={name}
                      className="w-16 h-16 rounded-xl object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl shrink-0 flex items-center justify-center"
                      style={{ backgroundColor: 'var(--accent-light, #ede9fe)' }}
                    >
                      <ShoppingBag size={22} style={{ color: 'var(--accent, #6c47ff)' }} />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{name}</p>
                    {variantLabel && (
                      <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--accent, #6c47ff)' }}>
                        {variantLabel}
                      </p>
                    )}
                    {supps && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{supps}</p>
                    )}
                    {line.note && (
                      <p className="text-xs italic text-gray-400 mt-0.5 truncate">{line.note}</p>
                    )}
                    <p className="text-sm font-bold mt-1" style={{ color: 'var(--accent, #6c47ff)' }}>
                      {formatDT(lineTotal, lang)}
                    </p>
                  </div>

                  {/* Right column: remove + qty */}
                  <div className="flex flex-col items-center gap-2 shrink-0">
                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => removeFromCart(line.id)}
                      className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>

                    {/* Quantity stepper */}
                    <div className="flex items-center gap-1.5 bg-gray-100 rounded-full px-2 py-1">
                      <button
                        type="button"
                        onClick={() => updateQuantity(line.id, line.quantity - 1)}
                        className="w-5 h-5 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-50"
                      >
                        <Minus size={10} />
                      </button>
                      <span className="text-xs font-bold text-gray-900 w-4 text-center">
                        {line.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(line.id, line.quantity + 1)}
                        className="w-5 h-5 rounded-full flex items-center justify-center text-white"
                        style={{ backgroundColor: 'var(--accent, #6c47ff)' }}
                      >
                        <Plus size={10} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* ── Note pour la commande ── */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                {t('cart.order_note', { defaultValue: 'Note pour la commande' })}
              </label>
              <textarea
                value={globalNote}
                onChange={(e) => setGlobalNote(e.target.value)}
                placeholder={t('cart.note_placeholder', { defaultValue: 'Allergie, préparation spéciale...' })}
                rows={3}
                className="w-full px-3 py-2.5 text-sm rounded-xl border resize-none focus:outline-none focus:ring-2 transition-all"
                style={{
                  borderColor: 'var(--card-border, #e5e7eb)',
                  backgroundColor: '#fafafa',
                  color: 'var(--text-primary, #111)',
                  '--tw-ring-color': 'var(--accent, #6c47ff)',
                }}
              />
            </div>
          </div>

          {/* ── Footer ── */}
          <div
            className="shrink-0 px-4 pt-3 pb-5 space-y-3"
            style={{ backgroundColor: '#f5f5f5' }}
          >
            {/* Subtotal row */}
            <div className="flex items-center justify-between px-1">
              <span className="text-sm font-medium text-gray-500">
                {t('common.total', { defaultValue: 'Sous-total' })}
              </span>
              <span className="text-xl font-extrabold" style={{ color: 'var(--accent, #6c47ff)' }}>
                {formatDT(cartTotal, lang)}
              </span>
            </div>

            {orderMutation.isError && (
              <p className="text-xs text-red-500 text-center">{t('errors.generic')}</p>
            )}

            {!tableId ? (
              /* No QR scan yet */
              <div className="flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-dashed text-sm font-medium"
                style={{ borderColor: 'var(--card-border, #d1d5db)', color: '#9ca3af' }}>
                <span>📷</span> Scannez le QR code pour commander
              </div>
            ) : (
              /* Action buttons */
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 py-3.5 rounded-2xl border-2 text-sm font-bold transition-colors hover:bg-gray-50"
                  style={{
                    borderColor: 'var(--accent, #6c47ff)',
                    color: 'var(--accent, #6c47ff)',
                  }}
                >
                  {t('cart.add_more', { defaultValue: 'Ajouter' })}
                </button>
                <button
                  type="button"
                  onClick={() => orderMutation.mutate()}
                  disabled={orderMutation.isPending || items.length === 0}
                  className="flex-1 py-3.5 rounded-2xl text-white text-sm font-bold flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-60"
                  style={{ backgroundColor: 'var(--accent, #6c47ff)' }}
                >
                  {orderMutation.isPending && <Loader2 size={15} className="animate-spin" />}
                  {t('cart.order_now')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
