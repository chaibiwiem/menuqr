import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';

const SOCKET_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001/api').replace('/api', '');

// Sounds, toasts and modal are handled by useNotifications in DashboardPage layout.
// This hook only keeps the OrdersPage query cache in sync.

export function useOrdersSocket(restaurantId) {
  const socketRef   = useRef(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!restaurantId) return;

    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current.on('connect', () => {
      socketRef.current.emit('join:restaurant', restaurantId);
    });

    socketRef.current.on('order:new', () => {
      queryClient.invalidateQueries({ queryKey: ['orders', restaurantId] });
    });

    socketRef.current.on('order:status_changed', ({ orderId, newStatus }) => {
      queryClient.setQueriesData({ queryKey: ['orders', restaurantId] }, (old) => {
        if (!old?.data) return old;
        return { ...old, data: old.data.map((o) => o.id === orderId ? { ...o, status: newStatus } : o) };
      });
    });

    socketRef.current.on('order:cancelled', ({ orderId }) => {
      queryClient.setQueriesData({ queryKey: ['orders', restaurantId] }, (old) => {
        if (!old?.data) return old;
        return { ...old, data: old.data.map((o) => o.id === orderId ? { ...o, status: 'CANCELLED' } : o) };
      });
    });

    return () => {
      socketRef.current?.emit('leave:restaurant', restaurantId);
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [restaurantId, queryClient]);

  return { socket: socketRef.current };
}
