import { create } from "zustand";
import { persist } from "zustand/middleware";
import { medusa } from "@/lib/medusa";
import type { Session } from "next-auth";
import type { AuthAction } from "@/lib/auth";

// Cart types
export interface CartItem {
  id: string;
  variantId: string;
  productId: string;
  title: string;
  variantTitle?: string;
  quantity: number;
  thumbnail?: string | null;
  unitPrice: number;
  handle?: string;
}

export interface CartData {
  id: string;
  email?: string;
  items: CartItem[];
  subtotal?: number;
  discount_total?: number;
  shipping_total?: number;
  tax_total?: number;
  total?: number;
  currency_code: string;
  region_id?: string;
  shipping_methods?: Array<{ id: string; shipping_option_id?: string; name?: string }>;
  completed_at?: string;
  status?: string;
}

interface CartStore {
  // State
  cartId: string | null;
  cart: CartData | null;
  items: CartItem[];
  isOpen: boolean;
  isLoading: boolean;
  isFetching: boolean;
  error: string | null;
  lastAddedItem: CartItem | null;
  lastFetchTime: number;
  
  // Actions
  setCartId: (id: string | null) => void;
  setItems: (items: CartItem[]) => void;
  addItemOptimistic: (item: CartItem) => void;
  addItem: (item: CartItem) => void; // Alias for addItemOptimistic
  setLastAddedItem: (item: CartItem | null) => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  clearCart: () => void;
  setError: (error: string | null) => void;
  
  // API Actions
  fetchCart: (force?: boolean) => Promise<CartData | null>;
  syncCart: () => Promise<CartData | null>; // Alias for fetchCart(true)
  updateItemQuantity: (itemId: string, quantity: number) => Promise<boolean>;
  removeItem: (itemId: string) => Promise<boolean>;
}

// Request deduplication and caching
let pendingFetch: Promise<CartData | null> | null = null;
const CACHE_DURATION = 10000; // 10 seconds cache - reduced API calls during rapid interactions

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cartId: null,
      cart: null,
      items: [],
      isOpen: false,
      isLoading: false,
      isFetching: false,
      error: null,
      lastAddedItem: null,
      lastFetchTime: 0,
      
      setCartId: (id) => set({ cartId: id }),
      setItems: (items) => set({ items }),
      setError: (error) => set({ error }),
      
      addItemOptimistic: (item) => {
        set((state) => {
          const existingItem = state.items.find((i) => i.variantId === item.variantId);
          let newItems: CartItem[];
          if (existingItem) {
            newItems = state.items.map((i) =>
              i.variantId === item.variantId ? { ...i, quantity: i.quantity + item.quantity } : i
            );
          } else {
            newItems = [...state.items, item];
          }
          return { items: newItems, lastAddedItem: item };
        });
        // Sync with server after optimistic update
        setTimeout(() => get().fetchCart(true), 300);
      },
      
      // Backwards-compatible alias
      addItem: (item) => get().addItemOptimistic(item),
      
      setLastAddedItem: (item) => set({ lastAddedItem: item }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      clearCart: () => set({ cartId: null, cart: null, items: [], lastAddedItem: null, error: null }),
      
      fetchCart: async (force = false) => {
        const { cartId, lastFetchTime, isFetching } = get();
        
        if (!cartId) {
          set({ cart: null, items: [], isLoading: false, isFetching: false });
          return null;
        }
        
        // Return cached data if within cache duration and not forced
        const now = Date.now();
        if (!force && now - lastFetchTime < CACHE_DURATION && get().cart) {
          return get().cart;
        }
        
        // Deduplicate concurrent requests
        if (pendingFetch && isFetching) {
          return pendingFetch;
        }
        
        set({ isFetching: true, error: null });
        
        pendingFetch = (async () => {
          try {
            const { cart } = await medusa.store.cart.retrieve(cartId, {
              fields: "+items.variant.product.handle,+items.variant.product.title,+items.variant.title,+shipping_methods.shipping_option_id",
            });
            
            if (!cart || !cart.items) {
              get().clearCart();
              return null;
            }
            
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const cartAny = cart as any;
            if (cartAny.completed_at || cartAny.status === "completed") {
              get().clearCart();
              return null;
            }
            
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const mappedItems: CartItem[] = cart.items.map((item: any) => ({
              id: item.id,
              variantId: item.variant_id,
              productId: item.variant?.product_id || item.product_id,
              title: item.title,
              variantTitle: item.variant?.title,
              quantity: item.quantity,
              thumbnail: item.thumbnail,
              unitPrice: item.unit_price,
              handle: item.variant?.product?.handle,
            }));
            
            const cartData: CartData = {
              id: cart.id,
              email: cart.email || undefined,
              items: mappedItems,
              subtotal: cartAny.subtotal,
              discount_total: cartAny.discount_total,
              shipping_total: cartAny.shipping_total,
              tax_total: cartAny.tax_total,
              total: cartAny.total,
              currency_code: cart.currency_code,
              region_id: cart.region_id || undefined,
              shipping_methods: cartAny.shipping_methods,
            };
            
            set({ 
              cart: cartData, 
              items: mappedItems, 
              isLoading: false, 
              isFetching: false,
              lastFetchTime: Date.now(),
              error: null,
            });
            
            return cartData;
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            
            if (errorMessage.includes("completed") || errorMessage.includes("not found") || errorMessage.includes("404") || errorMessage.includes("Internal Server Error") || errorMessage.includes("500")) {
              get().clearCart();
              return null;
            }
            
            set({ error: "Сагс ачаалахад алдаа гарлаа", isLoading: false, isFetching: false });
            return null;
          } finally {
            pendingFetch = null;
          }
        })();
        
        return pendingFetch;
      },
      
      // Backwards-compatible alias for fetchCart(true)
      syncCart: () => get().fetchCart(true),
      
      updateItemQuantity: async (itemId, quantity) => {
        const { cartId, items } = get();
        if (!cartId) return false;
        
        // Optimistic update
        const previousItems = [...items];
        set({
          items: items.map((i) => i.id === itemId ? { ...i, quantity } : i),
        });
        
        try {
          await medusa.store.cart.updateLineItem(cartId, itemId, { quantity });
          // Refresh cart data
          await get().fetchCart(true);
          return true;
        } catch (error: unknown) {
          // Rollback on error
          set({ items: previousItems });
          const errorMessage = error instanceof Error ? error.message : String(error);
          if (errorMessage.includes("completed")) {
            get().clearCart();
          }
          return false;
        }
      },
      
      removeItem: async (itemId) => {
        const { cartId, items } = get();
        if (!cartId) return false;
        
        // Optimistic update
        const previousItems = [...items];
        set({
          items: items.filter((i) => i.id !== itemId),
        });
        
        try {
          await medusa.store.cart.deleteLineItem(cartId, itemId);
          // Refresh cart data
          await get().fetchCart(true);
          return true;
        } catch (error: unknown) {
          // Rollback on error
          set({ items: previousItems });
          const errorMessage = error instanceof Error ? error.message : String(error);
          if (errorMessage.includes("completed")) {
            get().clearCart();
          }
          return false;
        }
      },
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({ 
        cartId: state.cartId,
        items: state.items,
      }),
    }
  )
);

