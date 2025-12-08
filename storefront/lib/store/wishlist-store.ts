import { create } from "zustand";
import { useUserStore } from "@/lib/store";

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";

const customFetch = async (path: string, options: RequestInit = {}) => {
  const token = useUserStore.getState().accessToken;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(PUBLISHABLE_KEY ? { "x-publishable-api-key": PUBLISHABLE_KEY } : {}),
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `Request failed: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage = errorData.message;
      }
      if (errorData.error) {
        errorMessage += ` - ${errorData.error}`;
      }
    } catch {
      // Ignore JSON parse error
    }
    throw new Error(errorMessage);
  }

  return response.json();
};

export interface WishlistItem {
  id: string;
  product_id: string;
  variant_id?: string | null;
  created_at: string;
}

interface WishlistStore {
  items: WishlistItem[];
  isLoading: boolean;
  fetchWishlist: () => Promise<void>;
  addItem: (productId: string, variantId?: string) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  isInWishlist: (productId: string, variantId?: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistStore>((set, get) => ({
  items: [],
  isLoading: false,
  fetchWishlist: async () => {
    const token = useUserStore.getState().accessToken;
    if (!token) {
      // User not authenticated, clear wishlist silently
      set({ items: [], isLoading: false });
      return;
    }
    
    set({ isLoading: true });
    try {
      const res = await customFetch("/store/wishlist");
      if (res.wishlist) {
        set({ items: res.wishlist.items || [] });
      } else {
        set({ items: [] });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      // If unauthorized, silently clear the wishlist (user logged out or token expired)
      if (errorMessage.includes("Unauthorized") || errorMessage.includes("401")) {
        set({ items: [] });
      } else {
        console.error("Failed to fetch wishlist:", error);
      }
    } finally {
      set({ isLoading: false });
    }
  },
  addItem: async (productId, variantId) => {
    try {
      const res = await customFetch("/store/wishlist", {
        method: "POST",
        body: JSON.stringify({
          product_id: productId,
          variant_id: variantId,
        }),
      });
      
      const currentItems = get().items;
      if (!currentItems.find(i => i.id === res.item.id)) {
        set({ items: [...currentItems, res.item] });
      }
    } catch (error) {
      console.error("Failed to add to wishlist:", error);
      throw error;
    }
  },
  removeItem: async (itemId) => {
    try {
      await customFetch(`/store/wishlist/${itemId}`, {
        method: "DELETE",
      });
      set({ items: get().items.filter((i) => i.id !== itemId) });
    } catch (error) {
      console.error("Failed to remove from wishlist:", error);
      throw error;
    }
  },
  isInWishlist: (productId, variantId) => {
    return get().items.some(
      (item) => 
        item.product_id === productId && 
        (!variantId || item.variant_id === variantId)
    );
  },
  clearWishlist: () => {
    set({ items: [], isLoading: false });
  },
}));
