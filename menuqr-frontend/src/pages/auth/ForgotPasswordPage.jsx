import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, ArrowLeft, Loader2 } from 'lucide-react';
import api from '../../api/axios';

const schema = z.object({
  identifier: z.string().min(1, 'Requis'),
});

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [sent, setSent] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: (data) => api.post('/auth/forgot-password', data).then((r) => r.data),
    onSuccess: () => setSent(true),
  });

  if (sent) {
    return (
      <div className="auth-root">
        <div className="auth-overlay" aria-hidden="true" />
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <CheckCircle2 size={52} style={{ color: '#22c55e', margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
            {t('auth.forgot_title')}
          </h2>
          <p style={{ fontSize: 13, color: '#fff', marginBottom: 24 }}>
            {t('auth.forgot_sent')}
          </p>
          <Link to="/login" className="auth-back-link">
            <ArrowLeft size={14} />
            {t('auth.back_to_login')}
          </Link>
        </div>
        <style>{STYLES}</style>
      </div>
    );
  }

  return (
    <div className="auth-root">
      <div className="auth-overlay" aria-hidden="true" />

      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand-name">MenuHAS</div>
          <h3 className="auth-title">{t('auth.forgot_title')}</h3>
          <p className="auth-subtitle">{t('auth.forgot_subtitle')}</p>
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

          {mutation.isError && (
            <div className="auth-api-error">
              {mutation.error?.response?.data?.message || t('errors.server_error')}
            </div>
          )}

          <button type="submit" disabled={mutation.isPending} className="auth-submit-btn" style={{ marginBottom: 20 }}>
            {mutation.isPending && <Loader2 size={15} className="auth-spin" />}
            {mutation.isPending ? t('common.loading') : t('auth.send_reset_link')}
          </button>
        </form>

        <div style={{ textAlign: 'center' }}>
          <Link to="/login" className="auth-back-link">
            <ArrowLeft size={14} />
            {t('auth.back_to_login')}
          </Link>
        </div>
      </div>

      <style>{STYLES}</style>
    </div>
  );
}

const STYLES = `
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
  .auth-title { font-size: 18px; font-weight: 700; color: #fff; margin: 8px 0 4px; }
  .auth-subtitle { font-size: 13px; color: #fff; margin: 0; }
  .auth-field { margin-bottom: 16px; }
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
  .auth-input:focus { border-color: rgba(245,158,11,0.8); }
  .auth-input-error { border-color: #ef4444 !important; }
  .auth-input::placeholder { color: rgba(255,255,255,0.25); }
  .auth-error-msg { font-size: 11px; color: #ef4444; margin: 4px 0 0; }
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
  .auth-spin { animation: spin 1s linear infinite; }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

  /* Responsive */
  @media (max-width: 480px) {
    .auth-root { padding: 12px; }
    .auth-card { padding: 28px 20px; border-radius: 16px; }
    .auth-brand-name { font-size: 22px; }
    .auth-title { font-size: 16px; }
    .auth-subtitle { font-size: 12px; }
    .auth-input { font-size: 16px; }
    .auth-submit-btn { font-size: 15px; padding: 13px; }
  }
  @media (max-width: 360px) {
    .auth-card { padding: 22px 14px; }
    .auth-brand-name { font-size: 20px; }
  }
`;
