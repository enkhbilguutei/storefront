"use client";

import { useEffect, useState, useCallback } from "react";
import { useCartStore } from "@/lib/store";
import { medusa } from "@/lib/medusa";
import { CartItem } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Loader2, Search, Smartphone, Laptop, Headphones, Watch, RefreshCw } from "lucide-react";

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
        fields: "+items.variant.product.handle,+items.variant.product.title",
      });
      
      if (!fetchedCart) {
        // Cart might be expired
        useCartStore.getState().clearCart();
        setCart(null);
      } else {
        setCart(fetchedCart);
      }
    } catch (err) {
      console.error("Error fetching cart:", err);
      // If cart retrieval fails, it might be expired - clear it
      useCartStore.getState().clearCart();
      setCart(null);
      setError("Сагсыг ачаалахад алдаа гарлаа");
    } finally {
      setIsLoading(false);
    }
  }, [cartId]);

  useEffect(() => {
    fetchCart();
    // Also sync the cart store
    syncCart();
  }, [fetchCart, syncCart]);

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    fetchCart();
  };

  if (isLoading) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#0071e3] mx-auto mb-4" />
          <p className="text-[#86868b]">Сагсыг ачаалж байна...</p>
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
      <main className="flex-1 flex flex-col items-center justify-center py-20">
        <div className="w-full max-w-2xl px-6 text-center">
          {/* Visual */}
          <div className="mb-10 relative inline-block">
            <div className="w-48 h-48 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mx-auto relative z-10 rotate-3 transition-transform hover:rotate-0 duration-500 overflow-hidden">
              <Image 
                src="/pngtree-sad-cartoon-apple-vector-png-image_20975407.png"
                alt="Empty Cart"
                width={150}
                height={150}
                className="object-contain opacity-80 grayscale hover:grayscale-0 transition-all duration-500"
              />
            </div>
            <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center z-20 animate-bounce-slow">
              <Search className="w-8 h-8 text-[#0071e3]" strokeWidth={2} />
            </div>
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full bg-blue-500/5 rounded-[2.5rem] -rotate-6 -z-10 scale-105" />
          </div>
          
          <h1 className="text-4xl font-semibold text-[#1d1d1f] mb-4 tracking-tight">
            Таны сагс хоосон байна
          </h1>
          <p className="text-[#86868b] text-lg mb-12 leading-relaxed max-w-lg mx-auto">
            Таны хайж буй технологийн шийдэл энд байна. <br className="hidden sm:block" />
            Шинэ загварын iPhone, Mac болон бусад бүтээгдэхүүнтэй танилцаарай.
          </p>
          
          <Link
            href="/products"
            className="inline-flex items-center justify-center bg-[#0071e3] text-white rounded-full py-4 px-12 text-[17px] font-medium hover:bg-[#0077ed] active:scale-[0.98] transition-all shadow-lg shadow-blue-500/20 group mb-16"
          >
            <span>Дэлгүүр хэсэх</span>
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Quick Categories */}
          <div className="border-t border-gray-100 pt-12">
            <p className="text-sm font-medium text-[#86868b] mb-8 uppercase tracking-wide">
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
                  className="flex flex-col items-center justify-center p-6 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors group"
                >
                  <item.icon className="w-8 h-8 text-[#1d1d1f] mb-3 group-hover:scale-110 transition-transform duration-300" strokeWidth={1.5} />
                  <span className="text-sm font-medium text-[#1d1d1f]">{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl md:text-4xl font-semibold text-[#1d1d1f] mb-12">
          Таны сагс ({cart.items.length})
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-8">
            <div className="border-t border-gray-100">
              {cart.items.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  currencyCode={cart.currency_code}
                  refreshCart={fetchCart}
                />
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-4">
            <CartSummary cart={cart} />
          </div>
        </div>
      </div>
    </main>
  );
}
