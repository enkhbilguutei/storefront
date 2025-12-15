"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/store";
import { CartItem } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import Link from "next/link";
import {
  Loader2,
  RefreshCw,
  ArrowRight,
  ShoppingBag,
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
          <div className="mx-auto mb-6 w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
            <ShoppingBag className="w-7 h-7 text-gray-400" />
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
    <main className="flex-1 pb-32 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Non-blocking error banner (when we still have persisted items to show) */}
        {error && hasPersistedItems ? (
          <div className="bg-white border border-red-100 rounded-2xl px-4 py-3 shadow-sm flex items-start sm:items-center justify-between gap-3">
            <p className="text-sm text-red-700 leading-snug">{error}</p>
            <button
              onClick={handleRetry}
              className="shrink-0 inline-flex items-center gap-2 bg-gray-900 text-white rounded-full py-2.5 px-4 text-sm font-semibold hover:bg-gray-800 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Дахин оролдох
            </button>
          </div>
        ) : null}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Сагс</h1>
            <p className="text-sm text-gray-500 mt-1">
              {itemCount} бүтээгдэхүүн{isFetching ? " • шинэчилж байна..." : ""}
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-gray-700 text-sm font-semibold hover:text-gray-900 transition-colors"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            Дэлгүүр үргэлжлүүлэх
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-8 order-1">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr] items-center px-6 py-3 text-xs font-semibold text-gray-500 bg-gray-50">
                <span>Бараа</span>
                <span className="text-center">Тоо</span>
                <span className="text-right">Нийт</span>
              </div>
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
                    className="hidden lg:flex w-full mt-6 bg-gray-900 text-white rounded-xl py-4 text-sm font-semibold hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 hover:shadow-xl items-center justify-center gap-2"
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
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 pb-4 px-4">
            <div className="max-w-7xl mx-auto bg-white/95 backdrop-blur rounded-2xl shadow-2xl border border-gray-100 p-4 flex items-center gap-4">
              <div className="flex-1">
                <p className="text-xs text-gray-500">Нийт төлөх</p>
                <p className="text-lg font-bold text-gray-900 leading-tight">₮{new Intl.NumberFormat("mn-MN").format(total)}</p>
              </div>
              <Link
                href="/checkout"
                className="inline-flex items-center gap-2 bg-gray-900 text-white rounded-xl px-4 py-3 text-sm font-semibold shadow-lg shadow-gray-200 hover:bg-gray-800 active:scale-[0.98] transition-all"
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
