import { useState, useRef, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, ChevronDown, ChevronRight, Plus, Pencil, Trash2, Loader2, Check, X } from 'lucide-react';
import api from '../../api/axios';
import { cn } from '../../lib/utils';
import MenuItemCard from './MenuItemCard';
import MenuItemForm from './MenuItemForm';
import BulkActions from './BulkActions';

// ─── Sortable Category Wrapper ────────────────────────────────────────────────

function SortableCategory({ category, menuId, children, dragHandleProps }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: category.id,
    data: { type: 'category' },
  });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  return (
    <div ref={setNodeRef} style={style}>
      {children({ dragHandle: { ...attributes, ...listeners } })}
    </div>
  );
}

// ─── Single Category Row ──────────────────────────────────────────────────────

function CategoryRow({ category, menuId, dragHandle, onReorderItems }) {
  const { t, i18n } = useTranslation();
  const qc = useQueryClient();
  const [expanded, setExpanded] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [nameVal, setNameVal] = useState('');
  const [showAddItem, setShowAddItem] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [selectedItems, setSelectedItems] = useState(new Set());

  const lang = ['fr', 'en', 'it', 'ar'].includes(i18n.language) ? i18n.language : 'fr';
  const catName = category[`name_${lang}`] || category.name_fr;
  const items = category.items || [];
  const activeCount = items.filter((i) => i.is_available).length;

  const updateMutation = useMutation({
    mutationFn: (data) => api.put(`/categories/${category.id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['menu-categories', menuId] });
      setEditingName(false);
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: () => api.delete(`/categories/${category.id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['menu-categories', menuId] }),
  });

  const deleteItemMutation = useMutation({
    mutationFn: (id) => api.delete(`/items/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['menu-categories', menuId] });
      setDeleteItem(null);
    },
  });

  function startEdit() {
    setNameVal(catName);
    setEditingName(true);
  }

  function toggleItemSelect(id) {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Category header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-gray-50/70 border-b border-gray-100">
        <button type="button" {...dragHandle} className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing shrink-0 touch-none">
          <GripVertical size={16} />
        </button>

        <button type="button" onClick={() => setExpanded((v) => !v)} className="text-gray-400 hover:text-gray-600 shrink-0">
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>

        {editingName ? (
          <form
            className="flex-1 flex items-center gap-2"
            onSubmit={(e) => { e.preventDefault(); if (nameVal.trim()) updateMutation.mutate({ name_fr: nameVal.trim() }); }}
          >
            <input
              autoFocus
              value={nameVal}
              onChange={(e) => setNameVal(e.target.value)}
              className="flex-1 px-2 py-1 text-sm rounded-lg border border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-200"
            />
            <button type="submit" className="text-green-600 hover:text-green-700"><Check size={14} /></button>
            <button type="button" onClick={() => setEditingName(false)} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
          </form>
        ) : (
          <div className="flex-1 flex items-center gap-2 min-w-0">
            <span className="text-sm font-semibold text-gray-800 truncate">{catName}</span>
            <span className="text-xs text-gray-400 shrink-0">{activeCount}/{items.length} {t('common.active')}</span>
          </div>
        )}

        {!editingName && (
          <div className="flex items-center gap-1 ml-auto shrink-0">
            <button type="button" onClick={startEdit} className="p-1.5 rounded-lg text-gray-400 hover:text-orange-500 hover:bg-orange-50">
              <Pencil size={13} />
            </button>
            <button
              type="button"
              onClick={() => { if (window.confirm(`Supprimer "${catName}" et tous ses plats ?`)) deleteCategoryMutation.mutate(); }}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 size={13} />
            </button>
          </div>
        )}
      </div>

      {/* Items list */}
      {expanded && (
        <div className="p-3 space-y-2">
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            {items.map((item) => (
              <div key={item.id} className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={selectedItems.has(item.id)}
                  onChange={() => toggleItemSelect(item.id)}
                  className="mt-4 h-4 w-4 rounded border-gray-300 accent-orange-500 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <MenuItemCard
                    item={item}
                    menuId={menuId}
                    categoryId={category.id}
                    onEdit={(i) => setEditingItem(i)}
                    onDelete={(i) => setDeleteItem(i)}
                  />
                </div>
              </div>
            ))}
          </SortableContext>

          {items.length === 0 && (
            <p className="text-xs text-center text-gray-400 py-4">{t('menu.no_items')}</p>
          )}

          <button
            type="button"
            onClick={() => { setEditingItem(null); setShowAddItem(true); }}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-dashed border-orange-200 text-xs font-medium text-orange-500 hover:bg-orange-50 mt-1"
          >
            <Plus size={13} /> {t('common.add')} plat
          </button>
        </div>
      )}

      {/* BulkActions bar */}
      {selectedItems.size > 0 && (
        <BulkActions
          selectedIds={[...selectedItems]}
          menuId={menuId}
          onDone={() => setSelectedItems(new Set())}
        />
      )}

      {/* Item form drawer */}
      {(showAddItem || editingItem) && (
        <MenuItemForm
          categoryId={category.id}
          menuId={menuId}
          item={editingItem}
          onClose={() => { setShowAddItem(false); setEditingItem(null); }}
        />
      )}

      {/* Delete item confirmation */}
      {deleteItem && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-base font-bold text-gray-900 mb-2">
              {t('common.delete')} "{deleteItem[`name_${lang}`] || deleteItem.name_fr}" ?
            </h3>
            <p className="text-sm text-gray-500 mb-5">Cette action est irréversible.</p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setDeleteItem(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50">
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={() => deleteItemMutation.mutate(deleteItem.id)}
                disabled={deleteItemMutation.isPending}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-60 flex items-center justify-center"
              >
                {deleteItemMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Add Category modal ───────────────────────────────────────────────────────

function AddCategoryModal({ menuId, onDone }) {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [name, setName] = useState('');

  const mutation = useMutation({
    mutationFn: () => api.post(`/menus/${menuId}/categories`, { name_fr: name.trim() }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['menu-categories', menuId] });
      onDone();
    },
  });

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <h3 className="text-base font-bold text-gray-900 mb-4">
          {t('common.add')} catégorie
        </h3>
        <form onSubmit={(e) => { e.preventDefault(); if (name.trim()) mutation.mutate(); }}>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nom de la catégorie (FR)..."
            className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300 mb-4"
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onDone}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={mutation.isPending || !name.trim()}
              className="flex-1 px-4 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {mutation.isPending && <Loader2 size={14} className="animate-spin" />}
              {t('common.add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main CategoryList ────────────────────────────────────────────────────────

export default function CategoryList({ menuId, menuName }) {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [localCategories, setLocalCategories] = useState([]);
  const reorderTimer = useRef(null);

  const { data, isLoading } = useQuery({
    queryKey: ['menu-categories', menuId],
    queryFn: () => api.get(`/menus/${menuId}/categories`).then((r) => r.data.data),
  });

  useEffect(() => {
    if (data) setLocalCategories(data);
  }, [data]);

  const reorderMutation = useMutation({
    mutationFn: (items) => api.put('/categories/reorder', { items }),
  });

  const reorderItemsMutation = useMutation({
    mutationFn: (items) => api.put('/items/reorder', { items }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['menu-categories', menuId] }),
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeType = active.data?.current?.type;
    const overType = over.data?.current?.type;

    if (activeType === 'category') {
      const oldIdx = localCategories.findIndex((c) => c.id === active.id);
      const newIdx = localCategories.findIndex((c) => c.id === over.id);
      if (oldIdx === -1 || newIdx === -1) return;
      const reordered = arrayMove(localCategories, oldIdx, newIdx);
      setLocalCategories(reordered);

      clearTimeout(reorderTimer.current);
      reorderTimer.current = setTimeout(() => {
        reorderMutation.mutate(reordered.map((c, idx) => ({ id: c.id, sort_order: idx })));
      }, 500);
    }

    if (activeType === 'item') {
      const activeCatId = active.data.current.categoryId;
      const overCatId = over.data?.current?.categoryId || over.id;
      const newCats = localCategories.map((cat) => {
        if (cat.id === activeCatId) {
          const items = cat.items || [];
          const activeIdx = items.findIndex((i) => i.id === active.id);
          if (cat.id === overCatId) {
            const overIdx = items.findIndex((i) => i.id === over.id);
            return { ...cat, items: arrayMove(items, activeIdx, overIdx) };
          }
          return { ...cat, items: items.filter((i) => i.id !== active.id) };
        }
        if (cat.id === overCatId && activeCatId !== overCatId) {
          const movedItem = localCategories.find((c) => c.id === activeCatId)?.items?.find((i) => i.id === active.id);
          if (!movedItem) return cat;
          const items = [...(cat.items || []), { ...movedItem, category_id: overCatId }];
          return { ...cat, items };
        }
        return cat;
      });
      setLocalCategories(newCats);

      // Persist all affected items' sort_order + category_id
      const allItems = [];
      newCats.forEach((cat) => {
        (cat.items || []).forEach((item, idx) => {
          allItems.push({ id: item.id, sort_order: idx, category_id: cat.id });
        });
      });
      clearTimeout(reorderTimer.current);
      reorderTimer.current = setTimeout(() => {
        reorderItemsMutation.mutate(allItems);
      }, 500);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 size={28} className="animate-spin text-orange-400" />
      </div>
    );
  }

  const categories = localCategories.length > 0 ? localCategories : (data || []);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl font-bold text-gray-900">{menuName}</h1>
        <button
          type="button"
          onClick={() => setShowAddCategory(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-medium hover:bg-orange-600"
        >
          <Plus size={15} /> {t('common.add')} catégorie
        </button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={categories.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {categories.map((cat) => (
            <SortableCategory key={cat.id} category={cat} menuId={menuId}>
              {({ dragHandle }) => (
                <CategoryRow
                  category={cat}
                  menuId={menuId}
                  dragHandle={dragHandle}
                />
              )}
            </SortableCategory>
          ))}
        </SortableContext>
      </DndContext>

      {categories.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-sm">Aucune catégorie — ajoutez-en une pour commencer</p>
        </div>
      )}

      {showAddCategory && (
        <AddCategoryModal menuId={menuId} onDone={() => setShowAddCategory(false)} />
      )}
    </div>
  );
}
