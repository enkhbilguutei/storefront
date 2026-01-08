"use client";

import Link from "next/link";
import { CloudinaryImage } from "@/components/Cloudinary";
import { ShoppingCart, Loader2, ArrowLeftRight, Star } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useCartStore, useUIStore } from "@/lib/store";
import { useComparisonStore } from "@/lib/store/comparison-store";
import { addToCart } from "@/lib/cart/addToCart";
import { isTradeInEligibleAppleProductText, TRADE_IN_BADGE_TEXT, TRADE_IN_BADGE_TITLE } from "@/lib/tradein";
import { toast } from "@/lib/toast";

interface ColorVariant {
  value: string;
  hex?: string;
}

interface ProductCardProps {
  id: string; // variant id for cart
  productId: string;
  title: string;
  handle: string;
  thumbnail?: string;
  tradeInEligible?: boolean;
  price?: {
    amount: number;
    currencyCode: string;
  };
  originalPrice?: {
    amount: number;
    currencyCode: string;
  };
  collection?: {
    id: string;
    title: string;
    handle: string;
  } | null;
  inventoryQuantity?: number | null;
  manageInventory?: boolean | null;
  allowBackorder?: boolean | null;
  rating?: number;
  reviewCount?: number;
  colors?: ColorVariant[];
}

