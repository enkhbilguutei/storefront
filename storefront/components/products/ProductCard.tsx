"use client";

import Link from "next/link";
import { CloudinaryImage } from "@/components/Cloudinary";
import { ShoppingCart, Loader2, Eye } from "lucide-react";
import { useState, useMemo } from "react";
import { medusa } from "@/lib/medusa";
import { useCartStore, useUIStore } from "@/lib/store";

interface ProductOption {
  id: string;
  title: string;
  values: string[];
}

interface ProductVariant {
  id: string;
  title: string;
  options: {
    option_id: string;
    value: string;
  }[];
}

interface ProductCardProps {
  id: string;
  title: string;
  handle: string;
  thumbnail?: string;
  price?: {
    amount: number;
    currencyCode: string;
  };
  options?: ProductOption[];
  variants?: ProductVariant[];
}

const colorMap: Record<string, string> = {
  "black": "#000000",
  "white": "#ffffff",
  "red": "#ef4444",
  "blue": "#3b82f6",
  "green": "#22c55e",
  "yellow": "#eab308",
  "gray": "#6b7280",
  "grey": "#6b7280",
  "silver": "#e5e7eb",
  "gold": "#fbbf24",
  "space gray": "#4b5563",
  "midnight": "#1e3a8a",
  "starlight": "#f3f4f6",
  "pink": "#f472b6",
  "purple": "#a855f7",
  "orange": "#f97316",
};

export function ProductCard({ id, title, handle, thumbnail, price, options, variants }: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { cartId, setCartId, addItem, syncCart } = useCartStore();
  const { openCartNotification } = useUIStore();

  const formatPrice = (amount: number, currencyCode: string) => {
    // Use consistent formatting to avoid hydration mismatch
    const formatted = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
    
    // Use consistent currency symbol
    const symbol = currencyCode.toUpperCase() === "MNT" ? "₮" : currencyCode;
    return `${symbol} ${formatted}`;
  };

  // Extract colors from options
  const colorOptions = useMemo(() => {
    if (!options || !variants) return [];
    
    const colorOption = options.find(opt => 
      opt.title.toLowerCase() === "color" || 
      opt.title.toLowerCase() === "colour" ||
      opt.title.toLowerCase() === "өнгө"
    );

    if (!colorOption) return [];

    // Get unique values
    const uniqueColors = new Set<string>();
    variants.forEach(variant => {
      const optionValue = variant.options?.find(opt => opt.option_id === colorOption.id)?.value;
      if (optionValue) uniqueColors.add(optionValue);
    });

    return Array.from(uniqueColors);
  }, [options, variants]);

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!variants || variants.length === 0) return;

    setIsAdding(true);
    try {
      let currentCartId = cartId;

      if (!currentCartId) {
        const { cart } = await medusa.store.cart.create({});
        currentCartId = cart.id;
        setCartId(cart.id);
      }

      const variantId = variants[0].id;

      addItem({
        id: "temp-" + Date.now(),
        variantId: variantId,
        productId: id,
        title: title,
        quantity: 1,
        thumbnail: thumbnail,
        unitPrice: price?.amount || 0,
        handle: handle
      });
      
      openCartNotification();
      setIsAdding(false);

      await medusa.store.cart.createLineItem(currentCartId!, {
        variant_id: variantId,
        quantity: 1,
      });

      await syncCart();
    } catch (error) {
      console.error("Failed to add to cart:", error);
      setIsAdding(false);
    }
  };

  return (
    <Link 
      href={`/products/${handle}`} 
      className="group block bg-white rounded-2xl transition-all duration-300 hover:shadow-2xl hover:shadow-black/5 hover:-translate-y-1 relative overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-4/5 overflow-hidden bg-linear-to-br from-[#f5f5f7] to-[#e8e8ed]">
        {thumbnail ? (
          <CloudinaryImage
            src={thumbnail}
            alt={title}
            width={400}
            height={500}
            className={`h-full w-full object-contain p-6 transition-all duration-700 ${
              isHovered ? "scale-110" : "scale-100"
            }`}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-[#86868b]">
            <span className="text-sm">No Image</span>
          </div>
        )}

        {/* Overlay on hover */}
        <div className={`absolute inset-0 bg-black/5 transition-opacity duration-300 ${
          isHovered ? "opacity-100" : "opacity-0"
        }`} />

        {/* Action Buttons - Visible on Hover */}
        <div className={`absolute bottom-4 left-4 right-4 flex gap-2 transition-all duration-300 ${
          isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}>
          <button
            onClick={handleQuickAdd}
            disabled={isAdding}
            className="flex-1 h-11 bg-[#1d1d1f] text-white rounded-full flex items-center justify-center gap-2 text-sm font-medium hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all active:scale-95"
          >
            {isAdding ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span>Нэмэх</span>
              </>
            )}
          </button>
          <div
            className="w-11 h-11 bg-white text-[#1d1d1f] rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 transition-all"
          >
            <Eye className="w-4 h-4" />
          </div>
        </div>
      </div>
      
      {/* Product Info */}
      <div className="p-4 space-y-3">
        {/* Color Swatches */}
        {colorOptions.length > 0 && (
          <div className="flex items-center gap-1.5">
            {colorOptions.slice(0, 5).map((color, index) => {
              const bg = colorMap[color.toLowerCase()] || color;
              const isWhite = bg.toLowerCase() === "#ffffff" || bg.toLowerCase() === "#f3f4f6";
              return (
                <div
                  key={index}
                  className={`w-4 h-4 rounded-full transition-transform hover:scale-125 ${
                    isWhite ? "border border-gray-200" : ""
                  }`}
                  style={{ 
                    backgroundColor: bg,
                    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1)"
                  }}
                  title={color}
                />
              );
            })}
            {colorOptions.length > 5 && (
              <span className="text-[11px] text-[#86868b] ml-1">+{colorOptions.length - 5}</span>
            )}
          </div>
        )}

        {/* Title */}
        <h3 className="text-[15px] font-medium text-[#1d1d1f] leading-snug group-hover:text-[#0066cc] transition-colors line-clamp-2 min-h-[2.5em]">
          {title}
        </h3>
        
        {/* Price */}
        {price ? (
          <p className="text-[15px] font-semibold text-[#1d1d1f]">
            {formatPrice(price.amount, price.currencyCode)}
          </p>
        ) : (
          <p className="text-[14px] text-[#86868b]">
            Үнэ тодорхойгүй
          </p>
        )}
      </div>
    </Link>
  );
}
