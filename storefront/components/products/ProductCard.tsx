"use client";

import Link from "next/link";
import { CloudinaryImage } from "@/components/Cloudinary";
import { ShoppingCart, Loader2, ArrowLeftRight } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useCartStore, useUIStore } from "@/lib/store";
import { useComparisonStore } from "@/lib/store/comparison-store";
import { addToCart } from "@/lib/cart/addToCart";
import { isTradeInEligibleAppleProductText, TRADE_IN_BADGE_TEXT, TRADE_IN_BADGE_TITLE } from "@/lib/tradein";
import { toast } from "@/lib/toast";

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
  allowBackorder
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
      
      await addToCart({
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
    } catch (error) {
      console.error('Failed to add item to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Link 
      href={`/products/${handle}`}
      className="group block bg-white border border-gray-200 rounded-lg overflow-hidden transition-shadow duration-200"
    >
      {/* Image Section */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        {thumbnail ? (
          <div className="absolute inset-0 flex items-center justify-center p-4">
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
            <span className="text-gray-400 text-sm">Зураггүй</span>
          </div>
        )}

        {/* Collection Badge */}
        {collection && (
          <div className="absolute top-2 left-2">
            <span className="bg-blue-600 text-white px-2 py-1 text-[9px] md:text-[10px] font-semibold rounded">
              {collection.title}
            </span>
          </div>
        )}

        {/* Out of stock badge */}
        {!isInStock && (
          <div className="absolute top-2 right-2 bg-gray-800/80 text-white px-2 py-1 rounded font-semibold text-xs md:text-sm">
            Дууссан
          </div>
        )}

        {/* Discount Badge */}
        {isOnSale && discountPercentage > 0 && isInStock && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded font-bold text-xs md:text-sm">
            {discountPercentage}% хямдрал
          </div>
        )}

        {/* Trade-in Badge (Apple only) */}
        {isTradeInEligible && (
          <div className="absolute bottom-2 left-2">
            <span
              title={TRADE_IN_BADGE_TITLE}
              className="bg-white/90 backdrop-blur-sm text-gray-900 px-2 py-1 rounded font-semibold text-[10px] md:text-xs border border-gray-200 shadow-sm"
            >
              {TRADE_IN_BADGE_TEXT}
            </span>
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
                {formatPrice(price.amount)}
              </span>
            )}
            {isOnSale && originalPrice && (
              <span className="text-xs md:text-sm text-gray-500 line-through">
                {formatPrice(originalPrice.amount)}
              </span>
            )}
          </div>
          {isOnSale && discountPercentage > 0 && (
            <span className="text-xs text-green-600 font-medium">
              {discountPercentage}% хямдарлаа
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={isAdding || !isInStock}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 md:py-2.5 px-3 md:px-4 rounded-lg font-medium text-xs md:text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isAdding ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Нэмж байна...
              </>
            ) : !isInStock ? (
              "Дууссан"
            ) : (
              <>
                <ShoppingCart className="h-4 w-4" />
                Сагслах
              </>
            )}
          </button>

          {/* Compare Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
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
            className={`px-3 md:px-4 py-2 md:py-2.5 rounded-lg font-medium text-xs md:text-sm transition-colors border flex items-center justify-center gap-1.5 ${
              mounted && isInCompare 
                ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700" 
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
            title={mounted && isInCompare ? "Харьцуулалтаас хасах" : "Харьцуулалтад нэмэх"}
          >
            <ArrowLeftRight className="h-4 w-4" />
            <span className="hidden sm:inline">Харьцуулах</span>
          </button>
        </div>
      </div>
    </Link>
  );
}