export function ProductCard({
  id,
  productId,
  title,
  handle,
  thumbnail,
  tradeInEligible,
  price,
  originalPrice,
  collection,
  inventoryQuantity,
  manageInventory,
  allowBackorder,
  rating = 4.5,
  reviewCount = 0,
  colors = [],
}: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { openCartNotification } = useUIStore();
  const { toggleProduct, isInComparison } = useComparisonStore();
  
  const isInCompare = isInComparison(id);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if product is on sale
  const isOnSale = originalPrice && price && originalPrice.amount > price.amount;
  const discountPercentage = isOnSale 
    ? Math.round(((originalPrice.amount - price.amount) / originalPrice.amount) * 100)
    : 0;

  const isTradeInEligible =
    typeof tradeInEligible === "boolean"
      ? tradeInEligible
      : isTradeInEligibleAppleProductText({ handle, title });

  // Lightweight stock check for grid cards (fallback to true if data missing)
  const isInStock = useMemo(() => {
    if (manageInventory === false) return true;
    if (allowBackorder) return true;
    if (inventoryQuantity == null) return true; // unknown → allow
    return inventoryQuantity > 0;
  }, [allowBackorder, inventoryQuantity, manageInventory]);

  const formatPrice = (amount: number) => {
    const formatted = new Intl.NumberFormat("mn-MN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
    
    return `₮${formatted}`;
  };

  // Color mapping for common color names
  const getColorHex = (colorName: string): string => {
    const colorMap: Record<string, string> = {
      'natural titanium': '#E5E4DF',
      'blue titanium': '#5B8FA3',
      'black titanium': '#2D2D2D',
      'white titanium': '#F5F5F0',
      'space gray': '#7D7D7D',
      'silver': '#E3E3E8',
      'gold': '#F9D7C4',
      'midnight': '#1F2937',
      'starlight': '#FAF9F7',
      'purple': '#9F7AEA',
      'blue': '#3B82F6',
      'green': '#10B981',
      'yellow': '#F59E0B',
      'red': '#EF4444',
      'pink': '#EC4899',
      'black': '#1F2937',
      'white': '#F9FAFB',
    };
    
    return colorMap[colorName.toLowerCase()] || '#9CA3AF';
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isAdding) return;
    if (!isInStock) {
      toast.error("Барааны нөөц дууссан байна.");
      return;
    }
    
    setIsAdding(true);
    try {
      const { cartId, setCartId, syncCart, addItem } = useCartStore.getState();
      
      const success = await addToCart({
        variantId: id,
        quantity: 1,
        productInfo: {
          id,
          title,
          thumbnail,
          handle,
          unitPrice: price?.amount || 0,
        },
        currentCartId: cartId,
        setCartId,
        syncCart,
        addItem,
        openCartNotification,
      });
      
      // addToCart already shows toast messages, no need to show success here
      if (!success) {
        console.error('Failed to add item to cart');
      }
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      // Error toast is already shown in addToCart function
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="group bg-white rounded-xl md:rounded-2xl overflow-hidden transition-all duration-300 border border-gray-200 hover:border-gray-300 flex flex-col h-full">
      {/* PICK Label */}
      {isOnSale && (
        <div className="px-3 md:px-4 pt-2 md:pt-3 pb-1">
          <span className="text-[10px] md:text-xs font-semibold text-blue-600 uppercase tracking-wider">
            Хямдрал
          </span>
        </div>
      )}

      {/* Image Section */}
      <Link href={`/products/${handle}`} className="relative aspect-[4/5] bg-white overflow-hidden px-4 md:px-6 pt-4 md:pt-6 pb-3 md:pb-4">
        {thumbnail ? (
          <div className="absolute inset-0 flex items-center justify-center p-6 md:p-8">
            <CloudinaryImage
              src={thumbnail}
              alt={title}
              width={400}
              height={400}
              className="object-contain w-full h-full"
            />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <span className="text-gray-400 text-xs md:text-sm">Зураггүй</span>
          </div>
        )}

        {/* Badges */}
        {!isInStock && (
          <div className="absolute top-3 md:top-4 right-3 md:right-4 bg-gray-900/90 backdrop-blur-sm text-white px-2 md:px-2.5 py-0.5 md:py-1 rounded-md font-semibold text-[10px] md:text-xs">
            Дууссан
          </div>
        )}
      </Link>

      {/* Content Section */}
      <div className="px-3 md:px-4 pb-3 md:pb-4 flex-1 flex flex-col">
        {/* Title */}
        <Link href={`/products/${handle}`}>
          <h3 className="text-sm md:text-base lg:text-lg font-bold text-gray-900 mb-1.5 md:mb-2 line-clamp-2 min-h-[2.5rem] md:min-h-[3rem]">
            {title}
          </h3>
        </Link>

        {/* Rating - Samsung style */}
        {reviewCount > 0 && (
          <div className="flex items-center gap-1.5 md:gap-2 mb-2 md:mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 md:h-4 w-3 md:w-4 ${
                    i < Math.floor(rating)
                      ? "fill-orange-400 text-orange-400"
                      : i < rating
                      ? "fill-orange-400 text-orange-400 opacity-50"
                      : "fill-gray-200 text-gray-200"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs md:text-sm font-bold text-gray-900">
              {rating.toFixed(1)}
            </span>
            <span className="text-xs md:text-sm text-gray-500">
              ({reviewCount > 999 ? `${Math.floor(reviewCount / 1000)}k+` : reviewCount}+)
            </span>
          </div>
        )}

        {/* Color Swatches with label - Samsung style */}
        {colors.length > 0 && (
          <div className="mb-3 md:mb-4">
            <p className="text-xs md:text-sm text-gray-700 mb-1.5 md:mb-2 font-medium truncate">
              {colors[0].value}
            </p>
            <div className="flex items-center gap-1.5 md:gap-2">
              {colors.slice(0, 4).map((color, index) => (
                <button
                  key={index}
                  onClick={(e) => e.preventDefault()}
                  className="w-6 h-6 md:w-7 md:h-7 rounded-full border-2 border-gray-300 hover:border-gray-900 transition-colors flex-shrink-0"
                  style={{ backgroundColor: color.hex || getColorHex(color.value) }}
                  title={color.value}
                />
              ))}
              {colors.length > 4 && (
                <span className="text-xs md:text-sm text-gray-600">
                  +{colors.length - 4}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Price Section - Samsung style */}
        <div className="mb-3 md:mb-4 mt-auto">
          {price && (
            <p className="text-xl md:text-2xl font-bold text-gray-900 mb-0.5 md:mb-1">
              {formatPrice(price.amount)}
            </p>
          )}
          {originalPrice && (
            <p className="text-[11px] md:text-sm text-gray-500 line-clamp-1">
              Үндсэн: {formatPrice(originalPrice.amount)}
            </p>
          )}
        </div>

        {/* Action Buttons - Samsung style */}
        <div className="space-y-1.5 md:space-y-2">
          <button
            onClick={handleAddToCart}
            disabled={isAdding || !isInStock}
            className="w-full bg-black hover:bg-gray-900 text-white py-2.5 md:py-3.5 px-3 md:px-4 rounded-full font-semibold text-xs md:text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 md:gap-2 min-h-[44px]"
          >
            {isAdding ? (
              <>
                <Loader2 className="h-3.5 md:h-4 w-3.5 md:w-4 animate-spin" />
                <span className="hidden sm:inline">Нэмж байна...</span>
                <span className="sm:hidden">...</span>
              </>
            ) : !isInStock ? (
              "Дууссан"
            ) : (
              "Худалдаж авах"
            )}
          </button>

          <Link href={`/products/${handle}`} className="block">
            <button className="w-full bg-white hover:bg-gray-50 text-gray-900 py-2.5 md:py-3.5 px-3 md:px-4 rounded-full font-semibold text-xs md:text-sm border-2 border-gray-300 hover:border-gray-400 transition-colors min-h-[44px]">
              <span className="hidden sm:inline">Дэлгэрэнгүй үзэх</span>
              <span className="sm:hidden">Дэлгэрэнгүй</span>
            </button>
          </Link>
        </div>

        {/* Compare Checkbox - Samsung style */}
        <div className="mt-2 md:mt-3 pt-2 md:pt-3 border-t border-gray-100">
          <label className="flex items-center gap-2 cursor-pointer min-h-[44px] -m-2 p-2">
            <input
              type="checkbox"
              checked={mounted && isInCompare}
              onChange={(e) => {
                e.stopPropagation();
                toggleProduct({
                  id: productId,
                  productId,
                  variantId: id,
                  title,
                  handle,
                  thumbnail,
                  price,
                });
              }}
              className="w-4 h-4 md:w-5 md:h-5 rounded border-gray-300 text-black focus:ring-black focus:ring-offset-0"
            />
            <span className="text-xs md:text-sm text-gray-700 font-medium">Харьцуулах</span>
          </label>
        </div>
      </div>
    </div>
  );
}
