import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Plus, ChevronDown, ChevronRight, Trash2, Pencil, Check, X, Loader2 } from 'lucide-react';
import api from '../../api/axios';
import { formatDT } from '../../utils/currency';
import { cn } from '../../lib/utils';

const LANGS = ['fr', 'en', 'it', 'ar'];
const LANG_LABELS = { fr: 'FR', en: 'EN', it: 'IT', ar: 'AR' };

function LangTabs({ active, onChange }) {
  return (
    <div className="flex gap-1 mb-3">
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => onChange(l)}
          className={cn(
            'px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors',
            active === l ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          )}
        >
          {LANG_LABELS[l]}
        </button>
      ))}
    </div>
  );
}

// ─── Option Row ───────────────────────────────────────────────────────────────

function OptionRow({ option, groupId, onDelete }) {
  const { t, i18n } = useTranslation();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [lang, setLang] = useState('fr');
  const [form, setForm] = useState({ name_fr: '', name_en: '', name_it: '', name_ar: '', extra_price: '0', is_available: true });

  function startEdit() {
    setForm({
      name_fr: option.name_fr || '', name_en: option.name_en || '',
      name_it: option.name_it || '', name_ar: option.name_ar || '',
      extra_price: String(parseFloat(option.extra_price) || 0),
      is_available: option.is_available,
    });
    setEditing(true);
  }

  const updateMutation = useMutation({
    mutationFn: (data) => api.put(`/supplement-options/${option.id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['item-detail'] }); setEditing(false); },
  });

  const displayLang = ['fr', 'en', 'it', 'ar'].includes(i18n.language) ? i18n.language : 'fr';
  const name = option[`name_${displayLang}`] || option.name_fr;
  const price = parseFloat(option.extra_price) || 0;

  if (editing) {
    return (
      <div className="bg-gray-50 rounded-xl p-3 border border-orange-200">
        <LangTabs active={lang} onChange={setLang} />
        <input
          value={form[`name_${lang}`]}
          onChange={(e) => setForm((f) => ({ ...f, [`name_${lang}`]: e.target.value }))}
          placeholder={`Nom (${lang.toUpperCase()})`}
          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-200 mb-2"
        />
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">{t('menu.price')} +DT</label>
            <input
              type="number"
              step="0.001"
              min="0"
              value={form.extra_price}
              onChange={(e) => setForm((f) => ({ ...f, extra_price: e.target.value }))}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-200"
            />
          </div>
          <label className="flex items-center gap-1.5 cursor-pointer mt-4">
            <input type="checkbox" checked={form.is_available} onChange={(e) => setForm((f) => ({ ...f, is_available: e.target.checked }))} className="h-4 w-4 rounded accent-orange-500" />
            <span className="text-xs text-gray-600">{t('common.active')}</span>
          </label>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => updateMutation.mutate({ ...form, extra_price: parseFloat(form.extra_price) || 0 })}
            disabled={updateMutation.isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-medium disabled:opacity-60"
          >
            {updateMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} {t('common.save')}
          </button>
          <button type="button" onClick={() => setEditing(false)} className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600">
            {t('common.cancel')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 group">
      <div className={cn('w-2 h-2 rounded-full shrink-0', option.is_available ? 'bg-green-400' : 'bg-gray-300')} />
      <span className="flex-1 text-sm text-gray-700">{name}</span>
      {price > 0 && (
        <span className="text-xs text-orange-500 font-medium">+{formatDT(price, displayLang)}</span>
      )}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button type="button" onClick={startEdit} className="p-1 rounded text-gray-400 hover:text-orange-500"><Pencil size={12} /></button>
        <button type="button" onClick={() => onDelete(option.id)} className="p-1 rounded text-gray-400 hover:text-red-600"><Trash2 size={12} /></button>
      </div>
    </div>
  );
}

// ─── Add Option Form ──────────────────────────────────────────────────────────

function AddOptionForm({ groupId, onDone }) {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [lang, setLang] = useState('fr');
  const [form, setForm] = useState({ name_fr: '', name_en: '', name_it: '', name_ar: '', extra_price: '0' });

  const mutation = useMutation({
    mutationFn: () => api.post(`/supplement-groups/${groupId}/options`, {
      ...form,
      extra_price: parseFloat(form.extra_price) || 0,
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['item-detail'] }); onDone(); },
  });

  return (
    <div className="bg-orange-50 rounded-xl p-3 border border-orange-200 mt-2">
      <LangTabs active={lang} onChange={setLang} />
      <input
        value={form[`name_${lang}`]}
        onChange={(e) => setForm((f) => ({ ...f, [`name_${lang}`]: e.target.value }))}
        placeholder={`Nom option (${lang.toUpperCase()}) *`}
        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-200 mb-2"
      />
      <div className="flex gap-2">
        <input
          type="number" step="0.001" min="0" value={form.extra_price}
          onChange={(e) => setForm((f) => ({ ...f, extra_price: e.target.value }))}
          placeholder="Prix supplémentaire DT"
          className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-200"
        />
        <button
          type="button"
          onClick={() => { if (form.name_fr.trim()) mutation.mutate(); }}
          disabled={mutation.isPending || !form.name_fr.trim()}
          className="px-4 py-2 rounded-lg bg-orange-500 text-white text-xs font-medium disabled:opacity-60"
        >
          {mutation.isPending ? <Loader2 size={12} className="animate-spin" /> : t('common.add')}
        </button>
        <button type="button" onClick={onDone} className="px-3 py-2 rounded-lg border border-gray-200 text-xs font-medium text-gray-600">
          <X size={13} />
        </button>
      </div>
    </div>
  );
}

// ─── Group Card ───────────────────────────────────────────────────────────────

function GroupCard({ group }) {
  const { t, i18n } = useTranslation();
  const qc = useQueryClient();
  const [open, setOpen] = useState(true);
  const [addOption, setAddOption] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/supplement-groups/${group.id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['item-detail'] }),
  });

  const deleteOptionMutation = useMutation({
    mutationFn: (id) => api.delete(`/supplement-options/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['item-detail'] }),
  });

  const displayLang = ['fr', 'en', 'it', 'ar'].includes(i18n.language) ? i18n.language : 'fr';
  const groupName = group[`name_${displayLang}`] || group.name_fr;
  const options = group.options || [];

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border-b border-gray-100">
        <button type="button" onClick={() => setOpen((v) => !v)} className="text-gray-400">
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        <span className="flex-1 text-sm font-semibold text-gray-800">{groupName}</span>
        <span className={cn(
          'text-xs px-2 py-0.5 rounded-full font-medium',
          group.type === 'radio' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
        )}>
          {group.type}
        </span>
        {group.is_required && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-medium">{t('common.required')}</span>
        )}
        <button
          type="button"
          onClick={() => { if (window.confirm(`Supprimer le groupe "${groupName}" ?`)) deleteMutation.mutate(); }}
          className="p-1 rounded text-gray-400 hover:text-red-600 ml-auto"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {open && (
        <div className="p-2">
          {options.map((opt) => (
            <OptionRow key={opt.id} option={opt} groupId={group.id} onDelete={(id) => deleteOptionMutation.mutate(id)} />
          ))}
          {options.length === 0 && <p className="text-xs text-gray-400 text-center py-2">Aucune option</p>}
          {addOption ? (
            <AddOptionForm groupId={group.id} onDone={() => setAddOption(false)} />
          ) : (
            <button
              type="button"
              onClick={() => setAddOption(true)}
              className="w-full flex items-center justify-center gap-1.5 mt-1 py-1.5 rounded-lg border border-dashed border-gray-200 text-xs text-gray-500 hover:bg-gray-50"
            >
              <Plus size={12} /> {t('common.add')} option
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Add Group Form ───────────────────────────────────────────────────────────

function AddGroupForm({ itemId, onDone }) {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [lang, setLang] = useState('fr');
  const [form, setForm] = useState({
    name_fr: '', name_en: '', name_it: '', name_ar: '',
    type: 'radio', min_select: 0, max_select: 1, is_required: false,
  });

  const mutation = useMutation({
    mutationFn: () => api.post(`/items/${itemId}/supplement-groups`, form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['item-detail'] }); onDone(); },
  });

  return (
    <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 mt-3">
      <p className="text-sm font-semibold text-gray-800 mb-3">Nouveau groupe</p>
      <LangTabs active={lang} onChange={setLang} />
      <input
        value={form[`name_${lang}`]}
        onChange={(e) => setForm((f) => ({ ...f, [`name_${lang}`]: e.target.value }))}
        placeholder={`Nom groupe (${lang.toUpperCase()}) *`}
        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-200 mb-3"
      />
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Type</label>
          <select
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-200"
          >
            <option value="radio">Radio (1 seul)</option>
            <option value="checkbox">Checkbox (multiple)</option>
          </select>
        </div>
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Min</label>
            <input type="number" min="0" value={form.min_select} onChange={(e) => setForm((f) => ({ ...f, min_select: +e.target.value }))}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none" />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Max</label>
            <input type="number" min="1" value={form.max_select} onChange={(e) => setForm((f) => ({ ...f, max_select: +e.target.value }))}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none" />
          </div>
        </div>
      </div>
      <label className="flex items-center gap-2 mb-3 cursor-pointer">
        <input type="checkbox" checked={form.is_required} onChange={(e) => setForm((f) => ({ ...f, is_required: e.target.checked }))} className="h-4 w-4 rounded accent-orange-500" />
        <span className="text-sm text-gray-600">{t('common.required')}</span>
      </label>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => { if (form.name_fr.trim()) mutation.mutate(); }}
          disabled={mutation.isPending || !form.name_fr.trim()}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-medium disabled:opacity-60"
        >
          {mutation.isPending ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} {t('common.add')}
        </button>
        <button type="button" onClick={onDone} className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600">
          {t('common.cancel')}
        </button>
      </div>
    </div>
  );
}

// ─── Main SupplementManager ───────────────────────────────────────────────────

export default function SupplementManager({ itemId }) {
  const { t } = useTranslation();
  const [addGroup, setAddGroup] = useState(false);

  const { data: groups, isLoading } = useQuery({
    queryKey: ['item-detail', itemId, 'groups'],
    queryFn: () => api.get(`/items/${itemId}/supplement-groups`).then((r) => r.data.data),
    enabled: !!itemId,
  });

  if (isLoading) return <div className="flex justify-center py-4"><Loader2 size={18} className="animate-spin text-orange-400" /></div>;

  const groupList = groups || [];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-700">{t('menu.supplements')}</p>
        <button
          type="button"
          onClick={() => setAddGroup(true)}
          className="flex items-center gap-1.5 text-xs font-medium text-orange-500 hover:text-indigo-800"
        >
          <Plus size={13} /> Ajouter groupe
        </button>
      </div>

      {groupList.map((group) => (
        <GroupCard key={group.id} group={group} />
      ))}

      {groupList.length === 0 && !addGroup && (
        <p className="text-xs text-gray-400 text-center py-3">Aucun groupe de suppléments</p>
      )}

      {addGroup && <AddGroupForm itemId={itemId} onDone={() => setAddGroup(false)} />}
    </div>
  );
}
