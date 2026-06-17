import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Plus, KeyRound, UserX, Loader2, Shield, User, Copy, CheckCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../lib/utils';

function TempPasswordModal({ name, tempPassword, email, username, onClose }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(tempPassword).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
            <CheckCheck size={20} className="text-green-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Compte créé !</h3>
            <p className="text-xs text-gray-400">{name}</p>
          </div>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Email</span>
            <span className="font-medium text-gray-800">{email}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Nom d'utilisateur</span>
            <span className="font-medium text-gray-800">{username}</span>
          </div>
          <div className="border-t border-gray-200 pt-2 mt-2">
            <p className="text-xs text-gray-500 mb-1.5">Mot de passe temporaire</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono font-bold text-orange-600 tracking-widest">
                {tempPassword}
              </code>
              <button
                type="button"
                onClick={copy}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                title="Copier"
              >
                {copied ? <CheckCheck size={15} className="text-green-500" /> : <Copy size={15} className="text-gray-500" />}
              </button>
            </div>
          </div>
        </div>
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
          Transmettez ce mot de passe à l'employé. Il devra le changer à la première connexion.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}

const ROLES = [
  { value: 'MANAGER',  label: 'Manager',  color: 'bg-purple-100 text-purple-700' },
  { value: 'STAFF',    label: 'Staff',    color: 'bg-blue-100 text-blue-700'    },
  { value: 'CASHIER',  label: 'Caissier', color: 'bg-teal-100 text-teal-700'    },
];

function roleColor(role) {
  return ROLES.find((r) => r.value === role)?.color || 'bg-gray-100 text-gray-600';
}
function roleLabel(role) {
  return ROLES.find((r) => r.value === role)?.label || role;
}

function NewMemberModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', username: '', email: '', role: 'STAFF' });
  const qc = useQueryClient();
  const { user } = useAuthStore();

  const createMutation = useMutation({
    mutationFn: (data) => api.post('/staff', data).then((r) => r.data.data),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['staff', user.restaurant_id] });
      onCreated({ ...data, name: form.name, email: form.email, username: form.username });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Erreur lors de la création'),
  });

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.username || !form.email) return;
    createMutation.mutate(form);
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h3 className="text-base font-bold text-gray-900 mb-5">Nouveau membre du staff</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Nom *</label>
              <input
                autoFocus
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Nom d'utilisateur *</label>
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Rôle</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none"
            >
              {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <p className="text-xs text-gray-400">
            Un mot de passe temporaire sera généré. L'employé devra le changer à la première connexion.
          </p>
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || !form.name || !form.username || !form.email}
              className="flex-1 px-4 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {createMutation.isPending && <Loader2 size={14} className="animate-spin" />}
              Créer le compte
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function StaffPage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const restaurantId = user?.restaurant_id;
  const isOwner = user?.role === 'OWNER';
  const qc = useQueryClient();

  const [showNew, setShowNew] = useState(false);
  const [resetTarget, setResetTarget] = useState(null);
  const [createdMember, setCreatedMember] = useState(null); // { name, email, username, temp_password }

  const { data, isLoading } = useQuery({
    queryKey: ['staff', restaurantId],
    queryFn: () => api.get('/staff').then((r) => r.data.data),
    enabled: !!restaurantId,
  });

  const resetMutation = useMutation({
    mutationFn: (id) => api.post(`/staff/${id}/reset-password`).then((r) => r.data.data),
    onSuccess: (data) => {
      setCreatedMember({
        name: resetTarget?.name || '',
        email: resetTarget?.email || '',
        username: resetTarget?.username || '',
        temp_password: data.temp_password,
      });
      setResetTarget(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Erreur'),
  });

  const disableMutation = useMutation({
    mutationFn: (id) => api.delete(`/staff/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['staff', restaurantId] });
      toast.success('Compte désactivé');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Erreur'),
  });

  const members = data || [];
  const active = members.filter((m) => m.is_active);
  const inactive = members.filter((m) => !m.is_active);

  function formatDate(iso) {
    if (!iso) return 'Jamais';
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function MemberRow({ member }) {
    return (
      <div className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
        <div className={cn(
          'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm',
          member.is_active ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400'
        )}>
          {member.name[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-gray-900 text-sm">{member.name}</span>
            <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', roleColor(member.role))}>
              {roleLabel(member.role)}
            </span>
            {member.is_first_login && !member.last_login_at && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                Jamais connecté
              </span>
            )}
            {member.is_first_login && member.last_login_at && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                Mdp à changer
              </span>
            )}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">
            @{member.username} · {member.email}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">
            Dernière connexion : {formatDate(member.last_login_at)}
          </div>
        </div>
        {isOwner && member.is_active && (
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setResetTarget(member)}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
              title="Réinitialiser le mot de passe"
            >
              <KeyRound size={14} />
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Désactiver ${member.name} ?`)) disableMutation.mutate(member.id);
              }}
              disabled={disableMutation.isPending}
              className="p-1.5 rounded-lg border border-red-100 text-red-400 hover:bg-red-50 disabled:opacity-50"
              title="Désactiver"
            >
              <UserX size={14} />
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-gray-900">{t('dashboard.nav.staff')}</h1>
          <span className="text-xs text-gray-400">{active.length} actif{active.length !== 1 ? 's' : ''}</span>
        </div>
        {isOwner && (
          <button
            type="button"
            onClick={() => setShowNew(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600"
          >
            <Plus size={15} /> Nouveau membre
          </button>
        )}
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 size={28} className="animate-spin text-orange-500" />
          </div>
        ) : (
          <>
            {/* Active */}
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-1">
                Membres actifs
                <span className="ml-2 text-gray-400 font-normal">({active.length})</span>
              </h2>
              {active.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-gray-400 gap-2">
                  <Shield size={28} />
                  <p className="text-sm">Aucun membre du staff.</p>
                  {isOwner && (
                    <button
                      type="button"
                      onClick={() => setShowNew(true)}
                      className="mt-2 px-4 py-2 rounded-xl bg-orange-50 text-orange-600 text-sm font-medium hover:bg-orange-100"
                    >
                      + Ajouter un membre
                    </button>
                  )}
                </div>
              ) : (
                <div>
                  {active.map((m) => <MemberRow key={m.id} member={m} />)}
                </div>
              )}
            </section>

            {/* Inactive */}
            {inactive.length > 0 && (
              <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="text-sm font-semibold text-gray-400 mb-1">
                  Désactivés
                  <span className="ml-2 font-normal">({inactive.length})</span>
                </h2>
                <div>
                  {inactive.map((m) => <MemberRow key={m.id} member={m} />)}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      {showNew && (
        <NewMemberModal
          onClose={() => setShowNew(false)}
          onCreated={(member) => { setShowNew(false); setCreatedMember(member); }}
        />
      )}
      {createdMember && (
        <TempPasswordModal
          name={createdMember.name}
          tempPassword={createdMember.temp_password}
          email={createdMember.email}
          username={createdMember.username}
          onClose={() => setCreatedMember(null)}
        />
      )}}

      {resetTarget && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-base font-bold text-gray-900 mb-2">
              Réinitialiser le mot de passe de {resetTarget.name} ?
            </h3>
            <p className="text-sm text-gray-500 mb-5">
              Un nouveau mot de passe temporaire sera généré et l'employé devra le changer à la prochaine connexion.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setResetTarget(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => resetMutation.mutate(resetTarget.id)}
                disabled={resetMutation.isPending}
                className="flex-1 px-4 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {resetMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                Réinitialiser
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
