"use client";

import { CloudinaryImage } from "@/components/Cloudinary";
import { Minus, Plus, Trash2, Loader2, AlertCircle } from "lucide-react";
import { useState, useCallback } from "react";
import { useCartStore } from "@/lib/store";
import Link from "next/link";
import { formatPrice } from "@/lib/utils/price";

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

  const lineTotal = item.unit_price * item.quantity;

  const handleUpdateQuantity = async (newQuantity: number) => {
    if (newQuantity < 1 || isUpdating) return;
    
    setIsUpdating(true);
    setError(null);
    
    const success = await updateItemQuantity(item.id, newQuantity);
    if (!success) {
      setError("Тоо хэмжээг өөрчлөхөд алдаа гарлаа");
    } else {
      // Keep totals in sync without blocking UI
      void refreshCart();
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
    } else {
      void refreshCart();
    }
    
    setIsUpdating(false);
  };

  return (
    <div className="group relative flex gap-4 px-6 py-5 bg-white hover:bg-gray-50 transition-colors">
      {/* Image */}
      <Link 
        href={item.variant?.product?.handle ? `/products/${item.variant.product.handle}` : '#'}
        className="relative w-24 h-24 shrink-0 bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors"
      >
        {item.thumbnail ? (
          <CloudinaryImage
            src={item.thumbnail}
            alt={item.title}
            width={144}
            height={144}
            className="w-full h-full object-contain p-2"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
            <div className="text-xs font-medium">Зураггүй</div>
          </div>
        )}
        {isUpdating && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] flex items-center justify-center z-10">
            <Loader2 className="w-5 h-5 animate-spin text-gray-900" />
          </div>
        )}
      </Link>

      {/* Details */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <Link 
              href={item.variant?.product?.handle ? `/products/${item.variant.product.handle}` : '#'}
              className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 block mb-1"
            >
              {item.title}
            </Link>
            {item.variant?.title && item.variant.title !== "Default Variant" && (
              <div className="inline-flex items-center gap-2 bg-gray-100 rounded-md px-2 py-1 text-xs text-gray-600 mt-1">
                <span>{item.variant.title}</span>
              </div>
            )}
          </div>
          <button
            onClick={handleRemoveItem}
            disabled={isUpdating}
            className="text-gray-400 hover:text-red-500 transition-colors p-1"
            aria-label="Устгах"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-end justify-between gap-4 mt-auto">
          {/* Quantity controls */}
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => handleUpdateQuantity(item.quantity - 1)}
              disabled={item.quantity <= 1 || isUpdating}
              aria-label="Тоо цөөрүүлэх"
              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-12 text-center text-sm font-semibold text-gray-900 tabular-nums">
              {item.quantity}
            </span>
            <button
              onClick={() => handleUpdateQuantity(item.quantity + 1)}
              disabled={isUpdating}
              aria-label="Тоо нэмэх"
              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Price */}
          <div className="text-right">
            <p className="text-xs text-gray-500 mb-0.5">Нийт</p>
            <p className="text-lg font-bold text-gray-900">{formatPrice(lineTotal, currencyCode)}</p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="absolute top-2 right-2 bg-red-50 text-red-600 text-xs px-3 py-1.5 rounded-md flex items-center gap-1.5 animate-in fade-in slide-in-from-top-2 shadow-sm">
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </div>
      )}
    </div>
  );
}

