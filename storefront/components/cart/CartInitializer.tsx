"use client";

import { useEffect, useRef } from "react";
import { useCartStore } from "@/lib/store";

export function CartInitializer() {
  const { fetchCart, cartId, clearCart } = useCartStore();
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Only initialize once on mount
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    
    if (!cartId) return;
    
    // fetchCart handles validation internally
    fetchCart().catch((error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes("completed") || errorMessage.includes("not found") || errorMessage.includes("404")) {
        console.log("Cart error detected, clearing...", errorMessage);
        clearCart();
      }
    });
  }, [fetchCart, cartId, clearCart]);

  return null;
}
