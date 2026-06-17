import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  CreditCard, FileText, Plus, Download, Pencil, Trash2,
  Loader2, CheckCircle2, Clock, XCircle, ChevronLeft, ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { cn } from '../../lib/utils';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(amount) {
  return new Intl.NumberFormat('fr-TN', { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(Number(amount) || 0) + ' DT';
}

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

const PLAN_BADGE = {
  FREE:    'bg-gray-100 text-gray-600',
  STARTER: 'bg-blue-100 text-blue-700',
  PRO:     'bg-orange-100 text-orange-600',
  PREMIUM: 'bg-amber-100 text-amber-800',
};

const SUB_STATUS_BADGE = {
  ACTIVE:    'bg-green-100 text-green-700',
  TRIAL:     'bg-orange-100 text-orange-700',
  EXPIRED:   'bg-red-100 text-red-700',
  SUSPENDED: 'bg-gray-100 text-gray-500',
  CANCELLED: 'bg-gray-100 text-gray-500',
};

const INV_STATUS = {
  PAID:      { label: 'Payée',      badge: 'bg-green-100 text-green-700',  icon: CheckCircle2 },
  PENDING:   { label: 'En attente', badge: 'bg-amber-100 text-amber-700',  icon: Clock },
  CANCELLED: { label: 'Annulée',    badge: 'bg-gray-100 text-gray-500',    icon: XCircle },
};

// ─── Sub edit modal ────────────────────────────────────────────────────────────

function SubscriptionModal({ sub, onClose }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    plan:           sub.plan,
    billing_period: sub.billing_period || 'MONTHLY',
    status:         sub.status,
    starts_at:      sub.starts_at || '',
    ends_at:        sub.ends_at   || '',
    amount:         sub.amount    || '',
    payment_ref:    sub.payment_ref  || '',
    admin_notes:    sub.admin_notes  || '',
  });

  const mutation = useMutation({
    mutationFn: (data) => api.put(`/admin/subscriptions/${sub.id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-subscriptions'] });
      toast.success('Abonnement mis à jour');
      onClose();
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  });

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-base font-bold text-gray-900 mb-1">Modifier l'abonnement</h3>
        <p className="text-sm text-gray-500 mb-5">{sub.restaurant?.name}</p>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Plan</label>
              <select value={form.plan} onChange={(e) => set('plan', e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300">
                {['FREE', 'STARTER', 'PRO', 'PREMIUM'].map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Facturation</label>
              <select value={form.billing_period} onChange={(e) => set('billing_period', e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300">
                <option value="MONTHLY">Mensuel</option>
                <option value="ANNUAL">Annuel</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Statut</label>
            <select value={form.status} onChange={(e) => set('status', e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300">
              {['ACTIVE', 'TRIAL', 'EXPIRED', 'SUSPENDED', 'CANCELLED'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Début</label>
              <input type="date" value={form.starts_at} onChange={(e) => set('starts_at', e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Expiration</label>
              <input type="date" value={form.ends_at} onChange={(e) => set('ends_at', e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Montant payé (DT)</label>
            <input type="number" step="0.001" value={form.amount} onChange={(e) => set('amount', e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Référence paiement</label>
            <input type="text" value={form.payment_ref} onChange={(e) => set('payment_ref', e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Notes internes</label>
            <textarea rows={2} value={form.admin_notes} onChange={(e) => set('admin_notes', e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none" />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button type="button" onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50">
            Annuler
          </button>
          <button type="button" onClick={() => mutation.mutate(form)}
            disabled={mutation.isPending}
            className="flex-1 px-4 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 disabled:opacity-60 flex items-center justify-center gap-2">
            {mutation.isPending && <Loader2 size={14} className="animate-spin" />}
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Invoice create/edit modal ─────────────────────────────────────────────────

function InvoiceModal({ invoice, restaurants, onClose }) {
  const qc = useQueryClient();
  const isEdit = !!invoice;
  const [form, setForm] = useState({
    restaurant_id: invoice?.restaurant_id || '',
    amount:        invoice?.amount        || '',
    status:        invoice?.status        || 'PENDING',
    issued_at:     invoice?.issued_at     || new Date().toISOString().split('T')[0],
    due_at:        invoice?.due_at        || '',
    currency:      invoice?.currency      || 'DT',
  });

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  const mutation = useMutation({
    mutationFn: (data) => isEdit
      ? api.put(`/admin/invoices/${invoice.id}`, data)
      : api.post('/admin/invoices', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-invoices'] });
      toast.success(isEdit ? 'Facture mise à jour' : 'Facture créée');
      onClose();
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || err?.message || 'Erreur serveur';
      toast.error(msg);
    },
  });

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h3 className="text-base font-bold text-gray-900 mb-5">
          {isEdit ? 'Modifier la facture' : 'Nouvelle facture'}
        </h3>

        <div className="space-y-4">
          {!isEdit && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Restaurant</label>
              <select value={form.restaurant_id} onChange={(e) => set('restaurant_id', e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300">
                <option value="">Sélectionner...</option>
                {(restaurants || []).map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Montant TTC (DT)</label>
            <input type="number" step="0.001" value={form.amount} onChange={(e) => set('amount', e.target.value)}
              placeholder="0.000"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Statut</label>
            <select value={form.status} onChange={(e) => set('status', e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300">
              <option value="PENDING">En attente</option>
              <option value="PAID">Payée</option>
              <option value="CANCELLED">Annulée</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Date d'émission</label>
              <input type="date" value={form.issued_at} onChange={(e) => set('issued_at', e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Date d'échéance</label>
              <input type="date" value={form.due_at} onChange={(e) => set('due_at', e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300" />
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button type="button" onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50">
            Annuler
          </button>
          <button
            type="button"
            onClick={() => {
              const payload = {
                ...form,
                amount: parseFloat(form.amount) || 0,
              };
              mutation.mutate(payload);
            }}
            disabled={mutation.isPending || (!form.restaurant_id && !isEdit) || !form.amount || parseFloat(form.amount) <= 0}
            className="flex-1 px-4 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 disabled:opacity-60 flex items-center justify-center gap-2">
            {mutation.isPending && <Loader2 size={14} className="animate-spin" />}
            {isEdit ? 'Enregistrer' : 'Créer'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete confirm ────────────────────────────────────────────────────────────

function DeleteConfirm({ label, onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <h3 className="text-base font-bold text-gray-900 mb-2">Supprimer cette facture ?</h3>
        <p className="text-sm text-gray-500 mb-5">{label}</p>
        <div className="flex gap-3">
          <button type="button" onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50">
            Annuler
          </button>
          <button type="button" onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700">
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Pagination ────────────────────────────────────────────────────────────────

function Pagination({ page, pages, onPage }) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-end gap-2 px-6 py-3 border-t border-gray-100">
      <button type="button" onClick={() => onPage(page - 1)} disabled={page <= 1}
        className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
        <ChevronLeft size={14} />
      </button>
      <span className="text-xs text-gray-500">Page {page} / {pages}</span>
      <button type="button" onClick={() => onPage(page + 1)} disabled={page >= pages}
        className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
        <ChevronRight size={14} />
      </button>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function AdminBillingPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [tab, setTab] = useState('subscriptions');

  // ── Subscriptions state ──
  const [subPage, setSubPage]     = useState(1);
  const [subFilter, setSubFilter] = useState({ plan: '', status: '', search: '' });
  const [editSub, setEditSub]     = useState(null);

  // ── Invoices state ──
  const [invPage, setInvPage]       = useState(1);
  const [invFilter, setInvFilter]   = useState({ status: '', restaurant_id: '' });
  const [showNewInv, setShowNewInv] = useState(false);
  const [editInv, setEditInv]       = useState(null);
  const [deleteInv, setDeleteInv]   = useState(null);

  // ── Queries ──
  const { data: subsData, isLoading: subsLoading } = useQuery({
    queryKey: ['admin-subscriptions', subPage, subFilter],
    queryFn: () => {
      const p = new URLSearchParams({ page: subPage });
      if (subFilter.plan)   p.set('plan',   subFilter.plan);
      if (subFilter.status) p.set('status', subFilter.status);
      if (subFilter.search) p.set('search', subFilter.search);
      return api.get(`/admin/subscriptions?${p}`).then((r) => r.data);
    },
    enabled: tab === 'subscriptions',
  });

  const { data: invData, isLoading: invLoading } = useQuery({
    queryKey: ['admin-invoices', invPage, invFilter],
    queryFn: () => {
      const p = new URLSearchParams({ page: invPage });
      if (invFilter.status)        p.set('status',        invFilter.status);
      if (invFilter.restaurant_id) p.set('restaurant_id', invFilter.restaurant_id);
      return api.get(`/admin/invoices?${p}`).then((r) => r.data);
    },
    enabled: tab === 'invoices',
  });

  const { data: allRests } = useQuery({
    queryKey: ['admin-restaurants-list'],
    queryFn: () => api.get('/admin/restaurants?limit=200').then((r) => r.data.data.restaurants || []),
    staleTime: 5 * 60 * 1000,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/invoices/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-invoices'] });
      toast.success('Facture supprimée');
      setDeleteInv(null);
    },
    onError: () => toast.error('Erreur'),
  });

  const subs     = subsData?.data || [];
  const subsMeta = subsData?.meta || {};
  const invs     = invData?.data  || [];
  const invsMeta = invData?.meta  || {};

  async function downloadInvoicePdf(id, invoiceNumber) {
    try {
      const res = await api.get(`/admin/invoices/${id}/download`, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `facture-${invoiceNumber || id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Erreur lors du téléchargement');
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-orange-50 rounded-xl">
            <CreditCard size={20} className="text-orange-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Facturation</h1>
            <p className="text-sm text-gray-500">Gestion des abonnements et factures</p>
          </div>
        </div>
        {tab === 'invoices' && (
          <button type="button" onClick={() => setShowNewInv(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600">
            <Plus size={15} /> Nouvelle facture
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {[
          { key: 'subscriptions', label: 'Abonnements', icon: CreditCard },
          { key: 'invoices',      label: 'Factures',    icon: FileText },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              tab === key
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* ── SUBSCRIPTIONS TAB ────────────────────────────────────────────────── */}
      {tab === 'subscriptions' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Filters */}
          <div className="flex items-center gap-3 px-6 py-3 border-b border-gray-100 flex-wrap">
            <input
              type="text"
              placeholder="Rechercher un restaurant..."
              value={subFilter.search}
              onChange={(e) => { setSubFilter((f) => ({ ...f, search: e.target.value })); setSubPage(1); }}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-300 w-52"
            />
            <select value={subFilter.plan} onChange={(e) => { setSubFilter((f) => ({ ...f, plan: e.target.value })); setSubPage(1); }}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-300">
              <option value="">Tous les plans</option>
              {['FREE', 'STARTER', 'PRO', 'PREMIUM'].map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <select value={subFilter.status} onChange={(e) => { setSubFilter((f) => ({ ...f, status: e.target.value })); setSubPage(1); }}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-300">
              <option value="">Tous les statuts</option>
              {['ACTIVE', 'TRIAL', 'EXPIRED', 'SUSPENDED', 'CANCELLED'].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <span className="ml-auto text-xs text-gray-400">{subsMeta.total ?? 0} résultat(s)</span>
          </div>

          {/* Table */}
          {subsLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 size={24} className="animate-spin text-orange-400" />
            </div>
          ) : subs.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">Aucun abonnement</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-left">
                  {['Restaurant', 'Owner', 'Plan', 'Statut', 'Montant', 'Début', 'Expiration', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {subs.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{sub.restaurant?.name || '—'}</div>
                      <div className="text-xs text-gray-400">{sub.restaurant?.slug}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {sub.restaurant?.owner?.name || '—'}
                      <br />
                      <span className="text-gray-400">{sub.restaurant?.owner?.email}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-bold', PLAN_BADGE[sub.plan])}>
                        {sub.plan}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-semibold', SUB_STATUS_BADGE[sub.status])}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-800">
                      {fmt(sub.amount)}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{fmtDate(sub.starts_at)}</td>
                    <td className="px-4 py-3 text-xs">
                      <span className={cn(sub.status === 'EXPIRED' ? 'text-red-600 font-semibold' : 'text-gray-500')}>
                        {fmtDate(sub.ends_at)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button type="button" onClick={() => setEditSub(sub)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-orange-500 hover:bg-orange-50 border border-orange-100">
                        <Pencil size={11} /> Modifier
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <Pagination page={subPage} pages={subsMeta.pages || 1} onPage={setSubPage} />
        </div>
      )}

      {/* ── INVOICES TAB ──────────────────────────────────────────────────────── */}
      {tab === 'invoices' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Filters */}
          <div className="flex items-center gap-3 px-6 py-3 border-b border-gray-100 flex-wrap">
            <select value={invFilter.status} onChange={(e) => { setInvFilter((f) => ({ ...f, status: e.target.value })); setInvPage(1); }}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-300">
              <option value="">Tous les statuts</option>
              <option value="PENDING">En attente</option>
              <option value="PAID">Payées</option>
              <option value="CANCELLED">Annulées</option>
            </select>
            <select value={invFilter.restaurant_id} onChange={(e) => { setInvFilter((f) => ({ ...f, restaurant_id: e.target.value })); setInvPage(1); }}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-300 max-w-[200px]">
              <option value="">Tous les restaurants</option>
              {(allRests || []).map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
            <span className="ml-auto text-xs text-gray-400">{invsMeta.total ?? 0} facture(s)</span>
          </div>

          {/* Table */}
          {invLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 size={24} className="animate-spin text-orange-400" />
            </div>
          ) : invs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
              <FileText size={32} className="text-gray-200" />
              <p className="text-sm">Aucune facture</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-left">
                  {['N° Facture', 'Restaurant', 'Date', 'Échéance', 'Montant', 'Statut', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {invs.map((inv) => {
                  const st = INV_STATUS[inv.status] || INV_STATUS.PENDING;
                  return (
                    <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-700">
                        {inv.invoice_number || String(inv.id).slice(-8).toUpperCase()}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {inv.Restaurant?.name || inv.restaurant?.name || '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{fmtDate(inv.issued_at)}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{fmtDate(inv.due_at)}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900">{fmt(inv.amount)}</td>
                      <td className="px-4 py-3">
                        <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold', st.badge)}>
                          <st.icon size={10} /> {st.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => downloadInvoicePdf(inv.id, inv.invoice_number)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-orange-500 hover:bg-orange-50" title="PDF">
                            <Download size={13} />
                          </button>
                          <button type="button" onClick={() => setEditInv(inv)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-orange-500 hover:bg-orange-50" title="Modifier">
                            <Pencil size={13} />
                          </button>
                          <button type="button" onClick={() => setDeleteInv(inv)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50" title="Supprimer">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          <Pagination page={invPage} pages={invsMeta.pages || 1} onPage={setInvPage} />
        </div>
      )}

      {/* Modals */}
      {editSub && <SubscriptionModal sub={editSub} onClose={() => setEditSub(null)} />}
      {(showNewInv || editInv) && (
        <InvoiceModal
          invoice={editInv || null}
          restaurants={allRests || []}
          onClose={() => { setShowNewInv(false); setEditInv(null); }}
        />
      )}
      {deleteInv && (
        <DeleteConfirm
          label={`${deleteInv.invoice_number || ''} — ${fmt(deleteInv.amount)}`}
          onConfirm={() => deleteMutation.mutate(deleteInv.id)}
          onClose={() => setDeleteInv(null)}
        />
      )}
    </div>
  );
}
