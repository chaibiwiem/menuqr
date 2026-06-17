import { useState, useCallback, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Plus, LayoutGrid, List, Bell, BellOff, Loader2,
  X, Trash2, Users, Pencil, AlertTriangle, Download,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../lib/utils';
import FloorPlan from '../../components/tables/FloorPlan';
import TableBadge, { STATUS_COLORS } from '../../components/tables/TableBadge';
import TableDetail from '../../components/tables/TableDetail';

const ZONES = ['SALLE', 'TERRASSE', 'ETAGE'];
const ZONE_LABELS = { SALLE: 'Salle', TERRASSE: 'Terrasse', ETAGE: 'Étage' };

// ── Confirm Delete ────────────────────────────────────────────────────────────

function ConfirmDeleteModal({ name, onConfirm, onCancel, isPending }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-[80] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-red-100 rounded-xl shrink-0">
            <AlertTriangle size={18} className="text-red-600" />
          </div>
          <h3 className="text-base font-bold text-gray-900">Confirmer la suppression</h3>
        </div>
        <p className="text-sm text-gray-500 mb-5">
          Supprimer <b className="text-gray-800">{name}</b> ? Cette action est irréversible.
        </p>
        <div className="flex gap-3">
          <button type="button" onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50">
            Annuler
          </button>
          <button type="button" onClick={onConfirm} disabled={isPending}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60 flex items-center justify-center gap-2">
            {isPending && <Loader2 size={14} className="animate-spin" />}
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Room Modal (create + edit) ────────────────────────────────────────────────

function RoomModal({ room, onClose }) {
  const isEdit = !!room;
  const [name, setName] = useState(room?.name || '');
  const [zone, setZone] = useState(room?.zone || 'SALLE');
  const [capacity, setCapacity] = useState(room?.capacity?.toString() || '0');
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: (d) => isEdit
      ? api.put(`/tables/rooms/${room.id}`, d).then((r) => r.data.data)
      : api.post('/tables/rooms', d).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rooms'] });
      toast.success(isEdit ? 'Salle modifiée' : 'Salle créée');
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Erreur'),
  });

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    mutation.mutate({ name, zone, capacity: parseInt(capacity, 10) || 0 });
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-gray-900">
            {isEdit ? 'Modifier la salle' : 'Nouvelle salle'}
          </h3>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Nom *</label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: Salle principale, Terrasse..."
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Zone</label>
            <div className="flex gap-2">
              {ZONES.map((z) => (
                <button key={z} type="button" onClick={() => setZone(z)}
                  className={cn('flex-1 py-2 rounded-lg text-xs font-medium border transition-colors',
                    zone === z ? 'bg-orange-500 text-white border-orange-500' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  )}>
                  {ZONE_LABELS[z]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Capacité totale</label>
            <input type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} min="0" max="500"
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300" />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50">
              Annuler
            </button>
            <button type="submit" disabled={mutation.isPending || !name.trim()}
              className="flex-1 px-4 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 disabled:opacity-60 flex items-center justify-center gap-2">
              {mutation.isPending && <Loader2 size={14} className="animate-spin" />}
              {isEdit ? 'Enregistrer' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Table Modal (create + edit) ───────────────────────────────────────────────

function TableModal({ table, rooms, defaultRoomId, onClose }) {
  const isEdit = !!table;
  const [name, setName] = useState(table?.name || '');
  const [number, setNumber] = useState(table?.number?.toString() || '');
  const [capacity, setCapacity] = useState(table?.capacity?.toString() || '2');
  const [roomId, setRoomId] = useState(table?.room_id || defaultRoomId || '');
  const [isActive, setIsActive] = useState(table?.is_active !== false);
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: (d) => isEdit
      ? api.put(`/tables/${table.id}`, d).then((r) => r.data.data)
      : api.post('/tables', d).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tables'] });
      qc.invalidateQueries({ queryKey: ['rooms'] });
      toast.success(isEdit ? 'Table modifiée' : 'Table créée');
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Erreur'),
  });

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    mutation.mutate({
      name,
      number: number || undefined,
      capacity,
      room_id: roomId || null,
      ...(isEdit && { is_active: isActive }),
    });
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-gray-900">
            {isEdit ? 'Modifier la table' : 'Nouvelle table'}
          </h3>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Nom *</label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: Table 1, Bar..."
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">N° (optionnel)</label>
              <input type="number" value={number} onChange={(e) => setNumber(e.target.value)} min="1" max="255"
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Couverts</label>
              <input type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} min="1" max="50"
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300" />
            </div>
          </div>
          {rooms.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Salle</label>
              <select value={roomId} onChange={(e) => setRoomId(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none">
                <option value="">Aucune salle</option>
                {rooms.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
          )}
          {isEdit && (
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded accent-orange-500" />
              <span className="text-sm text-gray-700">Table active</span>
            </label>
          )}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50">
              Annuler
            </button>
            <button type="submit" disabled={mutation.isPending || !name.trim()}
              className="flex-1 px-4 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 disabled:opacity-60 flex items-center justify-center gap-2">
              {mutation.isPending && <Loader2 size={14} className="animate-spin" />}
              {isEdit ? 'Enregistrer' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main TablesPage ───────────────────────────────────────────────────────────

export default function TablesPage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const restaurantId = user?.restaurant_id;
  const restaurantSlug = user?.restaurant_slug || '';
  const canManageTables = ['OWNER', 'MANAGER'].includes(user?.role);
  const qc = useQueryClient();

  const [view, setView] = useState('plan');
  const [activeRoomId, setActiveRoomId] = useState(null);
  const [selectedTableId, setSelectedTableId] = useState(null);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [editingTable, setEditingTable] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { type:'room'|'table', id, name }
  const [localPositions, setLocalPositions] = useState({});

  // ── Socket: auto-refresh when table status changes (e.g. reservation assigned)
  const socketRef = useRef(null);
  useEffect(() => {
    if (!restaurantId) return;
    const SOCKET_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001/api').replace('/api', '');
    socketRef.current = io(SOCKET_URL, { transports: ['websocket'], reconnectionAttempts: 5 });
    socketRef.current.on('connect', () => {
      socketRef.current.emit('join:restaurant', restaurantId);
    });
    socketRef.current.on('table:status_changed', () => {
      qc.invalidateQueries({ queryKey: ['tables'] });
      qc.invalidateQueries({ queryKey: ['rooms'] });
    });
    socketRef.current.on('reservation:new', () => {
      qc.invalidateQueries({ queryKey: ['tables'] });
    });
    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave:restaurant', restaurantId);
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [restaurantId, qc]);

  const { data: meData } = useQuery({
    queryKey: ['user-me'],
    queryFn: () => api.get('/auth/me').then((r) => r.data.data),
    enabled: !!restaurantId,
    staleTime: 5 * 60_000,
  });
  const restaurantLogoUrl = meData?.restaurant?.logo_url || null;

  const { data: roomsData, isLoading: roomsLoading } = useQuery({
    queryKey: ['rooms', restaurantId],
    queryFn: () => api.get('/tables/rooms').then((r) => r.data.data),
    enabled: !!restaurantId,
    staleTime: 0,
  });

  const { data: tablesData, isLoading: tablesLoading } = useQuery({
    queryKey: ['tables', restaurantId],
    queryFn: () => api.get('/tables').then((r) => r.data.data),
    enabled: !!restaurantId,
    staleTime: 0,
  });

  const { data: callsData } = useQuery({
    queryKey: ['table-calls', restaurantId],
    queryFn: () => api.get('/tables/calls').then((r) => r.data.data),
    enabled: !!restaurantId,
    refetchInterval: 15_000,
  });

  const resolveCallMutation = useMutation({
    mutationFn: (callId) => api.put(`/tables/calls/${callId}/resolve`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['table-calls', restaurantId] }),
  });

  const positionMutation = useMutation({
    mutationFn: ({ id, x, y }) => api.patch(`/tables/${id}/position`, { position_x: x, position_y: y }),
  });

  const deleteRoomMutation = useMutation({
    mutationFn: (id) => api.delete(`/tables/rooms/${id}`),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['rooms'] });
      qc.invalidateQueries({ queryKey: ['tables'] });
      if (activeRoomId === id) setActiveRoomId(null);
      setDeleteConfirm(null);
      toast.success('Salle supprimée');
    },
    onError: (err) => {
      setDeleteConfirm(null);
      const msg = err.response?.data?.message;
      toast.error(
        msg === 'room_has_tables'
          ? 'Impossible : déplacez ou supprimez les tables de cette salle d\'abord'
          : 'Erreur lors de la suppression'
      );
    },
  });

  const deleteTableMutation = useMutation({
    mutationFn: (id) => api.delete(`/tables/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tables'] });
      qc.invalidateQueries({ queryKey: ['rooms'] });
      setSelectedTableId(null);
      setDeleteConfirm(null);
      toast.success('Table supprimée');
    },
    onError: (err) => {
      setDeleteConfirm(null);
      toast.error(err.response?.data?.message || 'Erreur lors de la suppression');
    },
  });

  const rooms = roomsData || [];
  const tables = (tablesData || []).map((t) => ({
    ...t,
    position_x: localPositions[t.id]?.x ?? t.position_x,
    position_y: localPositions[t.id]?.y ?? t.position_y,
  }));
  const calls = callsData || [];

  const currentRoom = activeRoomId ? rooms.find((r) => r.id === activeRoomId) : null;
  const visibleTables = activeRoomId
    ? tables.filter((t) => t.room_id === activeRoomId)
    : tables;

  const handlePositionChange = useCallback((tableId, x, y, persist = false) => {
    setLocalPositions((prev) => ({ ...prev, [tableId]: { x, y } }));
    if (persist) positionMutation.mutate({ id: tableId, x, y });
  }, []);

  const stats = {
    total:   tables.length,
    libre:   tables.filter((t) => t.status === 'LIBRE').length,
    occupee: tables.filter((t) => t.status === 'OCCUPEE').length,
    attente: tables.filter((t) => t.status === 'EN_ATTENTE').length,
  };

  const isLoading = roomsLoading || tablesLoading;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-white shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-gray-900">{t('tables.title')}</h1>
            {calls.length > 0 && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold animate-pulse">
                <Bell size={11} /> {calls.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              <button type="button" onClick={() => setView('plan')}
                className={cn('px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors',
                  view === 'plan' ? 'bg-white shadow text-gray-900' : 'text-gray-500'
                )}>
                <LayoutGrid size={14} />
              </button>
              <button type="button" onClick={() => setView('list')}
                className={cn('px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors',
                  view === 'list' ? 'bg-white shadow text-gray-900' : 'text-gray-500'
                )}>
                <List size={14} />
              </button>
            </div>
            {canManageTables && (
              <>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const params = activeRoomId ? `?room_id=${activeRoomId}` : '';
                      const resp = await api.get(`/tables/export-qr${params}`, {
                        responseType: 'blob',
                      });
                      const blob = new Blob([resp.data], { type: 'application/zip' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      const cd = resp.headers['content-disposition'] || '';
                      a.download = cd.match(/filename="(.+)"/)?.[1] || 'qr-codes.zip';
                      a.click();
                      URL.revokeObjectURL(url);
                    } catch (err) {
                      console.error('[QR Export]', err);
                      let msg = 'Erreur export QR';
                      if (err.response) {
                        const d = err.response.data;
                        const text = d instanceof Blob ? await d.text().catch(() => '') : JSON.stringify(d);
                        console.error('[QR Export] server response:', err.response.status, text);
                        try { const parsed = JSON.parse(text); if (parsed.message === 'no_tables') msg = 'Aucune table active dans cette salle'; else msg = `Erreur ${err.response.status}: ${parsed.message || text}`; } catch { msg = `Erreur ${err.response.status}`; }
                      } else {
                        msg = `Erreur réseau: ${err.message}`;
                      }
                      toast.error(msg);
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50"
                  title="Exporter tous les QR codes en ZIP"
                >
                  <Download size={14} /> QR ZIP
                </button>
                <button type="button" onClick={() => setShowRoomModal(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50">
                  <Plus size={14} /> {t('tables.add_room')}
                </button>
                <button type="button" onClick={() => setShowTableModal(true)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600">
                  <Plus size={15} /> {t('tables.add_table')}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Stats strip */}
        <div className="flex items-center gap-3">
          {[
            { label: 'Total', value: stats.total, cls: 'text-orange-600 bg-orange-50' },
            { label: t('tables.status_libre'), value: stats.libre, cls: 'text-green-700 bg-green-50' },
            { label: t('tables.status_occupee'), value: stats.occupee, cls: 'text-orange-700 bg-orange-50' },
            { label: t('tables.status_en_attente'), value: stats.attente, cls: 'text-amber-700 bg-amber-50' },
          ].map((s) => (
            <div key={s.label} className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold', s.cls)}>
              <span className="text-base font-bold">{s.value}</span>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Room tabs */}
      {rooms.length > 0 && (
        <div className="flex items-center gap-1.5 px-6 py-2 border-b border-gray-100 bg-white overflow-x-auto scrollbar-hide shrink-0">
          <button
            type="button"
            onClick={() => setActiveRoomId(null)}
            className={cn('shrink-0 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors',
              activeRoomId === null ? 'bg-orange-500 text-white' : 'text-gray-500 border border-gray-200 hover:bg-gray-50'
            )}
          >
            Toutes ({tables.length})
          </button>

          {rooms.map((room) => {
            const count = tables.filter((t) => t.room_id === room.id).length;
            const isActive = activeRoomId === room.id;
            return (
              <div key={room.id} className="shrink-0 flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => setActiveRoomId(room.id)}
                  className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors',
                    isActive ? 'bg-orange-500 text-white' : 'text-gray-500 border border-gray-200 hover:bg-gray-50'
                  )}
                >
                  {room.name}
                  <span className={cn('text-xs', isActive ? 'opacity-70' : 'text-gray-400')}>
                    ({count})
                  </span>
                </button>
                {canManageTables && (
                  <>
                    <button
                      type="button"
                      onClick={() => setEditingRoom(room)}
                      className="p-1 rounded-md text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-colors"
                      title="Modifier"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirm({ type: 'room', id: room.id, name: room.name })}
                      className="p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 size={12} />
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Call waiter alerts */}
      {calls.length > 0 && (
        <div className="px-6 py-2 space-y-1.5 bg-amber-50 border-b border-amber-200 shrink-0">
          {calls.map((call) => (
            <div key={call.id} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-amber-800 font-medium">
                <Bell size={14} />
                {call.type === 'WAITER' ? 'Appel serveur' : call.type === 'CHECK' ? "Demande d'addition" : 'Appel'}
                {call.table ? ` — ${call.table.name}` : ''}
                {call.message && <span className="text-amber-600 font-normal">: {call.message}</span>}
              </span>
              <button
                type="button"
                onClick={() => resolveCallMutation.mutate(call.id)}
                disabled={resolveCallMutation.isPending}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-200 text-amber-800 text-xs font-medium hover:bg-amber-300 disabled:opacity-50"
              >
                <BellOff size={12} /> Résoudre
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 size={28} className="animate-spin text-orange-500" />
          </div>
        ) : visibleTables.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
            <div className="p-5 bg-gray-100 rounded-2xl">
              <Users size={36} className="text-gray-300" />
            </div>
            <div className="text-center">
              <p className="font-medium text-gray-600">
                Aucune table{currentRoom ? ` dans ${currentRoom.name}` : ''}
              </p>
              {canManageTables && (
                <p className="text-sm mt-1 text-gray-400">
                  Cliquez sur <b>+ Table</b> pour en créer une.
                </p>
              )}
            </div>
          </div>
        ) : view === 'plan' ? (
          <FloorPlan
            tables={visibleTables}
            selectedId={selectedTableId}
            onSelect={(tbl) => setSelectedTableId(tbl.id)}
            onPositionChange={handlePositionChange}
            draggable={canManageTables}
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
            {visibleTables.map((table) => {
              const colors = STATUS_COLORS[table.status] || STATUS_COLORS.LIBRE;
              return (
                <div
                  key={table.id}
                  className={cn(
                    'bg-white rounded-2xl border flex flex-col hover:shadow-md transition-shadow',
                    selectedTableId === table.id ? 'ring-2 ring-orange-400' : ''
                  )}
                  style={{ borderColor: colors.bg + '44' }}
                >
                  {/* Clickable area → detail sheet */}
                  <button
                    type="button"
                    onClick={() => setSelectedTableId(table.id)}
                    className="flex-1 text-left p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-sm font-bold text-gray-900">{table.name}</p>
                        {table.number && <p className="text-xs text-gray-400 font-mono">#{table.number}</p>}
                      </div>
                      <div className="w-3 h-3 rounded-full mt-1" style={{ backgroundColor: colors.bg }} />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                      <span className="flex items-center gap-1">
                        <Users size={11} /> {table.capacity}
                      </span>
                      {table.room?.name && <span className="truncate">{table.room.name}</span>}
                    </div>
                    <div
                      className="text-xs font-medium px-2 py-0.5 rounded-full inline-block"
                      style={{ backgroundColor: colors.bg + '22', color: colors.bg }}
                    >
                      {t(`tables.status_${table.status.toLowerCase()}`)}
                    </div>
                  </button>

                  {/* Edit / Delete row */}
                  {canManageTables && (
                    <div className="flex gap-1.5 px-3 pb-3">
                      <button
                        type="button"
                        onClick={() => setEditingTable(table)}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        <Pencil size={11} /> Modifier
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirm({ type: 'table', id: table.id, name: table.name })}
                        className="px-2.5 py-1.5 rounded-lg border border-red-100 text-red-400 hover:bg-red-50 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Table detail sheet */}
      {selectedTableId && (
        <TableDetail
          tableId={selectedTableId}
          restaurantSlug={restaurantSlug}
          restaurantLogoUrl={restaurantLogoUrl}
          canManageTables={canManageTables}
          onClose={() => setSelectedTableId(null)}
          onEdit={() => {
            const tbl = tables.find((t) => t.id === selectedTableId);
            if (tbl) { setEditingTable(tbl); setSelectedTableId(null); }
          }}
          onDelete={() => {
            const tbl = tables.find((t) => t.id === selectedTableId);
            if (tbl) setDeleteConfirm({ type: 'table', id: tbl.id, name: tbl.name });
          }}
          onRefresh={() => {
            qc.invalidateQueries({ queryKey: ['tables'] });
            qc.invalidateQueries({ queryKey: ['rooms'] });
          }}
        />
      )}

      {/* Room modal (create / edit) */}
      {(showRoomModal || editingRoom) && (
        <RoomModal
          room={editingRoom}
          onClose={() => { setShowRoomModal(false); setEditingRoom(null); }}
        />
      )}

      {/* Table modal (create / edit) */}
      {(showTableModal || editingTable) && (
        <TableModal
          table={editingTable}
          rooms={rooms}
          defaultRoomId={activeRoomId}
          onClose={() => { setShowTableModal(false); setEditingTable(null); }}
        />
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <ConfirmDeleteModal
          name={deleteConfirm.name}
          isPending={deleteRoomMutation.isPending || deleteTableMutation.isPending}
          onConfirm={() => {
            if (deleteConfirm.type === 'room') deleteRoomMutation.mutate(deleteConfirm.id);
            else deleteTableMutation.mutate(deleteConfirm.id);
          }}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
}
