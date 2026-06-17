import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import api from '../../api/axios';

const schema = z
  .object({
    current_password: z.string().optional(),
    new_password: z
      .string()
      .min(8, 'Minimum 8 caractères')
      .regex(/[A-Z]/, '1 majuscule requise')
      .regex(/[0-9]/, '1 chiffre requis'),
    confirm_password: z.string().min(1, 'Requis'),
  })
  .refine((d) => d.new_password === d.confirm_password, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirm_password'],
  });

export default function ChangePasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const [show, setShow] = useState({ current: false, new: false, confirm: false });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: (data) => api.put('/auth/change-password', data).then((r) => r.data),
    onSuccess: () => {
      updateUser({ is_first_login: false });
      if (user?.role === 'SUPER_ADMIN') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    },
  });

  const toggle = (field) => setShow((s) => ({ ...s, [field]: !s[field] }));

  const PasswordField = ({ id, name, label, showKey, autoComplete }) => (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium mb-1.5"
        style={{ color: 'hsl(var(--foreground))' }}
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          {...register(name)}
          type={show[showKey] ? 'text' : 'password'}
          autoComplete={autoComplete}
          className="w-full px-3 py-2.5 pr-10 text-sm rounded-lg border focus:outline-none focus:ring-2 transition-shadow"
          style={{
            borderColor: errors[name] ? 'hsl(var(--destructive))' : 'hsl(var(--border))',
            backgroundColor: 'hsl(var(--background))',
          }}
        />
        <button
          type="button"
          onClick={() => toggle(showKey)}
          className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
          style={{ color: 'hsl(var(--muted-foreground))' }}
          tabIndex={-1}
        >
          {show[showKey] ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {errors[name] && (
        <p className="text-xs mt-1" style={{ color: 'hsl(var(--destructive))' }}>
          {errors[name].message}
        </p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold" style={{ color: 'hsl(var(--primary))' }}>
            MenuHAS
          </h1>
        </div>

        {/* Warning banner */}
        <div
          className="flex items-start gap-3 rounded-xl px-4 py-3 mb-5 border"
          style={{ backgroundColor: '#fffbeb', borderColor: '#fde68a' }}
        >
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#d97706' }} />
          <p className="text-sm" style={{ color: '#92400e' }}>
            {t('auth.first_login_msg')}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border p-8" style={{ borderColor: 'hsl(var(--border))' }}>
          <h2 className="text-xl font-semibold mb-6" style={{ color: 'hsl(var(--foreground))' }}>
            {t('auth.first_login_title')}
          </h2>

          <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-5" noValidate>
            {/* Current password only required when NOT first login */}
            {!user?.is_first_login && (
              <PasswordField
                id="current_password"
                name="current_password"
                label={t('auth.current_password')}
                showKey="current"
                autoComplete="current-password"
              />
            )}
            <PasswordField
              id="new_password"
              name="new_password"
              label={t('auth.new_password')}
              showKey="new"
              autoComplete="new-password"
            />
            <PasswordField
              id="confirm_password"
              name="confirm_password"
              label={t('auth.confirm_password')}
              showKey="confirm"
              autoComplete="new-password"
            />

            {mutation.isError && (
              <div
                className="text-sm rounded-lg px-3 py-2.5"
                style={{
                  backgroundColor: 'hsl(var(--destructive) / 0.1)',
                  color: 'hsl(var(--destructive))',
                }}
              >
                {mutation.error?.response?.data?.message || t('errors.server_error')}
              </div>
            )}

            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full py-2.5 rounded-lg font-medium text-sm transition-opacity disabled:opacity-60"
              style={{
                backgroundColor: 'hsl(var(--primary))',
                color: 'hsl(var(--primary-foreground))',
              }}
            >
              {mutation.isPending ? t('common.loading') : t('auth.change_btn')}
            </button>
          </form>
        </div>

        <p
          className="text-center text-xs mt-6"
          style={{ color: 'hsl(var(--muted-foreground))' }}
        >
          {t('auth.password_requirements')}
        </p>
      </div>
    </div>
  );
}
