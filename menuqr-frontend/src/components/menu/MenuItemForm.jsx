import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { X, Loader2, Upload } from 'lucide-react';
import api from '../../api/axios';
import { cn } from '../../lib/utils';
import SupplementManager from './SupplementManager';
import VariantManager from './VariantManager';

const LANGS = ['fr', 'en', 'it', 'ar'];
const LANG_LABELS = { fr: 'Français', en: 'English', it: 'Italiano', ar: 'عربي' };

function LangTabs({ active, onChange }) {
  return (
    <div className="flex gap-1 mb-4 border-b border-gray-100 pb-3">
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => onChange(l)}
          className={cn(
            'px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
            active === l ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          )}
        >
          {l === 'ar' ? 'AR' : LANG_LABELS[l].slice(0, 2).toUpperCase()}
        </button>
      ))}
    </div>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-orange-300',
          checked ? 'bg-green-500' : 'bg-gray-300'
        )}
      >
        <span className={cn('pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform', checked ? 'translate-x-4' : 'translate-x-0')} />
      </button>
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
}

const EMPTY_FORM = {
  name_fr: '', name_en: '', name_it: '', name_ar: '',
  description_fr: '', description_en: '', description_it: '', description_ar: '',
  price: '', price_night: '', price_happy_hour: '',
  happy_hour_start: '', happy_hour_end: '',
  image_url: '', prep_time_min: '',
  is_available: true, is_featured: false,
  disable_at: '', enable_at: '',
  promo_price: '', promo_label: '', promo_start: '', promo_end: '',
};

function buildForm(item) {
  if (!item) return { ...EMPTY_FORM };
  return {
    name_fr: item.name_fr || '', name_en: item.name_en || '', name_it: item.name_it || '', name_ar: item.name_ar || '',
    description_fr: item.description_fr || '', description_en: item.description_en || '',
    description_it: item.description_it || '', description_ar: item.description_ar || '',
    price: String(item.price || ''),
    price_night: item.price_night ? String(item.price_night) : '',
    price_happy_hour: item.price_happy_hour ? String(item.price_happy_hour) : '',
    happy_hour_start: item.happy_hour_start || '', happy_hour_end: item.happy_hour_end || '',
    image_url: item.image_url || '',
    prep_time_min: item.prep_time_min != null ? String(item.prep_time_min) : '',
    is_available: item.is_available ?? true,
    is_featured: item.is_featured ?? false,
    disable_at: item.disable_at || '', enable_at: item.enable_at || '',
    promo_price: item.promo_price ? String(item.promo_price) : '',
    promo_label: item.promo_label || '',
    promo_start: item.promo_start ? item.promo_start.slice(0, 10) : '',
    promo_end: item.promo_end ? item.promo_end.slice(0, 10) : '',
  };
}

