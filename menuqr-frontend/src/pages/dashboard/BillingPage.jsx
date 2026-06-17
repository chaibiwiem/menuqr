import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Download, Loader2, FileText, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { cn } from '../../lib/utils';
import PlanCard from '../../components/billing/PlanCard';

const STATUS_COLORS = {
  PAID:      'bg-green-100 text-green-700',
  PENDING:   'bg-amber-100 text-amber-700',
  CANCELLED: 'bg-gray-100 text-gray-500',
};

function fmt(amount, lang = 'fr') {
  return new Intl.NumberFormat(lang === 'ar' ? 'ar-TN' : `${lang}-TN`, {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(Number(amount) || 0) + ' DT';
}

function fmtDate(d, lang = 'fr') {
  if (!d) return '—';
  return new Date(d).toLocaleDateString(lang === 'ar' ? 'ar-TN' : `${lang}-TN`, {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

export default function BillingPage() {
  const { t, i18n } = useTranslation();
  const lang = ['fr', 'en', 'it', 'ar'].includes(i18n.language) ? i18n.language : 'fr';

  const { data: planData, isLoading: planLoading } = useQuery({
    queryKey: ['billing-plan'],
    queryFn: () => api.get('/billing/plan').then((r) => r.data.data),
  });

  const { data: invoicesData, isLoading: invoicesLoading } = useQuery({
    queryKey: ['billing-invoices'],
    queryFn: () => api.get('/billing/invoices').then((r) => r.data),
  });

  const invoices = invoicesData?.data || [];

  async function downloadInvoice(id, invoiceNumber) {
    try {
      const res = await api.get(`/billing/invoices/${id}/download`, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `facture-${invoiceNumber || id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      toast.error(t('billing.download_error', 'Erreur lors du téléchargement'));
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-orange-50 rounded-xl">
          <CreditCard size={20} className="text-orange-500" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{t('billing.title')}</h1>
          <p className="text-sm text-gray-500">{t('billing.current_plan')}</p>
        </div>
      </div>

      {/* Plan Card */}
      {planLoading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 size={28} className="animate-spin text-orange-500" />
        </div>
      ) : planData ? (
        <PlanCard subscription={planData.subscription} features={planData.features} />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center text-gray-400 text-sm">
          Aucun abonnement trouvé. Contactez Hannibal Advanced Solutions.
        </div>
      )}

      {/* Invoices */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <FileText size={16} className="text-gray-400" />
          <h2 className="text-sm font-bold text-gray-800">{t('billing.invoices')}</h2>
          {invoicesData?.meta?.total > 0 && (
            <span className="ml-auto text-xs text-gray-400">{invoicesData.meta.total} facture(s)</span>
          )}
        </div>

        {invoicesLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 size={22} className="animate-spin text-orange-400" />
          </div>
        ) : invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
            <FileText size={32} className="text-gray-200" />
            <p className="text-sm">{t('billing.no_invoices')}</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-left">
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {t('billing.invoice_number')}
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {t('billing.date', 'Date')}
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {t('billing.period')}
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {t('billing.amount')}
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {t('billing.status')}
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3.5 font-mono text-xs text-gray-700 font-semibold">
                    {inv.invoice_number || String(inv.id).slice(-8).toUpperCase()}
                  </td>
                  <td className="px-4 py-3.5 text-gray-600">
                    {fmtDate(inv.issued_at, lang)}
                  </td>
                  <td className="px-4 py-3.5 text-gray-500 text-xs">
                    {inv.issued_at && inv.due_at
                      ? `${fmtDate(inv.issued_at, lang)} — ${fmtDate(inv.due_at, lang)}`
                      : fmtDate(inv.issued_at, lang)}
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-gray-900">
                    {fmt(inv.amount, lang)}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-semibold', STATUS_COLORS[inv.status])}>
                      {t(`billing.status_${inv.status?.toLowerCase()}`, inv.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => downloadInvoice(inv.id, inv.invoice_number)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-orange-500 hover:bg-orange-50 border border-orange-100 transition-colors"
                    >
                      <Download size={12} />
                      {t('billing.download_pdf')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
