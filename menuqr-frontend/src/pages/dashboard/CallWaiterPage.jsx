import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Bell, BellOff, CheckCircle, Download,
  Loader2, Filter, Clock, AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../lib/utils';

const TYPE_LABELS  = { WAITER: 'Appel serveur', CHECK: "Demande d'addition", OTHER: 'Autre' };
const TYPE_COLORS  = { WAITER: 'bg-blue-50 text-blue-700', CHECK: 'bg-orange-50 text-orange-700', OTHER: 'bg-gray-100 text-gray-600' };
const TYPE_ICONS   = { WAITER: '🔔', CHECK: '💳', OTHER: '💬' };
const STATUS_LABELS = { PENDING: 'En attente', IN_PROGRESS: 'En cours', DONE: 'Résolu' };
const STATUS_COLORS = {
  PENDING:     'bg-amber-50 text-amber-700 border border-amber-200',
  IN_PROGRESS: 'bg-blue-50 text-blue-700 border border-blue-200',
  DONE:        'bg-green-50 text-green-700 border border-green-200',
};

function formatDuration(seconds) {
  if (!seconds && seconds !== 0) return '—';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m >= 60) return `${Math.floor(m / 60)}h ${m % 60}m`;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function formatTime(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function ageLabel(createdAt) {
  if (!createdAt) return '';
  const diffMs = Date.now() - new Date(createdAt).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return '< 1 min';
  if (diffMin < 60) return `${diffMin} min`;
  return `${Math.floor(diffMin / 60)}h ${diffMin % 60}m`;
}

export default function CallWaiterPage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const restaurantId = user?.restaurant_id;
  const qc = useQueryClient();

  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType]     = useState('');
  const [filterDate, setFilterDate]     = useState('');

  const { data: statsData } = useQuery({
    queryKey: ['call-waiter-stats'],
    queryFn: () => api.get('/call-waiter/stats').then((r) => r.data.data),
    refetchInterval: 30_000,
    enabled: ['OWNER', 'MANAGER'].includes(user?.role),
  });

  const queryParams = new URLSearchParams();
  if (filterStatus) queryParams.set('status', filterStatus);
  if (filterType)   queryParams.set('type', filterType);
  if (filterDate) {
    queryParams.set('date_from', filterDate);
    queryParams.set('date_to', filterDate);
  }

  const { data: callsData, isLoading } = useQuery({
    queryKey: ['call-waiter-list', restaurantId, filterStatus, filterType, filterDate],
    queryFn: () => api.get(`/call-waiter?${queryParams}`).then((r) => r.data.data),
    enabled: !!restaurantId,
    refetchInterval: 15_000,
  });

  const resolveMutation = useMutation({
    mutationFn: (id) => api.put(`/call-waiter/${id}/resolve`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['call-waiter-list'] });
      qc.invalidateQueries({ queryKey: ['call-waiter-stats'] });
      qc.invalidateQueries({ queryKey: ['table-calls'] });
      toast.success('Appel résolu');
    },
    onError: () => toast.error('Erreur lors de la résolution'),
  });

  const calls = callsData || [];
  const canResolve = ['OWNER', 'MANAGER', 'STAFF', 'CASHIER'].includes(user?.role);
  const showStats  = ['OWNER', 'MANAGER'].includes(user?.role);

  function exportCSV() {
    const header = 'Date,Heure,Table,Type,Message,Statut,Résolu à\n';
    const rows = calls.map((c) =>
      [
        formatDate(c.created_at),
        formatTime(c.created_at),
        c.table?.name || '',
        TYPE_LABELS[c.type] || c.type,
        (c.message || '').replace(/[,\n]/g, ' '),
        STATUS_LABELS[c.status] || c.status,
        c.resolved_at ? formatTime(c.resolved_at) : '',
      ].join(',')
    ).join('\n');
    const blob = new Blob(['﻿' + header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `appels-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const pendingCalls  = calls.filter((c) => c.status === 'PENDING');
  const hasOldCalls   = pendingCalls.some(
    (c) => c.created_at && Date.now() - new Date(c.created_at).getTime() > 5 * 60 * 1000
  );

  return (
    <div className="flex flex-col h-full">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="px-6 py-4 border-b border-gray-100 bg-white shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-gray-900">
              {t('call_waiter.title', 'Appels en salle')}
            </h1>
            {statsData?.pending_count > 0 && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold animate-pulse">
                <Bell size={11} /> {statsData.pending_count}
              </span>
            )}
            {hasOldCalls && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-xs font-semibold">
                <AlertTriangle size={11} /> +5 min sans réponse
              </span>
            )}
          </div>

          {canResolve && (
            <button
              type="button"
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50"
            >
              <Download size={14} /> Exporter CSV
            </button>
          )}
        </div>

        {/* Stats strip */}
        {showStats && (
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-700 bg-amber-50">
              <Bell size={12} />
              <span className="text-base font-bold">{statsData?.pending_count ?? 0}</span>
              <span>En attente</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-orange-600 bg-orange-50">
              <span className="text-base font-bold">{statsData?.today_total ?? 0}</span>
              <span>Aujourd'hui</span>
            </div>
            {statsData?.avg_resolution_seconds != null && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-green-700 bg-green-50">
                <Clock size={12} />
                <span>Moy. {formatDuration(statsData.avg_resolution_seconds)}</span>
              </div>
            )}
            {statsData?.by_type && Object.entries(statsData.by_type).map(([type, count]) => (
              <div key={type} className={cn('flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold', TYPE_COLORS[type])}>
                <span>{TYPE_ICONS[type]}</span>
                <span className="font-bold">{count}</span>
                <span>{TYPE_LABELS[type]}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Filters ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-6 py-3 bg-white border-b border-gray-100 shrink-0 flex-wrap">
        <Filter size={14} className="text-gray-400 shrink-0" />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-300"
        >
          <option value="">Tous les statuts</option>
          <option value="PENDING">En attente</option>
          <option value="DONE">Résolu</option>
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-300"
        >
          <option value="">Tous les types</option>
          <option value="WAITER">Appel serveur</option>
          <option value="CHECK">Demande addition</option>
          <option value="OTHER">Autre</option>
        </select>
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-300"
        />
        {(filterStatus || filterType || filterDate) && (
          <button
            type="button"
            onClick={() => { setFilterStatus(''); setFilterType(''); setFilterDate(''); }}
            className="text-xs text-orange-500 hover:text-indigo-800 px-2 py-1.5 rounded-lg hover:bg-orange-50"
          >
            Réinitialiser
          </button>
        )}
        <span className="ml-auto text-xs text-gray-400">
          {calls.length} résultat{calls.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Table ───────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 size={28} className="animate-spin text-orange-500" />
          </div>
        ) : calls.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
            <div className="p-5 bg-gray-100 rounded-2xl">
              <BellOff size={36} className="text-gray-300" />
            </div>
            <div className="text-center">
              <p className="font-medium text-gray-600">Aucun appel</p>
              <p className="text-sm text-gray-400 mt-1">
                {filterStatus || filterType || filterDate
                  ? 'Aucun résultat pour ces filtres.'
                  : 'Les appels apparaîtront ici lorsque les clients scanneront le QR.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left">
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Table</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Message</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Heure</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Âge</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Statut</th>
                  {canResolve && <th className="px-4 py-3" />}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {calls.map((call) => {
                  const ageMs = call.created_at ? Date.now() - new Date(call.created_at).getTime() : 0;
                  const isOld = call.status === 'PENDING' && ageMs > 5 * 60 * 1000;
                  return (
                    <tr
                      key={call.id}
                      className={cn(
                        'hover:bg-gray-50 transition-colors',
                        isOld && 'bg-red-50 hover:bg-red-100'
                      )}
                    >
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        {call.table?.name || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', TYPE_COLORS[call.type])}>
                          {TYPE_ICONS[call.type]} {TYPE_LABELS[call.type]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate">
                        {call.message || <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-500 font-mono text-xs whitespace-nowrap">
                        {formatTime(call.created_at)}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                        {call.status === 'PENDING' ? (
                          <span className={cn(isOld ? 'text-red-600 font-bold' : '')}>
                            {ageLabel(call.created_at)}
                            {isOld && ' ⚠'}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn('inline-flex px-2 py-0.5 rounded-full text-xs font-medium', STATUS_COLORS[call.status])}>
                          {STATUS_LABELS[call.status] || call.status}
                        </span>
                      </td>
                      {canResolve && (
                        <td className="px-4 py-3">
                          {call.status === 'PENDING' && (
                            <button
                              type="button"
                              onClick={() => resolveMutation.mutate(call.id)}
                              disabled={resolveMutation.isPending}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-50 text-green-700 text-xs font-medium hover:bg-green-100 disabled:opacity-50 whitespace-nowrap"
                            >
                              {resolveMutation.isPending
                                ? <Loader2 size={11} className="animate-spin" />
                                : <CheckCircle size={11} />}
                              Résoudre
                            </button>
                          )}
                          {call.status === 'DONE' && call.resolved_at && (
                            <span className="text-xs text-gray-400 font-mono">
                              {formatTime(call.resolved_at)}
                            </span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
