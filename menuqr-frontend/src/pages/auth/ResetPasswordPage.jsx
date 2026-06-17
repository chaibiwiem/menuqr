import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const schema = z
  .object({
    password: z
      .string()
      .min(8, 'Minimum 8 caractères')
      .regex(/[A-Z]/, '1 majuscule requise')
      .regex(/[0-9]/, '1 chiffre requis'),
    confirmPassword: z.string().min(1, 'Requis'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: (data) =>
      api.post('/auth/reset-password', { token, password: data.password, confirmPassword: data.confirmPassword }).then((r) => r.data),
    onSuccess: () => {
      toast.success(t('auth.password_reset_success'));
      navigate('/login');
    },
  });

  if (!token) {
    navigate('/login', { replace: true });
    return null;
  }

  return (
    <div className="auth-root">
      <div className="auth-overlay" aria-hidden="true" />

      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand-name">MenuHAS</div>
          <h3 className="auth-title">{t('auth.reset_title')}</h3>
          <p className="auth-subtitle">{t('auth.password_requirements')}</p>
        </div>

        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} noValidate>
          <div className="auth-field">
            <label className="auth-label">{t('auth.new_password')}</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                {...register('password')}
                type={showPwd ? 'text' : 'password'}
                autoComplete="new-password"
                className={`auth-input auth-input-icon${errors.password ? ' auth-input-error' : ''}`}
              />
              <button type="button" onClick={() => setShowPwd((v) => !v)} tabIndex={-1} className="auth-eye-btn">
                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.password && <p className="auth-error-msg">{errors.password.message}</p>}
          </div>

          <div className="auth-field">
            <label className="auth-label">{t('auth.confirm_password')}</label>
            <div style={{ position: 'relative' }}>
              <input
                id="confirmPassword"
                {...register('confirmPassword')}
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                className={`auth-input auth-input-icon${errors.confirmPassword ? ' auth-input-error' : ''}`}
              />
              <button type="button" onClick={() => setShowConfirm((v) => !v)} tabIndex={-1} className="auth-eye-btn">
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.confirmPassword && <p className="auth-error-msg">{errors.confirmPassword.message}</p>}
          </div>

          {mutation.isError && (
            <div className="auth-api-error">
              {mutation.error?.response?.data?.message || t('errors.server_error')}
              {mutation.error?.response?.status === 400 && (
                <span> — <Link to="/forgot-password" style={{ color: '#F59E0B', textDecoration: 'underline' }}>{t('auth.forgot_password')}</Link></span>
              )}
            </div>
          )}

          <button type="submit" disabled={mutation.isPending} className="auth-submit-btn" style={{ marginBottom: 20 }}>
            {mutation.isPending ? t('common.loading') : t('auth.reset_btn')}
          </button>
        </form>

        <div style={{ textAlign: 'center' }}>
          <Link to="/login" className="auth-back-link">
            <ArrowLeft size={14} />
            {t('auth.back_to_login')}
          </Link>
        </div>
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
        .auth-brand { text-align: center; margin-bottom: 24px; }
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
        .auth-title { font-size: 18px; font-weight: 700; color: #fff; margin: 8px 0 4px; }
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
        .auth-back-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #F59E0B;
          text-decoration: none;
          font-weight: 600;
        }
        .auth-back-link:hover { text-decoration: underline; }

        /* Responsive */
        @media (max-width: 480px) {
          .auth-root { padding: 12px; }
          .auth-card { padding: 28px 20px; border-radius: 16px; }
          .auth-brand-name { font-size: 22px; }
          .auth-title { font-size: 16px; }
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
