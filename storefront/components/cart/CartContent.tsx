"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/store";
import { CartItem } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import Link from "next/link";
import Image from "next/image";
import {
  Loader2,
  RefreshCw,
  ArrowRight,
} from "lucide-react";

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
  const cart = useCartStore((state) => state.cart);
  const storeItems = useCartStore((state) => state.items);
  const fetchCart = useCartStore((state) => state.fetchCart);
  const isFetching = useCartStore((state) => state.isFetching);
  const error = useCartStore((state) => state.error);

  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

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
          <Loader2 className="w-8 h-8 animate-spin text-gray-900 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Сагсыг ачаалж байна...</p>
        </div>
      </main>
    );
  }

  // Wait for hydration before showing any content to avoid mismatch
  if (!hasMounted) {
    return (
      <main className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-900 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Сагсыг ачаалж байна...</p>
        </div>
      </main>
    );
  }

  if (error && !hasPersistedItems) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center py-20">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={handleRetry}
            className="inline-flex items-center gap-2 bg-gray-900 text-white rounded-full py-3 px-6 font-medium hover:bg-gray-800 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Дахин оролдох
          </button>
        </div>
      </main>
    );
  }

  // Show empty cart only if both API cart and persisted items are empty
  const hasCartItems = (cart?.items?.length ?? 0) > 0 || hasPersistedItems;
  
  if (!hasCartItems) {
    return (
      <main className="flex-1 flex items-center justify-center py-24 bg-white">
        <div className="w-full max-w-xl px-6 text-center">
          <div className="mx-auto mb-6 w-20 h-20 flex items-center justify-center">
            <Image 
              src="/pngtree-sad-cartoon-apple-vector-png-image_20975407.png" 
              alt="Сагс хоосон" 
              width={80} 
              height={80}
              className="w-20 h-20 object-contain"
            />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 tracking-tight">
            Сагс хоосон байна
          </h1>
          <p className="text-gray-500 text-sm sm:text-base mb-8 leading-relaxed">
            Дуртай бараагаа сонгоод сагсандаа нэмээрэй.
          </p>

          <Link
            href="/products"
            className="inline-flex items-center justify-center bg-gray-900 text-white rounded-full py-3.5 px-8 text-sm font-semibold hover:bg-gray-800 active:scale-[0.98] transition-all"
          >
            Дэлгүүр хэсэх
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
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
  
  const currencyCode = (cart?.currency_code || "MNT").toUpperCase();
  const itemCount = displayItems.length;

  const total = cart?.total ?? storeItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  // Wrapper function for refreshCart that matches expected signature
  const handleRefreshCart = async () => {
    await fetchCart(true);
  };

  return (
    <main className="flex-1 pb-32 bg-[#fafafa]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Non-blocking error banner (when we still have persisted items to show) */}
        {error && hasPersistedItems ? (
          <div className="bg-white border border-red-200 rounded-xl px-4 py-3 shadow-sm flex items-start sm:items-center justify-between gap-3 mb-6">
            <p className="text-sm text-red-700 leading-snug">{error}</p>
            <button
              onClick={handleRetry}
              className="shrink-0 inline-flex items-center gap-2 bg-gray-900 text-white rounded-lg py-2.5 px-4 text-sm font-semibold hover:bg-gray-800 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Дахин оролдох
            </button>
          </div>
        ) : null}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Сагс</h1>
            <Link
              href="/products"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
            >
              Үргэлжлүүлэх
            </Link>
          </div>
          <p className="text-sm text-gray-600">
            {itemCount} бүтээгдэхүүн{isFetching ? " • шинэчилж байна..." : ""}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 order-1 space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">Бараанууд ({itemCount})</h2>
              </div>
              <div className="divide-y divide-gray-200">
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
          </div>

          {/* Summary - sticky on desktop, fixed bottom on mobile */}
          <div className="lg:col-span-1 order-2">
            <div className="lg:sticky lg:top-24 space-y-4">
              {cart ? (
                <CartSummary cart={cart} />
              ) : (
                // Show a simplified summary from persisted items while loading
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h2 className="text-lg font-bold text-gray-900 mb-6">Нийт дүн</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Дүн ({itemCount} бараа)</span>
                      <span className="font-semibold text-gray-900">
                        ₮{new Intl.NumberFormat("mn-MN").format(storeItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0))}
                      </span>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 mt-6 pt-6">
                    <div className="flex justify-between items-baseline">
                      <span className="text-base font-bold text-gray-900">Нийт</span>
                      <span className="text-2xl font-bold text-gray-900">
                        ₮{new Intl.NumberFormat("mn-MN").format(storeItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0))}
                      </span>
                    </div>
                  </div>
                  <Link
                    href="/checkout"
                    className="hidden lg:flex w-full mt-6 bg-blue-600 text-white rounded-lg py-4 text-sm font-bold hover:bg-blue-700 transition-all shadow-sm items-center justify-center gap-2"
                  >
                    Захиалах
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile sticky checkout bar */}
        {hasCartItems && (
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 shadow-2xl">
            <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
              <div className="flex-1">
                <p className="text-xs text-gray-500">Нийт төлөх</p>
                <p className="text-xl font-bold text-gray-900 leading-tight">₮{new Intl.NumberFormat("mn-MN").format(total)}</p>
              </div>
              <Link
                href="/checkout"
                className="inline-flex items-center gap-2 bg-blue-600 text-white rounded-lg px-6 py-3.5 text-sm font-bold shadow-sm hover:bg-blue-700 active:scale-[0.98] transition-all"
              >
                Худалдан авах
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
