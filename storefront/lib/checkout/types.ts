// Checkout types
import type { CartData, CartItem } from "@/lib/store";

// Re-export cart types for checkout module
export type { CartData, CartItem };

export interface ShippingMethod {
  id: string;
  shipping_option_id?: string;
  name?: string;
}

// Re-export CartData as Cart for checkout compatibility
export type Cart = CartData;

export interface ShippingOption {
  id: string;
  name: string;
  amount: number;
}

export type DeliveryMethod = "delivery" | "pickup";
export type PaymentMethod = "bank_transfer" | "cash_on_delivery" | "qpay";

export interface CheckoutFormData {
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
  selectedShippingOption: string | null;
  paymentMethod: PaymentMethod;
}

export interface CheckoutFormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  city?: string;
  district?: string;
  khoroo?: string;
  street?: string;
  building?: string;
  apartment?: string;
  shipping?: string;
}

// Form state for useReducer
export interface CheckoutFormState extends CheckoutFormData {
  errors: CheckoutFormErrors;
  touched: Record<string, boolean>;
  formSubmitted: boolean;
}

export type CheckoutFormAction =
  | { type: "SET_FIELD"; field: keyof CheckoutFormData; value: string | null }
  | { type: "SET_TOUCHED"; field: string }
  | { type: "SET_ERRORS"; errors: CheckoutFormErrors }
  | { type: "SET_FORM_SUBMITTED"; value: boolean }
  | { type: "RESET_FORM" }
  | { type: "PREFILL_USER"; firstName: string; lastName: string; email: string };
