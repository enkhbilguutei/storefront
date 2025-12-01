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
      // Make API call and refresh in parallel - refreshCart will get updated data
      await medusa.store.cart.updateLineItem(cartId, item.id, {
        quantity: newQuantity,
      });
      refreshCart(); // Don't await - let it update in background
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
      // Only call refreshCart - it already fetches latest cart data
      // No need for duplicate syncCart call
      refreshCart();
    } catch (err) {
      console.error("Failed to remove item:", err);
      setError("Бараа устгахад алдаа гарлаа");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex gap-6 py-6 border-b border-gray-100 last:border-0">
      {/* Image */}
      <div className="relative w-24 h-24 sm:w-32 sm:h-32 shrink-0 bg-[#f5f5f7] rounded-xl overflow-hidden">
        {item.thumbnail ? (
          <CloudinaryImage
            src={item.thumbnail}
            alt={item.title}
            width={200}
            height={200}
            className="w-full h-full object-contain p-2"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
            No Image
          </div>
        )}
        {isUpdating && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-[#0071e3]" />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col justify-between">
        <div className="flex justify-between items-start gap-4">
          <div>
            {item.variant?.product?.handle ? (
              <Link 
                href={`/products/${item.variant.product.handle}`}
                className="text-base font-medium text-[#1d1d1f] hover:text-[#0071e3] transition-colors line-clamp-2"
              >
                {item.title}
              </Link>
            ) : (
              <span className="text-base font-medium text-[#1d1d1f] line-clamp-2">
                {item.title}
              </span>
            )}
            <p className="text-sm text-[#86868b] mt-1">{item.variant?.title}</p>
          </div>
          <p className="text-base font-semibold text-[#1d1d1f]">
            {formatPrice(item.unit_price * item.quantity)}
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-500 text-sm mt-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center border border-gray-200 rounded-lg p-1">
              <button
                onClick={() => updateQuantity(item.quantity - 1)}
                disabled={isUpdating || item.quantity <= 1}
                className="p-1.5 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Minus className="w-4 h-4 text-gray-600" />
              </button>
              <span className="w-10 text-center text-sm font-medium text-[#1d1d1f]">
                {item.quantity}
              </span>
              <button
                onClick={() => updateQuantity(item.quantity + 1)}
                disabled={isUpdating}
                className="p-1.5 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Plus className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            
            <button
              onClick={removeItem}
              disabled={isUpdating}
              className="text-sm text-red-500 hover:text-red-600 font-medium flex items-center gap-1 px-2 py-1.5 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50"
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
