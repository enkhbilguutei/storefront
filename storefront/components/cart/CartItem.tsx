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

  const lineTotal = item.unit_price * item.quantity;

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
    <div className="group relative flex flex-col gap-4 sm:gap-6 px-4 sm:px-6 py-5 bg-white">
      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6">
        {/* Image */}
        <Link 
          href={item.variant?.product?.handle ? `/products/${item.variant.product.handle}` : '#'}
          className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0 bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-gray-200 transition-colors mx-auto sm:mx-0"
        >
          {item.thumbnail ? (
            <CloudinaryImage
              src={item.thumbnail}
              alt={item.title}
              width={144}
              height={144}
              className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500"
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
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <Link 
                href={item.variant?.product?.handle ? `/products/${item.variant.product.handle}` : '#'}
                className="text-base font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2"
              >
                {item.title}
              </Link>
              {item.variant?.title && item.variant.title !== "Default Variant" && (
                <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-full px-3 py-1 text-xs text-gray-600">
                  <span>{item.variant.title}</span>
                </div>
              )}
            </div>
            <button
              onClick={handleRemoveItem}
              disabled={isUpdating}
              className="hidden sm:inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-500 font-medium transition-colors px-2 py-1 rounded-md hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
              Устгах
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-[auto_150px] items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-white border border-gray-200 rounded-full p-1 shadow-sm">
                <button
                  onClick={() => handleUpdateQuantity(item.quantity - 1)}
                  disabled={item.quantity <= 1 || isUpdating}
                  aria-label="Тоо цөөрүүлэх"
                  className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-10 text-center text-sm font-semibold text-gray-900 tabular-nums">
                  {item.quantity}
                </span>
                <button
                  onClick={() => handleUpdateQuantity(item.quantity + 1)}
                  disabled={isUpdating}
                  aria-label="Тоо нэмэх"
                  className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6">
              <div className="text-right">
                <p className="text-xs text-gray-500">Нэгж үнэ</p>
                <p className="text-sm font-semibold text-gray-900">{formatPrice(item.unit_price)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Нийт</p>
                <p className="text-lg font-bold text-gray-900">{formatPrice(lineTotal)}</p>
              </div>
            </div>
          </div>

          <div className="sm:hidden flex items-center justify-between pt-2">
            <button
              onClick={handleRemoveItem}
              disabled={isUpdating}
              className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-500 font-medium transition-colors px-2 py-1 rounded-md hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
              Устгах
            </button>
            <div className="text-right">
              <p className="text-xs text-gray-500">Нийт</p>
              <p className="text-base font-bold text-gray-900">{formatPrice(lineTotal)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="absolute bottom-2 right-2 sm:top-2 sm:right-2 bg-red-50 text-red-600 text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 animate-in fade-in slide-in-from-bottom-2">
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </div>
      )}
    </div>
  );
}

