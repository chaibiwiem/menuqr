import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, Clock, Globe, Check, Loader2, Palette, Upload, X, AlertCircle, KeyRound, Eye, EyeOff } from 'lucide-react';
import api from '../../api/axios';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../lib/utils';

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS = [
  { key: 0, label: 'Dimanche' },
  { key: 1, label: 'Lundi' },
  { key: 2, label: 'Mardi' },
  { key: 3, label: 'Mercredi' },
  { key: 4, label: 'Jeudi' },
  { key: 5, label: 'Vendredi' },
  { key: 6, label: 'Samedi' },
];

const TABS = [
  { key: 'info',             label: 'Informations',     icon: Settings },
  { key: 'social',           label: 'Réseaux sociaux',  icon: Globe },
  { key: 'horaires',         label: 'Horaires',         icon: Clock },
  { key: 'personnalisation', label: 'Personnalisation', icon: Palette },
  { key: 'securite',         label: 'Sécurité',         icon: KeyRound },
];

const TEMPLATES = [
  { id: 'classic_theme',  label: 'Classic',    bg: '#F8F8F6', accent: '#FF6B35' },
  { id: 'dark_sleek',     label: 'Dark Sleek', bg: '#0E0E0F', accent: '#FF5C35' },
  { id: 'aurora_glass',   label: 'Aurora',     bg: '#0D1B2A', accent: '#2DD4BF' },
  { id: 'bento_menu',     label: 'Bento',      bg: '#F5F5F5', accent: '#22C55E' },
  { id: 'editorial_menu', label: 'Editorial',  bg: '#F9F7F4', accent: '#1A1A1A' },
  { id: 'modern_theme',   label: 'Modern',     bg: '#F7F7F7', accent: '#6C47FF' },
];

const TEMPLATE_DEFAULTS = {
  aurora_glass:   { accent: '#2DD4BF', 'bg-primary': '#0D1B2A', 'bg-secondary': '#112236', 'card-bg': '#152840', 'card-border': '#1E3550', 'text-primary': '#F5F5F5', 'text-secondary': '#8DA4BC' },
  bento_menu:     { accent: '#22C55E', 'bg-primary': '#F5F5F5', 'bg-secondary': '#FFFFFF', 'card-bg': '#FFFFFF', 'card-border': '#EFEFEF', 'text-primary': '#1A1A1A', 'text-secondary': '#9CA3AF' },
  classic_theme:  { accent: '#FF6B35', 'bg-primary': '#F8F8F6', 'bg-secondary': '#FFFFFF', 'card-bg': '#FFFFFF', 'card-border': '#EFEFEF', 'text-primary': '#1A1A1A', 'text-secondary': '#9CA3AF' },
  dark_sleek:     { accent: '#FF5C35', 'bg-primary': '#0E0E0F', 'bg-secondary': '#1A1A1B', 'card-bg': '#1E1E1F', 'card-border': '#2A2A2B', 'text-primary': '#F5F5F5', 'text-secondary': '#A0A0A0' },
  editorial_menu: { accent: '#1A1A1A', 'bg-primary': '#F9F7F4', 'bg-secondary': '#F2EFE8', 'card-bg': '#FFFFFF', 'card-border': '#E0DDD8', 'text-primary': '#1A1A1A', 'text-secondary': '#6B6B6B' },
  modern_theme:   { accent: '#6C47FF', 'bg-primary': '#F7F7F7', 'bg-secondary': '#FFFFFF', 'card-bg': '#FFFFFF', 'card-border': '#EFEFEF', 'text-primary': '#1A1A1A', 'text-secondary': '#9CA3AF' },
};

const COLOR_FIELDS = [
  { key: 'accent',         label: 'Couleur principale' },
  { key: 'bg-primary',     label: 'Fond principal' },
  { key: 'bg-secondary',   label: 'Fond secondaire' },
  { key: 'card-bg',        label: 'Fond des cartes' },
  { key: 'card-border',    label: 'Bordure des cartes' },
  { key: 'text-primary',   label: 'Texte principal' },
  { key: 'text-secondary', label: 'Texte secondaire' },
];