// Selector hooks for performance
export const useCart = () => useCartStore((state) => state.cart);
export const useCartItems = () => useCartStore((state) => state.items);
export const useCartId = () => useCartStore((state) => state.cartId);
export const useCartLoading = () => useCartStore((state) => state.isLoading || state.isFetching);

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
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      accessToken: null,
      setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
      setAccessToken: (token) => set({ accessToken: token }),
      clearUser: () => {
        set({ user: null, isAuthenticated: false, accessToken: null, isLoading: false });
        // Clear cart when user is cleared
        useCartStore.getState().clearCart();
      },
      syncWithSession: (session) => {
        const wasAuthenticated = get().isAuthenticated;
        
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
          
          // Clear cart when user logs out (was authenticated, now not)
          if (wasAuthenticated) {
            useCartStore.getState().clearCart();
          }
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
  isWishlistNotificationOpen: boolean;
  wishlistNotificationMessage: string | null;
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
  openWishlistNotification: (message: string) => void;
  closeWishlistNotification: () => void;
  openAuthModal: (action?: AuthAction, view?: "login" | "register") => void;
  closeAuthModal: () => void;
  setAuthModalView: (view: "login" | "register") => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isMobileMenuOpen: false,
  isSearchOpen: false,
  isCartNotificationOpen: false,
  isWishlistNotificationOpen: false,
  wishlistNotificationMessage: null,
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
  openWishlistNotification: (message) => {
    set({ isWishlistNotificationOpen: true, wishlistNotificationMessage: message });
    setTimeout(() => set({ isWishlistNotificationOpen: false, wishlistNotificationMessage: null }), 3000);
  },
  closeWishlistNotification: () => set({ isWishlistNotificationOpen: false, wishlistNotificationMessage: null }),
  openAuthModal: (action = undefined, view = "login") => set({ 
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
