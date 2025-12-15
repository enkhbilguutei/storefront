import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ComparisonProduct {
  id: string; // kept for backward compatibility; use productId
  productId?: string;
  variantId: string;
  title: string;
  handle: string;
  thumbnail?: string | null;
  price?: {
    amount: number;
    currencyCode: string;
  };
  // Store variant attributes for comparison
  attributes?: {
    [key: string]: string | number | boolean;
  };
}

interface ComparisonStore {
  // State
  products: ComparisonProduct[];
  isBarVisible: boolean;

  // Actions
  addProduct: (product: ComparisonProduct) => void;
  removeProduct: (variantId: string) => void;
  clearAll: () => void;
  isInComparison: (variantId: string) => boolean;
  toggleProduct: (product: ComparisonProduct) => void;
  setBarVisible: (visible: boolean) => void;
}

export const useComparisonStore = create<ComparisonStore>()(
  persist(
    (set, get) => ({
      // Initial state
      products: [],
      isBarVisible: false,

      // Add product to comparison (max 4)
      addProduct: (product) => {
        const { products } = get();
        
        // Check if already in comparison
        if (products.some((p) => p.variantId === product.variantId)) {
          return;
        }

        // Max 4 products
        if (products.length >= 4) {
          console.warn("Maximum 4 products can be compared");
          return;
        }

        set({
          products: [...products, product],
          isBarVisible: true,
        });
      },

      // Remove product from comparison
      removeProduct: (variantId) => {
        const { products } = get();
        const newProducts = products.filter((p) => p.variantId !== variantId);
        
        set({
          products: newProducts,
          isBarVisible: newProducts.length > 0,
        });
      },

      // Clear all products
      clearAll: () => {
        set({
          products: [],
          isBarVisible: false,
        });
      },

      // Check if product is in comparison
      isInComparison: (variantId) => {
        return get().products.some((p) => p.variantId === variantId);
      },

      // Toggle product in comparison
      toggleProduct: (product) => {
        const { isInComparison, addProduct, removeProduct } = get();
        
        if (isInComparison(product.variantId)) {
          removeProduct(product.variantId);
        } else {
          addProduct(product);
        }
      },

      // Set bar visibility
      setBarVisible: (visible) => {
        set({ isBarVisible: visible });
      },
    }),
    {
      name: "comparison-storage",
      // Only persist products, not UI state
      partialize: (state) => ({ products: state.products }),
      // Restore bar visibility based on products
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isBarVisible = state.products.length > 0;
        }
      },
    }
  )
);