const FONTS = [
  { value: '',                  label: 'Par défaut (Inter)' },
  { value: 'Poppins',           label: 'Poppins' },
  { value: 'Montserrat',        label: 'Montserrat' },
  { value: 'Raleway',           label: 'Raleway' },
  { value: 'Lato',              label: 'Lato' },
  { value: 'Nunito',            label: 'Nunito' },
  { value: 'Playfair Display',  label: 'Playfair Display' },
];

const LANGS = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English',  flag: '🇬🇧' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'ar', label: 'العربية',  flag: '🇹🇳' },
];

// ─── Small UI primitives ──────────────────────────────────────────────────────

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = 'text', disabled }) {
  return (
    <input type={type} value={value ?? ''} onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder} disabled={disabled}
      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:bg-gray-50 disabled:text-gray-400" />
  );
}

function Textarea({ value, onChange, placeholder, rows = 3 }) {
  return (
    <textarea rows={rows} value={value ?? ''} onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none" />
  );
}

function SaveRow({ isPending, saved, error, onSave, label = 'Enregistrer', disabled = false }) {
  return (
    <div className="flex items-center gap-3 pt-2 flex-wrap">
      <button type="button" onClick={onSave} disabled={isPending || disabled}
        className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-medium hover:bg-orange-600 disabled:opacity-50 transition-colors">
        {isPending && <Loader2 size={15} className="animate-spin" />}
        {label}
      </button>
      {saved && (
        <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
          <Check size={15} /> Sauvegardé
        </span>
      )}
      {error && (
        <span className="flex items-center gap-1.5 text-sm text-red-500">
          <AlertCircle size={15} /> {error}
        </span>
      )}
    </div>
  );
}

// ─── Image picker ─────────────────────────────────────────────────────────────

