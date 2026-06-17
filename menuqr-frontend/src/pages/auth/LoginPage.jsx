import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Loader2, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import api from '../../api/axios';

const schema = z.object({
  identifier: z.string().min(1, 'Requis'),
  password: z.string().min(1, 'Requis'),
  remember_me: z.boolean().optional(),
});

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [bannerError, setBannerError] = useState(null);

  useEffect(() => {
    if (searchParams.get('error') === 'no_restaurant') {
      setBannerError("Votre compte n'est pas lié à un restaurant. Contactez votre administrateur.");
    }
  }, [searchParams]);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { identifier: '', password: '', remember_me: false },
  });

  const mutation = useMutation({
    mutationFn: (data) => api.post('/auth/login', data).then((r) => r.data),
    onSuccess: ({ data }) => {
      setAuth(data.token, data.user);
      if (data.user.is_first_login) navigate('/change-password');
      else if (data.user.role === 'SUPER_ADMIN') navigate('/admin');
      else navigate('/dashboard');
    },
  });

  return (
    <div className="auth-root">
      <div className="auth-overlay" aria-hidden="true" />

      <div className="auth-card">
        {bannerError && (
          <div className="auth-banner-error">
            <AlertTriangle size={15} style={{ color: '#f87171', flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 12, color: '#f87171', margin: 0, lineHeight: 1.5 }}>{bannerError}</p>
          </div>
        )}

        <div className="auth-brand">
          <div className="auth-brand-name">MenuHAS</div>
          <h3 className="auth-title">Welcome Back! 👨‍🍳</h3>
          <p className="auth-subtitle">{t('auth.login_subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} noValidate>
          <div className="auth-field">
            <label className="auth-label">{t('auth.identifier_label')}</label>
            <input
              {...register('identifier')}
              type="text"
              autoComplete="username"
              placeholder={t('auth.identifier_placeholder')}
              className={`auth-input${errors.identifier ? ' auth-input-error' : ''}`}
            />
            {errors.identifier && <p className="auth-error-msg">{errors.identifier.message}</p>}
          </div>

          <div className="auth-field">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <label className="auth-label" style={{ marginBottom: 0 }}>{t('auth.password')}</label>
              <Link to="/forgot-password" className="auth-link-small">{t('auth.forgot_password')}</Link>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder={t('auth.password_placeholder')}
                className={`auth-input auth-input-icon${errors.password ? ' auth-input-error' : ''}`}
              />
              <button type="button" onClick={() => setShowPassword((v) => !v)} tabIndex={-1} className="auth-eye-btn">
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.password && <p className="auth-error-msg">{errors.password.message}</p>}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <input
              id="remember_me"
              {...register('remember_me')}
              type="checkbox"
              style={{ width: 15, height: 15, accentColor: '#F59E0B', cursor: 'pointer', flexShrink: 0 }}
            />
            <label htmlFor="remember_me" style={{ fontSize: 12, color: '#fff', cursor: 'pointer', userSelect: 'none' }}>
              {t('auth.remember_me')}
            </label>
          </div>

          {mutation.isError && (
            <div className="auth-api-error">
              {mutation.error?.response?.data?.message || t('errors.server_error')}
            </div>
          )}

          <button type="submit" disabled={mutation.isPending} className="auth-submit-btn">
            {mutation.isPending && <Loader2 size={15} className="auth-spin" />}
            {mutation.isPending ? t('common.loading') : t('auth.login_btn')}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 11, color: '#fff', marginTop: 20, marginBottom: 0 }}>
          {t('auth.contact_admin')}
        </p>
      </div>

      <style>{`
        .auth-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          position: relative;
          overflow: hidden;
          background-image: url(/restaurant_digital_menu.jpg);
          background-size: cover;
          background-position: center;
        }
        .auth-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: rgba(0,0,0,0.08);
        }
        .auth-card {
          width: 100%;
          max-width: 420px;
          background: rgba(255,255,255,0.01);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 20px;
          padding: 36px 32px;
          box-shadow: 0 8px 48px rgba(0,0,0,0.35);
          position: relative;
          z-index: 1;
        }
        .auth-brand { text-align: center; margin-bottom: 28px; }
        .auth-brand-name {
          font-size: 26px;
          font-weight: 800;
          letter-spacing: -0.5px;
          background: linear-gradient(135deg, #fff 20%, #F59E0B 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 4px;
        }
        .auth-title { font-size: 22px; font-weight: 800; color: #fff; margin: 8px 0 4px; letter-spacing: -0.3px; }
        .auth-subtitle { font-size: 13px; color: #fff; margin: 0; }
        .auth-field { margin-bottom: 14px; }
        .auth-label { display: block; font-size: 12px; font-weight: 600; color: #fff; margin-bottom: 6px; letter-spacing: 0.03em; }
        .auth-input {
          width: 100%;
          box-sizing: border-box;
          padding: 11px 14px;
          font-size: 14px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 10px;
          outline: none;
          color: #fff;
          transition: border-color 0.2s;
        }
        .auth-input-icon { padding-right: 40px; }
        .auth-input:focus { border-color: rgba(245,158,11,0.8); }
        .auth-input-error { border-color: #ef4444 !important; }
        .auth-input::placeholder { color: rgba(255,255,255,0.25); }
        .auth-error-msg { font-size: 11px; color: #ef4444; margin: 4px 0 0; }
        .auth-eye-btn {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          color: rgba(255,255,255,0.4);
        }
        .auth-link-small { font-size: 11px; color: #F59E0B; text-decoration: none; }
        .auth-link-small:hover { text-decoration: underline; }
        .auth-api-error {
          font-size: 12px;
          color: #f87171;
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 8px;
          padding: 9px 12px;
          margin-bottom: 14px;
        }
        .auth-submit-btn {
          width: 100%;
          padding: 12px;
          background: #F59E0B;
          color: #07070f;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 20px rgba(245,158,11,0.35);
          transition: opacity 0.2s;
        }
        .auth-submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .auth-submit-btn:not(:disabled):hover { opacity: 0.9; }
        .auth-spin { animation: spin 1s linear infinite; }
        .auth-banner-error {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 10px 14px;
          background: rgba(239,68,68,0.12);
          border: 1px solid rgba(239,68,68,0.3);
          border-radius: 10px;
          margin-bottom: 20px;
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        /* Responsive */
        @media (max-width: 480px) {
          .auth-root { padding: 12px; }
          .auth-card { padding: 28px 20px; border-radius: 16px; }
          .auth-brand-name { font-size: 22px; }
          .auth-title { font-size: 18px; }
          .auth-subtitle { font-size: 12px; }
          .auth-input { font-size: 16px; /* prevent iOS zoom */ }
          .auth-submit-btn { font-size: 15px; padding: 13px; }
        }
        @media (max-width: 360px) {
          .auth-card { padding: 22px 14px; }
          .auth-brand-name { font-size: 20px; }
        }
      `}</style>
    </div>
  );
}
