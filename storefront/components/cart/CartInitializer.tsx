"use client";

import { useEffect, useRef } from "react";
import { useCartStore } from "@/lib/store";

export function CartInitializer() {
  const { syncCart, cartId } = useCartStore();
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Only sync once on mount, and only if there's a cartId
    if (!hasInitialized.current && cartId) {
      hasInitialized.current = true;
      syncCart();
    }
  }, [syncCart, cartId]);

  return null;
}
