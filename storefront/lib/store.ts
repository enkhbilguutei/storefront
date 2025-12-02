import { create } from "zustand";
import { persist } from "zustand/middleware";
import { medusa } from "@/lib/medusa";
import type { Session } from "next-auth";
import type { AuthAction } from "@/lib/auth";

interface CartItem {
  id: string;
  variantId: string;
  productId: string;
  title: string;
  variantTitle?: string;
  quantity: number;
  thumbnail?: string;
  unitPrice: number;
  handle?: string;
}

interface CartStore {
  cartId: string | null;
  items: CartItem[];
  isOpen: boolean;
  isLoading: boolean;
  lastAddedItem: CartItem | null;
  setCartId: (id: string | null) => void;
  setItems: (items: CartItem[]) => void;
  addItem: (item: CartItem) => void;
  setLastAddedItem: (item: CartItem | null) => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  clearCart: () => void;
  syncCart: () => Promise<void>;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cartId: null,
      items: [],
      isOpen: false,
      isLoading: false,
      lastAddedItem: null,
      setCartId: (id) => set({ cartId: id }),
      setItems: (items) => set({ items }),
      addItem: (item) => set((state) => {
        // Optimistically add item to the items array for immediate UI update
        const existingItem = state.items.find((i) => i.variantId === item.variantId);
        let newItems;
        if (existingItem) {
          newItems = state.items.map((i) =>
            i.variantId === item.variantId ? { ...i, quantity: i.quantity + item.quantity } : i
          );
        } else {
          newItems = [...state.items, item];
        }
        return { items: newItems, lastAddedItem: item };
      }),
      setLastAddedItem: (item) => set({ lastAddedItem: item }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      clearCart: () => set({ cartId: null, items: [], lastAddedItem: null }),
      syncCart: async () => {
        const { cartId } = get();
        if (!cartId) {
            set({ items: [], isLoading: false });
            return;
        }
        try {
          const { cart } = await medusa.store.cart.retrieve(cartId, {
            fields: "+items.variant.product.handle,+items.variant.product.title,+items.variant.title",
          });
          if (!cart || !cart.items) {
             set({ cartId: null, items: [], isLoading: false });
             return;
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const mappedItems = cart.items.map((item: any) => ({
            id: item.id,
            variantId: item.variant_id,
            productId: item.variant?.product_id || item.product_id,
            title: item.title,
            variantTitle: item.variant?.title,
            quantity: item.quantity,
            thumbnail: item.thumbnail,
            unitPrice: item.unit_price,
            handle: item.variant?.product?.handle 
          }));
          set({ items: mappedItems, isLoading: false });
        } catch (error) {
          console.error("Failed to sync cart:", error);
          // Cart might be expired or invalid, clear it
          set({ cartId: null, items: [], isLoading: false });
        }
      },
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({ 
        cartId: state.cartId,
        // Don't persist items - always fetch fresh from server
      }),
    }
  )
);

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  image?: string;
}

interface UserStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  clearUser: () => void;
  syncWithSession: (session: Session | null) => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      accessToken: null,
      setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
      setAccessToken: (token) => set({ accessToken: token }),
      clearUser: () => set({ user: null, isAuthenticated: false, accessToken: null, isLoading: false }),
      syncWithSession: (session) => {
        if (session?.user) {
          const nameParts = session.user.name?.split(" ") || [];
          set({
            user: {
              id: (session.user as { id?: string }).id || "",
              email: session.user.email || "",
              name: session.user.name || undefined,
              firstName: nameParts[0] || undefined,
              lastName: nameParts.slice(1).join(" ") || undefined,
              image: session.user.image || undefined,
            },
            isAuthenticated: true,
            accessToken: (session as { accessToken?: string }).accessToken || null,
            isLoading: false,
          });
        } else {
          set({
            user: null,
            isAuthenticated: false,
            accessToken: null,
            isLoading: false,
          });
        }
      },
    }),
    {
      name: "user-storage",
      partialize: (state) => ({
        // Only persist user data, not loading states
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

interface UIStore {
  isMobileMenuOpen: boolean;
  isSearchOpen: boolean;
  isCartNotificationOpen: boolean;
  isAuthModalOpen: boolean;
  authModalAction: AuthAction | null;
  authModalView: "login" | "register";
  openMobileMenu: () => void;
  closeMobileMenu: () => void;
  toggleMobileMenu: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  toggleSearch: () => void;
  openCartNotification: () => void;
  closeCartNotification: () => void;
  openAuthModal: (action?: AuthAction, view?: "login" | "register") => void;
  closeAuthModal: () => void;
  setAuthModalView: (view: "login" | "register") => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isMobileMenuOpen: false,
  isSearchOpen: false,
  isCartNotificationOpen: false,
  isAuthModalOpen: false,
  authModalAction: null,
  authModalView: "login",
  openMobileMenu: () => set({ isMobileMenuOpen: true }),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),
  toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),
  openCartNotification: () => set({ isCartNotificationOpen: true }),
  closeCartNotification: () => set({ isCartNotificationOpen: false }),
  openAuthModal: (action = null, view = "login") => set({ 
    isAuthModalOpen: true, 
    authModalAction: action,
    authModalView: view,
  }),
  closeAuthModal: () => set({ 
    isAuthModalOpen: false, 
    authModalAction: null,
  }),
  setAuthModalView: (view) => set({ authModalView: view }),
}));
