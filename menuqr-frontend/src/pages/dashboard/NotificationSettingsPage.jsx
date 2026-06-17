import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, BellOff, Loader2, Check } from 'lucide-react';
import api from '../../api/axios';

function Toggle({ label, description, checked, onChange, disabled }) {
  return (
    <label className="flex items-start gap-4 cursor-pointer group">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-800">{label}</div>
        {description && <div className="text-xs text-gray-400 mt-0.5">{description}</div>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative shrink-0 w-10 h-5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-1
          ${checked ? 'bg-orange-500' : 'bg-gray-200'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform
            ${checked ? 'translate-x-5' : 'translate-x-0'}`}
        />
      </button>
    </label>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export default function NotificationSettingsPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [form, setForm] = useState(null);
  const [saved, setSaved] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['notification-settings'],
    queryFn: () => api.get('/notifications/settings').then((r) => r.data.data),
  });

  useEffect(() => {
    if (data && !form) setForm({ ...data });
  }, [data]);

  const mutation = useMutation({
    mutationFn: (updates) => api.put('/notifications/settings', updates).then((r) => r.data.data),
    onSuccess: (updated) => {
      setForm({ ...updated });
      qc.invalidateQueries({ queryKey: ['notification-settings'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
  });

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  if (isLoading || !form) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={28} className="animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Bell size={22} className="text-orange-500" />
          Paramètres Notifications
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">Configurez vos alertes sonores et email</p>
      </div>

      <Section title="Sons">
        <Toggle
          label="Son — Nouvelle commande"
          description="Émet un son à chaque nouvelle commande reçue"
          checked={form.sound_new_order}
          onChange={(v) => set('sound_new_order', v)}
        />
        <Toggle
          label="Son — Appel serveur"
          description="Alerte sonore quand un client appelle le serveur"
          checked={form.sound_call_waiter}
          onChange={(v) => set('sound_call_waiter', v)}
        />
        <Toggle
          label="Son — Nouvelle réservation"
          description="Alerte sonore quand un client effectue une réservation en ligne"
          checked={form.sound_reservation ?? true}
          onChange={(v) => set('sound_reservation', v)}
        />
      </Section>

      <Section title="Emails">
        <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-700 mb-2">
          <BellOff size={13} className="shrink-0" />
          Les emails seront envoyés à l'adresse email enregistrée du restaurant
        </div>
        <Toggle
          label="Email — Nouvelle commande"
          description="Recevez un email à chaque nouvelle commande"
          checked={form.email_new_order}
          onChange={(v) => set('email_new_order', v)}
        />
        <Toggle
          label="Email — Nouvelle réservation"
          description="Recevez un email pour chaque réservation confirmée"
          checked={form.email_reservation}
          onChange={(v) => set('email_reservation', v)}
        />
        <Toggle
          label="Email — Appel serveur"
          description="Recevez un email quand un client appelle le serveur"
          checked={form.email_call_waiter}
          onChange={(v) => set('email_call_waiter', v)}
        />
      </Section>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => mutation.mutate(form)}
          disabled={mutation.isPending}
          className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-medium hover:bg-orange-600 disabled:opacity-50 transition-colors"
        >
          {mutation.isPending ? <Loader2 size={15} className="animate-spin" /> : null}
          Enregistrer
        </button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
            <Check size={15} />
            Paramètres sauvegardés
          </span>
        )}
      </div>
    </div>
  );
}
