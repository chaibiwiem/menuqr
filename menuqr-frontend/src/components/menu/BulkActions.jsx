import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Loader2, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import api from '../../api/axios';

export default function BulkActions({ selectedIds, menuId, onDone }) {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const statusMutation = useMutation({
    mutationFn: (is_available) =>
      api.put('/items/bulk-status', { ids: selectedIds, is_available }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['menu-categories', menuId] });
      onDone();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () =>
      Promise.all(selectedIds.map((id) => api.delete(`/items/${id}`))),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['menu-categories', menuId] });
      onDone();
    },
  });

  const isPending = statusMutation.isPending || deleteMutation.isPending;

  return (
    <>
      <div className="sticky bottom-0 left-0 right-0 bg-gray-900 text-white px-4 py-3 flex items-center gap-3 rounded-t-2xl shadow-2xl">
        <span className="text-xs font-semibold text-gray-300 mr-1">
          {selectedIds.length} {t('common.selected')}
        </span>

        <div className="flex items-center gap-2 ml-auto">
          <button
            type="button"
            onClick={() => statusMutation.mutate(true)}
            disabled={isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-xs font-medium disabled:opacity-60"
          >
            {statusMutation.isPending && statusMutation.variables === true ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <CheckCircle size={12} />
            )}
            {t('menu.enable_selected')}
          </button>

          <button
            type="button"
            onClick={() => statusMutation.mutate(false)}
            disabled={isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-xs font-medium disabled:opacity-60"
          >
            {statusMutation.isPending && statusMutation.variables === false ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <XCircle size={12} />
            )}
            {t('menu.disable_selected')}
          </button>

          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            disabled={isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-700 hover:bg-red-800 text-xs font-medium disabled:opacity-60"
          >
            <Trash2 size={12} /> {t('menu.delete_selected')}
          </button>

          <button
            type="button"
            onClick={onDone}
            disabled={isPending}
            className="px-3 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-xs font-medium"
          >
            {t('common.cancel')}
          </button>
        </div>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-base font-bold text-gray-900 mb-2">
              {t('common.delete')} {selectedIds.length} plat{selectedIds.length > 1 ? 's' : ''} ?
            </h3>
            <p className="text-sm text-gray-500 mb-5">Cette action est irréversible.</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={() => { setConfirmDelete(false); deleteMutation.mutate(); }}
                disabled={deleteMutation.isPending}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-60 flex items-center justify-center"
              >
                {deleteMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
