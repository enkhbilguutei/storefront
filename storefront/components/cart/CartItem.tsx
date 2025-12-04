"use client";

import { CloudinaryImage } from "@/components/Cloudinary";
import { Minus, Plus, Trash2, Loader2, AlertCircle } from "lucide-react";
import { useState, useCallback } from "react";
import { useCartStore } from "@/lib/store";
import Link from "next/link";

interface CartItemProps {
  item: {
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
  };
  currencyCode: string;
  refreshCart: () => Promise<void>;
}

export function CartItem({ item, currencyCode, refreshCart }: CartItemProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { updateItemQuantity, removeItem } = useCartStore();

  const formatPrice = useCallback((amount: number) => {
    return new Intl.NumberFormat("mn-MN", {
      style: "currency",
      currency: currencyCode,
    }).format(amount);
  }, [currencyCode]);

  const handleUpdateQuantity = async (newQuantity: number) => {
    if (newQuantity < 1 || isUpdating) return;
    
    setIsUpdating(true);
    setError(null);
    
    const success = await updateItemQuantity(item.id, newQuantity);
    if (!success) {
      setError("Тоо хэмжээг өөрчлөхөд алдаа гарлаа");
    }
    
    setIsUpdating(false);
  };

  const handleRemoveItem = async () => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    setError(null);
    
    const success = await removeItem(item.id);
    if (!success) {
      setError("Бараа устгахад алдаа гарлаа");
    }
    
    setIsUpdating(false);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 py-4 sm:py-6 border-b border-gray-100 last:border-0">
      {/* Image - Clickable with clean background */}
      <Link 
        href={item.variant?.product?.handle ? `/products/${item.variant.product.handle}` : '#'}
        className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 shrink-0 bg-[#fafafa] rounded-xl sm:rounded-3xl overflow-hidden hover:bg-[#f5f5f5] transition-colors group mx-auto sm:mx-0"
      >
        {item.thumbnail ? (
          <CloudinaryImage
            src={item.thumbnail}
            alt={item.title}
            width={144}
            height={144}
            className="w-full h-full object-contain p-2 sm:p-3 group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
            Зураг байхгүй
          </div>
        )}
        {isUpdating && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-xl sm:rounded-3xl">
            <Loader2 className="w-5 h-5 animate-spin text-[#0071e3]" />
          </div>
        )}
      </Link>

      {/* Details */}
      <div className="flex flex-1 flex-col justify-between py-0 sm:py-1">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-4">
          <div className="flex-1 w-full">
            {/* Product Title - Clickable */}
            <Link 
              href={item.variant?.product?.handle ? `/products/${item.variant.product.handle}` : '#'}
              className="text-[15px] sm:text-[17px] font-semibold text-[#1d1d1f] hover:text-[#0071e3] transition-colors line-clamp-2 leading-snug"
            >
              {item.title}
            </Link>
            
            {/* Variant Info - Show as pills */}
            {item.variant?.title && item.variant.title !== "Default" && (
              <div className="flex flex-wrap gap-1 sm:gap-1.5 mt-1.5 sm:mt-2">
                {item.variant.title.split(" / ").map((attr, idx) => (
                  <span 
                    key={idx}
                    className="inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 bg-[#f5f5f7] text-[#1d1d1f] text-[11px] sm:text-[12px] font-medium rounded-full"
                  >
                    {attr}
                  </span>
                ))}
              </div>
            )}
            
            {/* Unit Price */}
            <p className="text-[12px] sm:text-[13px] text-[#86868b] mt-1.5 sm:mt-2">
              {formatPrice(item.unit_price)} / ширхэг
            </p>
          </div>
          
          {/* Total Price */}
          <p className="text-[16px] sm:text-[17px] font-semibold text-[#1d1d1f] whitespace-nowrap">
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
        <div className="flex items-center justify-between mt-3 sm:mt-4">
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Quantity Controls */}
            <div className="flex items-center bg-[#f5f5f7] rounded-full p-0.5 sm:p-1">
              <button
                onClick={() => handleUpdateQuantity(item.quantity - 1)}
                disabled={isUpdating || item.quantity <= 1}
                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center hover:bg-white rounded-full disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#1d1d1f]" />
              </button>
              <span className="w-8 sm:w-10 text-center text-[14px] sm:text-[15px] font-semibold text-[#1d1d1f]">
                {item.quantity}
              </span>
              <button
                onClick={() => handleUpdateQuantity(item.quantity + 1)}
                disabled={isUpdating}
                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center hover:bg-white rounded-full disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#1d1d1f]" />
              </button>
            </div>
            
            {/* Remove Button */}
            <button
              onClick={handleRemoveItem}
              disabled={isUpdating}
              className="text-[14px] sm:text-[15px] text-[#0071e3] hover:text-[#0077ed] font-medium flex items-center gap-1 sm:gap-1.5 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Устгах</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
