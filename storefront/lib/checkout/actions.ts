"use client";

import { medusa } from "@/lib/medusa";
import { z } from "zod";
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

const checkoutSchema = z.object({
  firstName: z.string().min(1, "Нэр оруулна уу"),
  lastName: z.string().min(1, "Овог оруулна уу"),
  email: z.string().email("Имэйл хаяг буруу байна"),
  phone: z.string().min(8, "Утасны дугаар буруу байна"),
  deliveryMethod: z.enum(["delivery", "pickup"]),
  address: z.string().optional(),
  apartment: z.string().optional(),
  paymentMethod: z.enum(["bank_transfer", "cash_on_delivery", "qpay"]),
});

type CheckoutData = z.infer<typeof checkoutSchema>;

// Minimal delay only where needed for API consistency
const minDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function completeCheckout({
  cartId,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  cart,
  firstName,
  lastName,
  email,
  phone,
  deliveryMethod,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  city,
  district,
  khoroo,
  street,
  building,
  apartment,
  additionalInfo,
  paymentMethod,
  onSuccess,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  clearCart,
}: CompleteCheckoutParams) {
  console.log(`[Checkout] Starting completeCheckout for cart ${cartId}`);
  
  const data: CheckoutData = {
    firstName,
    lastName,
    email,
    phone,
    deliveryMethod,
    address: deliveryMethod === "delivery" 
      ? [street, building && `${building}-р байр`, apartment].filter(Boolean).join(", ")
      : "Дэлгүүрээс авах",
    apartment: additionalInfo,
    paymentMethod,
  };

  console.log(`[Checkout] Data:`, JSON.stringify(data, null, 2));

  try {
    // Step 1: Validate input
    const validatedData = checkoutSchema.parse(data);
    
    // Step 2: Update cart with addresses and email
    console.log(`[Checkout] Updating cart...`);
    const addressPayload = {
      first_name: validatedData.firstName,
      last_name: validatedData.lastName,
      address_1: validatedData.address,
      city: "Ulaanbaatar",
      country_code: "mn",
      phone: validatedData.phone,
      company: validatedData.apartment, // Using company field for apartment/details
      postal_code: "10000", // Default postal code
      province: deliveryMethod === "delivery" ? `${district}, ${khoroo}` : "",
    };

    const { cart: updatedCart } = await medusa.store.cart.update(cartId, {
      email: validatedData.email,
      shipping_address: addressPayload,
      billing_address: addressPayload,
      metadata: {
        payment_method: paymentMethod,
        delivery_method: deliveryMethod,
      },
    });
    console.log(`[Checkout] Cart updated.`);

    // Step 3: Add shipping method
    console.log(`[Checkout] Fetching shipping options...`);
    const { shipping_options } = await medusa.store.fulfillment.listCartOptions({
      cart_id: cartId,
    });
    
    if (shipping_options.length > 0) {
      let selectedOption;
      if (deliveryMethod === "pickup") {
        selectedOption = shipping_options.find((opt) => opt.name.toLowerCase().includes("авах"));
      } else {
        selectedOption = shipping_options.find((opt) => !opt.name.toLowerCase().includes("авах"));
      }

      if (!selectedOption) {
        selectedOption = shipping_options[0]; // Fallback
        console.warn(`[Checkout] Desired shipping option not found, using fallback: ${selectedOption.id}`);
      }

      console.log(`[Checkout] Adding shipping method: ${selectedOption.id}`);
      await medusa.store.cart.addShippingMethod(cartId, {
        option_id: selectedOption.id,
      });
      console.log(`[Checkout] Shipping method added.`);
    } else {
      console.warn(`[Checkout] No shipping options found for cart ${cartId}`);
    }

    // Step 4: Force payment session update/init
    console.log(`[Checkout] Fetching regions...`);
    const { regions } = await medusa.store.region.list();
    const region = regions[0]; // Assuming single region for now
    
    // Use system default provider
    const providerId = region.payment_providers?.find(p => p.id === "pp_system_default")?.id || "pp_system_default";
    console.log(`[Checkout] Using payment provider: ${providerId}`);
    
    console.log(`[Checkout] Initiating payment session...`);
    // Use updatedCart here as it has the latest address info
    await medusa.store.payment.initiatePaymentSession(updatedCart, {
      provider_id: providerId,
      data: {
        payment_method: paymentMethod,
      },
    });
    console.log(`[Checkout] Payment session initiated with payment method: ${paymentMethod}`);

    // Step 5: Complete order - SINGLE CALL
    console.log(`[Checkout] Completing cart...`);
    const completeResult = await medusa.store.cart.complete(cartId);
    console.log(`[Checkout] Cart completed. Result:`, JSON.stringify(completeResult, null, 2));

    if (completeResult.type === "order") {
      onSuccess(completeResult.order.id, paymentMethod);
      return { success: true, orderId: completeResult.order.id };
    } else {
      // If it's not an order (e.g. cart), something went wrong
      console.error(`[Checkout] Complete returned type: ${completeResult.type}`);
      throw new Error("Order completion failed - returned cart instead of order");
    }
  } catch (error: unknown) {
    console.error("[Checkout] Error in completeCheckout:", error);
    
    // Check for 500 error which likely means invalid cart/region
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err = error as any;
    if (err.status === 500 || (err.message && err.message.includes("500"))) {
       throw new Error("CART_INVALID");
    }

    // Ensure we throw a proper Error object
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(typeof error === 'string' ? error : "Unknown error during checkout");
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatCheckoutError(error: any): string {
  console.error("[Checkout] Detailed error:", JSON.stringify(error, null, 2));
  
  if (error instanceof z.ZodError) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (error as any).errors[0].message;
  }
  
  const errorMessage = error?.message || "Unknown error";
  
  // Handle specific Medusa errors
  if (errorMessage.includes("Inventory")) {
    return "Зарим бараа агуулахад дууссан байна.";
  }
  
  if (errorMessage.includes("shipping")) {
    return "Хүргэлтийн сонголт буруу байна.";
  }

  if (errorMessage.includes("CART_INVALID")) {
    return "CART_INVALID";
  }

  if (errorMessage.includes("500") || errorMessage.includes("Internal Server Error")) {
    return "Сэрвэрт алдаа гарлаа. Түр хүлээгээд дахин оролдоно уу. (500)";
  }

  return "Захиалга үүсгэхэд алдаа гарлаа. Дахин оролдоно уу.";
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
  
  // Cart already completed or being completed - wait and check cart status
  if (isCartCompletedError) {
    // Wait for the other completion request to finish
    await minDelay(2000);
    
    try {
      // Check if cart is now completed
      const { cart: currentCart } = await medusa.store.cart.retrieve(cartId, {
        fields: "+completed_at",
      });
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((currentCart as any).completed_at) {
        // Cart was completed successfully by the other request
        clearCart();
        // Redirect to confirmation - the page will show success even without order details
        return "__redirect_confirmation__";
      }
      
      // Cart not completed yet, try to complete it ourselves
      const completeResult = await medusa.store.cart.complete(cartId);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = completeResult as any;
      const orderId = result?.order?.id || result?.data?.id || result?.data?.order?.id || result?.id;
      
      if (result?.type === "order" || orderId) {
        clearCart();
        if (orderId) {
          onSuccess(orderId, paymentMethod);
          return "";
        }
        return "__redirect_confirmation__";
      }
    } catch (retryErr) {
      const retryMsg = retryErr instanceof Error ? retryErr.message : String(retryErr);
      // If cart retrieve fails or is already completed, assume success
      if (retryMsg.includes("completed") || retryMsg.includes("not found") || retryMsg.includes("404")) {
        clearCart();
        return "__redirect_confirmation__";
      }
    }
    
    // As a last resort, clear cart and redirect to confirmation
    clearCart();
    return "__redirect_confirmation__";
  }
  
  // Idempotency error - wait and check cart status
  if (isIdempotencyError) {
    await minDelay(1000);
    
    try {
      const { cart: currentCart } = await medusa.store.cart.retrieve(cartId, {
        fields: "+shipping_methods,+completed_at",
      });
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cartCompleted = (currentCart as any).completed_at;
      
      if (cartCompleted) {
        // Cart is completed, redirect to confirmation
        clearCart();
        return "__redirect_confirmation__";
      }
      
      // Cart not completed, try to complete it
      await minDelay(500);
      
      try {
        const retryResult = await medusa.store.cart.complete(cartId);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const retryData = retryResult as any;
        const orderId = retryData?.order?.id || retryData?.data?.id;
        
        if (retryData?.type === "order" || orderId) {
          clearCart();
          if (orderId) {
            onSuccess(orderId, paymentMethod);
            return "";
          }
          return "__redirect_confirmation__";
        }
      } catch (retryCompleteErr) {
        const retryMsg = retryCompleteErr instanceof Error ? retryCompleteErr.message : String(retryCompleteErr);
        // If it says already completed or being completed, that's a success
        if (retryMsg.includes("completed") || retryMsg.includes("being completed")) {
          clearCart();
          return "__redirect_confirmation__";
        }
        if (retryMsg.includes("Idempotency") || retryMsg.includes("conflicted")) {
          // Wait and redirect to confirmation
          await minDelay(2000);
          clearCart();
          return "__redirect_confirmation__";
        }
      }
      
      return "Захиалга үүсгэхэд алдаа гарлаа. Дахин оролдоно уу.";
    } catch {
      // Cart retrieve failed, probably completed
      clearCart();
      return "__redirect_confirmation__";
    }
  }
  
  // Handle success without order ID
  if (errorMessage.includes("__success_no_id__")) {
    clearCart();
    return "__redirect_confirmation__";
  }
  
  // Handle lock message - someone else is processing
  if (errorMessage.includes("боловсруулж байна")) {
    // Wait a bit and redirect to confirmation
    await minDelay(3000);
    clearCart();
    return "__redirect_confirmation__";
  }
  
  // Use formatCheckoutError for standard messages
  return formatCheckoutError(err);
}
