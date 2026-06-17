import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, XCircle, Loader2, Copy } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { cn } from '../../lib/utils';

const LANGS = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English' },
  { value: 'it', label: 'Italiano' },
  { value: 'ar', label: 'العربية' },
];

function genPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#!';
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export default function OwnerAccountForm({ register, watch, setValue, errors }) {
  const { t } = useTranslation();
  const [autoPass] = useState(genPassword);
  const [copied, setCopied] = useState(false);
  const passwordMode = watch('password_mode') || 'auto';
  const username = watch('owner_username') || '';

  // Vérif username live
  const { data: usernameCheck, isFetching: checkingUsername } = useQuery({
    queryKey: ['check-username', username],
    queryFn: () => api.get(`/admin/check-username?username=${username}`).then((r) => r.data.data),
    enabled: username.length >= 3,
    staleTime: 2000,
  });

  useEffect(() => {
    if (passwordMode === 'auto') setValue('generated_password', autoPass);
  }, [passwordMode, autoPass, setValue]);

  function copyPass() {
    navigator.clipboard.writeText(autoPass);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const usernameAvailable = usernameCheck?.available;

  return (
    <div className="space-y-5">
      {/* Nom */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('common.name')} *</label>
        <input
          {...register('owner_name')}
          className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300"
          placeholder="Nom complet"
        />
        {errors.owner_name && <p className="text-xs text-red-500 mt-1">{errors.owner_name.message}</p>}
      </div>

      {/* Username */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Username *</label>
        <div className="relative">
          <input
            {...register('owner_username')}
            className="w-full px-3 py-2.5 pr-10 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300"
            placeholder="owner_bistro"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {checkingUsername && <Loader2 size={16} className="animate-spin text-gray-400" />}
            {!checkingUsername && username.length >= 3 && usernameAvailable === true && (
              <CheckCircle2 size={16} className="text-green-500" />
            )}
            {!checkingUsername && username.length >= 3 && usernameAvailable === false && (
              <XCircle size={16} className="text-red-500" />
            )}
          </div>
        </div>
        {!checkingUsername && username.length >= 3 && usernameAvailable === false && (
          <p className="text-xs text-red-500 mt-1">{t('admin.username_taken')}</p>
        )}
        {errors.owner_username && <p className="text-xs text-red-500 mt-1">{errors.owner_username.message}</p>}
      </div>

      {/* Email + Phone */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('common.email')} *</label>
          <input
            {...register('owner_email')}
            type="email"
            className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
          {errors.owner_email && <p className="text-xs text-red-500 mt-1">{errors.owner_email.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('common.phone')}</label>
          <input
            {...register('owner_phone')}
            className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300"
            placeholder="+216..."
          />
        </div>
      </div>

      {/* Langue */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Langue de l'interface</label>
        <select
          {...register('ui_language')}
          className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300"
        >
          {LANGS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
        </select>
      </div>

      {/* Mode mot de passe */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Mot de passe initial</p>
        <div className="flex gap-4 mb-3">
          {['auto', 'manual'].map((mode) => (
            <label key={mode} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                {...register('password_mode')}
                value={mode}
                className="accent-orange-500"
              />
              <span className="text-sm">{mode === 'auto' ? t('admin.auto_password') : t('admin.manual_password')}</span>
            </label>
          ))}
        </div>

        {passwordMode === 'auto' ? (
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-200">
            <code className="flex-1 text-sm font-mono text-gray-700">{autoPass}</code>
            <button type="button" onClick={copyPass} className="text-orange-500 hover:text-indigo-800 shrink-0">
              {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
            </button>
          </div>
        ) : (
          <input
            {...register('owner_password')}
            type="text"
            placeholder="Mot de passe manuel (min 8 chars)"
            className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        )}
        {errors.owner_password && <p className="text-xs text-red-500 mt-1">{errors.owner_password.message}</p>}
      </div>
    </div>
  );
}
