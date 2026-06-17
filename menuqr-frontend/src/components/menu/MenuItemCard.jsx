import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Pencil, Trash2 } from 'lucide-react';
import api from '../../api/axios';
import { formatDT, isPromoActive, getEffectivePrice } from '../../utils/currency';
import { cn } from '../../lib/utils';

function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-orange-300 disabled:opacity-50',
        checked ? 'bg-green-500' : 'bg-gray-300'
      )}
    >
      <span className={cn(
        'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform',
        checked ? 'translate-x-4' : 'translate-x-0'
      )} />
    </button>
  );
}

export default function MenuItemCard({ item, menuId, categoryId, onEdit, onDelete }) {
  const { t, i18n } = useTranslation();
  const qc = useQueryClient();
  const [optimistic, setOptimistic] = useState(item.is_available);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    data: { type: 'item', categoryId },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const toggleMutation = useMutation({
    mutationFn: () => api.patch(`/items/${item.id}/toggle`),
    onMutate: () => setOptimistic((v) => !v),
    onError: () => setOptimistic((v) => !v),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['menu-categories', menuId] }),
  });

  const lang = ['fr', 'en', 'it', 'ar'].includes(i18n.language) ? i18n.language : 'fr';
  const name = item[`name_${lang}`] || item.name_fr;
  const promoActive = isPromoActive(item);
  const effectivePrice = getEffectivePrice(item);

  const variants = item.variants || [];
  const hasVariants = variants.length > 0;
  const minVariantPrice = hasVariants
    ? Math.min(...variants.map((v) => parseFloat(v.price) || 0))
    : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-3 shadow-sm',
        !optimistic && 'opacity-60'
      )}
    >
      {/* Drag handle */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing shrink-0 touch-none"
      >
        <GripVertical size={16} />
      </button>

      {/* Image */}
      {item.image_url ? (
        <img
          src={item.image_url}
          alt={name}
          loading="lazy"
          className="w-12 h-12 rounded-lg object-cover shrink-0"
        />
      ) : (
        <div className="w-12 h-12 rounded-lg bg-gray-100 shrink-0 flex items-center justify-center text-gray-300 text-lg">
          🍽
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-sm font-medium text-gray-900 truncate">{name}</span>
          {item.is_featured && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700 font-medium">
              {t('menu.popular')}
            </span>
          )}
          {promoActive && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-red-100 text-red-600 font-medium">
              {item.promo_label || t('menu.promo_badge')}
            </span>
          )}
          {!optimistic && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-gray-100 text-gray-500 font-medium">
              {t('menu.unavailable')}
            </span>
          )}
        </div>
        {item[`description_${lang}`] && (
          <p className="text-xs text-gray-400 truncate mt-0.5">{item[`description_${lang}`]}</p>
        )}
        <div className="flex items-center gap-2 mt-0.5">
          {hasVariants ? (
            <>
              <span className="text-xs text-gray-400">À partir de</span>
              <span className="text-sm text-orange-500 font-semibold">{formatDT(minVariantPrice, lang)}</span>
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-500 font-medium">
                {variants.length} taille{variants.length > 1 ? 's' : ''}
              </span>
            </>
          ) : (
            <>
              <span className="text-sm text-orange-500 font-semibold">{formatDT(effectivePrice, lang)}</span>
              {promoActive && (
                <span className="text-xs text-gray-400 line-through">{formatDT(parseFloat(item.price), lang)}</span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <Toggle
          checked={optimistic}
          onChange={() => toggleMutation.mutate()}
          disabled={toggleMutation.isPending}
        />
        <button
          type="button"
          onClick={() => onEdit(item)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-orange-500 hover:bg-orange-50"
        >
          <Pencil size={14} />
        </button>
        <button
          type="button"
          onClick={() => onDelete(item)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
