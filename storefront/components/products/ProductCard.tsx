"use client";

import Link from "next/link";
import { CloudinaryImage } from "@/components/Cloudinary";
import { ShoppingCart, Loader2, X, Check } from "lucide-react";
import { useState, useMemo, useEffect, useRef } from "react";
import { medusa } from "@/lib/medusa";
import { useCartStore, useUIStore } from "@/lib/store";

interface ProductOptionValue {
  id: string;
  value: string;
  option_id: string;
}

interface ProductOption {
  id: string;
  title: string;
  values?: ProductOptionValue[] | string[];
}

interface ProductVariant {
  id: string;
  title: string;
  options?: {
    option_id: string;
    value: string;
  }[];
  inventory_quantity?: number;
  manage_inventory?: boolean;
  allow_backorder?: boolean;
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
  "cosmic orange": "#f97316",
  "mist blue": "#87ceeb",
  "natural titanium": "#c0b0a0",
  "desert titanium": "#d4c4b0",
  "white titanium": "#f5f5f5",
  "black titanium": "#2d2d2d",
};

export function ProductCard({ id, title, handle, thumbnail, price, options, variants }: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const modalRef = useRef<HTMLDivElement>(null);
  const { cartId, setCartId, addItem, syncCart } = useCartStore();
  const { openCartNotification } = useUIStore();

  const formatPrice = (amount: number, currencyCode: string) => {
    const formatted = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
    
    const symbol = currencyCode.toUpperCase() === "MNT" ? "₮" : currencyCode;
    return `${symbol} ${formatted}`;
  };

  // Parse options with their values
  const parsedOptions = useMemo(() => {
    if (!options) return [];
    
    return options.map(opt => {
      let values: string[] = [];
      
      if (opt.values && opt.values.length > 0) {
        const firstValue = opt.values[0];
        if (typeof firstValue === 'object' && 'value' in firstValue) {
          values = (opt.values as ProductOptionValue[]).map(v => v.value);
        } else {
          values = opt.values as string[];
        }
      } else if (variants) {
        const uniqueValues = new Set<string>();
        variants.forEach(variant => {
          const optionValue = variant.options?.find(o => o.option_id === opt.id)?.value;
          if (optionValue) uniqueValues.add(optionValue);
        });
        values = Array.from(uniqueValues);
      }
      
      return {
        id: opt.id,
        title: opt.title,
        values
      };
    }).filter(opt => opt.values.length > 0);
  }, [options, variants]);

  // Check if product has multiple variants that need selection
  const needsVariantSelection = useMemo(() => {
    return variants && variants.length > 1 && parsedOptions.length > 0;
  }, [variants, parsedOptions]);

  // Extract colors from options for display
  const colorOptions = useMemo(() => {
    const colorTitles = ["color", "colour", "өнгө"];
    const colorOption = parsedOptions.find(opt => 
      colorTitles.includes(opt.title.toLowerCase())
    );
    return colorOption?.values || [];
  }, [parsedOptions]);

  // Find matching variant based on selected options
  const findMatchingVariant = (selections: Record<string, string>) => {
    if (!variants || !options) return null;
    
    return variants.find(variant => {
      return options.every(opt => {
        const selectedValue = selections[opt.id];
        if (!selectedValue) return false;
        
        const variantOptionValue = variant.options?.find(o => o.option_id === opt.id)?.value;
        return variantOptionValue === selectedValue;
      });
    });
  };

  // Check if all options are selected
  const allOptionsSelected = useMemo(() => {
    return parsedOptions.every(opt => selectedOptions[opt.id]);
  }, [parsedOptions, selectedOptions]);

  // Get selected variant
  const selectedVariant = useMemo(() => {
    if (!allOptionsSelected) return null;
    return findMatchingVariant(selectedOptions);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allOptionsSelected, selectedOptions]);

  // Check if a variant is in stock
  const isVariantInStock = (variant: ProductVariant | null | undefined): boolean => {
    if (!variant) return false;
    
    // If inventory is not managed, assume it's in stock
    if (variant.manage_inventory === false) return true;
    
    // If backorders are allowed, it's always "in stock"
    if (variant.allow_backorder) return true;
    
    // Check actual inventory quantity
    const qty = variant.inventory_quantity ?? 0;
    return qty > 0;
  };

  // Check if the first variant is in stock (for single variant products)
  const isFirstVariantInStock = useMemo(() => {
    if (!variants || variants.length === 0) return false;
    return isVariantInStock(variants[0]);
  }, [variants]);

  // Check if selected variant is in stock
  const isSelectedVariantInStock = useMemo(() => {
    return isVariantInStock(selectedVariant);
  }, [selectedVariant]);

  // Handle click outside modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowVariantModal(false);
      }
    };

    if (showVariantModal) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showVariantModal]);

  // Reset selections when modal opens
  useEffect(() => {
    if (showVariantModal) {
      setSelectedOptions({});
    }
  }, [showVariantModal]);

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!variants || variants.length === 0) return;

    // If product has multiple variants, show selection modal
    if (needsVariantSelection) {
      setShowVariantModal(true);
      return;
    }

    // Single variant - check stock before adding
    if (!isFirstVariantInStock) {
      return; // Don't add if out of stock
    }

    // Single variant - add directly
    await addVariantToCart(variants[0]);
  };

  const handleAddSelectedVariant = async () => {
    if (!selectedVariant) return;
    await addVariantToCart(selectedVariant);
    setShowVariantModal(false);
  };

  const addVariantToCart = async (variant: ProductVariant) => {
    setIsAdding(true);
    try {
      let currentCartId = cartId;

      if (!currentCartId) {
        const { cart } = await medusa.store.cart.create({});
        currentCartId = cart.id;
        setCartId(cart.id);
      }

      const variantId = variant.id;

      addItem({
        id: "temp-" + Date.now(),
        variantId: variantId,
        productId: id,
        title: title,
        variantTitle: variant.title,
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

  const handleOptionSelect = (optionId: string, value: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionId]: value
    }));
  };

  const isColorOption = (optionTitle: string) => {
    const colorTitles = ["color", "colour", "өнгө"];
    return colorTitles.includes(optionTitle.toLowerCase());
  };

  return (
    <>
      <div className="group block bg-white rounded-2xl md:rounded-3xl transition-all duration-300 hover:shadow-lg hover:shadow-black/5 relative overflow-hidden">
        <Link 
          href={`/products/${handle}`} 
          className="block"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Image Container - Clean white background */}
          <div className="relative aspect-square overflow-hidden bg-[#f5f5f7] rounded-t-2xl md:rounded-t-3xl">
            {thumbnail ? (
              <CloudinaryImage
                src={thumbnail}
                alt={title}
                width={400}
                height={400}
                className={`h-full w-full object-contain p-4 md:p-8 transition-transform duration-500 ${
                  isHovered ? "scale-105" : "scale-100"
                }`}
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-[#86868b]">
                <span className="text-sm">Зураг байхгүй</span>
              </div>
            )}
          </div>
          
          {/* Product Info */}
          <div className="p-3 md:p-5 space-y-2 md:space-y-3">
            {/* Color Swatches */}
            {colorOptions.length > 0 && (
              <div className="flex items-center gap-1">
                {colorOptions.slice(0, 4).map((color, index) => {
                  const bg = colorMap[color.toLowerCase()] || color;
                  const isWhite = bg.toLowerCase() === "#ffffff" || bg.toLowerCase() === "#f3f4f6" || bg.toLowerCase() === "#f5f5f5";
                  return (
                    <div
                      key={index}
                      className={`w-3 h-3 rounded-full transition-transform hover:scale-125 ${
                        isWhite ? "border border-gray-200" : ""
                      }`}
                      style={{ 
                        backgroundColor: bg,
                        boxShadow: "inset 0 1px 2px rgba(0,0,0,0.08)"
                      }}
                      title={color}
                    />
                  );
                })}
                {colorOptions.length > 4 && (
                  <span className="text-[10px] text-[#86868b] ml-0.5">+{colorOptions.length - 4}</span>
                )}
              </div>
            )}

            {/* Title */}
            <h3 className="text-[14px] md:text-[16px] font-medium text-[#1d1d1f] leading-snug group-hover:text-[#0066cc] transition-colors line-clamp-2 min-h-[2.5em]">
              {title}
            </h3>
            
            {/* Price */}
            {price ? (
              <p className="text-[15px] md:text-[17px] font-semibold text-[#1d1d1f]">
                {formatPrice(price.amount, price.currencyCode)}
              </p>
            ) : (
              <p className="text-[14px] text-[#86868b]">
                Үнэ тодорхойгүй
              </p>
            )}
          </div>
        </Link>

        {/* Add to Cart Button - Always Visible */}
        <div className="px-3 pb-3 md:px-5 md:pb-5">
          {!needsVariantSelection && !isFirstVariantInStock ? (
            <button
              disabled
              className="w-full h-10 md:h-11 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center gap-2 text-[13px] md:text-sm font-medium cursor-not-allowed"
            >
              <span>Дууссан</span>
            </button>
          ) : (
            <button
              onClick={handleQuickAdd}
              disabled={isAdding}
              className="w-full h-10 md:h-11 bg-[#1d1d1f] text-white rounded-full flex items-center justify-center gap-1.5 md:gap-2 text-[13px] md:text-sm font-medium hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
            >
              {isAdding ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 md:w-[18px] md:h-[18px]" strokeWidth={2.5} />
                  <span className="hidden sm:inline">Сагсанд нэмэх</span>
                  <span className="sm:hidden">Нэмэх</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Variant Selection Modal */}
      {showVariantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div 
            ref={modalRef}
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Modal Header */}
            <div className="relative p-6 border-b border-gray-100">
              <button
                onClick={() => setShowVariantModal(false)}
                className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
              <h2 className="text-xl font-semibold text-[#1d1d1f] pr-8">
                Хувилбар сонгох
              </h2>
              <p className="text-sm text-[#86868b] mt-1 line-clamp-1">{title}</p>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              {/* Product Preview */}
              <div className="flex items-center gap-4 p-4 bg-[#f5f5f7] rounded-2xl">
                {thumbnail && (
                  <div className="w-20 h-20 bg-white rounded-xl overflow-hidden shrink-0">
                    <CloudinaryImage
                      src={thumbnail}
                      alt={title}
                      width={80}
                      height={80}
                      className="w-full h-full object-contain p-2"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1d1d1f] line-clamp-2">{title}</p>
                  {price && (
                    <p className="text-sm font-semibold text-[#1d1d1f] mt-1">
                      {formatPrice(price.amount, price.currencyCode)}
                    </p>
                  )}
                </div>
              </div>

              {/* Option Selectors */}
              {parsedOptions.map((option) => (
                <div key={option.id} className="space-y-3">
                  <label className="text-sm font-medium text-[#1d1d1f]">
                    {option.title}
                    {selectedOptions[option.id] && (
                      <span className="ml-2 text-[#86868b] font-normal">
                        - {selectedOptions[option.id]}
                      </span>
                    )}
                  </label>
                  
                  {isColorOption(option.title) ? (
                    // Color swatches
                    <div className="flex flex-wrap gap-2">
                      {option.values.map((value) => {
                        const bg = colorMap[value.toLowerCase()] || value;
                        const isWhite = bg.toLowerCase() === "#ffffff" || bg.toLowerCase() === "#f3f4f6" || bg.toLowerCase() === "#f5f5f5";
                        const isSelected = selectedOptions[option.id] === value;
                        
                        return (
                          <button
                            key={value}
                            onClick={() => handleOptionSelect(option.id, value)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                              isSelected 
                                ? "ring-2 ring-offset-2 ring-[#0071e3]" 
                                : "hover:scale-110"
                            } ${isWhite ? "border border-gray-200" : ""}`}
                            style={{ backgroundColor: bg }}
                            title={value}
                          >
                            {isSelected && (
                              <Check className={`w-5 h-5 ${
                                isWhite || bg === "#fbbf24" || bg === "#eab308" 
                                  ? "text-gray-800" 
                                  : "text-white"
                              }`} />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    // Text buttons for other options
                    <div className="flex flex-wrap gap-2">
                      {option.values.map((value) => {
                        const isSelected = selectedOptions[option.id] === value;
                        
                        return (
                          <button
                            key={value}
                            onClick={() => handleOptionSelect(option.id, value)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                              isSelected
                                ? "bg-[#1d1d1f] text-white"
                                : "bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e8e8ed]"
                            }`}
                          >
                            {value}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}

              {/* Selected Variant Display */}
              {selectedVariant && (
                <div className={`p-3 rounded-xl border ${
                  isSelectedVariantInStock 
                    ? "bg-green-50 border-green-200" 
                    : "bg-red-50 border-red-200"
                }`}>
                  <p className={`text-sm font-medium flex items-center gap-2 ${
                    isSelectedVariantInStock ? "text-green-800" : "text-red-700"
                  }`}>
                    {isSelectedVariantInStock ? (
                      <>
                        <Check className="w-4 h-4" />
                        Сонгосон: {selectedVariant.title}
                      </>
                    ) : (
                      <>
                        <X className="w-4 h-4" />
                        {selectedVariant.title} - Дууссан
                      </>
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-100">
              <button
                onClick={handleAddSelectedVariant}
                disabled={!selectedVariant || isAdding || !isSelectedVariantInStock}
                className={`w-full h-12 rounded-full flex items-center justify-center gap-2 text-[15px] font-medium transition-all active:scale-[0.98] ${
                  selectedVariant && !isSelectedVariantInStock
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-[#0071e3] text-white hover:bg-[#0077ed] disabled:opacity-50 disabled:cursor-not-allowed"
                }`}
              >
                {isAdding ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : selectedVariant && !isSelectedVariantInStock ? (
                  <span>Дууссан</span>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" strokeWidth={2.5} />
                    <span>Сагсанд нэмэх</span>
                  </>
                )}
              </button>
              
              <Link
                href={`/products/${handle}`}
                className="block mt-3 text-center text-[15px] text-[#0071e3] font-medium hover:underline"
                onClick={() => setShowVariantModal(false)}
              >
                Дэлгэрэнгүй үзэх
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
