"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/lib/store";
import type { 
  CheckoutFormState, 
  CheckoutFormAction, 
  CheckoutFormErrors, 
  CheckoutFormData,
  DeliveryMethod,
  PaymentMethod 
} from "./types";

// Helper to compare errors objects
const areErrorsEqual = (a: CheckoutFormErrors, b: CheckoutFormErrors): boolean => {
  const keysA = Object.keys(a) as (keyof CheckoutFormErrors)[];
  const keysB = Object.keys(b) as (keyof CheckoutFormErrors)[];
  if (keysA.length !== keysB.length) return false;
  return keysA.every(key => a[key] === b[key]);
};

// Initial form state
const initialFormState: CheckoutFormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  deliveryMethod: "delivery",
  city: "Улаанбаатар",
  district: "",
  khoroo: "",
  street: "",
  building: "",
  apartment: "",
  additionalInfo: "",
  selectedShippingOption: null,
  paymentMethod: "bank_transfer",
  errors: {},
  touched: {},
  formSubmitted: false,
};

// Form reducer for consolidated state management
function formReducer(state: CheckoutFormState, action: CheckoutFormAction): CheckoutFormState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "SET_TOUCHED":
      return { ...state, touched: { ...state.touched, [action.field]: true } };
    case "SET_ERRORS":
      return { ...state, errors: action.errors };
    case "SET_FORM_SUBMITTED":
      return { ...state, formSubmitted: action.value };
    case "RESET_FORM":
      return initialFormState;
    case "PREFILL_USER":
      return {
        ...state,
        firstName: state.firstName || action.firstName,
        lastName: state.lastName || action.lastName,
        email: state.email || action.email,
      };
    default:
      return state;
  }
}

