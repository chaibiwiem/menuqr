import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Bell, X, Loader2 } from 'lucide-react';
import api from '../../api/axios';

const TYPES = [
  { key: 'WAITER', icon: '🔔', labelKey: 'client.call_waiter' },
  { key: 'CHECK', icon: '🧾', labelKey: 'client.call_check' },
  { key: 'OTHER', icon: '💬', labelKey: 'client.call_other' },
];

const COOLDOWN_SEC = 30;

// open + onClose are controlled from the parent (header icon triggers opening)
export default function CallWaiterButton({ slug, tableId, open, onClose, onSuccess }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const [selectedType, setSelectedType] = useState('WAITER');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const isRTL = lang === 'ar';

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) { clearInterval(timer); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const callMutation = useMutation({
    mutationFn: () =>
      api.post(`/public/${slug}/call-waiter`, {
        table_id: tableId,
        type: selectedType,
        message: selectedType === 'OTHER' ? message.trim() || null : null,
      }),
    onSuccess: () => {
      setSuccess(true);
      onClose?.();
      onSuccess?.();   // notify parent to start header cooldown display
      setCooldown(COOLDOWN_SEC);
      setTimeout(() => setSuccess(false), 5000);
    },
  });

  if (!tableId) return null;

  return (
    <>
      {/* Success toast */}
      {success && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-green-600 text-white text-sm font-semibold shadow-lg">
          ✓ {t('client.call_sent')}
        </div>
      )}

      {/* Bottom sheet */}
      {open && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
          <div
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl p-5"
            style={{ backgroundColor: 'var(--bg-primary, white)' }}
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            {/* Handle */}
            <div className="flex justify-center mb-4">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold" style={{ color: 'var(--text-primary, #111)' }}>
                {t('client.call_waiter_title')}
              </h2>
              <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>

            {/* Type options */}
            <div className="space-y-2 mb-4">
              {TYPES.map((type) => (
                <button
                  key={type.key}
                  type="button"
                  onClick={() => setSelectedType(type.key)}
                  className="w-full flex items-center gap-3 p-3.5 rounded-2xl border text-start transition-colors"
                  style={
                    selectedType === type.key
                      ? { borderColor: 'var(--accent, #6c47ff)', backgroundColor: 'rgba(108,71,255,0.06)' }
                      : { borderColor: 'var(--card-border, #e5e7eb)', backgroundColor: 'var(--card-bg, white)' }
                  }
                >
                  <span className="text-xl">{type.icon}</span>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary, #111)' }}>
                    {t(type.labelKey)}
                  </span>
                </button>
              ))}
            </div>

            {/* Message for OTHER */}
            {selectedType === 'OTHER' && (
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t('client.call_message_placeholder')}
                rows={3}
                className="w-full px-3 py-2.5 text-sm rounded-xl border resize-none focus:outline-none mb-4"
                style={{
                  borderColor: 'var(--card-border, #e5e7eb)',
                  backgroundColor: 'var(--card-bg, white)',
                  color: 'var(--text-primary, #111)',
                }}
              />
            )}

            {callMutation.isError && (
              <p className="text-xs text-red-500 text-center mb-2">
                {callMutation.error?.response?.data?.message === 'call_already_pending'
                  ? t('client.call_already_pending')
                  : t('errors.generic')}
              </p>
            )}

            <button
              type="button"
              onClick={() => callMutation.mutate()}
              disabled={callMutation.isPending}
              className="w-full py-3.5 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: 'var(--accent, #6c47ff)' }}
            >
              {callMutation.isPending && <Loader2 size={15} className="animate-spin" />}
              {t('client.call_confirm')}
            </button>
          </div>
        </>
      )}
    </>
  );
}
