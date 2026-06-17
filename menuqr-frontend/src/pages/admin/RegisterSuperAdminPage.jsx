import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { ShieldCheck, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
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

export default function RegisterSuperAdminPage() {
  const navigate = useNavigate();
  const [show, setShow] = useState({ password: false, confirm: false });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: (data) => api.post('/admin/super-admins', data).then((r) => r.data),
    onSuccess: () => {
      toast.success('Super Admin créé avec succès');
      reset();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Erreur serveur'),
  });

  const toggle = (field) => setShow((s) => ({ ...s, [field]: !s[field] }));

  function Field({ id, name, label, type = 'text', autoComplete, placeholder, showKey, optional }) {
    const isPassword = !!showKey;
    return (
      <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}{optional && <span className="text-gray-400 font-normal ml-1">(optionnel)</span>}
        </label>
        <div className="relative">
          <input
            id={id}
            {...register(name)}
            type={isPassword ? (show[showKey] ? 'text' : 'password') : type}
            autoComplete={autoComplete}
            placeholder={placeholder}
            className="w-full px-3 py-2.5 pr-10 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            style={{ borderColor: errors[name] ? '#ef4444' : '#e5e7eb' }}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => toggle(showKey)}
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {show[showKey] ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          )}
        </div>
        {errors[name] && (
          <p className="text-xs text-red-500 mt-1">{errors[name].message}</p>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => navigate('/admin/users')}
          className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-500 transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck size={20} className="text-indigo-500" />
            Créer un Super Admin
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Compte avec accès complet à la plateforme
          </p>
        </div>
      </div>

      {/* Warning */}
      <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
        <strong>Attention :</strong> Un Super Admin a accès à toutes les fonctionnalités de la plateforme sans restriction. Ne créez ce type de compte que pour des administrateurs de confiance.
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <Field id="name" name="name" label="Nom complet *" autoComplete="name" placeholder="Jean Dupont" />
        <Field id="email" name="email" label="Email *" type="email" autoComplete="email" placeholder="admin@example.com" />
        <Field id="username" name="username" label="Nom d'utilisateur" autoComplete="username" placeholder="admin_jean" optional />

        <hr className="border-gray-100" />

        <Field id="password" name="password" label="Mot de passe *" autoComplete="new-password" showKey="password" placeholder="Min. 8 car., 1 majuscule, 1 chiffre" />
        <Field id="confirm_password" name="confirm_password" label="Confirmer le mot de passe *" autoComplete="new-password" showKey="confirm" placeholder="Répéter le mot de passe" />

        {mutation.isError && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
            {mutation.error?.response?.data?.message || 'Erreur serveur'}
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={() => navigate('/admin/users')}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSubmit((data) => mutation.mutate(data))}
            disabled={mutation.isPending}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60 transition-colors"
          >
            {mutation.isPending ? (
              <><Loader2 size={15} className="animate-spin" /> Création…</>
            ) : (
              <><ShieldCheck size={15} /> Créer le Super Admin</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
