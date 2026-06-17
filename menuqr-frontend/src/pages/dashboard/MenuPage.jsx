import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Plus, MoreVertical, ToggleLeft, ToggleRight, Trash2, Loader2, Pencil } from 'lucide-react';
import api from '../../api/axios';
import CategoryList from '../../components/menu/CategoryList';
import { cn } from '../../lib/utils';

function MenuActionsMenu({ menu, onToggle, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"
      >
        <MoreVertical size={14} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-7 z-20 bg-white rounded-xl shadow-lg border border-gray-100 py-1 min-w-[150px]">
            <button
              type="button"
              onClick={() => { onEdit(); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
            >
              <Pencil size={13} /> {t('common.edit')}
            </button>
            <button
              type="button"
              onClick={() => { onToggle(); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
            >
              {menu.is_active ? <ToggleLeft size={13} /> : <ToggleRight size={13} />}
              {menu.is_active ? t('common.inactive') : t('common.active')}
            </button>
            <hr className="my-1 border-gray-100" />
            <button
              type="button"
              onClick={() => { onDelete(); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50"
            >
              <Trash2 size={13} /> {t('common.delete')}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function MenuPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [selectedMenuId, setSelectedMenuId] = useState(null);
  const [showNewMenu, setShowNewMenu] = useState(false);
  const [newMenuName, setNewMenuName] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [editMenu, setEditMenu] = useState(null);
  const [editMenuName, setEditMenuName] = useState('');

  const { data: menus, isLoading } = useQuery({
    queryKey: ['menus'],
    queryFn: () => api.get('/menus').then((r) => r.data.data),
  });

  useEffect(() => {
    if (menus?.length > 0 && !selectedMenuId) {
      setSelectedMenuId(menus[0].id);
    }
  }, [menus]);

  const createMutation = useMutation({
    mutationFn: (name) => api.post('/menus', { name }).then((r) => r.data.data),
    onSuccess: (menu) => {
      qc.invalidateQueries({ queryKey: ['menus'] });
      setSelectedMenuId(menu.id);
      setShowNewMenu(false);
      setNewMenuName('');
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }) => api.put(`/menus/${id}`, { is_active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['menus'] }),
  });

  const renameMutation = useMutation({
    mutationFn: ({ id, name }) => api.put(`/menus/${id}`, { name }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['menus'] });
      setEditMenu(null);
      setEditMenuName('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/menus/${id}`),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['menus'] });
      if (selectedMenuId === id) setSelectedMenuId(null);
      setConfirmDelete(null);
    },
  });

  const menuList = menus || [];

  return (
    <div className="flex h-full bg-gray-50 overflow-hidden">
      {/* Left sidebar — menus list */}
      <aside className="w-60 shrink-0 bg-white border-r border-gray-100 flex flex-col">
        {/* Header + button */}
        <div className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide shrink-0">{t('dashboard.menu')}</h2>
          <button
            type="button"
            onClick={() => setShowNewMenu(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600 transition-colors shrink-0"
          >
            <Plus size={12} /> {t('common.add')}
          </button>
        </div>

        {/* Menu list */}
        <div className="flex-1 overflow-auto p-2 space-y-0.5">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 size={18} className="animate-spin text-orange-400" />
            </div>
          ) : menuList.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-6">Aucun menu</p>
          ) : (
            menuList.map((menu) => (
              <div
                key={menu.id}
                onClick={() => setSelectedMenuId(menu.id)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer group transition-colors',
                  selectedMenuId === menu.id
                    ? 'bg-orange-50 text-orange-600'
                    : 'text-gray-600 hover:bg-gray-50'
                )}
              >
                <div className={cn('w-2 h-2 rounded-full shrink-0', menu.is_active ? 'bg-green-400' : 'bg-gray-300')} />
                <span className="flex-1 text-sm font-medium truncate">{menu.name}</span>
                <MenuActionsMenu
                  menu={menu}
                  onToggle={() => toggleMutation.mutate({ id: menu.id, is_active: !menu.is_active })}
                  onEdit={() => { setEditMenu(menu); setEditMenuName(menu.name); }}
                  onDelete={() => setConfirmDelete(menu)}
                />
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Main content — categories + items */}
      <main className="flex-1 overflow-auto">
        {selectedMenuId ? (
          <CategoryList
            menuId={selectedMenuId}
            menuName={menuList.find((m) => m.id === selectedMenuId)?.name || ''}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
              <Plus size={28} className="text-gray-300" />
            </div>
            <p className="text-sm">
              {menuList.length === 0 ? 'Créez votre premier menu' : 'Sélectionnez un menu'}
            </p>
          </div>
        )}
      </main>

      {/* New menu modal */}
      {showNewMenu && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-base font-bold text-gray-900 mb-4">{t('common.add')} menu</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newMenuName.trim()) createMutation.mutate(newMenuName.trim());
              }}
            >
              <input
                autoFocus
                value={newMenuName}
                onChange={(e) => setNewMenuName(e.target.value)}
                placeholder="Nom du menu..."
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300 mb-4"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setShowNewMenu(false); setNewMenuName(''); }}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || !newMenuName.trim()}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {createMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                  {t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit menu modal */}
      {editMenu && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-base font-bold text-gray-900 mb-4">{t('common.edit')} menu</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (editMenuName.trim() && editMenuName.trim() !== editMenu.name) {
                  renameMutation.mutate({ id: editMenu.id, name: editMenuName.trim() });
                } else {
                  setEditMenu(null);
                  setEditMenuName('');
                }
              }}
            >
              <input
                autoFocus
                value={editMenuName}
                onChange={(e) => setEditMenuName(e.target.value)}
                placeholder="Nom du menu..."
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300 mb-4"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setEditMenu(null); setEditMenuName(''); }}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={renameMutation.isPending || !editMenuName.trim()}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {renameMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                  {t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-base font-bold text-gray-900 mb-2">{t('common.delete')} "{confirmDelete.name}" ?</h3>
            <p className="text-sm text-gray-500 mb-5">Toutes les catégories et plats seront supprimés. Cette action est irréversible.</p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setConfirmDelete(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50">
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={() => deleteMutation.mutate(confirmDelete.id)}
                disabled={deleteMutation.isPending}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-60"
              >
                {deleteMutation.isPending ? <Loader2 size={14} className="animate-spin mx-auto" /> : t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
