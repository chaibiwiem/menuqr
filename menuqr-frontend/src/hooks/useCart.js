import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useCart = create(
  persist(
    (set, get) => ({
      items: [],
      slug: null,

      setSlug: (slug) => set({ slug }),

      addToCart: (entry) => {
        // entry: { id (cart line id = uuid), item, supplements, quantity, note, unitTotal }
        set((state) => ({ items: [...state.items, entry] }));
      },

      removeFromCart: (cartLineId) => {
        set((state) => ({ items: state.items.filter((i) => i.id !== cartLineId) }));
      },

      updateQuantity: (cartLineId, quantity) => {
        if (quantity < 1) {
          set((state) => ({ items: state.items.filter((i) => i.id !== cartLineId) }));
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.id === cartLineId ? { ...i, quantity } : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      get totalItems() {
        return get().items.reduce((acc, i) => acc + i.quantity, 0);
      },

      get totalPrice() {
        return get().items.reduce((acc, i) => acc + (i.unitTotal || 0) * i.quantity, 0);
      },
    }),
    {
      name: 'menuqr-cart',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

export default useCart;
