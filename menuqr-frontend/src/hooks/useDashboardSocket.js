import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';

const SOCKET_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001/api').replace('/api', '');

// Lightweight socket hook for DashboardHome widgets.
// Sounds, modals and order modal are handled by useNotifications in the layout.
// This hook only invalidates widget-specific queries on real-time events.

export function useDashboardSocket(restaurantId) {
  const socketRef = useRef(null);
  const qc = useQueryClient();

  useEffect(() => {
    if (!restaurantId) return;

    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      socket.emit('join:restaurant', restaurantId);
    });

    const invalidateDashboard = () => {
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
      qc.invalidateQueries({ queryKey: ['orders-live', restaurantId] });
      qc.invalidateQueries({ queryKey: ['top-dishes', restaurantId] });
      qc.invalidateQueries({ queryKey: ['orders-pending-header', restaurantId] });
    };

    socket.on('order:new',            invalidateDashboard);
    socket.on('order:status_changed', invalidateDashboard);
    socket.on('order:cancelled',      invalidateDashboard);

    socket.on('table:status_changed', () => {
      qc.invalidateQueries({ queryKey: ['tables-status', restaurantId] });
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
    });

    socket.on('call_waiter:new', () => {
      qc.invalidateQueries({ queryKey: ['table-calls', restaurantId] });
    });

    socket.on('call_waiter:resolved', () => {
      qc.invalidateQueries({ queryKey: ['table-calls', restaurantId] });
      qc.invalidateQueries({ queryKey: ['tables-status', restaurantId] });
    });

    socket.on('menu:item_toggled', () => {
      qc.invalidateQueries({ queryKey: ['public-menu'] });
    });

    return () => {
      socket.emit('leave:restaurant', restaurantId);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [restaurantId, qc]);

  return { isConnected: !!socketRef.current?.connected };
}
