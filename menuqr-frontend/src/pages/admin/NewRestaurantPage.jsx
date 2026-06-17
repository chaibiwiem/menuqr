import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Check, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import api from '../../api/axios';
import { cn } from '../../lib/utils';
import PlanSelector from '../../components/admin/PlanSelector';
import OwnerAccountForm from '../../components/admin/OwnerAccountForm';
import TemplateGallery from '../../components/admin/TemplateGallery';
import HorairesPicker from '../../components/admin/HorairesPicker';
import ImageUploader from '../../components/admin/ImageUploader';

const DAYS_FR = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

const DEFAULT_HORAIRES = DAYS_FR.map((_, i) => ({
  day_of_week: i,
  is_closed: i === 0,
  open_time: '09:00',
  close_time: '22:00',
}));

const TYPES = ['Restaurant', 'Café', 'Bar', 'Hôtel', 'Fast-food', 'Autre'];

const STEPS = [
  { key: 'info',    label: 'Informations' },
  { key: 'visual',  label: 'Visuel' },
  { key: 'horaires', label: 'Horaires' },
  { key: 'owner',   label: 'Compte Owner' },
];

function slugify(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function NewRestaurantPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [logo, setLogo] = useState(null);
  const [banner, setBanner] = useState(null);
  const [horaires, setHoraires] = useState(DEFAULT_HORAIRES);

  const {
    register, handleSubmit, watch, setValue, control, trigger,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      slug: '',
      type: 'Restaurant',
      email: '',
      phone: '',
      address: '',
      short_description: '',
      template_id: 'classic_theme',
      plan: 'FREE',
      password_mode: 'auto',
      ui_language: 'fr',
    },
  });

  const name = watch('name');
  const slug = watch('slug');

  // Slug check live
  const { data: slugCheck, isFetching: checkingSlug } = useQuery({
    queryKey: ['check-slug', slug],
    queryFn: () => api.get(`/admin/check-slug?slug=${slug}`).then((r) => r.data.data),
    enabled: slug.length >= 2,
    staleTime: 2000,
  });

  function autoSlug() {
    if (name) setValue('slug', slugify(name));
  }

  const mutation = useMutation({
    mutationFn: async (values) => {
      const fd = new FormData();
      fd.append('name', values.name);
      fd.append('slug', values.slug);
      fd.append('type', values.type);
      fd.append('email', values.email || '');
      fd.append('phone', values.phone || '');
      fd.append('address', values.address || '');
      fd.append('short_description', values.short_description || '');
      fd.append('template_id', values.template_id);
      fd.append('plan', values.plan);
      fd.append('owner_name', values.owner_name);
      fd.append('owner_username', values.owner_username);
      fd.append('owner_email', values.owner_email);
      fd.append('owner_phone', values.owner_phone || '');
      fd.append('ui_language', values.ui_language || 'fr');
      const password = values.password_mode === 'auto'
        ? (values.generated_password || '')
        : (values.owner_password || '');
      fd.append('owner_password', password);
      fd.append('horaires', JSON.stringify(horaires));
      if (logo?.file) fd.append('logo', logo.file);
      if (banner?.file) fd.append('banner', banner.file);
      return api.post('/admin/restaurants', fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data);
    },
    onSuccess: () => navigate('/admin/restaurants'),
  });

  const STEP_FIELDS = [
    ['name', 'slug'],                                              // étape 0
    [],                                                            // étape 1 (pas de champs requis)
    [],                                                            // étape 2
    ['owner_name', 'owner_username', 'owner_email'],              // étape 3
  ];

  async function next() {
    const valid = await trigger(STEP_FIELDS[step]);
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }
  function prev() { setStep((s) => Math.max(s - 1, 0)); }

  const onSubmit = (values) => mutation.mutate(values);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <button
          type="button"
          onClick={() => navigate('/admin/restaurants')}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('admin.new_restaurant')}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{t('admin.new_restaurant_sub')}</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center mb-10">
        {STEPS.map((s, i) => (
          <div key={s.key} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm border-2 transition-all',
                  i < step ? 'bg-orange-500 border-orange-500 text-white'
                    : i === step ? 'border-orange-500 text-orange-500 bg-white'
                    : 'border-gray-200 text-gray-400 bg-white'
                )}
              >
                {i < step ? <Check size={16} /> : i + 1}
              </div>
              <span className={cn('text-xs mt-1.5 font-medium', i === step ? 'text-orange-500' : 'text-gray-400')}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn('flex-1 h-0.5 mx-2 mb-5', i < step ? 'bg-orange-500' : 'bg-gray-200')} />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 min-h-[420px]">

          {/* STEP 0 — Info */}
          {step === 0 && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('common.name')} *</label>
                  <input
                    {...register('name', { required: 'Requis' })}
                    onBlur={autoSlug}
                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300"
                    placeholder="Le Bistro Parisien"
                  />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Type *</label>
                  <select
                    {...register('type')}
                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300"
                  >
                    {TYPES.map((tp) => <option key={tp} value={tp}>{tp}</option>)}
                  </select>
                </div>
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Slug (URL) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">menuqr.tn/</span>
                  <input
                    {...register('slug', { required: 'Requis', pattern: { value: /^[a-z0-9-]+$/, message: 'Caractères a-z, 0-9, - uniquement' } })}
                    className="w-full pl-24 pr-10 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300"
                    placeholder="bistro-parisien"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {checkingSlug && <Loader2 size={15} className="animate-spin text-gray-400" />}
                    {!checkingSlug && slug.length >= 2 && slugCheck?.available === true && <CheckCircle2 size={15} className="text-green-500" />}
                    {!checkingSlug && slug.length >= 2 && slugCheck?.available === false && <XCircle size={15} className="text-red-500" />}
                  </div>
                </div>
                {errors.slug && <p className="text-xs text-red-500 mt-1">{errors.slug.message}</p>}
                {!checkingSlug && slug.length >= 2 && slugCheck?.available === false && (
                  <p className="text-xs text-red-500 mt-1">Ce slug est déjà utilisé</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <input {...register('email')} type="email" className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('common.phone')}</label>
                  <input {...register('phone')} className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300" placeholder="+216..." />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse</label>
                <input {...register('address')} className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description courte <span className="text-gray-400 font-normal">(max 160 chars)</span></label>
                <textarea
                  {...register('short_description', { maxLength: 160 })}
                  rows={2}
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
                />
              </div>
            </div>
          )}

          {/* STEP 1 — Visual */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-5">
                <ImageUploader
                  label="Logo"
                  hint="400×400px recommandé, JPG/PNG/WebP"
                  value={logo}
                  onChange={setLogo}
                />
                <ImageUploader
                  label="Bannière"
                  hint="1200×400px recommandé"
                  value={banner}
                  onChange={setBanner}
                  aspectRatio="banner"
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">Thème visuel</p>
                <Controller
                  name="template_id"
                  control={control}
                  render={({ field }) => (
                    <TemplateGallery value={field.value} onChange={field.onChange} />
                  )}
                />
              </div>
            </div>
          )}

          {/* STEP 2 — Horaires */}
          {step === 2 && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-4">Horaires d'ouverture</p>
              <HorairesPicker value={horaires} onChange={setHoraires} />
            </div>
          )}

          {/* STEP 3 — Owner + Plan */}
          {step === 3 && (
            <div className="space-y-8">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-4">Compte Owner</p>
                <OwnerAccountForm
                  register={register}
                  watch={watch}
                  setValue={setValue}
                  errors={errors}
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-4">Plan d'abonnement</p>
                <Controller
                  name="plan"
                  control={control}
                  render={({ field }) => (
                    <PlanSelector value={field.value} onChange={field.onChange} />
                  )}
                />
              </div>
            </div>
          )}
        </div>

        {/* Error from API */}
        {mutation.isError && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {(() => {
              const apiMsg = mutation.error?.response?.data?.message;
              const msgs = {
                slug_taken: 'Ce slug (URL) est déjà utilisé — retournez à l\'étape 1 et changez-le.',
                username_taken: 'Ce username est déjà pris — choisissez-en un autre.',
                email_taken: 'Cet email owner est déjà utilisé.',
                missing_required_fields: 'Certains champs obligatoires sont vides — vérifiez toutes les étapes.',
                database_error: 'Erreur base de données. Réessayez.',
              };
              return msgs[apiMsg] || apiMsg || 'Une erreur est survenue';
            })()}
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={prev}
            disabled={step === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} /> Précédent
          </button>

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={next}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-medium hover:bg-orange-600"
            >
              Suivant <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-60"
            >
              {mutation.isPending ? (
                <><Loader2 size={16} className="animate-spin" /> Création...</>
              ) : (
                <><Check size={16} /> Créer le restaurant</>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