export default function MenuItemForm({ categoryId, menuId, item, onClose }) {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const isEdit = !!item;
  const [lang, setLang] = useState('fr');
  const [form, setForm] = useState(buildForm(item));
  const [showVariablePricing, setShowVariablePricing] = useState(
    !!(item?.price_night || item?.price_happy_hour)
  );
  const [showPromo, setShowPromo] = useState(!!(item?.promo_price));
  const [uploadPreview, setUploadPreview] = useState(item?.image_url || '');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [tab, setTab] = useState('info');

  // Fetch fresh item data when editing so the form always shows current DB values
  const { data: freshItem, isLoading: itemLoading } = useQuery({
    queryKey: ['item-detail', item?.id],
    queryFn: () => api.get(`/items/${item.id}`).then((r) => r.data.data),
    enabled: isEdit,
    staleTime: 0,
  });

  useEffect(() => {
    if (freshItem) {
      setForm(buildForm(freshItem));
      setShowVariablePricing(!!(freshItem.price_night || freshItem.price_happy_hour));
      setShowPromo(!!(freshItem.promo_price));
      setUploadPreview(freshItem.image_url || '');
    }
  }, [freshItem]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  function set(key, val) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadLoading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const endpoint = isEdit ? `/items/${item.id}/image` : '/items/upload-image';
      // Do NOT set Content-Type manually — browser must auto-set multipart/form-data with boundary
      const res = await api.post(endpoint, fd, {
        headers: { 'Content-Type': undefined },
        timeout: 60000,
      });
      const url = res.data.data.image_url;
      set('image_url', url);
      setUploadPreview(url);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Erreur upload image');
    } finally {
      setUploadLoading(false);
    }
  }

  function buildPayload() {
    return {
      category_id: categoryId,
      name_fr: form.name_fr.trim(),
      name_en: form.name_en.trim() || null,
      name_it: form.name_it.trim() || null,
      name_ar: form.name_ar.trim() || null,
      description_fr: form.description_fr.trim() || null,
      description_en: form.description_en.trim() || null,
      description_it: form.description_it.trim() || null,
      description_ar: form.description_ar.trim() || null,
      price: parseFloat(form.price) || 0,
      price_night: form.price_night ? parseFloat(form.price_night) : null,
      price_happy_hour: form.price_happy_hour ? parseFloat(form.price_happy_hour) : null,
      happy_hour_start: form.happy_hour_start || null,
      happy_hour_end: form.happy_hour_end || null,
      image_url: form.image_url || null,
      prep_time_min: form.prep_time_min ? parseInt(form.prep_time_min, 10) : null,
      is_available: form.is_available,
      is_featured: form.is_featured,
      disable_at: form.disable_at || null,
      enable_at: form.enable_at || null,
      promo_price: form.promo_price ? parseFloat(form.promo_price) : null,
      promo_label: form.promo_label.trim() || null,
      promo_start: form.promo_start || null,
      promo_end: form.promo_end || null,
    };
  }

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      isEdit
        ? api.put(`/items/${item.id}`, payload)
        : api.post(`/categories/${categoryId}/items`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['menu-categories', menuId] });
      if (isEdit) qc.invalidateQueries({ queryKey: ['item-detail', item.id] });
      onClose();
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || t('errors.server_error'));
    },
  });

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name_fr.trim() || !form.price) return;
    saveMutation.mutate(buildPayload());
  }

  const isRTL = lang === 'ar';

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-base font-bold text-gray-900">
            {isEdit ? t('menu.edit_item') : t('menu.add_item')}
          </h2>
          <button type="button" onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        {/* Sub-tabs for edit mode */}
        {isEdit && (
          <div className="flex border-b border-gray-100 shrink-0">
            {[
              { key: 'info',        label: t('menu.item_info') },
              { key: 'variants',    label: 'Variantes' },
              { key: 'supplements', label: t('menu.supplements_tab') },
            ].map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={cn(
                  'flex-1 py-2.5 text-sm font-medium transition-colors',
                  tab === key ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-500 hover:text-gray-700'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-auto px-5 py-4">
          {tab === 'supplements' && isEdit ? (
            <SupplementManager itemId={item.id} />
          ) : tab === 'variants' && isEdit ? (
            <VariantManager itemId={item.id} />
          ) : itemLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 size={24} className="animate-spin text-orange-400" />
            </div>
          ) : (
            <form id="item-form" onSubmit={handleSubmit} className="space-y-5">
              {/* Lang tabs */}
              <LangTabs active={lang} onChange={setLang} />

              {/* Name */}
              <div dir={isRTL ? 'rtl' : 'ltr'}>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  {t('menu.item_name')} ({lang.toUpperCase()}) {lang === 'fr' && <span className="text-red-500">*</span>}
                </label>
                <input
                  value={form[`name_${lang}`]}
                  onChange={(e) => set(`name_${lang}`, e.target.value)}
                  required={lang === 'fr'}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
                />
              </div>

              {/* Description */}
              <div dir={isRTL ? 'rtl' : 'ltr'}>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  {t('menu.description')} ({lang.toUpperCase()})
                </label>
                <textarea
                  value={form[`description_${lang}`]}
                  onChange={(e) => set(`description_${lang}`, e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 resize-none"
                />
              </div>

              {/* Common fields — always visible regardless of lang */}
              <hr className="border-gray-100" />

              {/* Price */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{t('menu.price')} (DT) <span className="text-red-500">*</span></label>
                  <input
                    type="number" step="0.001" min="0"
                    value={form.price}
                    onChange={(e) => set('price', e.target.value)}
                    required
                    placeholder="0.000"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{t('menu.prep_time_label')} (min)</label>
                  <input
                    type="number" min="0" max="120"
                    value={form.prep_time_min}
                    onChange={(e) => set('prep_time_min', e.target.value)}
                    placeholder="—"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-4">
                <Toggle checked={form.is_available} onChange={(v) => set('is_available', v)} label={t('common.available')} />
                <Toggle checked={form.is_featured} onChange={(v) => set('is_featured', v)} label={t('menu.popular')} />
              </div>

              {/* Image */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">{t('menu.image')}</label>
                <div className="flex items-center gap-3">
                  {uploadPreview ? (
                    <img src={uploadPreview} alt="preview" className="w-16 h-16 rounded-xl object-cover border border-gray-100 shrink-0" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center text-gray-300 shrink-0">
                      <Upload size={18} />
                    </div>
                  )}
                  <label className="flex-1 cursor-pointer">
                    <div className={cn(
                      'flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-gray-300 text-sm text-gray-500 hover:bg-gray-50',
                      uploadLoading && 'opacity-60'
                    )}>
                      {uploadLoading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                      {uploadLoading ? t('common.uploading') : t('common.upload')}
                    </div>
                    <input type="file" accept="image/*" className="sr-only" onChange={handleImageChange} disabled={uploadLoading} />
                  </label>
                </div>
              </div>

              {/* Auto-disable schedule */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{t('menu.disable_at')}</label>
                  <input type="time" value={form.disable_at} onChange={(e) => set('disable_at', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{t('menu.enable_at')}</label>
                  <input type="time" value={form.enable_at} onChange={(e) => set('enable_at', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200" />
                </div>
              </div>

              {/* Variable pricing toggle */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowVariablePricing((v) => !v)}
                  className="flex items-center gap-2 text-sm font-medium text-orange-500 hover:text-indigo-800"
                >
                  <span className={cn('text-xs px-2 py-0.5 rounded-full', showVariablePricing ? 'bg-orange-100 text-orange-500' : 'bg-gray-100 text-gray-500')}>
                    {showVariablePricing ? '−' : '+'}
                  </span>
                  {t('menu.variable_pricing')}
                </button>

                {showVariablePricing && (
                  <div className="mt-3 bg-amber-50 rounded-xl p-4 border border-amber-200 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">{t('menu.night_price')} (DT)</label>
                        <input type="number" step="0.001" min="0" value={form.price_night} onChange={(e) => set('price_night', e.target.value)}
                          placeholder="0.000"
                          className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">{t('menu.happy_hour_price')} (DT)</label>
                        <input type="number" step="0.001" min="0" value={form.price_happy_hour} onChange={(e) => set('price_happy_hour', e.target.value)}
                          placeholder="0.000"
                          className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">{t('menu.happy_hour_start')}</label>
                        <input type="time" value={form.happy_hour_start} onChange={(e) => set('happy_hour_start', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">{t('menu.happy_hour_end')}</label>
                        <input type="time" value={form.happy_hour_end} onChange={(e) => set('happy_hour_end', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none" />
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Promotion ── */}
                <button
                  type="button"
                  onClick={() => setShowPromo((v) => !v)}
                  className="flex items-center gap-2 text-sm font-medium text-red-500 hover:text-red-700"
                >
                  <span className={cn('text-xs px-2 py-0.5 rounded-full', showPromo ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-500')}>
                    {showPromo ? '−' : '+'}
                  </span>
                  {t('menu.promotion')}
                </button>

                {showPromo && (
                  <div className="mt-3 bg-red-50 rounded-xl p-4 border border-red-200 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">{t('menu.promo_price')} (DT)</label>
                        <input type="number" step="0.001" min="0" value={form.promo_price} onChange={(e) => set('promo_price', e.target.value)}
                          placeholder="0.000"
                          className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">{t('menu.promo_label')}</label>
                        <input type="text" value={form.promo_label} onChange={(e) => set('promo_label', e.target.value)}
                          placeholder={t('menu.promo_label_placeholder')}
                          maxLength={50}
                          className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">{t('menu.promo_start')}</label>
                        <input type="date" value={form.promo_start} onChange={(e) => set('promo_start', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">{t('menu.promo_end')}</label>
                        <input type="date" value={form.promo_end} onChange={(e) => set('promo_end', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200" />
                      </div>
                    </div>
                    <p className="text-xs text-red-400">{t('menu.promo_hint')}</p>
                  </div>
                )}
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        {tab !== 'supplements' && tab !== 'variants' && (
          <div className="px-5 py-4 border-t border-gray-100 shrink-0 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              form="item-form"
              disabled={saveMutation.isPending || !form.name_fr.trim() || !form.price}
              className="flex-1 px-4 py-3 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saveMutation.isPending && <Loader2 size={14} className="animate-spin" />}
              {t('common.save')}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
