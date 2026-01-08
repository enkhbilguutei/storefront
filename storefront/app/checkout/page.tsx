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
        selectedShippingOption: checkout.selectedShippingOption,
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
            <Loader2 className="w-8 h-8 animate-spin text-[#1d8dd8] mx-auto mb-4" />
            <p className="text-gray-500">Ачаалж байна...</p>
          </div>
        </main>
      </div>
    );
  }

  // Empty cart
  if (!checkout.cart || !checkout.cart.items?.length) {
    const accentGradient = "bg-gradient-to-r from-[#0f4ab8] to-[#1d8dd8]";
    
    return (
      <div className="min-h-screen flex flex-col bg-[#f8f8f8]">
        <main className="flex-1 flex items-center justify-center py-20">
          <div className="text-center max-w-md px-6">
            <div className="w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <Image 
                src="/pngtree-sad-cartoon-apple-vector-png-image_20975407.png" 
                alt="Сагс хоосон" 
                width={80} 
                height={80}
                className="w-20 h-20 object-contain"
              />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-3">
              Сагс хоосон байна
            </h1>
            <p className="text-gray-500 mb-8">
              Захиалга өгөхийн тулд сагсандаа бараа нэмнэ үү
            </p>
            <Link
              href="/products"
              className={`inline-flex items-center justify-center ${accentGradient} text-white rounded-full py-3 px-8 font-medium hover:shadow-md hover:shadow-amber-200/50 transition-all`}
            >
              Дэлгүүр хэсэх
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const itemCount = checkout.cart.items.reduce((acc, item) => acc + item.quantity, 0);

  const accentGradient = "bg-gradient-to-r from-[#0f4ab8] to-[#1d8dd8]";

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-amber-50/30">
      {/* Header */}
      <header className="bg-white/75 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/cart" className="group flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-all">
            <div className="p-2 -ml-2 rounded-lg group-hover:bg-slate-100 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </div>
            <span className="hidden sm:inline font-medium">Сагс</span>
          </Link>
          <Link href="/" className="flex items-center">
            <Image 
              src="/logo.png" 
              alt="Alimhan" 
              width={160} 
              height={44} 
              className="h-10 w-auto" 
              priority
            />
          </Link>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
            <Lock className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold hidden sm:inline">Аюулгүй</span>
          </div>
        </div>
      </header>

      <main className="flex-1 py-6 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">
              Захиалга баталгаажуулах
            </h1>
            <p className="text-slate-600 text-sm sm:text-base">Мэдээллээ оруулж, захиалгаа баталгаажуулна уу</p>
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
            <div className="lg:col-span-7 space-y-4">
              
              {/* Contact Info */}
              <section className="bg-white/90 rounded-lg p-4 sm:p-5 shadow-sm border border-slate-200/70">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-lg ${accentGradient} flex items-center justify-center shadow-sm shadow-slate-200/70`}>
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">Холбоо барих мэдээлэл</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Та дээр дурьдсан мэдээллээр холбогдох болно</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div data-error={!!checkout.getError("lastName")} className="group">
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Овог *</label>
                    <input
                      type="text"
                      value={checkout.lastName}
                      onChange={(e) => checkout.setLastName(e.target.value)}
                      onBlur={() => checkout.handleBlur("lastName")}
                      placeholder="Овог оруулна уу"
                      className={`w-full px-3.5 py-3 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1d8dd8]/15 focus:border-[#1d8dd8] transition-all duration-150 ${
                        checkout.getError("lastName") ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-100" : "border-slate-200 hover:border-slate-300"
                      }`}
                    />
                    {checkout.getError("lastName") && <p className="text-red-600 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{checkout.getError("lastName")}</p>}
                  </div>
                  <div data-error={!!checkout.getError("firstName")} className="group">
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Нэр *</label>
                    <input
                      type="text"
                      value={checkout.firstName}
                      onChange={(e) => checkout.setFirstName(e.target.value)}
                      onBlur={() => checkout.handleBlur("firstName")}
                      placeholder="Нэр оруулна уу"
                      className={`w-full px-3.5 py-3 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1d8dd8]/15 focus:border-[#1d8dd8] transition-all duration-150 ${
                        checkout.getError("firstName") ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-100" : "border-slate-200 hover:border-slate-300"
                      }`}
                    />
                    {checkout.getError("firstName") && <p className="text-red-600 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{checkout.getError("firstName")}</p>}
                  </div>
                </div>

                <div className="mt-3 group" data-error={!!checkout.getError("email")}>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">И-мэйл хаяг *</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#1d8dd8] transition-colors" />
                    <input
                      type="email"
                      value={checkout.email}
                      onChange={(e) => checkout.setEmail(e.target.value)}
                      onBlur={() => checkout.handleBlur("email")}
                      placeholder="your@email.com"
                      className={`w-full pl-12 pr-4 py-3 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1d8dd8]/15 focus:border-[#1d8dd8] transition-all duration-150 ${
                        checkout.getError("email") ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-100" : "border-slate-200 hover:border-slate-300"
                      }`}
                    />
                  </div>
                  {checkout.getError("email") && <p className="text-red-600 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{checkout.getError("email")}</p>}
                </div>

                <div className="mt-3 group" data-error={!!checkout.getError("phone")}>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Утасны дугаар *
                    {checkout.customerData?.phone && checkout.phone === checkout.customerData.phone && (
                      <span className="ml-2 text-xs text-green-600 font-normal">(Бүртгэлээс авсан)</span>
                    )}
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#1d8dd8] transition-colors" />
                    <input
                      type="tel"
                      value={checkout.phone}
                      onChange={(e) => checkout.setPhone(e.target.value.replace(/\D/g, "").slice(0, 8))}
                      onBlur={() => checkout.handleBlur("phone")}
                      placeholder="99001234"
                      maxLength={8}
                      className={`w-full pl-12 pr-4 py-3 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1d8dd8]/15 focus:border-[#1d8dd8] transition-all duration-150 ${
                        checkout.getError("phone") ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-100" : "border-slate-200 hover:border-slate-300"
                      }`}
                    />
                  </div>
                  {checkout.getError("phone") && <p className="text-red-600 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{checkout.getError("phone")}</p>}
                </div>
              </section>

              {/* Delivery Method */}
              <section className="bg-white/90 rounded-lg p-4 sm:p-5 shadow-sm border border-slate-200/70">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-lg ${accentGradient} flex items-center justify-center shadow-sm shadow-slate-200/70`}>
                    <Truck className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">Хүргэлтийн төрөл</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Танд тохирох хэлбэрийг сонгоно уу</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => checkout.setDeliveryMethod("delivery")}
                    className={`group relative flex items-center gap-4 p-4 rounded-lg border transition-all duration-200 text-left ${
                      checkout.deliveryMethod === "delivery"
                        ? "border-[#1d8dd8] bg-[#f8f5ff] shadow-sm"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 active:scale-[0.99]"
                    }`}
                  >
                    <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                      checkout.deliveryMethod === "delivery" ? `${accentGradient} text-white shadow-md shadow-amber-200/50` : "bg-slate-100 text-slate-700 group-hover:bg-slate-200"
                    }`}>
                      <Truck className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 flex items-center gap-2 text-sm">
                        Хүргэлт
                        {checkout.deliveryMethod === "delivery" && (
                          <CheckCircle className="w-4 h-4 text-[#1d8dd8]" />
                        )}
                      </p>
                      <p className="text-xs text-slate-600 mt-0.5">Таны хаягт хүргэнэ • 1-2 хоног</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => checkout.setDeliveryMethod("pickup")}
                    className={`group relative flex items-center gap-4 p-4 rounded-lg border transition-all duration-200 text-left ${
                      checkout.deliveryMethod === "pickup"
                        ? "border-[#1d8dd8] bg-[#f8f5ff] shadow-sm"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 active:scale-[0.99]"
                    }`}
                  >
                    <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                      checkout.deliveryMethod === "pickup" ? `${accentGradient} text-white shadow-md shadow-amber-200/50` : "bg-slate-100 text-slate-700 group-hover:bg-slate-200"
                    }`}>
                      <Store className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 flex items-center gap-2 text-sm">
                        Дэлгүүрээс авах
                        {checkout.deliveryMethod === "pickup" && (
                          <CheckCircle className="w-4 h-4 text-[#1d8dd8]" />
                        )}
                      </p>
                      <p className="text-xs font-semibold text-emerald-600 mt-0.5">Үнэгүй • Сонголттой</p>
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
                <section className="bg-white/90 rounded-lg p-4 sm:p-5 shadow-sm border border-slate-200/70">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-lg ${accentGradient} flex items-center justify-center shadow-sm shadow-slate-200/70`}>
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-lg font-semibold text-slate-900">Хүргэлтийн хаяг</h2>
                  </div>

                  {/* Saved addresses selector */}
                  {checkout.savedAddresses && checkout.savedAddresses.length > 0 && (
                    <div className="mb-5 p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Хадгалагдсан хаяг сонгох
                      </label>
                      <select
                        onChange={(e) => {
                          const address = checkout.savedAddresses.find((a) => a.id === e.target.value);
                          if (address) checkout.fillFromAddress(address);
                        }}
                        className="w-full px-3.5 py-3 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1d8dd8]/15 focus:border-[#1d8dd8] transition-all appearance-none cursor-pointer"
                      >
                        <option value="">Шинэ хаяг оруулах</option>
                        {checkout.savedAddresses.map((addr) => (
                          <option key={addr.id} value={addr.id}>
                            {addr.address_1}, {addr.city}
                            {addr.first_name && ` - ${addr.first_name} ${addr.last_name}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div data-error={!!checkout.getError("city")}>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Хот/Аймаг *</label>
                        <select
                          value={checkout.city}
                          onChange={(e) => { checkout.setCity(e.target.value); checkout.setDistrict(""); }}
                          onBlur={() => checkout.handleBlur("city")}
                          className={`w-full px-3.5 py-3 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1d8dd8]/15 focus:border-[#1d8dd8] transition-all appearance-none cursor-pointer ${
                            checkout.getError("city") ? "border-red-400 bg-red-50" : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        {checkout.getError("city") && <p className="text-red-500 text-xs mt-1">{checkout.getError("city")}</p>}
                      </div>

                      <div data-error={!!checkout.getError("district")}>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Дүүрэг/Сум *</label>
                        {checkout.city === "Улаанбаатар" ? (
                          <select
                            value={checkout.district}
                            onChange={(e) => checkout.setDistrict(e.target.value)}
                            onBlur={() => checkout.handleBlur("district")}
                            className={`w-full px-3.5 py-3 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1d8dd8]/15 focus:border-[#1d8dd8] transition-all appearance-none cursor-pointer ${
                              checkout.getError("district") ? "border-red-400 bg-red-50" : "border-slate-200 hover:border-slate-300"
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
                            className={`w-full px-3.5 py-3 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1d8dd8]/15 focus:border-[#1d8dd8] transition-all ${
                              checkout.getError("district") ? "border-red-400 bg-red-50" : "border-slate-200 hover:border-slate-300"
                            }`}
                          />
                        )}
                        {checkout.getError("district") && <p className="text-red-500 text-xs mt-1">{checkout.getError("district")}</p>}
                      </div>
                    </div>

                    <div data-error={!!checkout.getError("khoroo")}>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Хороо/Баг *</label>
                      <input
                        type="text"
                        value={checkout.khoroo}
                        onChange={(e) => checkout.setKhoroo(e.target.value)}
                        onBlur={() => checkout.handleBlur("khoroo")}
                        placeholder="Жишээ: 1-р хороо"
                        className={`w-full px-3.5 py-3 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1d8dd8]/15 focus:border-[#1d8dd8] transition-all ${
                          checkout.getError("khoroo") ? "border-red-400 bg-red-50" : "border-slate-200 hover:border-slate-300"
                        }`}
                      />
                      {checkout.getError("khoroo") && <p className="text-red-500 text-xs mt-1">{checkout.getError("khoroo")}</p>}
                    </div>

                    <div data-error={!!checkout.getError("street")}>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Гудамж *</label>
                      <input
                        type="text"
                        value={checkout.street}
                        onChange={(e) => checkout.setStreet(e.target.value)}
                        onBlur={() => checkout.handleBlur("street")}
                        placeholder="Гудамжийн нэр"
                        className={`w-full px-3.5 py-3 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1d8dd8]/15 focus:border-[#1d8dd8] transition-all ${
                          checkout.getError("street") ? "border-red-400 bg-red-50" : "border-slate-200 hover:border-slate-300"
                        }`}
                      />
                      {checkout.getError("street") && <p className="text-red-500 text-xs mt-1">{checkout.getError("street")}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div data-error={!!checkout.getError("building")}>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Байр *</label>
                        <input
                          type="text"
                          value={checkout.building}
                          onChange={(e) => checkout.setBuilding(e.target.value)}
                          onBlur={() => checkout.handleBlur("building")}
                          placeholder="Байрны дугаар"
                          className={`w-full px-3.5 py-3 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1d8dd8]/15 focus:border-[#1d8dd8] transition-all ${
                            checkout.getError("building") ? "border-red-400 bg-red-50" : "border-slate-200 hover:border-slate-300"
                          }`}
                        />
                        {checkout.getError("building") && <p className="text-red-500 text-xs mt-1">{checkout.getError("building")}</p>}
                      </div>
                      <div data-error={!!checkout.getError("apartment")}>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Тоот *</label>
                        <input
                          type="text"
                          value={checkout.apartment}
                          onChange={(e) => checkout.setApartment(e.target.value)}
                          onBlur={() => checkout.handleBlur("apartment")}
                          placeholder="Орц, давхар, тоот"
                          className={`w-full px-3.5 py-3 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1d8dd8]/15 focus:border-[#1d8dd8] transition-all ${
                            checkout.getError("apartment") ? "border-red-400 bg-red-50" : "border-slate-200 hover:border-slate-300"
                          }`}
                        />
                        {checkout.getError("apartment") && <p className="text-red-500 text-xs mt-1">{checkout.getError("apartment")}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Нэмэлт мэдээлэл</label>
                      <textarea
                        value={checkout.additionalInfo}
                        onChange={(e) => checkout.setAdditionalInfo(e.target.value)}
                        placeholder="Хүргэлтийн нэмэлт зааварчилгаа"
                        rows={2}
                        className="w-full px-3.5 py-3 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1d8dd8]/15 focus:border-[#1d8dd8] transition-all resize-none"
                      />
                    </div>

                    {/* Shipping info - standard delivery auto-selected */}
                    <div className="pt-3 border-t border-slate-200/70">
                      <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-md ${accentGradient} flex items-center justify-center text-white`}>
                            <Truck className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">Энгийн хүргэлт</p>
                            <p className="text-xs text-slate-500">2-3 хоногт хүргэнэ</p>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-slate-900">₮5,000</span>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Payment */}
                <section className="bg-white/90 rounded-lg p-4 sm:p-5 shadow-sm border border-slate-200/70">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-lg ${accentGradient} flex items-center justify-center shadow-sm shadow-slate-200/70`}>
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-lg font-semibold text-slate-900">Төлбөрийн хэлбэр</h2>
                </div>

                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={() => checkout.setPaymentMethod("bank_transfer")}
                    className={`w-full flex items-center gap-4 p-3.5 rounded-lg border transition-all text-left ${
                      checkout.paymentMethod === "bank_transfer"
                        ? "border-[#1d8dd8] bg-[#f8f5ff] shadow-sm"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${
                      checkout.paymentMethod === "bank_transfer" ? `${accentGradient} text-white shadow-md shadow-amber-200/50` : "bg-slate-100 text-slate-700"
                    }`}>
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 text-sm">Банкны шилжүүлэг</p>
                      <p className="text-xs text-slate-500 mt-0.5">Банкны апп эсвэл интернет банкаар</p>
                    </div>
                    {checkout.paymentMethod === "bank_transfer" && (
                      <CheckCircle className="w-5 h-5 text-[#1d8dd8]" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => checkout.setPaymentMethod("qpay")}
                    className={`w-full flex items-center gap-4 p-3.5 rounded-lg border transition-all text-left ${
                      checkout.paymentMethod === "qpay"
                        ? "border-[#00bfa0] bg-[#ecfdf3] shadow-sm"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 overflow-hidden ${
                      checkout.paymentMethod === "qpay" ? "bg-[#00bfa0]" : "bg-slate-100"
                    }`}>
                      <Image
                        src="https://qpay.mn/q-logo.png"
                        alt="QPay"
                        width={26}
                        height={26}
                        className={`object-contain ${checkout.paymentMethod === "qpay" ? "brightness-0 invert" : ""}`}
                        unoptimized
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-900 text-sm">QPay</p>
                        <span className="px-2 py-0.5 bg-[#00bfa0]/15 text-[#047857] text-[10px] font-medium rounded-full">
                          Түгээмэл
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">QR код эсвэл банкны апп-аар</p>
                    </div>
                    {checkout.paymentMethod === "qpay" && (
                      <CheckCircle className="w-5 h-5 text-[#00bfa0]" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => checkout.setPaymentMethod("cash_on_delivery")}
                    className={`w-full flex items-center gap-4 p-3.5 rounded-lg border transition-all text-left ${
                      checkout.paymentMethod === "cash_on_delivery"
                        ? "border-[#1d8dd8] bg-[#f8f5ff] shadow-sm"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${
                      checkout.paymentMethod === "cash_on_delivery" ? `${accentGradient} text-white shadow-md shadow-amber-200/50` : "bg-slate-100 text-slate-700"
                    }`}>
                      <Banknote className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 text-sm">
                        {checkout.deliveryMethod === "pickup" ? "Дэлгүүрт төлөх" : "Хүргэлтээр төлөх"}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {checkout.deliveryMethod === "pickup" 
                          ? "Бараа авахдаа дэлгүүрт бэлнээр төлнө" 
                          : "Бараа хүлээн авахдаа бэлнээр төлнө"}
                      </p>
                    </div>
                    {checkout.paymentMethod === "cash_on_delivery" && (
                      <CheckCircle className="w-5 h-5 text-[#1d8dd8]" />
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
                  className={`w-full ${accentGradient} text-white rounded-lg py-4 px-6 font-bold text-base hover:shadow-lg hover:shadow-amber-200/50 active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md`}
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
              <div className="bg-white/95 rounded-xl p-4 sm:p-5 shadow-sm border border-slate-200/70 sticky top-24">
                {/* Header */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-dotted border-slate-300">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-[#1d8dd8]" />
                    <h2 className="text-lg font-bold text-slate-900">Захиалгын дэлгэрэнгүй</h2>
                  </div>
                  <span className="px-3 py-1 bg-[#f8f5ff] text-[#1d8dd8] text-xs font-bold rounded-full">{itemCount} бараа</span>
                </div>

                {/* Items List */}
                <div className="space-y-3 max-h-[320px] overflow-y-auto mb-4 pb-4 border-b border-dotted border-slate-300 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                  {checkout.cart.items.map((item) => (
                    <div key={item.id} className="flex gap-3 group hover:bg-slate-50 p-2 -m-2 rounded-md transition-colors">
                      <div className="relative w-16 h-16 bg-slate-100 rounded-sm overflow-hidden shrink-0 ring-1 ring-slate-200 group-hover:ring-slate-300 transition-all">
                        {item.thumbnail ? (
                          <Image src={item.thumbnail} alt={item.title} fill sizes="64px" className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-6 h-6 text-slate-400" />
                          </div>
                        )}
                        <span className={`absolute -top-1.5 -right-1.5 w-6 h-6 ${accentGradient} text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-md`}>
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 line-clamp-2">{item.title}</p>
                        {item.variantTitle && item.variantTitle !== "Default" && (
                          <p className="text-xs text-slate-500 mt-1">{item.variantTitle}</p>
                        )}
                        <p className="text-sm font-bold text-slate-900 mt-1.5">
                          {checkout.formatPrice(item.unitPrice * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2.5 text-sm mb-4 pb-4 border-b border-dotted border-slate-300">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Барааны үнэ</span>
                    <span className="font-semibold text-slate-900">{checkout.formatPrice(checkout.cart.subtotal || 0)}</span>
                  </div>
                  {(checkout.cart.discount_total || 0) > 0 && (
                    <div className="flex justify-between items-center bg-emerald-50 -mx-1 px-2 py-2 rounded-lg">
                      <span className="text-emerald-700 font-medium">Хямдрал</span>
                      <span className="font-bold text-emerald-700">-{checkout.formatPrice(checkout.cart.discount_total || 0)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 flex items-center gap-1">
                      <Truck className="w-4 h-4" />
                      Хүргэлт
                    </span>
                    <span className="font-semibold text-slate-900">
                      {checkout.deliveryMethod === "pickup" ? (
                        <span className="text-emerald-600 font-bold">Үнэгүй</span>
                      ) : (
                        (checkout.cart.shipping_total || 0) > 0 ? checkout.formatPrice(checkout.cart.shipping_total || 0) : "₮5,000"
                      )}
                    </span>
                  </div>
                </div>

                {/* Total */}
                <div className="bg-gradient-to-br from-slate-50 via-white to-amber-50/60 -mx-4 sm:-mx-5 px-4 sm:px-5 py-4 rounded-b-xl border-t border-slate-200/60">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-slate-900">Нийт дүн</span>
                    <span className="text-2xl sm:text-3xl font-black text-[#1d8dd8]">{checkout.formatPrice(checkout.cart.total || 0)}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 text-right">НӨАТ орсон</p>
                </div>

                {/* Submit Button (desktop) */}
                <div className="hidden lg:block mt-4">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={checkout.isSubmitting}
                    className={`w-full ${accentGradient} text-white rounded-lg py-4 px-6 font-bold text-base hover:shadow-lg hover:shadow-amber-200/50 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0 flex items-center justify-center gap-2 shadow-md`}
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
                  
                  <p className="text-xs text-slate-500 text-center mt-3">
                    Захиалга өгснөөр та манай{" "}
                    <Link href="/terms" className="text-[#1d8dd8] hover:underline">
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
