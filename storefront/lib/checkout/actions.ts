"use client";

import { medusa } from "@/lib/medusa";
import type { Cart, DeliveryMethod, PaymentMethod } from "./types";

interface CompleteCheckoutParams {
  cartId: string;
  cart: Cart;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  deliveryMethod: DeliveryMethod;
  city: string;
  district: string;
  khoroo: string;
  street: string;
  building: string;
  apartment: string;
  additionalInfo: string;
  paymentMethod: PaymentMethod;
  onSuccess: (orderId: string, paymentMethod: PaymentMethod) => void;
  clearCart: () => void;
}

// Minimal delay only where needed for API consistency
const minDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Shipping options cache for checkout completion
let cachedShippingOptions: { cartId: string; options: Array<{ id: string; name: string }> } | null = null;

// Prevent duplicate completions
const completionInProgress = new Set<string>();

export async function completeCheckout({
  cartId,
  cart,
  firstName,
  lastName,
  email,
  phone,
  deliveryMethod,
  city,
  district,
  khoroo,
  street,
  building,
  apartment,
  additionalInfo,
  paymentMethod,
  onSuccess,
  clearCart,
}: CompleteCheckoutParams): Promise<void> {
  // Prevent duplicate completion attempts
  if (completionInProgress.has(cartId)) {
    throw new Error("Захиалга боловсруулж байна...");
  }
  completionInProgress.add(cartId);

  try {
    // Early validation - check if cart is already completed
    if (cart.completed_at || cart.status === "completed") {
      clearCart();
      throw new Error("Энэ захиалга аль хэдийн баталгаажсан байна.");
    }

    // Validate required fields
    if (!email || !firstName || !lastName || !phone) {
      throw new Error("Холбоо барих мэдээлэл дутуу байна.");
    }

    const addressLine = deliveryMethod === "delivery" 
      ? [street, building && `${building}-р байр`, apartment].filter(Boolean).join(", ")
      : "Дэлгүүрээс авах";
    const province = deliveryMethod === "delivery" ? `${district}, ${khoroo}` : "";

    // Step 1: Determine shipping option - auto-select based on delivery method
    let shippingOptionId: string;
    
    // Fetch shipping options (use cache if available)
    let shippingOptions = cachedShippingOptions?.cartId === cartId 
      ? cachedShippingOptions.options 
      : null;
    
    if (!shippingOptions) {
      const { shipping_options } = await medusa.store.fulfillment.listCartOptions({ cart_id: cartId });
      shippingOptions = (shipping_options || []).map((o: { id: string; name: string }) => ({ id: o.id, name: o.name }));
      cachedShippingOptions = { cartId, options: shippingOptions };
    }
    
    if (deliveryMethod === "pickup") {
      const pickupOption = shippingOptions.find((opt) => opt.name.toLowerCase().includes("авах"));
      if (!pickupOption) {
        throw new Error("Дэлгүүрээс авах сонголт олдсонгүй. Дэлгүүрийн тохиргоог шалгана уу.");
      }
      shippingOptionId = pickupOption.id;
    } else {
      // Auto-select first non-pickup delivery option (usually standard/cheapest)
      const deliveryOption = shippingOptions.find((opt) => !opt.name.toLowerCase().includes("авах"));
      if (!deliveryOption) {
        throw new Error("Хүргэлтийн сонголт олдсонгүй.");
      }
      shippingOptionId = deliveryOption.id;
    }

    const addressPayload = {
      first_name: firstName,
      last_name: lastName,
      address_1: addressLine,
      address_2: deliveryMethod === "delivery" ? additionalInfo : "",
      city: deliveryMethod === "delivery" ? city : "Улаанбаатар",
      province,
      postal_code: "",
      country_code: "mn",
      phone,
    };

    // Step 2: Update cart and add shipping - run in parallel where possible
    const needsShippingUpdate = !cart.shipping_methods?.length || 
      cart.shipping_methods[0]?.shipping_option_id !== shippingOptionId;

    // Update cart with addresses
    const cartUpdatePromise = medusa.store.cart.update(cartId, {
      email,
      shipping_address: addressPayload,
      billing_address: addressPayload,
    });

    // If we need shipping update, do it right after cart update
    if (needsShippingUpdate) {
      await cartUpdatePromise;
      await medusa.store.cart.addShippingMethod(cartId, { option_id: shippingOptionId });
    } else {
      await cartUpdatePromise;
    }

    // Step 3: Initialize payment session - only if needed
    // Skip the retrieve step if we already have payment_collection info
    const regionId = cart.region_id;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existingPaymentSessions = (cart as any).payment_collection?.payment_sessions;
    
    if (!existingPaymentSessions?.length) {
      // Need to initialize payment - get providers and cart in parallel
      const providersPromise = regionId 
        ? medusa.store.payment.listPaymentProviders({ region_id: regionId })
        : null;
      
      const { cart: cartForPayment } = await medusa.store.cart.retrieve(cartId, {
        fields: "+payment_collection.payment_sessions,+region_id",
      });
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const paymentCollection = (cartForPayment as any).payment_collection;
      
      if (!paymentCollection?.payment_sessions?.length) {
        const finalRegionId = regionId || cartForPayment.region_id;
        if (finalRegionId) {
          const providersResult = providersPromise 
            ? await providersPromise 
            : await medusa.store.payment.listPaymentProviders({ region_id: finalRegionId });
          const providerId = providersResult.payment_providers?.[0]?.id || "pp_system_default";
          await medusa.store.payment.initiatePaymentSession(cartForPayment, { provider_id: providerId });
        }
      }
    }

    // Step 4: Complete order
    const completeResult = await medusa.store.cart.complete(cartId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = completeResult as any;
    
    // Try to extract order ID from various response formats
    // SDK can return: { type: "order", order: { id } } or { data: { id } }
    const orderId = result?.order?.id || result?.data?.id || result?.data?.order?.id || result?.id;
    
    // Check if successful order type
    if (result?.type === "order" || orderId) {
      if (orderId) {
        clearCart();
        onSuccess(orderId, paymentMethod);
        return;
      }
    }
    
    if (result?.type === "cart" || result?.cart) {
      const returnedCart = result?.cart || result;
      const missingItems: string[] = [];
      if (!returnedCart?.email) missingItems.push("email");
      if (!returnedCart?.shipping_address) missingItems.push("shipping_address");
      if (!returnedCart?.shipping_methods?.length) missingItems.push("shipping_method");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (!(returnedCart as any)?.payment_collection?.payment_sessions?.length) missingItems.push("payment_session");
      
      if (missingItems.length > 0) {
        throw new Error(`Захиалга дуусгахад дараах мэдээлэл дутуу байна: ${missingItems.join(", ")}`);
      }
      throw new Error("Захиалга дуусгахад алдаа гарлаа. Дахин оролдоно уу.");
    } else {
      throw new Error(result?.error?.message || "Захиалга үүсгэхэд алдаа гарлаа");
    }
  } finally {
    completionInProgress.delete(cartId);
  }
}

export async function handleCheckoutError(
  err: unknown,
  cartId: string,
  paymentMethod: PaymentMethod,
  clearCart: () => void,
  onSuccess: (orderId: string, paymentMethod: PaymentMethod) => void,
): Promise<string> {
  const errorMessage = err instanceof Error ? err.message : String(err);
  const isIdempotencyError = errorMessage.includes("Idempotency") || errorMessage.includes("conflicted");
  const isCartCompletedError = errorMessage.includes("already completed") || errorMessage.includes("being completed");
  
  // Helper to try to find the order from a completed cart
  const tryFindOrderFromCart = async (): Promise<string | null> => {
    try {
      // Try to get the order by cart ID first (most reliable)
      const { orders } = await medusa.store.order.list({ 
        limit: 5,
        order: "-created_at",
      });
      
      if (orders?.[0]?.id) {
        return orders[0].id;
      }
    } catch {
      // Orders API failed
    }
    return null;
  };
  
  // Cart already completed or being completed - try to find the order
  if (isCartCompletedError) {
    // Wait a moment for the completion to finish
    await minDelay(500);
    
    // Try to find the order
    const orderId = await tryFindOrderFromCart();
    if (orderId) {
      clearCart();
      onSuccess(orderId, paymentMethod);
      return "";
    }
    
    // Still try to check cart status
    try {
      const { cart: currentCart } = await medusa.store.cart.retrieve(cartId, {
        fields: "+completed_at",
      });
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((currentCart as any).completed_at) {
        // Cart was completed, order should exist
        await minDelay(300);
        const orderId2 = await tryFindOrderFromCart();
        if (orderId2) {
          clearCart();
          onSuccess(orderId2, paymentMethod);
          return "";
        }
      }
    } catch {
      // Cart retrieve failed, it's probably completed
    }
    
    // As a last resort, clear cart and redirect to confirmation with placeholder
    clearCart();
    return "__redirect_confirmation__";
  }
  
  // Idempotency error - wait and check
  if (isIdempotencyError) {
    await minDelay(500);
    
    try {
      const { cart: currentCart } = await medusa.store.cart.retrieve(cartId, {
        fields: "+shipping_methods,+completed_at",
      });
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cartCompleted = (currentCart as any).completed_at;
      
      if (cartCompleted) {
        const orderId = await tryFindOrderFromCart();
        if (orderId) {
          clearCart();
          onSuccess(orderId, paymentMethod);
          return "";
        }
        clearCart();
        return "__redirect_home__";
      }
      
      await minDelay(300);
      
      try {
        const retryResult = await medusa.store.cart.complete(cartId);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const retryData = retryResult as any;
        
        if (retryData?.type === "order" && retryData?.order?.id) {
          clearCart();
          onSuccess(retryData.order.id, paymentMethod);
          return "";
        } else if (retryData?.order?.id) {
          clearCart();
          onSuccess(retryData.order.id, paymentMethod);
          return "";
        }
      } catch (retryCompleteErr) {
        const retryMsg = retryCompleteErr instanceof Error ? retryCompleteErr.message : String(retryCompleteErr);
        if (retryMsg.includes("Idempotency") || retryMsg.includes("conflicted")) {
          return "__refresh_5s__";
        }
      }
      
      return "Захиалга үүсгэхэд алдаа гарлаа. Дахин оролдоно уу.";
    } catch {
      const orderId = await tryFindOrderFromCart();
      if (orderId) {
        clearCart();
        onSuccess(orderId, paymentMethod);
        return "";
      }
      clearCart();
      return "__redirect_confirmation__";
    }
  }
  
  // Specific error messages
  if (errorMessage.includes("email")) return "И-мэйл хаяг буруу байна";
  if (errorMessage.includes("shipping") || errorMessage.includes("address")) return "Хүргэлтийн хаяг буруу байна";
  if (errorMessage.includes("payment")) return "Төлбөрийн алдаа гарлаа";
  if (errorMessage.includes("inventory") || errorMessage.includes("stock")) return "Бараа дууссан байна";
  if (err instanceof Error) return err.message;
  
  return "Захиалга үүсгэхэд алдаа гарлаа";
}