function ImagePicker({ label, hint, value, onChange, isBanner }) {
  const ref = useRef(null);
  const preview = value?.preview || (typeof value === 'string' ? value : null);

  function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    onChange({ file, preview: URL.createObjectURL(file) });
  }

  return (
    <div>
      <p className="text-xs font-medium text-gray-600 mb-1">{label}</p>
      {hint && <p className="text-xs text-gray-400 mb-1.5">{hint}</p>}
      <div
        className={cn(
          'relative rounded-xl border-2 border-dashed border-gray-200 hover:border-orange-300 cursor-pointer transition-colors overflow-hidden',
          isBanner ? 'h-28 w-full' : 'h-24 w-24'
        )}
        onClick={() => ref.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
      >
        {preview ? (
          <>
            <img src={preview} alt="preview" className="w-full h-full object-cover" />
            <button type="button"
              onClick={(e) => { e.stopPropagation(); onChange(null); if (ref.current) ref.current.value = ''; }}
              className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-black/80">
              <X size={12} />
            </button>
            {/* "Changer" badge */}
            <div className="absolute bottom-0 inset-x-0 bg-black/40 py-1 flex items-center justify-center">
              <span className="text-white text-[10px] font-medium">Changer</span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-1.5 text-gray-400">
            <Upload size={18} />
            <span className="text-[11px]">Choisir</span>
          </div>
        )}
      </div>
      {/* FIX: input is OUTSIDE the overflow-hidden div to prevent blocking */}
      <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
        onChange={(e) => handleFile(e.target.files[0])} />
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function defaultHoraires() {
  return DAYS.map((d) => ({
    day_of_week: d.key, open_time: '09:00', close_time: '23:00', is_closed: d.key === 0,
  }));
}

function useFlash() {
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const flash = () => { setSaved(true); setError(''); setTimeout(() => setSaved(false), 2500); };
  const fail  = (msg) => { setError(msg || 'Erreur'); setSaved(false); setTimeout(() => setError(''), 4000); };
  return { saved, error, flash, fail };
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SettingsPage() {
  const qc = useQueryClient();

  const [tab, setTab]         = useState('info');
  const [form, setForm]       = useState(null);
  const [horaires, setHoraires] = useState(null);

  // Personnalisation state (managed independently from form)
  const [templateId, setTemplateId] = useState('classic_theme');
  const [colors, setColors]   = useState({});
  const [font, setFont]       = useState('');
  const [langs, setLangs]     = useState(['fr']);
  const [logo, setLogo]       = useState(null);   // { file?, preview }
  const [banner, setBanner]   = useState(null);
  // Guard: only init personnalisation from server once (and after each successful save)
  const personInitRef = useRef(false);

  // Per-section flash states
  const info     = useFlash();
  const horaire  = useFlash();
  const person   = useFlash();
  const imgs     = useFlash();
  const pwd      = useFlash();

  // Password form
  const [pwdForm, setPwdForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [showPwd, setShowPwd] = useState({ current: false, new: false, confirm: false });
  const [pwdError, setPwdError] = useState('');

  // ── Fetch ──
  const { data, isLoading } = useQuery({
    queryKey: ['owner-settings'],
    queryFn: () => api.get('/settings').then((r) => r.data.data),
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!data) return;
    // Only initialize form once (avoid overwriting user edits on refetch)
    if (!form) {
      setForm({
        name:               data.name || '',
        email:              data.email || '',
        phone:              data.phone || '',
        address:            data.address || '',
        short_description:  data.short_description || '',
        social_facebook:    data.social_facebook || '',
        social_instagram:   data.social_instagram || '',
        social_tripadvisor: data.social_tripadvisor || '',
        social_google_maps: data.social_google_maps || '',
        social_website:     data.social_website || '',
        social_whatsapp:    data.social_whatsapp || '',
      });
      const h = data.horaires?.length > 0 ? data.horaires : defaultHoraires();
      setHoraires(DAYS.map((d) => h.find((x) => x.day_of_week === d.key) || { day_of_week: d.key, open_time: '09:00', close_time: '23:00', is_closed: false }));
    }

    // Personnalisation: only init once (and after each save resets the flag)
    // Without this guard, background refetches (window focus, etc.) would reset
    // any pending user changes before they can click Save.
    if (!personInitRef.current) {
      personInitRef.current = true;
      const tmpl = data.template_id || 'classic_theme';
      setTemplateId(tmpl);
      setColors(data.custom_colors && Object.keys(data.custom_colors).length > 0
        ? data.custom_colors
        : { ...TEMPLATE_DEFAULTS[tmpl] });
      setFont(data.custom_font || '');
      setLangs(Array.isArray(data.menu_languages) && data.menu_languages.length > 0
        ? data.menu_languages : ['fr']);
      if (data.logo_url)   setLogo({ preview: data.logo_url });
      if (data.banner_url) setBanner({ preview: data.banner_url });
    }
  }, [data]);

  // ── Mutations ──
  const infoMutation = useMutation({
    mutationFn: (body) => api.put('/settings', body).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['owner-settings'] }); info.flash(); },
    onError: () => info.fail('Erreur lors de la sauvegarde'),
  });

  const horairesMutation = useMutation({
    mutationFn: (h) => api.put('/settings/horaires', { horaires: h }).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['owner-settings'] }); horaire.flash(); },
    onError: () => horaire.fail('Erreur lors de la sauvegarde'),
  });

  const personMutation = useMutation({
    mutationFn: (body) => api.put('/settings', body).then((r) => r.data),
    onSuccess: () => {
      personInitRef.current = false; // allow post-save refetch to reinitialize with fresh data
      qc.invalidateQueries({ queryKey: ['owner-settings'] });
      person.flash();
    },
    onError: () => person.fail('Erreur lors de la sauvegarde'),
  });

  const imagesMutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      if (logo?.file)   fd.append('logo',   logo.file);
      if (banner?.file) fd.append('banner', banner.file);
      // Use native fetch — axios default Content-Type:application/json breaks Multer
      // (XHR setRequestHeader overrides the multipart boundary). fetch with FormData
      // body always sets Content-Type:multipart/form-data;boundary=... automatically.
      const token = useAuthStore.getState().token;
      const base = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const res = await fetch(`${base}/settings/images`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'upload_failed');
      return json;
    },
    onSuccess: () => {
      personInitRef.current = false; // allow post-save refetch to reinitialize with fresh URLs
      qc.invalidateQueries({ queryKey: ['owner-settings'] });
      imgs.flash();
    },
    onError: (err) => imgs.fail(err?.message || 'Erreur upload image'),
  });

  const pwdMutation = useMutation({
    mutationFn: (body) => api.put('/auth/change-password', body).then((r) => r.data),
    onSuccess: () => {
      setPwdForm({ current_password: '', new_password: '', confirm_password: '' });
      setPwdError('');
      pwd.flash();
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Erreur lors du changement de mot de passe';
      setPwdError(msg);
    },
  });

  function submitPassword() {
    setPwdError('');
    if (!pwdForm.current_password) return setPwdError('Mot de passe actuel requis');
    if (pwdForm.new_password.length < 8) return setPwdError('Nouveau mot de passe : 8 caractères minimum');
    if (!/[A-Z]/.test(pwdForm.new_password)) return setPwdError('Nouveau mot de passe : 1 majuscule requise');
    if (!/[0-9]/.test(pwdForm.new_password)) return setPwdError('Nouveau mot de passe : 1 chiffre requis');
    if (pwdForm.new_password !== pwdForm.confirm_password) return setPwdError('Les mots de passe ne correspondent pas');
    pwdMutation.mutate(pwdForm);
  }

  // ── Handlers ──
  function setF(key, val) { setForm((f) => ({ ...f, [key]: val })); }

  function setHoraire(idx, key, val) {
    setHoraires((prev) => { const next = [...prev]; next[idx] = { ...next[idx], [key]: val }; return next; });
  }

  function handleTemplateChange(id) {
    setTemplateId(id);
    setColors({ ...TEMPLATE_DEFAULTS[id] });
  }

  function setColor(key, val) {
    setColors((c) => ({ ...c, [key]: val }));
  }

  function toggleLang(code) {
    setLangs((prev) => {
      if (prev.includes(code)) {
        if (prev.length === 1) return prev; // at least one required
        return prev.filter((l) => l !== code);
      }
      return [...prev, code];
    });
  }

  function savePersonalisation() {
    personMutation.mutate({
      template_id:    templateId,
      custom_colors:  colors,
      custom_font:    font || null,
      menu_languages: langs,
    });
  }

  const hasNewImages = !!(logo?.file || banner?.file);

  // ── Loading ──
  if (isLoading || !form) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={28} className="animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Settings size={22} className="text-orange-500" />
          Paramètres Restaurant
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">Modifiez les informations de votre établissement</p>
      </div>

      {/* ── Tabs ── */}
      <div className="flex flex-wrap gap-1 bg-gray-100 rounded-xl p-1">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} type="button" onClick={() => setTab(key)}
            className={cn('flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              tab === key ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* ════════════════ Informations ════════════════ */}
      {tab === 'info' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nom du restaurant">
              <Input value={form.name} onChange={(v) => setF('name', v)} placeholder="Mon restaurant" />
            </Field>
            <Field label="Email">
              <Input value={form.email} onChange={(v) => setF('email', v)} type="email" placeholder="contact@resto.tn" />
            </Field>
            <Field label="Téléphone">
              <Input value={form.phone} onChange={(v) => setF('phone', v)} placeholder="+216 XX XXX XXX" />
            </Field>
            <Field label="Adresse">
              <Input value={form.address} onChange={(v) => setF('address', v)} placeholder="Rue, Ville" />
            </Field>
          </div>
          <Field label="Description courte">
            <Textarea value={form.short_description} onChange={(v) => setF('short_description', v)}
              placeholder="Une phrase qui décrit votre restaurant..." />
          </Field>
          <SaveRow isPending={infoMutation.isPending} saved={info.saved} error={info.error}
            onSave={() => infoMutation.mutate(form)} />
        </div>
      )}

      {/* ════════════════ Réseaux sociaux ════════════════ */}
      {tab === 'social' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: 'social_facebook',    label: 'Facebook' },
              { key: 'social_instagram',   label: 'Instagram' },
              { key: 'social_tripadvisor', label: 'TripAdvisor' },
              { key: 'social_google_maps', label: 'Google Maps' },
              { key: 'social_website',     label: 'Site web' },
              { key: 'social_whatsapp',    label: 'WhatsApp' },
            ].map(({ key, label }) => (
              <Field key={key} label={label}>
                <Input value={form[key]} onChange={(v) => setF(key, v)} placeholder="URL ou numéro..." />
              </Field>
            ))}
          </div>
          <SaveRow isPending={infoMutation.isPending} saved={info.saved} error={info.error}
            onSave={() => infoMutation.mutate(form)} />
        </div>
      )}

      {/* ════════════════ Horaires ════════════════ */}
      {tab === 'horaires' && horaires && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
          {horaires.map((h, idx) => {
            const day = DAYS.find((d) => d.key === h.day_of_week);
            return (
              <div key={h.day_of_week} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                <div className="w-24 shrink-0 text-sm font-medium text-gray-700">{day?.label}</div>
                <label className="flex items-center gap-1.5 cursor-pointer select-none shrink-0">
                  <input type="checkbox" checked={h.is_closed}
                    onChange={(e) => setHoraire(idx, 'is_closed', e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-gray-300 text-red-500 focus:ring-red-400" />
                  <span className="text-xs text-gray-500">Fermé</span>
                </label>
                <input type="time" value={h.open_time} disabled={h.is_closed}
                  onChange={(e) => setHoraire(idx, 'open_time', e.target.value)}
                  className="px-2 py-1.5 rounded-lg border border-gray-200 text-sm disabled:opacity-40" />
                <span className="text-gray-400 text-sm">—</span>
                <input type="time" value={h.close_time} disabled={h.is_closed}
                  onChange={(e) => setHoraire(idx, 'close_time', e.target.value)}
                  className="px-2 py-1.5 rounded-lg border border-gray-200 text-sm disabled:opacity-40" />
              </div>
            );
          })}
          <SaveRow isPending={horairesMutation.isPending} saved={horaire.saved} error={horaire.error}
            onSave={() => horairesMutation.mutate(horaires)} />
        </div>
      )}

      {/* ════════════════ Personnalisation ════════════════ */}
      {tab === 'personnalisation' && (
        <div className="space-y-5">

          {/* ── Template ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Template</h3>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {TEMPLATES.map((tmpl) => (
                <button key={tmpl.id} type="button" onClick={() => handleTemplateChange(tmpl.id)}
                  className={cn(
                    'relative rounded-xl overflow-hidden border-2 transition-all text-left',
                    templateId === tmpl.id
                      ? 'border-orange-500 ring-2 ring-orange-200'
                      : 'border-gray-100 hover:border-gray-300'
                  )}>
                  <div className="h-14 flex flex-col items-center justify-center gap-1.5 px-2"
                    style={{ backgroundColor: tmpl.bg }}>
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: tmpl.accent }} />
                    <div className="w-full space-y-0.5">
                      <div className="h-1 rounded-full w-full opacity-30" style={{ backgroundColor: tmpl.accent }} />
                      <div className="h-1 rounded-full w-2/3 opacity-20" style={{ backgroundColor: tmpl.accent }} />
                    </div>
                  </div>
                  <div className="px-2 py-1" style={{ backgroundColor: tmpl.bg }}>
                    <span className="text-[10px] font-bold" style={{ color: tmpl.accent }}>{tmpl.label}</span>
                  </div>
                  {templateId === tmpl.id && (
                    <div className="absolute top-1 right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                      <Check size={9} className="text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ── Couleurs ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-800">Couleurs</h3>
              <button type="button"
                onClick={() => setColors({ ...TEMPLATE_DEFAULTS[templateId] })}
                className="text-xs text-orange-500 hover:text-orange-600 font-medium">
                Réinitialiser
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {COLOR_FIELDS.map(({ key, label }) => (
                <div key={key} className="flex items-center gap-3">
                  <input
                    type="color"
                    value={colors[key] || '#000000'}
                    onChange={(e) => setColor(key, e.target.value)}
                    style={{
                      width: 40, height: 40, padding: 3,
                      borderRadius: 8, border: '2px solid #e5e7eb',
                      cursor: 'pointer', flexShrink: 0,
                      backgroundColor: 'transparent',
                    }}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-700">{label}</p>
                    <p className="text-[11px] text-gray-400 font-mono">{colors[key] || ''}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Police ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Police</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {FONTS.map(({ value, label }) => (
                <button key={value} type="button" onClick={() => setFont(value)}
                  className={cn(
                    'px-3 py-2.5 rounded-xl border text-sm text-left transition-all',
                    font === value
                      ? 'border-orange-500 bg-orange-50 text-orange-600 font-semibold'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  )}
                  style={{ fontFamily: value ? `'${value}', sans-serif` : 'Inter, sans-serif' }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Langues ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-1">Langues du menu</h3>
            <p className="text-xs text-gray-400 mb-3">Sélectionnez les langues visibles dans le menu public</p>
            <div className="flex flex-wrap gap-2">
              {LANGS.map(({ code, label, flag }) => {
                const active = langs.includes(code);
                const isLast = active && langs.length === 1;
                return (
                  <button key={code} type="button" onClick={() => toggleLang(code)} disabled={isLast}
                    title={isLast ? 'Au moins une langue requise' : ''}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all select-none',
                      active
                        ? 'border-orange-500 bg-orange-50 text-orange-600'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300',
                      isLast && 'opacity-50 cursor-not-allowed'
                    )}>
                    <span className="text-base">{flag}</span>
                    {label}
                    {active && <Check size={13} className="text-orange-500 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Save template + colors + font + langs */}
          <SaveRow isPending={personMutation.isPending} saved={person.saved} error={person.error}
            onSave={savePersonalisation} label="Enregistrer la personnalisation" />

          {/* ── Images ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Images</h3>
            <div className="flex gap-6 items-start flex-wrap mb-4">
              <ImagePicker label="Logo" hint="Format carré (ex: 400×400)" value={logo} onChange={setLogo} />
              <div className="flex-1 min-w-[200px]">
                <ImagePicker label="Bannière" hint="Format 16:9 recommandé" value={banner} onChange={setBanner} isBanner />
              </div>
            </div>
            <SaveRow
              isPending={imagesMutation.isPending}
              saved={imgs.saved}
              error={imgs.error}
              onSave={() => imagesMutation.mutate()}
              label="Enregistrer les images"
              disabled={!hasNewImages}
            />
            {!hasNewImages && (
              <p className="text-xs text-gray-400 mt-1.5">Sélectionnez un nouveau fichier pour enregistrer</p>
            )}
          </div>

        </div>
      )}

      {/* ════════════════ Sécurité ════════════════ */}
      {tab === 'securite' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-5">
          <div className="flex items-center gap-2 mb-1">
            <KeyRound size={16} className="text-orange-500" />
            <h3 className="text-sm font-semibold text-gray-800">Changer le mot de passe</h3>
          </div>

          {[
            { key: 'current_password', label: 'Mot de passe actuel',      showKey: 'current', autoComplete: 'current-password' },
            { key: 'new_password',     label: 'Nouveau mot de passe',      showKey: 'new',     autoComplete: 'new-password',    hint: 'Min. 8 car., 1 majuscule, 1 chiffre' },
            { key: 'confirm_password', label: 'Confirmer le mot de passe', showKey: 'confirm', autoComplete: 'new-password' },
          ].map(({ key, label, showKey, autoComplete, hint }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                {label}
                {hint && <span className="text-gray-400 font-normal ml-1">({hint})</span>}
              </label>
              <div className="relative">
                <input
                  type={showPwd[showKey] ? 'text' : 'password'}
                  value={pwdForm[key]}
                  onChange={(e) => setPwdForm((f) => ({ ...f, [key]: e.target.value }))}
                  autoComplete={autoComplete}
                  className="w-full px-3 py-2.5 pr-10 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => ({ ...s, [showKey]: !s[showKey] }))}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPwd[showKey] ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          ))}

          {pwdError && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
              <AlertCircle size={14} className="shrink-0" />
              {pwdError}
            </div>
          )}

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={submitPassword}
              disabled={pwdMutation.isPending}
              className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-medium hover:bg-orange-600 disabled:opacity-50 transition-colors"
            >
              {pwdMutation.isPending && <Loader2 size={15} className="animate-spin" />}
              Changer le mot de passe
            </button>
            {pwd.saved && (
              <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                <Check size={15} /> Mot de passe mis à jour
              </span>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
