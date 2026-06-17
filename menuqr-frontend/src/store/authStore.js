import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,

      setAuth: (token, user) => {
        localStorage.setItem('token', token);
        set({ token, user });
      },

      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null });
      },

      updateUser: (partial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : null,
        })),

      isAuthenticated: () => !!get().token,
      isSuperAdmin: () => get().user?.role === 'SUPER_ADMIN',
      isOwner: () => get().user?.role === 'OWNER',
      isManager: () => get().user?.role === 'MANAGER',
      isStaff: () => ['OWNER', 'MANAGER', 'STAFF', 'CASHIER'].includes(get().user?.role),
    }),
    {
      name: 'menuqr-auth',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);

export { useAuthStore };
export default useAuthStore;