export function useCheckout() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  
  // Use centralized cart store
  const { 
    cartId, 
    cart, 
    clearCart, 
    fetchCart,
    isFetching: isCartFetching,
    error: cartError,
    setError: setCartError,
  } = useCartStore();
  
  // Consolidated form state with useReducer
  const [formState, dispatch] = useReducer(formReducer, initialFormState);
  
  // Submission state
  const [submissionState, setSubmissionState] = useReducer(
    (state: { isSubmitting: boolean; error: string | null }, 
     action: Partial<typeof state>) => ({ ...state, ...action }),
    { isSubmitting: false, error: null }
  );
  
  // Refs for preventing duplicate submissions
  const isCompletingRef = useRef(false);
  const lastSubmitAttempt = useRef<number>(0);

  // Format price - memoized
  const formatPrice = useCallback((amount: number) => {
    return new Intl.NumberFormat("mn-MN", {
      style: "currency",
      currency: cart?.currency_code?.toUpperCase() || "MNT",
    }).format(amount);
  }, [cart?.currency_code]);

  // Fetch cart on mount
  useEffect(() => {
    fetchCart();
    
    // Warm up the backend connection (helps with serverless DB cold starts)
    fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/warm`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
      },
    }).catch(() => {}); // Ignore errors, this is just a warmup
  }, [fetchCart]);

  // Pre-fill user data from session
  useEffect(() => {
    const user = session?.user;
    if (user) {
      const nameParts = user.name?.split(" ") || [];
      dispatch({
        type: "PREFILL_USER",
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        email: user.email || "",
      });
    }
  }, [session]);

  // Pre-fill email from cart
  useEffect(() => {
    if (cart?.email && !formState.email) {
      dispatch({ type: "SET_FIELD", field: "email", value: cart.email });
    }
  }, [cart?.email, formState.email]);

  // Validation - computes errors and only dispatches if changed
  const validate = useCallback(() => {
    const newErrors: CheckoutFormErrors = {};
    const { firstName, lastName, email, phone, deliveryMethod, city, district, khoroo, street, building, apartment } = formState;

    if (!firstName.trim()) newErrors.firstName = "Нэр оруулна уу";
    if (!lastName.trim()) newErrors.lastName = "Овог оруулна уу";
    if (!email.trim()) newErrors.email = "И-мэйл оруулна уу";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "И-мэйл хаяг буруу байна";
    if (!phone.trim()) newErrors.phone = "Утас оруулна уу";
    else if (!/^\d{8}$/.test(phone.replace(/\s/g, ""))) newErrors.phone = "8 оронтой дугаар оруулна уу";

    if (deliveryMethod === "delivery") {
      if (!city) newErrors.city = "Хот сонгоно уу";
      if (!district.trim()) newErrors.district = "Дүүрэг оруулна уу";
      if (!khoroo.trim()) newErrors.khoroo = "Хороо оруулна уу";
      if (!street.trim()) newErrors.street = "Гудамж оруулна уу";
      if (!building.trim()) newErrors.building = "Байр оруулна уу";
      if (!apartment.trim()) newErrors.apartment = "Тоот оруулна уу";
    }

    // Only dispatch if errors changed to avoid infinite loops
    if (!areErrorsEqual(newErrors, formState.errors)) {
      dispatch({ type: "SET_ERRORS", errors: newErrors });
    }
    return Object.keys(newErrors).length === 0;
  }, [formState]);

  // Run validation on form field changes (debounced)
  const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }
    validationTimeoutRef.current = setTimeout(() => {
      validate();
    }, 100);
    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, [validate]);

  // Field setters - memoized
  const setField = useCallback((field: keyof CheckoutFormData, value: string | null) => {
    dispatch({ type: "SET_FIELD", field, value });
  }, []);

  const handleBlur = useCallback((field: string) => {
    dispatch({ type: "SET_TOUCHED", field });
  }, []);

  const getError = useCallback((field: string) => {
    return (formState.touched[field] || formState.formSubmitted) 
      ? formState.errors[field as keyof CheckoutFormErrors] 
      : undefined;
  }, [formState.touched, formState.formSubmitted, formState.errors]);

  const setFormSubmitted = useCallback((value: boolean) => {
    dispatch({ type: "SET_FORM_SUBMITTED", value });
  }, []);

  // Computed loading state
  const isLoading = isCartFetching && !cart;

  return {
    // Session
    session,
    sessionStatus,
    isAuthenticated: !!session?.user,
    
    // Cart - from centralized store
    cart,
    cartId,
    isLoading,
    error: submissionState.error || cartError,
    setError: (error: string | null) => {
      setSubmissionState({ error });
      if (!error) setCartError(null);
    },
    clearCart,
    
    // Form fields - consolidated
    firstName: formState.firstName,
    setFirstName: (v: string) => setField("firstName", v),
    lastName: formState.lastName,
    setLastName: (v: string) => setField("lastName", v),
    email: formState.email,
    setEmail: (v: string) => setField("email", v),
    phone: formState.phone,
    setPhone: (v: string) => setField("phone", v),
    deliveryMethod: formState.deliveryMethod as DeliveryMethod,
    setDeliveryMethod: (v: DeliveryMethod) => setField("deliveryMethod", v),
    city: formState.city,
    setCity: (v: string) => setField("city", v),
    district: formState.district,
    setDistrict: (v: string) => setField("district", v),
    khoroo: formState.khoroo,
    setKhoroo: (v: string) => setField("khoroo", v),
    street: formState.street,
    setStreet: (v: string) => setField("street", v),
    building: formState.building,
    setBuilding: (v: string) => setField("building", v),
    apartment: formState.apartment,
    setApartment: (v: string) => setField("apartment", v),
    additionalInfo: formState.additionalInfo,
    setAdditionalInfo: (v: string) => setField("additionalInfo", v),
    paymentMethod: formState.paymentMethod as PaymentMethod,
    setPaymentMethod: (v: PaymentMethod) => setField("paymentMethod", v),
    
    // Submission
    isSubmitting: submissionState.isSubmitting,
    setIsSubmitting: (v: boolean) => setSubmissionState({ isSubmitting: v }),
    errors: formState.errors,
    formSubmitted: formState.formSubmitted,
    setFormSubmitted,
    
    // Refs
    isCompletingRef,
    lastSubmitAttempt,
    
    // Utilities
    formatPrice,
    validate,
    handleBlur,
    getError,
    router,
  };
}
