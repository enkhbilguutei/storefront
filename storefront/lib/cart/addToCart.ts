/**
 * Centralized add-to-cart helper
 * Consolidates cart creation and line item addition logic
 */

import { medusa } from "@/lib/medusa";
import { getDefaultRegion } from "@/lib/data/regions";
import { toast } from "@/lib/toast";
import type { CartData, CartItem } from "@/lib/store";

export interface AddToCartParams {
  variantId: string;
  quantity: number;
  productInfo: {
    id: string;
    title: string;
    thumbnail?: string | null;
    handle: string;
    unitPrice: number;
  };
  currentCartId?: string | null;
  setCartId: (id: string) => void;
  syncCart: () => Promise<CartData | null>;
  addItem: (item: CartItem) => void;
  openCartNotification: () => void;
}

export async function addToCart({
  variantId,
  quantity,
  productInfo,
  currentCartId,
  setCartId,
  syncCart,
  addItem,
  openCartNotification,
}: AddToCartParams): Promise<boolean> {
  try {
    let cartId = currentCartId;

    // Create cart if it doesn't exist
    if (!cartId) {
      const defaultRegion = await getDefaultRegion();
      
      if (!defaultRegion) {
        toast.error("Бүс нутаг олдсонгүй. Дэлгүүрийн админтай холбогдоно уу.");
        return false;
      }
      
      const { cart } = await medusa.store.cart.create({
        region_id: defaultRegion.id
      });
      cartId = cart.id;
      setCartId(cart.id);
    }

    if (!cartId) {
      return false;
    }

    // Add item to Medusa cart
    await medusa.store.cart.createLineItem(cartId, {
      variant_id: variantId,
      quantity: quantity,
    });

    // Sync cart state from server
    await syncCart();
    
    // Show notification with item details
    const addedItem = {
      id: "added-" + Date.now(),
      variantId: variantId,
      productId: productInfo.id,
      title: productInfo.title,
      quantity: quantity,
      thumbnail: productInfo.thumbnail,
      unitPrice: productInfo.unitPrice,
      handle: productInfo.handle
    };
    
    addItem(addedItem);
    openCartNotification();
    
    return true;
  } catch (error) {
    console.error("Error adding to cart:", error);
    const message =
      (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
      (error as Error)?.message ||
      "";
    const normalized = message.toLowerCase();

    if (normalized.includes("stock location")) {
      toast.error("Энэ бараанд нөөцийн байршил холбогдоогүй байна. Дэлгүүрийн админтай холбогдоно уу.");
    } else if (normalized.includes("out of stock") || normalized.includes("inventory")) {
      toast.error("Барааны нөөц дууссан байна.");
    } else {
      toast.error("Сагсанд нэмэхэд алдаа гарлаа. Дахин оролдоно уу.");
    }
    return false;
  }
}
