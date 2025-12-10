"use client";

import Link from "next/link";
import { CloudinaryImage } from "@/components/Cloudinary";
import { ShoppingCart, Loader2 } from "lucide-react";
import { useState } from "react";
import { useCartStore, useUIStore } from "@/lib/store";

interface ProductCardProps {
  id: string;
  title: string;
  handle: string;
  thumbnail?: string;
  price?: {
    amount: number;
    currencyCode: string;
  };
  originalPrice?: {
    amount: number;
    currencyCode: string;
  };
  badge?: "Best Seller" | "Recommended" | "New Arrival" | "Trending" | "Featured" | null;
  soldCount?: number;
}

export function ProductCard({
  id,
  title,
  handle,
  thumbnail,
  price,
  originalPrice,
  badge,
  soldCount
}: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const { addItem, cartId, setCartId, syncCart } = useCartStore();
  const { openCartNotification } = useUIStore();

  // Check if product is on sale
  const isOnSale = originalPrice && price && originalPrice.amount > price.amount;
  const discountPercentage = isOnSale 
    ? Math.round(((originalPrice.amount - price.amount) / originalPrice.amount) * 100)
    : 0;

  const formatPrice = (amount: number, currencyCode: string) => {
    const formatted = new Intl.NumberFormat("mn-MN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
    
    return `₮${formatted}`;
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isAdding) return;
    
    setIsAdding(true);
    try {
      await addItem({
        variant_id: id,
        quantity: 1,
      });
      openCartNotification();
    } catch (error) {
      console.error('Failed to add item to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const getBadgeStyles = (badgeType: typeof badge) => {
    switch (badgeType) {
      case "Best Seller":
        return "bg-orange-500 text-white";
      case "Recommended":
        return "bg-green-500 text-white";
      case "New Arrival":
        return "bg-blue-500 text-white";
      case "Trending":
        return "bg-purple-500 text-white";
      case "Featured":
        return "bg-red-500 text-white";
      default:
        return "";
    }
  };

  const getBadgeText = (badgeType: typeof badge) => {
    switch (badgeType) {
      case "Best Seller":
        return "Хамгийн их борлуулалттай";
      case "Recommended":
        return "Санал болгох";
      case "New Arrival":
        return "Шинэ";
      case "Trending":
        return "Эрэлттэй";
      case "Featured":
        return "Онцлох";
      default:
        return "";
    }
  };

  return (
    <Link 
      href={`/products/${handle}`}
      className="group block bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
    >
      {/* Image Section */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        {thumbnail ? (
          <CloudinaryImage
            src={thumbnail}
            alt={title}
            width={400}
            height={400}
            className="object-contain w-full h-full p-4 group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <span className="text-gray-400 text-sm">Зураггүй</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {badge && (
            <span className={`${getBadgeStyles(badge)} px-2 py-1 text-[9px] md:text-[10px] font-semibold rounded`}>
              {getBadgeText(badge)}
            </span>
          )}
          {soldCount && soldCount > 0 && (
            <span className="bg-gray-900/80 text-white px-2 py-1 text-[9px] md:text-[10px] font-semibold rounded">
              {soldCount}+ худалдаалагдсан
            </span>
          )}
        </div>

        {/* Discount Badge */}
        {isOnSale && discountPercentage > 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded font-bold text-xs md:text-sm">
            {discountPercentage}% хямдрал
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-3 md:p-4">
        {/* Title */}
        <h3 className="text-sm md:text-base font-medium text-gray-900 line-clamp-2 mb-2 h-10 md:h-12">
          {title}
        </h3>

        {/* Price Section */}
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {price && (
              <span className="text-base md:text-lg font-bold text-gray-900">
                {formatPrice(price.amount, price.currencyCode)}
              </span>
            )}
            {isOnSale && originalPrice && (
              <span className="text-xs md:text-sm text-gray-500 line-through">
                {formatPrice(originalPrice.amount, originalPrice.currencyCode)}
              </span>
            )}
          </div>
          {isOnSale && discountPercentage > 0 && (
            <span className="text-xs text-green-600 font-medium">
              {discountPercentage}% хямдарлаа
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={isAdding}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 md:py-2.5 px-3 md:px-4 rounded-lg font-medium text-xs md:text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isAdding ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Нэмж байна...
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" />
              Сагслах
            </>
          )}
        </button>
      </div>
    </Link>
  );
}
