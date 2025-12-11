"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Loader2,
  ShoppingBag,
  Lock,
  AlertCircle,
  User,
  Mail,
  Phone,
  Truck,
  Store,
  MapPin,
  Clock,
  Building2,
  Banknote,
  Package,
  LogIn,
  CheckCircle,
} from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { useCheckout, completeCheckout, handleCheckoutError, STORE_INFO, CITIES, UB_DISTRICTS } from "@/lib/checkout";

// Metadata: Төлбөр тооцоо | Алимхан Дэлгүүр (client component - add layout)

export default function CheckoutPage() {
  const checkout = useCheckout();

  // Handle form submission
  const handleSubmit = async () => {
    // IMMEDIATE blocking check - must be first
    if (checkout.isCompletingRef.current) {
      console.log("[Checkout] Ref lock active, ignoring duplicate click");
      return;
    }
    
    // Set ref lock IMMEDIATELY before any async work
    checkout.isCompletingRef.current = true;
    
    // Secondary check with state
    if (checkout.isSubmitting) {
      console.log("[Checkout] State lock active, ignoring");
      checkout.isCompletingRef.current = false;
      return;
    }

    const now = Date.now();
    if (now - checkout.lastSubmitAttempt.current < 5000) {
      console.log("[Checkout] Debounce: too soon after last attempt");
      checkout.isCompletingRef.current = false;
      return;
    }
    checkout.lastSubmitAttempt.current = now;

    checkout.setFormSubmitted(true);

    if (!checkout.validate() || !checkout.cartId || !checkout.cart) {
      const firstError = document.querySelector('[data-error="true"]');
      firstError?.scrollIntoView({ behavior: "smooth", block: "center" });
      checkout.isCompletingRef.current = false;
      return;
    }

    // Check if cart is already completed
    if (checkout.cart.completed_at || checkout.cart.status === "completed") {
      checkout.clearCart();
      checkout.router.push("/");
      checkout.isCompletingRef.current = false;
      return;
    }

    checkout.setIsSubmitting(true);
    checkout.setError(null);

    let shouldResetState = true;

    try {
      await completeCheckout({
        cartId: checkout.cartId,
        cart: checkout.cart,
        firstName: checkout.firstName,
        lastName: checkout.lastName,
        email: checkout.email,
        phone: checkout.phone,
        deliveryMethod: checkout.deliveryMethod,
        city: checkout.city,
        district: checkout.district,
        khoroo: checkout.khoroo,
        street: checkout.street,
        building: checkout.building,
        apartment: checkout.apartment,
        additionalInfo: checkout.additionalInfo,
        paymentMethod: checkout.paymentMethod,
        onSuccess: (orderId, paymentMethod) => {
          shouldResetState = false; // Don't reset on success (navigating away)
          checkout.router.push(`/checkout/confirmation?order_id=${orderId}&payment_method=${paymentMethod}`);
        },
        clearCart: checkout.clearCart,
      });
    } catch (err) {
      console.error("[CheckoutPage] Caught error during checkout:", err);
      const result = await handleCheckoutError(
        err,
        checkout.cartId!,
        checkout.paymentMethod,
        checkout.clearCart,
        (orderId, paymentMethod) => {
          shouldResetState = false; // Don't reset on success redirect
          checkout.router.push(`/checkout/confirmation?order_id=${orderId}&payment_method=${paymentMethod}`);
        }
      );
      
      if (result === "__redirect_confirmation__") {
        shouldResetState = false;
        // Redirect to confirmation - order was successfully created
        checkout.router.push(`/checkout/confirmation?payment_method=${checkout.paymentMethod}`);
        return;
      } else if (result) {
        checkout.setError(result);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } finally {
      if (shouldResetState) {
        checkout.isCompletingRef.current = false;
        checkout.setIsSubmitting(false);
      }
    }
  };

  // Loading state
  if (checkout.isLoading || checkout.sessionStatus === "loading") {
    return (
      <div className="min-h-screen flex flex-col bg-[#f8f8f8]">
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#0071e3] mx-auto mb-4" />
            <p className="text-gray-500">Ачаалж байна...</p>
          </div>
        </main>
      </div>
    );
  }

  // Empty cart
  if (!checkout.cart || !checkout.cart.items?.length) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f8f8f8]">
        <main className="flex-1 flex items-center justify-center py-20">
          <div className="text-center max-w-md px-6">
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mx-auto mb-6 shadow-sm">
              <ShoppingBag className="w-10 h-10 text-gray-400" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-3">
              Сагс хоосон байна
            </h1>
            <p className="text-gray-500 mb-8">
              Захиалга өгөхийн тулд сагсандаа бараа нэмнэ үү
            </p>
            <Link
              href="/products"
              className="inline-flex items-center justify-center bg-[#0071e3] text-white rounded-full py-3 px-8 font-medium hover:bg-[#0077ed] transition-colors"
            >
              Дэлгүүр хэсэх
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const itemCount = checkout.cart.items.reduce((acc, item) => acc + item.quantity, 0);

  // Progress calculation
  const getProgressStep = () => {
    if (checkout.paymentMethod) return 4;
    if (checkout.deliveryMethod === "delivery" && checkout.district) return 3;
    if (checkout.deliveryMethod === "pickup" || checkout.deliveryMethod === "delivery") return 2;
    if (checkout.email && checkout.firstName) return 1;
    return 0;
  };

  const progressStep = getProgressStep();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 via-white to-gray-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/cart" className="group flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-all">
            <div className="p-2 -ml-2 rounded-lg group-hover:bg-gray-100 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </div>
            <span className="hidden sm:inline font-medium">Сагс</span>
          </Link>
          <Link href="/" className="flex items-center">
            <Image 
              src="/logo.png" 
              alt="Alimhan" 
              width={120} 
              height={36} 
              className="h-8 w-auto" 
              priority
            />
          </Link>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full border border-green-200">
            <Lock className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold hidden sm:inline">Аюулгүй</span>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-4">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-1.5">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    progressStep >= step 
                      ? "bg-gradient-to-br from-[#0071e3] to-[#0055b3] text-white shadow-lg shadow-blue-500/30 scale-110" 
                      : "bg-gray-200 text-gray-500"
                  }`}>
                    {progressStep > step ? <CheckCircle className="w-4 h-4" /> : step}
                  </div>
                  <span className={`text-[10px] font-medium hidden sm:block transition-colors ${
                    progressStep >= step ? "text-gray-900" : "text-gray-400"
                  }`}>
                    {step === 1 && "Холбоо барих"}
                    {step === 2 && "Хүргэлт"}
                    {step === 3 && "Хаяг"}
                    {step === 4 && "Төлбөр"}
                  </span>
                </div>
                {step < 4 && (
                  <div className={`flex-1 h-1 mx-2 rounded-full transition-all duration-300 ${
                    progressStep > step ? "bg-gradient-to-r from-[#0071e3] to-[#0055b3]" : "bg-gray-200"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 py-6 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Захиалга баталгаажуулах
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">Мэдээллээ оруулж, захиалгаа баталгаажуулна уу</p>
          </div>

          {/* Error */}
          {checkout.error && (
            <div className="mb-6 p-4 sm:p-5 bg-gradient-to-r from-red-50 to-red-50/30 border-l-4 border-red-500 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2 duration-300 shadow-sm">
              <div className="p-1 bg-red-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="text-red-900 font-semibold text-sm">Алдаа гарлаа</p>
                <p className="text-red-700 text-sm mt-1">
                  {checkout.error === "CART_INVALID" 
                    ? "Таны сагсны мэдээлэл хуучирсан байна. Сагсаа шинэчлээд дахин оролдоно уу." 
                    : checkout.error}
                </p>
                {checkout.error === "CART_INVALID" && (
                  <button
                    onClick={() => {
                      checkout.clearCart();
                      window.location.reload();
                    }}
                    className="mt-3 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-all active:scale-95 shadow-sm"
                  >
                    Сагс шинэчлэх
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Form */}
            <div className="lg:col-span-7 space-y-5">
              
              {/* Contact Info */}
              <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0071e3] to-[#0055b3] flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-gray-900">Холбоо барих мэдээлэл</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Та дээр дурьдсан мэдээллээр холбогдох болно</p>
                  </div>
                </div>

                {checkout.isAuthenticated ? (
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl mb-6 shadow-sm">
                    <div className="p-1.5 bg-green-100 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-green-900">Нэвтэрсэн</p>
                      <p className="text-xs text-green-700 mt-0.5">{checkout.session?.user?.name || checkout.session?.user?.email}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl mb-6 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-blue-100 rounded-lg">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">Зочин хэрэглэгч</span>
                    </div>
                    <Link href="/auth/login?callbackUrl=/checkout" className="flex items-center gap-1.5 text-sm font-semibold text-[#0071e3] hover:gap-2 transition-all">
                      <LogIn className="w-4 h-4" />
                      Нэвтрэх
                    </Link>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div data-error={!!checkout.getError("lastName")} className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Овог *</label>
                    <input
                      type="text"
                      value={checkout.lastName}
                      onChange={(e) => checkout.setLastName(e.target.value)}
                      onBlur={() => checkout.handleBlur("lastName")}
                      placeholder="Овог оруулна уу"
                      className={`w-full px-4 py-3.5 bg-gray-50 border-2 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-[#0071e3]/10 focus:border-[#0071e3] focus:bg-white transition-all duration-200 ${
                        checkout.getError("lastName") ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-100" : "border-gray-200 hover:border-gray-300"
                      }`}
                    />
                    {checkout.getError("lastName") && <p className="text-red-600 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{checkout.getError("lastName")}</p>}
                  </div>
                  <div data-error={!!checkout.getError("firstName")} className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Нэр *</label>
                    <input
                      type="text"
                      value={checkout.firstName}
                      onChange={(e) => checkout.setFirstName(e.target.value)}
                      onBlur={() => checkout.handleBlur("firstName")}
                      placeholder="Нэр оруулна уу"
                      className={`w-full px-4 py-3.5 bg-gray-50 border-2 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-[#0071e3]/10 focus:border-[#0071e3] focus:bg-white transition-all duration-200 ${
                        checkout.getError("firstName") ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-100" : "border-gray-200 hover:border-gray-300"
                      }`}
                    />
                    {checkout.getError("firstName") && <p className="text-red-600 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{checkout.getError("firstName")}</p>}
                  </div>
                </div>

                <div className="mt-4 group" data-error={!!checkout.getError("email")}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">И-мэйл хаяг *</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#0071e3] transition-colors" />
                    <input
                      type="email"
                      value={checkout.email}
                      onChange={(e) => checkout.setEmail(e.target.value)}
                      onBlur={() => checkout.handleBlur("email")}
                      placeholder="your@email.com"
                      className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-[#0071e3]/10 focus:border-[#0071e3] focus:bg-white transition-all duration-200 ${
                        checkout.getError("email") ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-100" : "border-gray-200 hover:border-gray-300"
                      }`}
                    />
                  </div>
                  {checkout.getError("email") && <p className="text-red-600 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{checkout.getError("email")}</p>}
                </div>

                <div className="mt-4 group" data-error={!!checkout.getError("phone")}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Утасны дугаар *
                    {checkout.customerData?.phone && checkout.phone === checkout.customerData.phone && (
                      <span className="ml-2 text-xs text-green-600 font-normal">(Бүртгэлээс авсан)</span>
                    )}
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#0071e3] transition-colors" />
                    <input
                      type="tel"
                      value={checkout.phone}
                      onChange={(e) => checkout.setPhone(e.target.value.replace(/\D/g, "").slice(0, 8))}
                      onBlur={() => checkout.handleBlur("phone")}
                      placeholder="99001234"
                      maxLength={8}
                      className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-[#0071e3]/10 focus:border-[#0071e3] focus:bg-white transition-all duration-200 ${
                        checkout.getError("phone") ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-100" : "border-gray-200 hover:border-gray-300"
                      }`}
                    />
                  </div>
                  {checkout.getError("phone") && <p className="text-red-600 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{checkout.getError("phone")}</p>}
                </div>
              </section>

              {/* Delivery Method */}
              <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#0071e3] to-[#0055b3] flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Truck className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-gray-900">Хүргэлтийн төрөл</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Танд тохирох хэлбэрийг сонгоно уу</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => checkout.setDeliveryMethod("delivery")}
                    className={`group relative flex items-center gap-4 p-5 rounded-xl border-2 transition-all duration-200 text-left ${
                      checkout.deliveryMethod === "delivery"
                        ? "border-[#0071e3] bg-blue-50/50 ring-4 ring-[#0071e3]/10"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 active:scale-[0.98]"
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                      checkout.deliveryMethod === "delivery" ? "bg-linear-to-br from-[#0071e3] to-[#0055b3] shadow-lg shadow-blue-500/30" : "bg-gray-100 group-hover:bg-gray-200"
                    }`}>
                      <Truck className={`w-6 h-6 ${checkout.deliveryMethod === "delivery" ? "text-white" : "text-gray-600"}`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 flex items-center gap-2">
                        Хүргэлт
                        {checkout.deliveryMethod === "delivery" && (
                          <CheckCircle className="w-4 h-4 text-[#0071e3]" />
                        )}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">Таны хаягт хүргэнэ</p>
                      <p className="text-xs text-gray-500 mt-0.5">1-2 хоногт</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => checkout.setDeliveryMethod("pickup")}
                    className={`group relative flex items-center gap-4 p-5 rounded-xl border-2 transition-all duration-200 text-left ${
                      checkout.deliveryMethod === "pickup"
                        ? "border-[#0071e3] bg-blue-50/50 ring-4 ring-[#0071e3]/10"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 active:scale-[0.98]"
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                      checkout.deliveryMethod === "pickup" ? "bg-linear-to-br from-[#0071e3] to-[#0055b3] shadow-lg shadow-blue-500/30" : "bg-gray-100 group-hover:bg-gray-200"
                    }`}>
                      <Store className={`w-6 h-6 ${checkout.deliveryMethod === "pickup" ? "text-white" : "text-gray-600"}`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 flex items-center gap-2">
                        Дэлгүүрээс авах
                        {checkout.deliveryMethod === "pickup" && (
                          <CheckCircle className="w-4 h-4 text-[#0071e3]" />
                        )}
                      </p>
                      <p className="text-xs font-semibold text-green-600 mt-1">Үнэгүй • Тухай хүсвэл</p>
                    </div>
                  </button>
                </div>

                {checkout.deliveryMethod === "pickup" && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                    <h4 className="font-semibold text-gray-900 mb-3">{STORE_INFO.name}</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                        <span className="text-gray-600">{STORE_INFO.address}, {STORE_INFO.city}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Clock className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                        <span className="text-gray-600">{STORE_INFO.hours}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Phone className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                        <span className="text-gray-600">{STORE_INFO.phone}</span>
                      </div>
                    </div>
                  </div>
                )}
              </section>

              {/* Address (delivery only) */}
              {checkout.deliveryMethod === "delivery" && (
                <section className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-[#0071e3] flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">Хүргэлтийн хаяг</h2>
                  </div>

                  {/* Saved addresses selector */}
                  {checkout.savedAddresses && checkout.savedAddresses.length > 0 && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Хадгалагдсан хаяг сонгох
                      </label>
                      <select
                        onChange={(e) => {
                          const address = checkout.savedAddresses.find((a: any) => a.id === e.target.value);
                          if (address) checkout.fillFromAddress(address);
                        }}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 focus:border-[#0071e3] transition-all appearance-none cursor-pointer"
                      >
                        <option value="">Шинэ хаяг оруулах</option>
                        {checkout.savedAddresses.map((addr: any) => (
                          <option key={addr.id} value={addr.id}>
                            {addr.address_1}, {addr.city}
                            {addr.first_name && ` - ${addr.first_name} ${addr.last_name}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div data-error={!!checkout.getError("city")}>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Хот/Аймаг *</label>
                        <select
                          value={checkout.city}
                          onChange={(e) => { checkout.setCity(e.target.value); checkout.setDistrict(""); }}
                          onBlur={() => checkout.handleBlur("city")}
                          className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 focus:border-[#0071e3] transition-all appearance-none cursor-pointer ${
                            checkout.getError("city") ? "border-red-400 bg-red-50" : "border-gray-200"
                          }`}
                        >
                          {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        {checkout.getError("city") && <p className="text-red-500 text-xs mt-1">{checkout.getError("city")}</p>}
                      </div>

                      <div data-error={!!checkout.getError("district")}>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Дүүрэг/Сум *</label>
                        {checkout.city === "Улаанбаатар" ? (
                          <select
                            value={checkout.district}
                            onChange={(e) => checkout.setDistrict(e.target.value)}
                            onBlur={() => checkout.handleBlur("district")}
                            className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 focus:border-[#0071e3] transition-all appearance-none cursor-pointer ${
                              checkout.getError("district") ? "border-red-400 bg-red-50" : "border-gray-200"
                            }`}
                          >
                            <option value="">Сонгоно уу</option>
                            {UB_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={checkout.district}
                            onChange={(e) => checkout.setDistrict(e.target.value)}
                            onBlur={() => checkout.handleBlur("district")}
                            placeholder="Сум"
                            className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 focus:border-[#0071e3] transition-all ${
                              checkout.getError("district") ? "border-red-400 bg-red-50" : "border-gray-200"
                            }`}
                          />
                        )}
                        {checkout.getError("district") && <p className="text-red-500 text-xs mt-1">{checkout.getError("district")}</p>}
                      </div>
                    </div>

                    <div data-error={!!checkout.getError("khoroo")}>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Хороо/Баг *</label>
                      <input
                        type="text"
                        value={checkout.khoroo}
                        onChange={(e) => checkout.setKhoroo(e.target.value)}
                        onBlur={() => checkout.handleBlur("khoroo")}
                        placeholder="Жишээ: 1-р хороо"
                        className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 focus:border-[#0071e3] transition-all ${
                          checkout.getError("khoroo") ? "border-red-400 bg-red-50" : "border-gray-200"
                        }`}
                      />
                      {checkout.getError("khoroo") && <p className="text-red-500 text-xs mt-1">{checkout.getError("khoroo")}</p>}
                    </div>

                    <div data-error={!!checkout.getError("street")}>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Гудамж *</label>
                      <input
                        type="text"
                        value={checkout.street}
                        onChange={(e) => checkout.setStreet(e.target.value)}
                        onBlur={() => checkout.handleBlur("street")}
                        placeholder="Гудамжийн нэр"
                        className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 focus:border-[#0071e3] transition-all ${
                          checkout.getError("street") ? "border-red-400 bg-red-50" : "border-gray-200"
                        }`}
                      />
                      {checkout.getError("street") && <p className="text-red-500 text-xs mt-1">{checkout.getError("street")}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div data-error={!!checkout.getError("building")}>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Байр *</label>
                        <input
                          type="text"
                          value={checkout.building}
                          onChange={(e) => checkout.setBuilding(e.target.value)}
                          onBlur={() => checkout.handleBlur("building")}
                          placeholder="Байрны дугаар"
                          className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 focus:border-[#0071e3] transition-all ${
                            checkout.getError("building") ? "border-red-400 bg-red-50" : "border-gray-200"
                          }`}
                        />
                        {checkout.getError("building") && <p className="text-red-500 text-xs mt-1">{checkout.getError("building")}</p>}
                      </div>
                      <div data-error={!!checkout.getError("apartment")}>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Тоот *</label>
                        <input
                          type="text"
                          value={checkout.apartment}
                          onChange={(e) => checkout.setApartment(e.target.value)}
                          onBlur={() => checkout.handleBlur("apartment")}
                          placeholder="Орц, давхар, тоот"
                          className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 focus:border-[#0071e3] transition-all ${
                            checkout.getError("apartment") ? "border-red-400 bg-red-50" : "border-gray-200"
                          }`}
                        />
                        {checkout.getError("apartment") && <p className="text-red-500 text-xs mt-1">{checkout.getError("apartment")}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Нэмэлт мэдээлэл</label>
                      <textarea
                        value={checkout.additionalInfo}
                        onChange={(e) => checkout.setAdditionalInfo(e.target.value)}
                        placeholder="Хүргэлтийн нэмэлт зааварчилгаа"
                        rows={2}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 focus:border-[#0071e3] transition-all resize-none"
                      />
                    </div>

                    {/* Shipping info - standard delivery auto-selected */}
                    <div className="pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <Truck className="w-5 h-5 text-[#0071e3]" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Энгийн хүргэлт</p>
                            <p className="text-xs text-gray-500">2-3 хоногт хүргэнэ</p>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">₮5,000</span>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Payment */}
              <section className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-[#0071e3] flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Төлбөрийн хэлбэр</h2>
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => checkout.setPaymentMethod("bank_transfer")}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                      checkout.paymentMethod === "bank_transfer"
                        ? "border-[#0071e3] bg-[#0071e3]/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                      checkout.paymentMethod === "bank_transfer" ? "bg-[#0071e3]" : "bg-gray-100"
                    }`}>
                      <Building2 className={`w-6 h-6 ${checkout.paymentMethod === "bank_transfer" ? "text-white" : "text-gray-600"}`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">Банкны шилжүүлэг</p>
                      <p className="text-xs text-gray-500 mt-0.5">Банкны апп эсвэл интернет банкаар</p>
                    </div>
                    {checkout.paymentMethod === "bank_transfer" && (
                      <CheckCircle className="w-5 h-5 text-[#0071e3]" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => checkout.setPaymentMethod("qpay")}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                      checkout.paymentMethod === "qpay"
                        ? "border-[#00D4AA] bg-[#00D4AA]/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 overflow-hidden ${
                      checkout.paymentMethod === "qpay" ? "bg-[#00D4AA]" : "bg-gray-100"
                    }`}>
                      <Image
                        src="https://qpay.mn/q-logo.png"
                        alt="QPay"
                        width={28}
                        height={28}
                        className={`object-contain ${checkout.paymentMethod === "qpay" ? "brightness-0 invert" : ""}`}
                        unoptimized
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900">QPay</p>
                        <span className="px-2 py-0.5 bg-[#00D4AA]/20 text-[#00A080] text-[10px] font-medium rounded-full">
                          Түгээмэл
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">QR код эсвэл банкны апп-аар</p>
                    </div>
                    {checkout.paymentMethod === "qpay" && (
                      <CheckCircle className="w-5 h-5 text-[#00D4AA]" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => checkout.setPaymentMethod("cash_on_delivery")}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                      checkout.paymentMethod === "cash_on_delivery"
                        ? "border-[#0071e3] bg-[#0071e3]/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                      checkout.paymentMethod === "cash_on_delivery" ? "bg-[#0071e3]" : "bg-gray-100"
                    }`}>
                      <Banknote className={`w-6 h-6 ${checkout.paymentMethod === "cash_on_delivery" ? "text-white" : "text-gray-600"}`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {checkout.deliveryMethod === "pickup" ? "Дэлгүүрт төлөх" : "Хүргэлтээр төлөх"}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {checkout.deliveryMethod === "pickup" 
                          ? "Бараа авахдаа дэлгүүрт бэлнээр төлнө" 
                          : "Бараа хүлээн авахдаа бэлнээр төлнө"}
                      </p>
                    </div>
                    {checkout.paymentMethod === "cash_on_delivery" && (
                      <CheckCircle className="w-5 h-5 text-[#0071e3]" />
                    )}
                  </button>
                </div>
              </section>

              {/* Submit (mobile) */}
              <div className="lg:hidden">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={checkout.isSubmitting}
                  className="w-full bg-linear-to-r from-[#0071e3] to-[#0055b3] text-white rounded-xl py-4 px-6 font-bold text-base hover:shadow-xl hover:shadow-blue-500/40 active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                >
                  {checkout.isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Боловсруулж байна...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      <span>Захиалга баталгаажуулах</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-md border border-gray-100 sticky top-24">
                {/* Header */}
                <div className="flex items-center justify-between mb-5 pb-5 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-[#0071e3]" />
                    <h2 className="text-lg font-bold text-gray-900">Захиалгын дэлгэрэнгүй</h2>
                  </div>
                  <span className="px-3 py-1 bg-blue-50 text-[#0071e3] text-xs font-bold rounded-full">{itemCount} бараа</span>
                </div>

                {/* Items List */}
                <div className="space-y-4 max-h-[320px] overflow-y-auto mb-5 pb-5 border-b border-gray-200 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {checkout.cart.items.map((item) => (
                    <div key={item.id} className="flex gap-3 group hover:bg-gray-50 p-2 -m-2 rounded-lg transition-colors">
                      <div className="relative w-16 h-16 bg-gray-100 rounded-xl overflow-hidden shrink-0 ring-1 ring-gray-200 group-hover:ring-gray-300 transition-all">
                        {item.thumbnail ? (
                          <Image src={item.thumbnail} alt={item.title} fill sizes="64px" className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        <span className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-linear-to-br from-gray-900 to-gray-700 text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-lg">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 line-clamp-2">{item.title}</p>
                        {item.variantTitle && item.variantTitle !== "Default" && (
                          <p className="text-xs text-gray-500 mt-1">{item.variantTitle}</p>
                        )}
                        <p className="text-sm font-bold text-gray-900 mt-1.5">
                          {checkout.formatPrice(item.unitPrice * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 text-sm mb-5 pb-5 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Барааны үнэ</span>
                    <span className="font-semibold text-gray-900">{checkout.formatPrice(checkout.cart.subtotal || 0)}</span>
                  </div>
                  {(checkout.cart.discount_total || 0) > 0 && (
                    <div className="flex justify-between items-center bg-green-50 -mx-2 px-2 py-2 rounded-lg">
                      <span className="text-green-700 font-medium">Хямдрал</span>
                      <span className="font-bold text-green-700">-{checkout.formatPrice(checkout.cart.discount_total || 0)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 flex items-center gap-1">
                      <Truck className="w-4 h-4" />
                      Хүргэлт
                    </span>
                    <span className="font-semibold text-gray-900">
                      {checkout.deliveryMethod === "pickup" ? (
                        <span className="text-green-600 font-bold">Үнэгүй</span>
                      ) : (
                        (checkout.cart.shipping_total || 0) > 0 ? checkout.formatPrice(checkout.cart.shipping_total || 0) : "₮5,000"
                      )}
                    </span>
                  </div>
                </div>

                {/* Total */}
                <div className="bg-linear-to-br from-gray-50 to-gray-100 -mx-5 sm:-mx-6 px-5 sm:px-6 py-4 rounded-b-2xl">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Нийт дүн</span>
                    <span className="text-2xl sm:text-3xl font-black text-[#0071e3]">{checkout.formatPrice(checkout.cart.total || 0)}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 text-right">НӨАТ орсон</p>
                </div>

                {/* Submit Button (desktop) */}
                <div className="hidden lg:block mt-5">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={checkout.isSubmitting}
                    className="w-full bg-linear-to-r from-[#0071e3] to-[#0055b3] text-white rounded-xl py-4 px-6 font-bold text-base hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0 flex items-center justify-center gap-2 shadow-lg"
                  >
                    {checkout.isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Боловсруулж байна...
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5" />
                        Захиалга баталгаажуулах
                      </>
                    )}
                  </button>
                  
                  <p className="text-xs text-gray-500 text-center mt-3">
                    Захиалга өгснөөр та манай{" "}
                    <Link href="/terms" className="text-[#0071e3] hover:underline">
                      үйлчилгээний нөхцөл
                    </Link>
                    -ийг зөвшөөрч байна
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
