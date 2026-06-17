import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { playOrderSound, playCallWaiterSound, playReservationSound, startRepeatingSound } from '../utils/sounds';

const SOCKET_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001/api').replace('/api', '');

// ─── useNotifications ─────────────────────────────────────────────────────────
// Global hook — mounted once in DashboardPage layout.
// Handles: Socket.io, sounds (repeat 60s), order modal, call-waiter modal, unread count.

export function useNotifications(restaurantId) {
  const qc = useQueryClient();

  // ── Order modal ───────────────────────────────────────────────────────────
  const [modalOrder,        setModalOrder]        = useState(null);
  const [modalCallWaiter,   setModalCallWaiter]   = useState(null);
  const [modalReservation,  setModalReservation]  = useState(null);
  const modalOrderRef       = useRef(null);
  const modalCallWaiterRef  = useRef(null);
  const modalReservationRef = useRef(null);

  // ── Sound stop handles ────────────────────────────────────────────────────
  const orderSoundStopRef      = useRef(null);
  const callWaiterSoundStopRef = useRef(null);

  function stopOrderSound() {
    orderSoundStopRef.current?.();
    orderSoundStopRef.current = null;
  }
  function stopCallWaiterSound() {
    callWaiterSoundStopRef.current?.();
    callWaiterSoundStopRef.current = null;
  }

  // Silences ALL notification sounds immediately — call on any accept/resolve action
  const stopAllSounds = useCallback(() => {
    stopOrderSound();
    stopCallWaiterSound();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const dismissModal = useCallback(() => {
    stopAllSounds();
    setModalOrder(null);
    modalOrderRef.current = null;
  }, [stopAllSounds]);

  const dismissCallWaiterModal = useCallback(() => {
    stopAllSounds();
    setModalCallWaiter(null);
    modalCallWaiterRef.current = null;
  }, [stopAllSounds]);

  const dismissReservationModal = useCallback(() => {
    setModalReservation(null);
    modalReservationRef.current = null;
  }, []);

  // ── Unread count ──────────────────────────────────────────────────────────
  const { data: notifData, refetch: refetchNotifs } = useQuery({
    queryKey: ['notifications'],
    queryFn:  () => api.get('/notifications').then((r) => r.data),
    enabled:  !!restaurantId,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
  const unreadCount = notifData?.meta?.unread ?? 0;

  // ── Notification settings (sound toggles) — kept in ref for socket closure ─
  const { data: settings } = useQuery({
    queryKey: ['notification-settings'],
    queryFn:  () => api.get('/notifications/settings').then((r) => r.data.data),
    enabled:  !!restaurantId,
    staleTime: 120_000,
  });
  const settingsRef = useRef(settings);
  useEffect(() => { settingsRef.current = settings; }, [settings]);

  const refetchNotifsCb = useCallback(() => refetchNotifs(), [refetchNotifs]);

  // ── Socket.io ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!restaurantId) return;

    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socket.on('connect', () => {
      socket.emit('join:restaurant', restaurantId);
    });

    // Helper — invalidate a list of query keys at once
    function inv(...keys) {
      keys.forEach((k) => qc.invalidateQueries({ queryKey: Array.isArray(k) ? k : [k] }));
    }

    // ── New order ─────────────────────────────────────────────────────────
    socket.on('order:new', (payload) => {
      inv(
        ['orders', restaurantId],
        'dashboard-stats',
        'orders-pending-header',
        'orders-history',
        'pos-active-tables',
        'analytics-kpis',
        'analytics-chart',
      );

      if (settingsRef.current?.sound_new_order !== false) {
        stopOrderSound();
        orderSoundStopRef.current = startRepeatingSound(playOrderSound, 6000, 60000);
      }

      setModalOrder(payload);
      modalOrderRef.current = payload;
      refetchNotifsCb();
    });

    // ── Call waiter ───────────────────────────────────────────────────────
    socket.on('call_waiter:new', (payload) => {
      inv(
        ['table-calls', restaurantId],
        'call-waiter-list',
        'call-waiter-stats',
        'dashboard-stats',
      );

      if (settingsRef.current?.sound_call_waiter !== false) {
        stopCallWaiterSound();
        callWaiterSoundStopRef.current = startRepeatingSound(playCallWaiterSound, 7000, 60000);
      }

      setModalCallWaiter(payload);
      modalCallWaiterRef.current = payload;
      refetchNotifsCb();
    });

    // ── Backend persisted notification → refresh bell ─────────────────────
    socket.on('notification:new', () => {
      refetchNotifsCb();
    });

    // ── Order status changed ──────────────────────────────────────────────
    socket.on('order:status_changed', ({ orderId, newStatus }) => {
      const cur = modalOrderRef.current;
      const curId = cur ? (cur.order_id ?? cur.id) : null;
      if (newStatus === 'CONFIRMED' && curId != null && String(curId) === String(orderId)) {
        stopOrderSound();
        setModalOrder(null);
        modalOrderRef.current = null;
      }

      // Instant cache patch for orders kanban
      qc.setQueriesData({ queryKey: ['orders', restaurantId] }, (old) => {
        if (!old?.data) return old;
        return { ...old, data: old.data.map((o) => o.id === orderId ? { ...o, status: newStatus } : o) };
      });

      inv(
        'dashboard-stats',
        'orders-pending-header',
        'pos-active-tables',
        'pos-order',
        'orders-history',
        'analytics-kpis',
      );
    });

    socket.on('order:cancelled', ({ orderId }) => {
      const cur = modalOrderRef.current;
      const curId = cur ? (cur.order_id ?? cur.id) : null;
      if (curId != null && String(curId) === String(orderId)) {
        stopOrderSound();
        setModalOrder(null);
        modalOrderRef.current = null;
      }

      qc.setQueriesData({ queryKey: ['orders', restaurantId] }, (old) => {
        if (!old?.data) return old;
        return { ...old, data: old.data.map((o) => o.id === orderId ? { ...o, status: 'CANCELLED' } : o) };
      });

      inv(
        'dashboard-stats',
        'orders-pending-header',
        'pos-active-tables',
        'orders-history',
        'analytics-kpis',
      );
    });

    // ── Call waiter resolved ──────────────────────────────────────────────
    socket.on('call_waiter:resolved', ({ id } = {}) => {
      if (id && modalCallWaiterRef.current?.id === id) {
        stopCallWaiterSound();
        setModalCallWaiter(null);
        modalCallWaiterRef.current = null;
      }
      inv(
        ['table-calls', restaurantId],
        'call-waiter-list',
        'call-waiter-stats',
        'dashboard-stats',
      );
    });

    // ── Table status changed ──────────────────────────────────────────────
    socket.on('table:status_changed', () => {
      inv('tables', 'rooms', 'pos-active-tables', 'dashboard-stats');
    });

    // ── Reservation events ────────────────────────────────────────────────
    socket.on('reservation:new', (payload) => {
      inv('reservations', 'reservations-month', 'reservations-tables', 'dashboard-stats');

      if (settingsRef.current?.sound_reservation !== false) {
        playReservationSound();
      }

      if (payload?.first_name) {
        setModalReservation(payload);
        modalReservationRef.current = payload;
      }

      refetchNotifsCb();
    });

    socket.on('reservation:updated', () => {
      inv('reservations', 'reservations-month', 'reservations-tables');
    });

    // ── Menu toggled (item availability changed) ──────────────────────────
    socket.on('menu:item_toggled', () => {
      inv('menus');
    });

    return () => {
      socket.emit('leave:restaurant', restaurantId);
      socket.disconnect();
    };
  }, [restaurantId, qc, refetchNotifsCb]);   // eslint-disable-line react-hooks/exhaustive-deps

  // Stop sounds on unmount
  useEffect(() => {
    return () => {
      stopOrderSound();
      stopCallWaiterSound();
    };
  }, []);                                     // eslint-disable-line react-hooks/exhaustive-deps

  return { modalOrder, dismissModal, modalCallWaiter, dismissCallWaiterModal, modalReservation, dismissReservationModal, stopAllSounds, unreadCount };
}
