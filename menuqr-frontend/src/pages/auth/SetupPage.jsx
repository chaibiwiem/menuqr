import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Eye, EyeOff, Loader2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import api from '../../api/axios';

const schema = z
  .object({
    name:             z.string().min(2, 'Minimum 2 caractères'),
    email:            z.string().email('Email invalide'),
    username:         z.string().min(3, 'Minimum 3 caractères').optional().or(z.literal('')),
    password:         z.string().min(8, 'Minimum 8 caractères').regex(/[A-Z]/, '1 majuscule requise').regex(/[0-9]/, '1 chiffre requis'),
    confirm_password: z.string().min(1, 'Requis'),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirm_password'],
  });

export default function SetupPage() {
  const navigate = useNavigate();
  const [show, setShow] = useState({ password: false, confirm: false });
  const [done, setDone] = useState(false);
  const [checking, setChecking] = useState(true);

  // If a super admin already exists, redirect to login
  useEffect(() => {
    api.get('/setup/check')
      .then(({ data }) => {
        if (!data.needed) navigate('/login', { replace: true });
        else setChecking(false);
      })
      .catch(() => setChecking(false));
  }, [navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: (data) => api.post('/setup/init', data).then((r) => r.data),
    onSuccess: () => setDone(true),
  });

  const toggle = (k) => setShow((s) => ({ ...s, [k]: !s[k] }));

  const inputStyle = (hasError) => ({
    width: '100%',
    boxSizing: 'border-box',
    padding: '11px 14px',
    fontSize: 14,
    backgroundColor: '#0c0c18',
    border: `1px solid ${hasError ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
    borderRadius: 10,
    outline: 'none',
    color: '#fff',
  });

  if (checking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#07070f' }}>
        <Loader2 size={28} style={{ color: '#F59E0B', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{ backgroundColor: '#07070f' }}>

      {/* Aurora background */}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '-10%', left: '-5%',
          width: '55%', height: '55%', borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(99,60,255,0.22) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-10%', right: '-5%',
          width: '55%', height: '55%', borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(0,180,255,0.18) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }} />
        <div style={{
          position: 'absolute', top: '52%', left: '-10%',
          width: '120%', height: '3px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(100,60,255,0.55) 30%, rgba(0,200,255,0.6) 50%, rgba(120,80,255,0.4) 70%, transparent 100%)',
          filter: 'blur(6px)', transform: 'rotate(-1deg)',
        }} />
      </div>

      {/* Card */}
      <div style={{
        width: '100%', maxWidth: 400,
        backgroundColor: '#13131e',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 20,
        padding: '32px 28px',
        boxShadow: '0 8px 64px rgba(0,0,0,0.6)',
        position: 'relative', zIndex: 1,
      }}>

        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px',
            background: 'linear-gradient(135deg, #fff 20%, #F59E0B 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            marginBottom: 4,
          }}>
            MenuHAS
          </div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: 0 }}>
            Configuration initiale de la plateforme
          </p>
        </div>

        {done ? (
          /* ── Success state ── */
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <CheckCircle2 size={52} style={{ color: '#22c55e', margin: '0 auto 16px' }} />
            <p style={{ color: '#fff', fontWeight: 700, fontSize: 16, marginBottom: 8 }}>
              Super Admin créé !
            </p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 24 }}>
              Vous pouvez maintenant vous connecter avec vos identifiants.
            </p>
            <button
              type="button"
              onClick={() => navigate('/login')}
              style={{
                width: '100%', padding: '12px',
                backgroundColor: '#F59E0B', color: '#07070f',
                border: 'none', borderRadius: 10,
                fontSize: 14, fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(245,158,11,0.35)',
              }}
            >
              Se connecter →
            </button>
          </div>
        ) : (
          /* ── Form ── */
          <form onSubmit={handleSubmit((data) => mutation.mutate(data))} noValidate>

            {/* Name */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.55)', marginBottom: 6 }}>
                Nom complet *
              </label>
              <input {...register('name')} type="text" placeholder="Jean Dupont" style={inputStyle(errors.name)}
                onFocus={(e) => { if (!errors.name) e.target.style.borderColor = 'rgba(245,158,11,0.7)'; }}
                onBlur={(e) => { if (!errors.name) e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
              />
              {errors.name && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.55)', marginBottom: 6 }}>
                Email *
              </label>
              <input {...register('email')} type="email" placeholder="admin@example.com" style={inputStyle(errors.email)}
                onFocus={(e) => { if (!errors.email) e.target.style.borderColor = 'rgba(245,158,11,0.7)'; }}
                onBlur={(e) => { if (!errors.email) e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
              />
              {errors.email && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{errors.email.message}</p>}
            </div>

            {/* Username */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.55)', marginBottom: 6 }}>
                Username <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>(optionnel)</span>
              </label>
              <input {...register('username')} type="text" placeholder="superadmin" style={inputStyle(errors.username)}
                onFocus={(e) => { if (!errors.username) e.target.style.borderColor = 'rgba(245,158,11,0.7)'; }}
                onBlur={(e) => { if (!errors.username) e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
              />
              {errors.username && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{errors.username.message}</p>}
            </div>

            {/* Password */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.55)', marginBottom: 6 }}>
                Mot de passe *
              </label>
              <div style={{ position: 'relative' }}>
                <input {...register('password')} type={show.password ? 'text' : 'password'} placeholder="Min. 8 car., 1 maj., 1 chiffre"
                  style={{ ...inputStyle(errors.password), paddingRight: 40 }}
                  onFocus={(e) => { if (!errors.password) e.target.style.borderColor = 'rgba(245,158,11,0.7)'; }}
                  onBlur={(e) => { if (!errors.password) e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                />
                <button type="button" onClick={() => toggle('password')} tabIndex={-1}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'rgba(255,255,255,0.35)' }}>
                  {show.password ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{errors.password.message}</p>}
            </div>

            {/* Confirm */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.55)', marginBottom: 6 }}>
                Confirmer le mot de passe *
              </label>
              <div style={{ position: 'relative' }}>
                <input {...register('confirm_password')} type={show.confirm ? 'text' : 'password'} placeholder="Répéter le mot de passe"
                  style={{ ...inputStyle(errors.confirm_password), paddingRight: 40 }}
                  onFocus={(e) => { if (!errors.confirm_password) e.target.style.borderColor = 'rgba(245,158,11,0.7)'; }}
                  onBlur={(e) => { if (!errors.confirm_password) e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                />
                <button type="button" onClick={() => toggle('confirm')} tabIndex={-1}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'rgba(255,255,255,0.35)' }}>
                  {show.confirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.confirm_password && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{errors.confirm_password.message}</p>}
            </div>

            {mutation.isError && (
              <div style={{ fontSize: 12, color: '#f87171', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '9px 12px', marginBottom: 14 }}>
                {mutation.error?.response?.data?.message || 'Erreur serveur'}
              </div>
            )}

            <button
              type="submit"
              disabled={mutation.isPending}
              style={{
                width: '100%', padding: '12px',
                backgroundColor: mutation.isPending ? 'rgba(245,158,11,0.7)' : '#F59E0B',
                color: '#07070f', border: 'none', borderRadius: 10,
                fontSize: 14, fontWeight: 700,
                cursor: mutation.isPending ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: '0 4px 20px rgba(245,158,11,0.35)',
              }}
            >
              {mutation.isPending
                ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Création…</>
                : <><ShieldCheck size={15} /> Créer le Super Admin</>
              }
            </button>
          </form>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input::placeholder { color: rgba(255,255,255,0.2); }
      `}</style>
    </div>
  );
}
