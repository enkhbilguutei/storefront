"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/store";
import { CartItem } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import Link from "next/link";
import { ArrowRight, Loader2, Smartphone, Laptop, Headphones, Watch, RefreshCw } from "lucide-react";

// Line item type for display (compatible with CartItem component)
interface DisplayLineItem {
  id: string;
  title: string;
  quantity: number;
  thumbnail?: string | null;
  unit_price: number;
  variant?: {
    id: string;
    title?: string | null;
    product?: {
      handle?: string;
      title?: string;
    } | null;
  };
}

export function CartContent() {
  const { 
    cart, 
    items: storeItems, 
    fetchCart, 
    isFetching, 
    error,
  } = useCartStore();
  
  const [hasMounted, setHasMounted] = useState(false);

  // Handle hydration - wait for client-side mount
  useEffect(() => {
    // Using requestAnimationFrame to avoid direct setState in effect
    const frame = requestAnimationFrame(() => setHasMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  // Fetch cart on mount
  useEffect(() => {
    if (hasMounted) {
      fetchCart();
    }
  }, [hasMounted, fetchCart]);

  const handleRetry = () => {
    fetchCart(true);
  };

  // Show loading only if we don't have any persisted items to show
  const hasPersistedItems = hasMounted && storeItems.length > 0;
  const isLoading = isFetching && !cart && !hasPersistedItems;
  
  if (isLoading) {
    return (
      <main className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#0071e3] mx-auto mb-4" />
          <p className="text-[#86868b] text-[15px]">Сагсыг ачаалж байна...</p>
        </div>
      </main>
    );
  }

  // Wait for hydration before showing any content to avoid mismatch
  if (!hasMounted) {
    return (
      <main className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#0071e3] mx-auto mb-4" />
          <p className="text-[#86868b] text-[15px]">Сагсыг ачаалж байна...</p>
        </div>
      </main>
    );
  }

  if (error && !hasPersistedItems) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center py-20">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={handleRetry}
            className="inline-flex items-center gap-2 bg-[#0071e3] text-white rounded-full py-3 px-6 font-medium hover:bg-[#0077ed] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Дахин оролдох
          </button>
        </div>
      </main>
    );
  }

  // Show empty cart only if both API cart and persisted items are empty
  const hasCartItems = cart?.items?.length || hasPersistedItems;
  
  if (!hasCartItems) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center py-24 bg-white">
        <div className="w-full max-w-2xl px-6 text-center">
          <div className="mb-8 relative inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-50">
            <div className="absolute inset-0 rounded-full bg-blue-50/50 animate-pulse" />
            <div className="relative bg-white p-5 rounded-full shadow-sm border border-gray-100">
              <div className="relative">
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
                <svg 
                  className="w-8 h-8 text-gray-400" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  strokeWidth={1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">
            Таны сагс хоосон байна
          </h1>
          <p className="text-gray-500 text-lg mb-10 max-w-md mx-auto leading-relaxed">
            Таны хайж буй бараа манай дэлгүүрт байгаа гэдэгт итгэлтэй байна.
          </p>
          
          <Link
            href="/products"
            className="inline-flex items-center justify-center bg-gray-900 text-white rounded-full py-4 px-10 text-[15px] font-medium hover:bg-gray-800 active:scale-[0.98] transition-all shadow-lg shadow-gray-200 hover:shadow-xl"
          >
            <span>Дэлгүүр хэсэх</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>

          {/* Quick Categories */}
          <div className="mt-20">
            <p className="text-sm font-semibold text-gray-900 mb-8 uppercase tracking-wider">
              Санал болгох ангилал
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { name: "iPhone", href: "/collections/iphone", icon: Smartphone },
                { name: "Mac", href: "/collections/mac", icon: Laptop },
                { name: "AirPods", href: "/collections/airpods", icon: Headphones },
                { name: "Watch", href: "/collections/apple-watch", icon: Watch },
              ].map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="group flex flex-col items-center justify-center p-6 rounded-2xl bg-gray-50 border border-transparent hover:border-gray-200 hover:bg-white hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300 text-gray-900">
                    <item.icon className="w-6 h-6" strokeWidth={1.5} />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Build display items - prefer API cart items, fallback to persisted items
  const displayItems: DisplayLineItem[] = cart?.items?.map(item => ({
    id: item.id,
    title: item.title,
    quantity: item.quantity,
    thumbnail: item.thumbnail,
    unit_price: item.unitPrice,
    variant: {
      id: item.variantId,
      title: item.variantTitle,
      product: {
        handle: item.handle,
        title: item.title,
      },
    },
  })) || storeItems.map(item => ({
    id: item.id,
    title: item.title,
    quantity: item.quantity,
    thumbnail: item.thumbnail,
    unit_price: item.unitPrice,
    variant: {
      id: item.variantId,
      title: item.variantTitle,
      product: {
        handle: item.handle,
        title: item.title,
      },
    },
  }));
  
  const currencyCode = cart?.currency_code || "mnt";
  const itemCount = displayItems.length;

  // Wrapper function for refreshCart that matches expected signature
  const handleRefreshCart = async () => {
    await fetchCart(true);
  };

  return (
    <main className="flex-1 pb-24 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex items-baseline justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Сагс
          </h1>
          <p className="text-gray-500 font-medium">
            {itemCount} бүтээгдэхүүн
            {isFetching && <span className="ml-2 text-xs text-blue-600 animate-pulse">(шинэчилж байна...)</span>}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-8 order-1">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="divide-y divide-gray-100">
                {displayItems.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    currencyCode={currencyCode}
                    refreshCart={handleRefreshCart}
                  />
                ))}
              </div>
            </div>
            
            {/* Continue Shopping Link */}
            <div className="mt-6">
              <Link 
                href="/products"
                className="inline-flex items-center gap-2 text-gray-600 text-sm font-medium hover:text-gray-900 transition-colors"
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
                Дэлгүүр үргэлжлүүлэх
              </Link>
            </div>
          </div>

          {/* Summary - sticky on desktop, fixed bottom on mobile */}
          <div className="lg:col-span-4 order-2">
            <div className="lg:sticky lg:top-24 space-y-6">
              {cart ? (
                <CartSummary cart={cart} />
              ) : (
                // Show a simplified summary from persisted items while loading
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Захиалгын дүн</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Дүн ({itemCount} бараа)</span>
                      <span className="font-medium text-gray-900">
                        ₮{new Intl.NumberFormat("mn-MN").format(storeItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0))}
                      </span>
                    </div>
                  </div>
                  <div className="border-t border-gray-100 mt-6 pt-6">
                    <div className="flex justify-between items-baseline">
                      <span className="text-base font-semibold text-gray-900">Нийт</span>
                      <span className="text-2xl font-bold text-gray-900">
                        ₮{new Intl.NumberFormat("mn-MN").format(storeItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0))}
                      </span>
                    </div>
                  </div>
                  <Link
                    href="/checkout"
                    className="w-full mt-6 bg-gray-900 text-white rounded-xl py-4 text-sm font-semibold hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    Захиалах
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
              
              {/* Additional Info Cards could go here */}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
