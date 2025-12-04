"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/store";
import { CartItem } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Loader2, Search, Smartphone, Laptop, Headphones, Watch, RefreshCw } from "lucide-react";

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
      <main className="flex-1 flex flex-col items-center justify-center py-20 bg-white">
        <div className="w-full max-w-xl px-6 text-center">
          {/* Visual - Sad Apple */}
          <div className="mb-10 relative inline-block">
            <Image
              src="/pngtree-sad-cartoon-apple-vector-png-image_20975407.png"
              alt="Хоосон сагс"
              width={160}
              height={160}
              className="mx-auto"
            />
          </div>
          
          <h1 className="text-[32px] font-semibold text-[#1d1d1f] mb-3 tracking-tight">
            Таны сагс хоосон байна
          </h1>
          <p className="text-[#86868b] text-[17px] mb-10 leading-relaxed">
            Дэлгүүр хэсэх үед хүссэн барааг сагсандаа нэмээрэй.
          </p>
          
          <Link
            href="/products"
            className="inline-flex items-center justify-center bg-[#0071e3] text-white rounded-full py-3.5 px-8 text-[17px] font-medium hover:bg-[#0077ed] active:scale-[0.98] transition-all group"
          >
            <span>Дэлгүүр хэсэх</span>
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Quick Categories */}
          <div className="border-t border-gray-100 pt-10 mt-12">
            <p className="text-[13px] font-medium text-[#86868b] mb-6 uppercase tracking-wide">
              Онцлох ангилал
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { name: "iPhone", href: "/collections/iphone", icon: Smartphone },
                { name: "Mac", href: "/collections/mac", icon: Laptop },
                { name: "AirPods", href: "/collections/airpods", icon: Headphones },
                { name: "Watch", href: "/collections/apple-watch", icon: Watch },
              ].map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex flex-col items-center justify-center p-5 rounded-3xl bg-[#f5f5f7] hover:bg-[#e8e8ed] transition-colors group"
                >
                  <item.icon className="w-7 h-7 text-[#1d1d1f] mb-2.5 group-hover:scale-110 transition-transform duration-300" strokeWidth={1.5} />
                  <span className="text-[13px] font-medium text-[#1d1d1f]">{item.name}</span>
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
    <main className="flex-1 pb-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        {/* Header */}
        <div className="mb-6 sm:mb-8 lg:mb-10">
          <h1 className="text-[28px] sm:text-[32px] md:text-[40px] font-semibold text-[#1d1d1f] tracking-tight">
            Сагс
          </h1>
          <p className="text-[#86868b] text-[15px] sm:text-[17px] mt-1 sm:mt-2">
            {itemCount} бүтээгдэхүүн
            {isFetching && <span className="ml-2 text-xs">(шинэчилж байна...)</span>}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10">
          {/* Cart Items */}
          <div className="lg:col-span-8 order-1">
            <div className="bg-[#fafafa] rounded-2xl sm:rounded-3xl p-4 sm:p-6">
              {displayItems.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  currencyCode={currencyCode}
                  refreshCart={handleRefreshCart}
                />
              ))}
            </div>
            
            {/* Continue Shopping Link */}
            <Link 
              href="/products"
              className="inline-flex items-center gap-2 text-[#0071e3] text-[14px] sm:text-[15px] font-medium mt-4 sm:mt-6 hover:underline"
            >
              <Search className="w-4 h-4" />
              Дэлгүүр үргэлжлүүлэх
            </Link>
          </div>

          {/* Summary - sticky on desktop, fixed bottom on mobile */}
          <div className="lg:col-span-4 order-2">
            <div className="lg:sticky lg:top-24">
              {cart ? (
                <CartSummary cart={cart} />
              ) : (
                // Show a simplified summary from persisted items while loading
                <div className="bg-[#fafafa] rounded-2xl sm:rounded-3xl p-5 sm:p-6">
                  <h2 className="text-lg font-semibold text-[#1d1d1f] mb-4">Захиалгын дүн</h2>
                  <div className="space-y-3 text-[15px]">
                    <div className="flex justify-between">
                      <span className="text-[#86868b]">Дүн ({itemCount} бараа)</span>
                      <span className="font-medium">
                        ₮{new Intl.NumberFormat("mn-MN").format(storeItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0))}
                      </span>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 mt-4 pt-4">
                    <div className="flex justify-between text-[17px] font-semibold">
                      <span>Нийт</span>
                      <span>₮{new Intl.NumberFormat("mn-MN").format(storeItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0))}</span>
                    </div>
                  </div>
                  <Link
                    href="/checkout"
                    className="w-full mt-5 bg-[#0071e3] text-white rounded-xl py-3.5 text-[15px] font-semibold hover:bg-[#0077ed] transition-colors flex items-center justify-center gap-2"
                  >
                    Захиалах
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
