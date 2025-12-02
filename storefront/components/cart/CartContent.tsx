"use client";

import { useEffect, useState, useCallback } from "react";
import { useCartStore } from "@/lib/store";
import { medusa } from "@/lib/medusa";
import { CartItem } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Loader2, Search, Smartphone, Laptop, Headphones, Watch, RefreshCw, ShoppingCart } from "lucide-react";

// Define types based on Medusa response
interface LineItem {
  id: string;
  title: string;
  quantity: number;
  thumbnail?: string;
  unit_price: number;
  variant: {
    id: string;
    title: string;
    product: {
      handle: string;
      title: string;
    };
  };
}

interface Cart {
  id: string;
  items: LineItem[];
  subtotal?: number;
  discount_total?: number;
  shipping_total?: number;
  tax_total?: number;
  total?: number;
  currency_code: string;
  region_id: string;
}

export function CartContent() {
  const { cartId, syncCart } = useCartStore();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = useCallback(async () => {
    if (!cartId) {
      setIsLoading(false);
      setCart(null);
      return;
    }

    setError(null);
    
    try {
      const { cart: fetchedCart } = await medusa.store.cart.retrieve(cartId, {
        fields: "+items.variant.product.handle,+items.variant.product.title,+items.variant.title",
      });
      
      if (!fetchedCart) {
        useCartStore.getState().clearCart();
        setCart(null);
      } else {
        setCart(fetchedCart);
      }
    } catch (err) {
      console.error("Error fetching cart:", err);
      useCartStore.getState().clearCart();
      setCart(null);
      setError("Сагсыг ачаалахад алдаа гарлаа");
    } finally {
      setIsLoading(false);
    }
  }, [cartId]);

  useEffect(() => {
    fetchCart();
    syncCart();
  }, [fetchCart, syncCart]);

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    fetchCart();
  };

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

  if (error) {
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

  if (!cart || !cart.items?.length) {
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
                  className="flex flex-col items-center justify-center p-5 rounded-[1.5rem] bg-[#f5f5f7] hover:bg-[#e8e8ed] transition-colors group"
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

  return (
    <main className="flex-1 pb-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        {/* Header */}
        <div className="mb-6 sm:mb-8 lg:mb-10">
          <h1 className="text-[28px] sm:text-[32px] md:text-[40px] font-semibold text-[#1d1d1f] tracking-tight">
            Сагс
          </h1>
          <p className="text-[#86868b] text-[15px] sm:text-[17px] mt-1 sm:mt-2">
            {cart.items.length} бүтээгдэхүүн
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10">
          {/* Cart Items */}
          <div className="lg:col-span-8 order-1">
            <div className="bg-[#fafafa] rounded-2xl sm:rounded-3xl p-4 sm:p-6">
              {cart.items.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  currencyCode={cart.currency_code}
                  refreshCart={fetchCart}
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
              <CartSummary cart={cart} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
