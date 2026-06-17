import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  X, Loader2, Users, MapPin, QrCode,
  ArrowRightLeft, Merge, Unlock, Pencil, Trash2, Plus,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { formatDT } from '../../utils/currency';
import { STATUS_COLORS } from './TableBadge';
import QRCodeGenerator from './QRCodeGenerator';
import NewOrderDrawer from '../pos/NewOrderDrawer';
import { useAuthStore } from '../../store/authStore';

const STATUS_LABELS = {
  LIBRE:      'tables.status_libre',
  OCCUPEE:    'tables.status_occupee',
  RESERVEE:   'tables.status_reservee',
  EN_ATTENTE: 'tables.status_en_attente',
  DESACTIVEE: 'tables.status_desactivee',
};

const STATUSES = ['LIBRE', 'OCCUPEE', 'RESERVEE', 'EN_ATTENTE', 'DESACTIVEE'];

export default function TableDetail({ tableId, restaurantSlug, restaurantLogoUrl, canManageTables, onClose, onEdit, onDelete, onRefresh }) {
  const { t, i18n } = useTranslation();
  const lang = ['fr', 'en', 'it', 'ar'].includes(i18n.language) ? i18n.language : 'fr';
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const canOrder   = ['OWNER', 'MANAGER', 'CASHIER', 'STAFF'].includes(user?.role);
  const canOperate = ['OWNER', 'MANAGER', 'STAFF', 'CASHIER'].includes(user?.role); // status/free/merge — operational, not structural

  const [showQR, setShowQR] = useState(false);
  const [showMerge, setShowMerge] = useState(false);
  const [mergeTargetId, setMergeTargetId] = useState('');
  const [showNewOrder, setShowNewOrder] = useState(false);

  const { data: tableData, isLoading } = useQuery({
    queryKey: ['table-detail', tableId],
    queryFn: () => api.get(`/tables/${tableId}`).then((r) => r.data.data),
    enabled: !!tableId,
    refetchInterval: 15_000,
  });

  const { data: allTablesData } = useQuery({
    queryKey: ['tables'],
    queryFn: () => api.get('/tables').then((r) => r.data.data),
  });

  const statusMutation = useMutation({
    mutationFn: ({ status }) => api.put(`/tables/${tableId}/status`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['table-detail', tableId] });
      qc.invalidateQueries({ queryKey: ['tables'] });
      onRefresh?.();
      toast.success(t('common.save'));
    },
    onError: () => toast.error(t('common.error')),
  });

  const freeMutation = useMutation({
    mutationFn: () => api.put(`/tables/${tableId}/status`, { status: 'LIBRE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['table-detail', tableId] });
      qc.invalidateQueries({ queryKey: ['tables'] });
      onRefresh?.();
      toast.success(t('tables.free_table'));
    },
  });

  const mergeMutation = useMutation({
    mutationFn: () =>
      api.post('/tables/merge', { source_table_id: tableId, target_table_id: mergeTargetId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tables'] });
      onRefresh?.();
      toast.success(t('tables.merge_tables'));
      setShowMerge(false);
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.message || t('common.error')),
  });

  const regenMutation = useMutation({
    mutationFn: () => api.post(`/tables/${tableId}/regenerate-qr`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['table-detail', tableId] });
      qc.invalidateQueries({ queryKey: ['tables'] });
      toast.success(t('tables.regenerate_qr'));
    },
  });

  const table = tableData;
  const allTables = (allTablesData || []).filter((t) => t.id !== tableId);
  const activeOrder = table?.orders?.[0] || null;
  const colors = table ? STATUS_COLORS[table.status] : STATUS_COLORS.LIBRE;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      {/* Sheet */}
      <div className="fixed inset-y-0 end-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b shrink-0"
          style={{ borderColor: '#e5e7eb' }}
        >
          <div className="flex items-center gap-3">
            {table && (
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: colors.bg }}
              />
            )}
            <h2 className="text-base font-bold text-gray-900">
              {table?.name || '...'}
            </h2>
            {table && (
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ backgroundColor: colors.bg + '22', color: colors.bg }}
              >
                {t(STATUS_LABELS[table.status])}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 size={24} className="animate-spin text-orange-400" />
            </div>
          ) : table ? (
            <>
              {/* Info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                    <Users size={12} /> {t('tables.capacity')}
                  </div>
                  <div className="text-lg font-bold text-gray-900">{table.capacity}</div>
                </div>
                {table.room && (
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                      <MapPin size={12} /> {t('tables.zone')}
                    </div>
                    <div className="text-sm font-semibold text-gray-900">{table.room.name}</div>
                  </div>
                )}
              </div>

              {/* Active order */}
              {activeOrder && (
                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
                  <h3 className="text-sm font-bold text-orange-800 mb-2">
                    {t('tables.current_order')}
                  </h3>
                  <div className="space-y-1">
                    {(activeOrder.items || []).slice(0, 4).map((item) => (
                      <div key={item.id} className="flex justify-between text-xs text-orange-700">
                        <span>{item.quantity} × {item.name_snapshot}</span>
                        <span>{formatDT(parseFloat(item.unit_price) * item.quantity, lang)}</span>
                      </div>
                    ))}
                    {(activeOrder.items || []).length > 4 && (
                      <p className="text-xs text-orange-500">+{activeOrder.items.length - 4} article(s)</p>
                    )}
                  </div>
                  <div className="flex justify-between mt-2 pt-2 border-t border-orange-200">
                    <span className="text-xs font-bold text-orange-800">{t('common.total')}</span>
                    <span className="text-sm font-bold text-orange-900">
                      {formatDT(parseFloat(activeOrder.total), lang)}
                    </span>
                  </div>
                </div>
              )}

              {/* Nouvelle commande */}
              {canOrder && !activeOrder && table.status !== 'DESACTIVEE' && (
                <button
                  type="button"
                  onClick={() => setShowNewOrder(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 transition-colors shadow-sm"
                >
                  <Plus size={16} />
                  Nouvelle commande
                </button>
              )}

              {/* QR code section */}
              <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{t('tables.view_qr')}</p>
                  <p className="text-xs text-gray-500 mt-0.5 font-mono">
                    {restaurantSlug}/{table.qr_token?.slice(0, 8)}...
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowQR(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600"
                  >
                    <QrCode size={14} /> {t('tables.view_qr')}
                  </button>
                  {canManageTables && (
                    <button
                      type="button"
                      onClick={() => regenMutation.mutate()}
                      disabled={regenMutation.isPending}
                      className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                      title={t('tables.regenerate_qr')}
                    >
                      {regenMutation.isPending ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : '↺'}
                    </button>
                  )}
                </div>
              </div>

              {/* Status change */}
              {canOperate && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                    {t('common.status')}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {STATUSES.filter((s) => s !== table.status).map((s) => {
                      const c = STATUS_COLORS[s];
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => statusMutation.mutate({ status: s })}
                          disabled={statusMutation.isPending}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-colors hover:opacity-80 disabled:opacity-50"
                          style={{ borderColor: c.bg + '44', backgroundColor: c.bg + '11', color: c.bg }}
                        >
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.bg }} />
                          {t(STATUS_LABELS[s])}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Actions — operational (status/merge), open to floor staff */}
              {canOperate && (
                <div className="space-y-2">
                  {table.status !== 'LIBRE' && (
                    <button
                      type="button"
                      onClick={() => freeMutation.mutate()}
                      disabled={freeMutation.isPending}
                      className="w-full flex items-center gap-2 px-4 py-3 rounded-xl border border-green-200 text-green-700 text-sm font-medium hover:bg-green-50 disabled:opacity-50"
                    >
                      <Unlock size={15} /> {t('tables.free_table')}
                    </button>
                  )}

                  {activeOrder && (
                    <button
                      type="button"
                      onClick={() => setShowMerge(true)}
                      className="w-full flex items-center gap-2 px-4 py-3 rounded-xl border border-blue-200 text-blue-700 text-sm font-medium hover:bg-blue-50"
                    >
                      <Merge size={15} /> {t('tables.merge_tables')}
                    </button>
                  )}
                </div>
              )}

              {/* Actions — structural (edit/delete table), OWNER/MANAGER only */}
              {canManageTables && (
                <div className="space-y-2">
                  {onEdit && (
                    <button
                      type="button"
                      onClick={onEdit}
                      className="w-full flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50"
                    >
                      <Pencil size={15} /> Modifier la table
                    </button>
                  )}

                  {onDelete && (
                    <button
                      type="button"
                      onClick={onDelete}
                      className="w-full flex items-center gap-2 px-4 py-3 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50"
                    >
                      <Trash2 size={15} /> Supprimer la table
                    </button>
                  )}
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-500 text-center">{t('common.error')}</p>
          )}
        </div>
      </div>

      {/* QR Modal */}
      {showQR && table && (
        <QRCodeGenerator
          table={table}
          restaurantSlug={restaurantSlug}
          restaurantLogoUrl={restaurantLogoUrl}
          onClose={() => setShowQR(false)}
          onRegenerate={() => regenMutation.mutate()}
        />
      )}

      {/* New Order Drawer */}
      {showNewOrder && table && (
        <NewOrderDrawer
          table={table}
          lang={lang}
          onClose={() => setShowNewOrder(false)}
          onOrderCreated={() => {
            setShowNewOrder(false);
            qc.invalidateQueries({ queryKey: ['table-detail', tableId] });
            qc.invalidateQueries({ queryKey: ['tables'] });
            qc.invalidateQueries({ queryKey: ['rooms'] });
            qc.invalidateQueries({ queryKey: ['pos-tables'] });
            onRefresh?.();
          }}
        />
      )}

      {/* Merge Modal */}
      {showMerge && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-base font-bold text-gray-900 mb-1">{t('tables.merge_tables')}</h3>
            <p className="text-xs text-gray-500 mb-4">
              Déplacer les commandes de <b>{table?.name}</b> vers :
            </p>
            <select
              value={mergeTargetId}
              onChange={(e) => setMergeTargetId(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none mb-4"
            >
              <option value="">Choisir une table...</option>
              {allTables.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowMerge(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={() => mergeMutation.mutate()}
                disabled={!mergeTargetId || mergeMutation.isPending}
                className="flex-1 px-4 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {mergeMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                <ArrowRightLeft size={14} /> Fusionner
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
