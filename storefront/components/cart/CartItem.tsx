"use client";

import { CloudinaryImage } from "@/components/Cloudinary";
import { Minus, Plus, Trash2, Loader2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { medusa } from "@/lib/medusa";
import { useCartStore } from "@/lib/store";
import Link from "next/link";

interface CartItemProps {
  item: {
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
  };
  currencyCode: string;
  refreshCart: () => Promise<void>;
}

export function CartItem({ item, currencyCode, refreshCart }: CartItemProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("mn-MN", {
      style: "currency",
      currency: currencyCode,
    }).format(amount);
  };

  const updateQuantity = async (newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const cartId = useCartStore.getState().cartId;
    if (!cartId) {
      setError("Сагс олдсонгүй");
      return;
    }
    
    setIsUpdating(true);
    setError(null);
    
    try {
      await medusa.store.cart.updateLineItem(cartId, item.id, {
        quantity: newQuantity,
      });
      refreshCart();
    } catch (err) {
      console.error("Failed to update quantity:", err);
      setError("Тоо хэмжээг өөрчлөхөд алдаа гарлаа");
    } finally {
      setIsUpdating(false);
    }
  };

  const removeItem = async () => {
    const cartId = useCartStore.getState().cartId;
    if (!cartId) {
      setError("Сагс олдсонгүй");
      return;
    }
    
    setIsUpdating(true);
    setError(null);
    
    try {
      await medusa.store.cart.deleteLineItem(cartId, item.id);
      refreshCart();
    } catch (err) {
      console.error("Failed to remove item:", err);
      setError("Бараа устгахад алдаа гарлаа");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex gap-5 py-6 border-b border-gray-100 last:border-0">
      {/* Image - Clickable with clean background */}
      <Link 
        href={item.variant?.product?.handle ? `/products/${item.variant.product.handle}` : '#'}
        className="relative w-28 h-28 sm:w-36 sm:h-36 shrink-0 bg-[#fafafa] rounded-[1.5rem] overflow-hidden hover:bg-[#f5f5f5] transition-colors group"
      >
        {item.thumbnail ? (
          <CloudinaryImage
            src={item.thumbnail}
            alt={item.title}
            width={144}
            height={144}
            className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
            Зураг байхгүй
          </div>
        )}
        {isUpdating && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-[1.5rem]">
            <Loader2 className="w-5 h-5 animate-spin text-[#0071e3]" />
          </div>
        )}
      </Link>

      {/* Details */}
      <div className="flex flex-1 flex-col justify-between py-1">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            {/* Product Title - Clickable */}
            <Link 
              href={item.variant?.product?.handle ? `/products/${item.variant.product.handle}` : '#'}
              className="text-[17px] font-semibold text-[#1d1d1f] hover:text-[#0071e3] transition-colors line-clamp-2 leading-snug"
            >
              {item.title}
            </Link>
            
            {/* Variant Info - Show as pills */}
            {item.variant?.title && item.variant.title !== "Default" && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {item.variant.title.split(" / ").map((attr, idx) => (
                  <span 
                    key={idx}
                    className="inline-flex items-center px-2.5 py-1 bg-[#f5f5f7] text-[#1d1d1f] text-[12px] font-medium rounded-full"
                  >
                    {attr}
                  </span>
                ))}
              </div>
            )}
            
            {/* Unit Price */}
            <p className="text-[13px] text-[#86868b] mt-2">
              {formatPrice(item.unit_price)} / ширхэг
            </p>
          </div>
          
          {/* Total Price */}
          <p className="text-[17px] font-semibold text-[#1d1d1f] whitespace-nowrap">
            {formatPrice(item.unit_price * item.quantity)}
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-500 text-sm mt-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {/* Quantity & Remove */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-4">
            {/* Quantity Controls */}
            <div className="flex items-center bg-[#f5f5f7] rounded-full p-1">
              <button
                onClick={() => updateQuantity(item.quantity - 1)}
                disabled={isUpdating || item.quantity <= 1}
                className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-full disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Minus className="w-4 h-4 text-[#1d1d1f]" />
              </button>
              <span className="w-10 text-center text-[15px] font-semibold text-[#1d1d1f]">
                {item.quantity}
              </span>
              <button
                onClick={() => updateQuantity(item.quantity + 1)}
                disabled={isUpdating}
                className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-full disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Plus className="w-4 h-4 text-[#1d1d1f]" />
              </button>
            </div>
            
            {/* Remove Button */}
            <button
              onClick={removeItem}
              disabled={isUpdating}
              className="text-[15px] text-[#0071e3] hover:text-[#0077ed] font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Устгах</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
