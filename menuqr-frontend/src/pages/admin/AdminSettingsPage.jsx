import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, User, Lock, CreditCard, Save, Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { cn } from '../../lib/utils';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(v) {
  return new Intl.NumberFormat('fr-TN', { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(Number(v) || 0);
}

const PLAN_META = {
  FREE:    { color: 'bg-gray-100 text-gray-700',    ring: 'ring-gray-200',   dot: 'bg-gray-400' },
  STARTER: { color: 'bg-blue-100 text-blue-700',    ring: 'ring-blue-200',   dot: 'bg-blue-500' },
  PRO:     { color: 'bg-orange-100 text-orange-600', ring: 'ring-orange-300', dot: 'bg-orange-500' },
  PREMIUM: { color: 'bg-amber-100 text-amber-700',  ring: 'ring-amber-300',  dot: 'bg-amber-500' },
};

const PLAN_EXTRA_FEATURES = {
  FREE:    ['QR Code', 'Menu digital'],
  STARTER: ['Call Waiter', 'Notifications email', 'Sous-domaine'],
  PRO:     ['Réservations', 'Analytics', 'Export CSV', 'Notifications SMS'],
  PREMIUM: ['POS Caisse', 'Clôture service', 'Support prioritaire', 'Toutes fonctionnalités'],
};

function buildPlanFeatures(plan) {
  const lines = [];
  if (plan.max_menus === 0)  lines.push('Menus illimités');
  else lines.push(`${plan.max_menus} menu${plan.max_menus > 1 ? 's' : ''}`);

  if (plan.max_tables === 0) lines.push('Tables illimitées');
  else lines.push(`${plan.max_tables} tables max`);

  if (plan.max_staff === 0)  lines.push('Staff illimité');
  else lines.push(`${plan.max_staff} compte${plan.max_staff > 1 ? 's' : ''} staff`);

  (PLAN_EXTRA_FEATURES[plan.name] || []).forEach((f) => lines.push(f));
  return lines;
}

// ─── Input ─────────────────────────────────────────────────────────────────────

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        'w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white',
        className
      )}
      {...props}
    />
  );
}

// ─── Tab: Profil ──────────────────────────────────────────────────────────────

function ProfileTab() {
  const qc = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['admin-profile'],
    queryFn: () => api.get('/admin/profile').then((r) => r.data.data),
  });

  const [form, setForm] = useState(null);

  if (!isLoading && profile && !form) {
    setForm({ name: profile.name || '', email: profile.email || '' });
  }

  const mutation = useMutation({
    mutationFn: (data) => api.put('/admin/profile', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-profile'] });
      toast.success('Profil mis à jour');
    },
    onError: (err) => {
      const msg = err?.response?.data?.message;
      if (msg === 'email_taken') toast.error('Cet email est déjà utilisé');
      else toast.error('Erreur lors de la mise à jour');
    },
  });

  if (isLoading || !form) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 size={24} className="animate-spin text-orange-400" />
      </div>
    );
  }

  return (
    <div className="max-w-lg space-y-5">
      <div className="bg-orange-50 rounded-2xl p-4 flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-orange-200 flex items-center justify-center text-orange-700 font-bold text-lg">
          {(form.name || 'A')[0].toUpperCase()}
        </div>
        <div>
          <div className="font-semibold text-gray-900">{profile.name}</div>
          <div className="text-xs text-gray-500">{profile.email}</div>
          <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs font-bold">
            SUPER ADMIN
          </span>
        </div>
      </div>

      <Field label="Nom complet">
        <Input
          type="text"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="Votre nom"
        />
      </Field>

      <Field label="Adresse email">
        <Input
          type="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          placeholder="email@example.com"
        />
      </Field>

      <Field label="Rôle">
        <Input type="text" value="Super Administrateur" disabled className="bg-gray-50 text-gray-400 cursor-not-allowed" />
      </Field>

      {profile.last_login_at && (
        <p className="text-xs text-gray-400">
          Dernière connexion : {new Date(profile.last_login_at).toLocaleString('fr-FR')}
        </p>
      )}

      <button
        type="button"
        onClick={() => mutation.mutate(form)}
        disabled={mutation.isPending || !form.name.trim()}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 disabled:opacity-60 transition-colors"
      >
        {mutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
        Enregistrer le profil
      </button>
    </div>
  );
}

