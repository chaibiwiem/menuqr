import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import {
  ChevronLeft, Save, ToggleLeft, ToggleRight, Trash2,
  KeyRound, Loader2, ExternalLink, User, Shield, Eye, EyeOff, X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { cn } from '../../lib/utils';
import PlanSelector from '../../components/admin/PlanSelector';
import TemplateGallery from '../../components/admin/TemplateGallery';
import ImageUploader from '../../components/admin/ImageUploader';

const TYPES = ['Restaurant', 'Café', 'Bar', 'Hôtel', 'Fast-food', 'Autre'];
const DAYS_FR = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const TABS = [
  { key: 'info',   label: 'Informations' },
  { key: 'visual', label: 'Visuel & Plan' },
  { key: 'team',   label: 'Équipe' },
];

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

const PLAN_BADGE = {
  FREE:    'bg-gray-100 text-gray-600',
  STARTER: 'bg-blue-100 text-blue-700',
  PRO:     'bg-purple-100 text-purple-700',
  PREMIUM: 'bg-amber-100 text-amber-700',
};

export default function RestaurantDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [tab, setTab] = useState('info');
  const [logo, setLogo] = useState(null);
  const [banner, setBanner] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [changePwdTarget, setChangePwdTarget] = useState(null); // { id, name }
  const [pwdForm, setPwdForm] = useState({ new_password: '', confirm_password: '' });
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [pwdError, setPwdError] = useState('');

  // ─── Fetch ────────────────────────────────────────────────────────────────────
  const { data: restaurant, isLoading } = useQuery({
    queryKey: ['admin-restaurant', id],
    queryFn: () => api.get(`/admin/restaurants/${id}`).then((r) => r.data.data),
    onError: () => navigate('/admin/restaurants'),
  });

  // Sync logo/banner previews from DB (only when no user-selected file exists)
  useEffect(() => {
    if (!restaurant) return;
    setLogo((prev) => prev?.file ? prev : (restaurant.logo_url   ? { file: null, preview: restaurant.logo_url   } : null));
    setBanner((prev) => prev?.file ? prev : (restaurant.banner_url ? { file: null, preview: restaurant.banner_url } : null));
  }, [restaurant?.logo_url, restaurant?.banner_url]);

  // ─── Forms ───────────────────────────────────────────────────────────────────
  const {
    register: regInfo,
    handleSubmit: hsInfo,
    formState: { errors: errInfo, isDirty: infoDirty },
    reset: resetInfo,
  } = useForm({ values: restaurant ? {
    name: restaurant.name || '',
    type: restaurant.type || 'Restaurant',
    email: restaurant.email || '',
    phone: restaurant.phone || '',
    address: restaurant.address || '',
    short_description: restaurant.short_description || '',
    social_facebook: restaurant.social_facebook || '',
    social_instagram: restaurant.social_instagram || '',
    social_website: restaurant.social_website || '',
    social_whatsapp: restaurant.social_whatsapp || '',
    social_tripadvisor: restaurant.social_tripadvisor || '',
    social_google_maps: restaurant.social_google_maps || '',
  } : {} });

  const {
    control: controlVisual,
    handleSubmit: hsVisual,
    formState: { isDirty: visualDirty },
  } = useForm({ values: restaurant ? { template_id: restaurant.template_id, plan: restaurant.plan } : {} });

  // ─── Mutations ────────────────────────────────────────────────────────────────
  const updateInfoMutation = useMutation({
    mutationFn: (data) => {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => v !== undefined && fd.append(k, v || ''));
      return api.put(`/admin/restaurants/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-restaurant', id] });
      qc.invalidateQueries({ queryKey: ['admin-restaurants'] });
      toast.success('Informations mises à jour');
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  });

  const updateVisualMutation = useMutation({
    mutationFn: (data) => {
      const fd = new FormData();
      fd.append('template_id', data.template_id);
      fd.append('plan', data.plan);
      if (logo?.file) fd.append('logo', logo.file);
      if (banner?.file) fd.append('banner', banner.file);
      return api.put(`/admin/restaurants/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-restaurant', id] });
      qc.invalidateQueries({ queryKey: ['admin-restaurants'] });
      setLogo(null);
      setBanner(null);
      toast.success('Visuel mis à jour');
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  });

  const toggleMutation = useMutation({
    mutationFn: () => api.put(`/admin/restaurants/${id}/toggle`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-restaurant', id] });
      qc.invalidateQueries({ queryKey: ['admin-restaurants'] });
    },
  });

  const resetPwdMutation = useMutation({
    mutationFn: () => api.post(`/admin/restaurants/${id}/reset-password`),
    onSuccess: () => { toast.success('Mot de passe réinitialisé — email envoyé'); setResetConfirm(false); },
    onError: () => toast.error('Erreur lors de la réinitialisation'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/admin/restaurants/${id}`),
    onSuccess: () => { toast.success('Restaurant supprimé'); navigate('/admin/restaurants'); },
    onError: () => toast.error('Erreur lors de la suppression'),
  });

  const changePwdMutation = useMutation({
    mutationFn: ({ userId, body }) => api.put(`/admin/users/${userId}/change-password`, body).then((r) => r.data),
    onSuccess: () => {
      toast.success('Mot de passe modifié avec succès');
      setChangePwdTarget(null);
      setPwdForm({ new_password: '', confirm_password: '' });
      setPwdError('');
    },
    onError: (err) => setPwdError(err.response?.data?.message || 'Erreur serveur'),
  });

  function openChangePwd(user) {
    setPwdForm({ new_password: '', confirm_password: '' });
    setPwdError('');
    setShowNewPwd(false);
    setShowConfirmPwd(false);
    setChangePwdTarget(user);
  }

  function submitChangePwd() {
    setPwdError('');
    if (!pwdForm.new_password) return setPwdError('Nouveau mot de passe requis');
    if (pwdForm.new_password.length < 8) return setPwdError('Minimum 8 caractères');
    if (!/[A-Z]/.test(pwdForm.new_password)) return setPwdError('1 majuscule requise');
    if (!/[0-9]/.test(pwdForm.new_password)) return setPwdError('1 chiffre requis');
    if (pwdForm.new_password !== pwdForm.confirm_password) return setPwdError('Les mots de passe ne correspondent pas');
    changePwdMutation.mutate({ userId: changePwdTarget.id, body: pwdForm });
  }

  // ─── Loading ──────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 size={32} className="animate-spin text-orange-500" />
      </div>
    );
  }
  if (!restaurant) return null;

  const sub = restaurant.subscription;
  const owner = restaurant.owner;
  const staff = restaurant.staff || [];
  const horaires = (restaurant.horaires || []).sort((a, b) => a.day_of_week - b.day_of_week);

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 mb-7">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/restaurants')}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 shrink-0"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              {restaurant.logo_url && (
                <img src={restaurant.logo_url} alt="" className="w-9 h-9 rounded-lg object-cover" />
              )}
              <h1 className="text-2xl font-bold text-gray-900">{restaurant.name}</h1>
              <span className="text-sm text-gray-400 font-mono">/{restaurant.slug}</span>
              <span className={cn(
                'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                restaurant.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              )}>
                {restaurant.is_active ? 'Actif' : 'Inactif'}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1 ml-12">
              {restaurant.type} · Créé le {formatDate(restaurant.created_at)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href={`/${restaurant.slug}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50"
          >
            <ExternalLink size={13} /> Voir menu
          </a>
          <button
            type="button"
            onClick={() => toggleMutation.mutate()}
            disabled={toggleMutation.isPending}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors',
              restaurant.is_active
                ? 'border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100'
                : 'border-green-200 text-green-700 bg-green-50 hover:bg-green-100'
            )}
          >
            {toggleMutation.isPending
              ? <Loader2 size={13} className="animate-spin" />
              : restaurant.is_active ? <ToggleLeft size={13} /> : <ToggleRight size={13} />
            }
            {restaurant.is_active ? 'Désactiver' : 'Activer'}
          </button>
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-200 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100"
          >
            <Trash2 size={13} /> Supprimer
          </button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
              tab === t.key
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════ TAB: INFO ══ */}
      {tab === 'info' && (
        <form onSubmit={hsInfo((data) => updateInfoMutation.mutate(data))} className="space-y-6">

          {/* Infos générales */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-5">Informations générales</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Nom *</label>
                <input
                  {...regInfo('name', { required: true })}
                  className={cn('w-full px-3 py-2.5 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-orange-300',
                    errInfo.name ? 'border-red-400' : 'border-gray-200')}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Type</label>
                <select {...regInfo('type')} className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300">
                  {TYPES.map((tp) => <option key={tp} value={tp}>{tp}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Email</label>
                <input {...regInfo('email')} type="email" className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Téléphone</label>
                <input {...regInfo('phone')} className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300" placeholder="+216..." />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Adresse</label>
                <input {...regInfo('address')} className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Description courte <span className="text-gray-400 font-normal">(max 160 chars)</span>
                </label>
                <textarea
                  {...regInfo('short_description', { maxLength: 160 })}
                  rows={2}
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
                />
              </div>
            </div>
          </section>

          {/* Réseaux sociaux */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-5">Réseaux sociaux & Liens</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: 'social_instagram', label: 'Instagram' },
                { name: 'social_facebook', label: 'Facebook' },
                { name: 'social_website', label: 'Site web' },
                { name: 'social_whatsapp', label: 'WhatsApp' },
                { name: 'social_tripadvisor', label: 'TripAdvisor' },
                { name: 'social_google_maps', label: 'Google Maps' },
              ].map(({ name, label }) => (
                <div key={name}>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
                  <input {...regInfo(name)} className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300" placeholder="https://..." />
                </div>
              ))}
            </div>
          </section>

          {/* Horaires (lecture seule) */}
          {horaires.length > 0 && (
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Horaires d'ouverture</h2>
              <div className="space-y-2">
                {horaires.map((h) => (
                  <div key={h.day_of_week} className="flex items-center gap-4 text-sm">
                    <span className="w-24 font-medium text-gray-700">{DAYS_FR[h.day_of_week]}</span>
                    {h.is_closed
                      ? <span className="text-gray-400 italic">Fermé</span>
                      : <span className="text-gray-600">{h.open_time?.slice(0, 5)} → {h.close_time?.slice(0, 5)}</span>
                    }
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={updateInfoMutation.isPending}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 disabled:opacity-60"
            >
              {updateInfoMutation.isPending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              Enregistrer les modifications
            </button>
          </div>
        </form>
      )}

      {/* ═══════════════════════════════════════════════════ TAB: VISUAL+PLAN ══ */}
      {tab === 'visual' && (
        <form onSubmit={hsVisual((data) => updateVisualMutation.mutate(data))} className="space-y-6">

          {/* Images */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-5">Logo & Bannière</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <ImageUploader
                  label="Logo"
                  hint="400×400px recommandé"
                  value={logo || (restaurant.logo_url ? { preview: restaurant.logo_url } : null)}
                  onChange={setLogo}
                />
              </div>
              <div>
                <ImageUploader
                  label="Bannière"
                  hint="1200×400px recommandé"
                  value={banner || (restaurant.banner_url ? { preview: restaurant.banner_url } : null)}
                  onChange={setBanner}
                  aspectRatio="banner"
                />
              </div>
            </div>
          </section>

          {/* Template */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Thème visuel</h2>
            <Controller
              name="template_id"
              control={controlVisual}
              render={({ field }) => <TemplateGallery value={field.value} onChange={field.onChange} />}
            />
          </section>

          {/* Plan */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-2">Plan d'abonnement</h2>
            {sub && (
              <div className="flex items-center gap-3 mb-5 text-xs text-gray-500">
                <span className={cn('px-2 py-0.5 rounded-full font-semibold', PLAN_BADGE[sub.plan] || PLAN_BADGE.FREE)}>{sub.plan}</span>
                <span>Statut : <strong>{sub.status}</strong></span>
                {sub.ends_at && <span>Expire le : <strong>{formatDate(sub.ends_at)}</strong></span>}
              </div>
            )}
            <Controller
              name="plan"
              control={controlVisual}
              render={({ field }) => <PlanSelector value={field.value} onChange={field.onChange} />}
            />
          </section>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={updateVisualMutation.isPending}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 disabled:opacity-60"
            >
              {updateVisualMutation.isPending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              Enregistrer le visuel & plan
            </button>
          </div>
        </form>
      )}

      {/* ═════════════════════════════════════════════════════════ TAB: TEAM ══ */}
      {tab === 'team' && (
        <div className="space-y-6">

          {/* Owner */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Compte Owner</h2>
            {owner ? (
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                    <span className="text-orange-500 font-bold text-sm">{owner.name?.[0]?.toUpperCase()}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{owner.name}</div>
                    <div className="text-xs text-gray-400">{owner.email}</div>
                    <div className="text-xs text-gray-400 mt-0.5">@{owner.username}</div>
                  </div>
                </div>
                <div className="text-right text-xs text-gray-400 space-y-1">
                  <div>
                    <span className={cn('inline-flex px-2 py-0.5 rounded-full font-medium',
                      owner.is_first_login ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                    )}>
                      {owner.is_first_login ? 'Jamais connecté' : 'Connecté'}
                    </span>
                  </div>
                  {owner.last_login_at && <div>Dernière connexion : {formatDate(owner.last_login_at)}</div>}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400">Aucun owner associé</p>
            )}
            {owner && (
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-3">
                {resetConfirm ? (
                  <>
                    <span className="text-xs text-gray-600">Confirmer la réinitialisation du mot de passe ?</span>
                    <button
                      type="button"
                      onClick={() => resetPwdMutation.mutate()}
                      disabled={resetPwdMutation.isPending}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-medium hover:bg-amber-600 disabled:opacity-60"
                    >
                      {resetPwdMutation.isPending ? '...' : 'Confirmer'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setResetConfirm(false)}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600"
                    >
                      Annuler
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setResetConfirm(true)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <KeyRound size={13} /> Réinitialiser (email)
                    </button>
                    <button
                      type="button"
                      onClick={() => openChangePwd(owner)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-orange-200 bg-orange-50 text-xs font-medium text-orange-700 hover:bg-orange-100"
                    >
                      <KeyRound size={13} /> Changer le mot de passe
                    </button>
                  </>
                )}
              </div>
            )}
          </section>

          {/* Staff */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">
              Staff <span className="text-gray-400 font-normal ml-1">({staff.length})</span>
            </h2>
            {staff.length === 0 ? (
              <p className="text-sm text-gray-400">Aucun membre du staff pour ce restaurant.</p>
            ) : (
              <div className="space-y-2">
                {staff.map((member) => (
                  <div key={member.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                        <User size={14} className="text-gray-400" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-800">{member.name}</div>
                        <div className="text-xs text-gray-400">{member.role}</div>
                      </div>
                    </div>
                    <span className={cn(
                      'text-xs px-2 py-0.5 rounded-full font-medium',
                      member.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    )}>
                      {member.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* ══ Change password modal ══ */}
      {changePwdTarget && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <KeyRound size={16} className="text-orange-500" />
                Changer le mot de passe
              </h3>
              <button
                type="button"
                onClick={() => setChangePwdTarget(null)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Compte : <strong className="text-gray-700">{changePwdTarget.name}</strong> ({changePwdTarget.email})
            </p>

            <div className="space-y-3 mb-4">
              {[
                { key: 'new_password',     label: 'Nouveau mot de passe',      show: showNewPwd,     toggle: () => setShowNewPwd((v) => !v),     hint: 'Min. 8 car., 1 maj., 1 chiffre' },
                { key: 'confirm_password', label: 'Confirmer le mot de passe', show: showConfirmPwd, toggle: () => setShowConfirmPwd((v) => !v) },
              ].map(({ key, label, show, toggle, hint }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    {label}
                    {hint && <span className="text-gray-400 font-normal ml-1">({hint})</span>}
                  </label>
                  <div className="relative">
                    <input
                      type={show ? 'text' : 'password'}
                      value={pwdForm[key]}
                      onChange={(e) => setPwdForm((f) => ({ ...f, [key]: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && submitChangePwd()}
                      className="w-full px-3 py-2.5 pr-10 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                    />
                    <button
                      type="button"
                      onClick={toggle}
                      tabIndex={-1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {show ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {pwdError && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2 mb-3">
                {pwdError}
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setChangePwdTarget(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={submitChangePwd}
                disabled={changePwdMutation.isPending}
                className="flex-1 px-4 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {changePwdMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <KeyRound size={14} />}
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ Delete confirmation modal ══ */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-base font-bold text-gray-900 mb-2">Supprimer {restaurant.name} ?</h3>
            <p className="text-sm text-gray-500 mb-5">
              Tous les menus, commandes et comptes staff seront désactivés. Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {deleteMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