// ─── Tab: Sécurité ────────────────────────────────────────────────────────────

function SecurityTab() {
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [show, setShow] = useState({ current: false, new: false, confirm: false });

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }
  function toggle(k) { setShow((s) => ({ ...s, [k]: !s[k] })); }

  const checks = [
    { label: '8 caractères minimum', ok: form.new_password.length >= 8 },
    { label: '1 majuscule',          ok: /[A-Z]/.test(form.new_password) },
    { label: '1 chiffre',            ok: /[0-9]/.test(form.new_password) },
    { label: 'Mots de passe identiques', ok: form.new_password === form.confirm_password && form.confirm_password.length > 0 },
  ];

  const mutation = useMutation({
    mutationFn: (data) => api.put('/admin/profile/password', data),
    onSuccess: () => {
      setForm({ current_password: '', new_password: '', confirm_password: '' });
      toast.success('Mot de passe modifié avec succès');
    },
    onError: (err) => {
      const msg = err?.response?.data?.message;
      if (msg === 'current_password_wrong') toast.error('Mot de passe actuel incorrect');
      else if (msg === 'passwords_mismatch') toast.error('Les mots de passe ne correspondent pas');
      else if (msg === 'password_too_weak') toast.error('Mot de passe trop faible');
      else toast.error('Erreur lors du changement');
    },
  });

  const canSubmit = checks.every((c) => c.ok) && form.current_password.length >= 1;

  function PasswordInput({ field, showKey, placeholder }) {
    return (
      <div className="relative">
        <Input
          type={show[showKey] ? 'text' : 'password'}
          value={form[field]}
          onChange={(e) => set(field, e.target.value)}
          placeholder={placeholder}
          className="pr-10"
        />
        <button
          type="button"
          onClick={() => toggle(showKey)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {show[showKey] ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg space-y-5">
      <Field label="Mot de passe actuel">
        <PasswordInput field="current_password" showKey="current" placeholder="••••••••" />
      </Field>

      <Field label="Nouveau mot de passe">
        <PasswordInput field="new_password" showKey="new" placeholder="Minimum 8 caractères" />
      </Field>

      <Field label="Confirmer le nouveau mot de passe">
        <PasswordInput field="confirm_password" showKey="confirm" placeholder="Répétez le mot de passe" />
      </Field>

      {/* Strength indicators */}
      {form.new_password && (
        <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">
          {checks.map((c) => (
            <div key={c.label} className="flex items-center gap-2 text-xs">
              <CheckCircle2 size={13} className={c.ok ? 'text-green-500' : 'text-gray-300'} />
              <span className={c.ok ? 'text-green-700' : 'text-gray-400'}>{c.label}</span>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => mutation.mutate(form)}
        disabled={mutation.isPending || !canSubmit}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 disabled:opacity-60 transition-colors"
      >
        {mutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
        Changer le mot de passe
      </button>
    </div>
  );
}

// ─── Tab: Plans & Tarifs ──────────────────────────────────────────────────────

function PlansTab() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({});

  const { data: plans, isLoading } = useQuery({
    queryKey: ['admin-plans'],
    queryFn: () => api.get('/admin/plans').then((r) => r.data.data),
  });

  const mutation = useMutation({
    mutationFn: ({ name, data }) => api.put(`/admin/plans/${name}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-plans'] });
      toast.success('Plan mis à jour');
      setEditing(null);
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  });

  function startEdit(plan) {
    setEditing(plan.name);
    setEditForm({
      price_monthly: plan.price_monthly,
      price_annual:  plan.price_annual,
      max_menus:     plan.max_menus,
      max_tables:    plan.max_tables,
      max_staff:     plan.max_staff,
    });
  }

  const ORDER = ['FREE', 'STARTER', 'PRO', 'PREMIUM'];
  const sorted = plans ? [...plans].sort((a, b) => ORDER.indexOf(a.name) - ORDER.indexOf(b.name)) : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 size={24} className="animate-spin text-orange-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Configurez les tarifs et limites de chaque plan. <span className="text-gray-400">0 = illimité pour max_menus, max_tables, max_staff.</span>
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sorted.map((plan) => {
          const meta = PLAN_META[plan.name] || PLAN_META.FREE;
          const isEdit = editing === plan.name;

          return (
            <div key={plan.name} className={cn('bg-white rounded-2xl border shadow-sm p-5 ring-2', meta.ring)}>
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <span className={cn('px-3 py-1 rounded-full text-sm font-bold', meta.color)}>
                  {plan.name}
                </span>
                {!isEdit ? (
                  <button
                    type="button"
                    onClick={() => startEdit(plan)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium"
                  >
                    Modifier
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditing(null)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      onClick={() => mutation.mutate({ name: plan.name, data: editForm })}
                      disabled={mutation.isPending}
                      className="text-xs px-3 py-1.5 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600 disabled:opacity-60 flex items-center gap-1"
                    >
                      {mutation.isPending && editing === plan.name
                        ? <Loader2 size={11} className="animate-spin" />
                        : <Save size={11} />}
                      Sauvegarder
                    </button>
                  </div>
                )}
              </div>

              {/* Features list */}
              <ul className="space-y-1 mb-4">
                {buildPlanFeatures(plan).map((f) => (
                  <li key={f} className="flex items-center gap-1.5 text-xs text-gray-600">
                    <div className={cn('w-1.5 h-1.5 rounded-full shrink-0', meta.dot)} />
                    {f}
                  </li>
                ))}
              </ul>

              {/* Pricing & limits */}
              {isEdit ? (
                <div className="space-y-3 border-t border-gray-100 pt-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Prix mensuel (DT)</label>
                      <Input
                        type="number"
                        step="0.001"
                        min="0"
                        value={editForm.price_monthly}
                        onChange={(e) => setEditForm((f) => ({ ...f, price_monthly: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Prix annuel (DT)</label>
                      <Input
                        type="number"
                        step="0.001"
                        min="0"
                        value={editForm.price_annual}
                        onChange={(e) => setEditForm((f) => ({ ...f, price_annual: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Max menus</label>
                      <Input
                        type="number"
                        min="0"
                        value={editForm.max_menus}
                        onChange={(e) => setEditForm((f) => ({ ...f, max_menus: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Max tables</label>
                      <Input
                        type="number"
                        min="0"
                        value={editForm.max_tables}
                        onChange={(e) => setEditForm((f) => ({ ...f, max_tables: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Max staff</label>
                      <Input
                        type="number"
                        min="0"
                        value={editForm.max_staff}
                        onChange={(e) => setEditForm((f) => ({ ...f, max_staff: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border-t border-gray-100 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Mensuel</span>
                    <span className="font-bold text-gray-900">{fmt(plan.price_monthly)} DT</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Annuel</span>
                    <span className="font-bold text-gray-900">{fmt(plan.price_annual)} DT</span>
                  </div>
                  <div className="flex gap-4 text-xs text-gray-400 pt-1">
                    <span>{plan.max_menus === 0 ? '∞' : plan.max_menus} menus</span>
                    <span>{plan.max_tables === 0 ? '∞' : plan.max_tables} tables</span>
                    <span>{plan.max_staff === 0 ? '∞' : plan.max_staff} staff</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'profile',  label: 'Mon profil',     icon: User },
  { key: 'security', label: 'Sécurité',        icon: Lock },
  { key: 'plans',    label: 'Plans & Tarifs',  icon: CreditCard },
];

export default function AdminSettingsPage() {
  const [tab, setTab] = useState('profile');

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-orange-50 rounded-xl">
          <Settings size={20} className="text-orange-500" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Paramètres</h1>
          <p className="text-sm text-gray-500">Gestion du profil, sécurité et tarification des plans</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              tab === key
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {tab === 'profile'  && <ProfileTab />}
        {tab === 'security' && <SecurityTab />}
        {tab === 'plans'    && <PlansTab />}
      </div>
    </div>
  );
}
