"use client";

import { useState, useMemo } from "react";
import { medusa } from "@/lib/medusa";
import { useCartStore, useUIStore } from "@/lib/store";
import { CloudinaryImage } from "@/components/Cloudinary";
import Link from "next/link";
import { 
  ChevronRight, 
  ShoppingBag, 
  Truck, 
  RotateCcw, 
  Shield, 
  Check,
  Minus,
  Plus,
  Heart,
  Share2,
  Star,
  ChevronLeft
} from "lucide-react";

interface ProductVariant {
  id: string;
  title: string;
  prices: {
    amount: number;
    currency_code: string;
  }[];
  options?: {
    id: string;
    option_id: string;
    value: string;
  }[];
}

interface ProductOption {
  id: string;
  title: string;
  values: {
    id: string;
    value: string;
  }[];
}

interface ProductImage {
  id: string;
  url: string;
}

interface Product {
  id: string;
  title: string;
  handle: string;
  description: string;
  thumbnail: string;
  images: ProductImage[];
  variants: ProductVariant[];
  options: ProductOption[];
}

interface ProductDetailsProps {
  product: Product;
}

// Color mapping for visual swatches
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

export function ProductDetails({ product }: ProductDetailsProps) {
  const { cartId, setCartId, addItem, syncCart } = useCartStore();
  const { openCartNotification } = useUIStore();
  
  // Track selected option values
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    // Initialize with the first variant's options
    const initial: Record<string, string> = {};
    if (product.variants?.[0]?.options) {
      product.variants[0].options.forEach((opt) => {
        initial[opt.option_id] = opt.value;
      });
    }
    return initial;
  });
  
  // Find the variant that matches selected options
  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) return null;
    if (product.variants.length === 1) return product.variants[0];
    
    return product.variants.find((variant) => {
      if (!variant.options) return false;
      return variant.options.every(
        (opt) => selectedOptions[opt.option_id] === opt.value
      );
    }) || product.variants[0];
  }, [product.variants, selectedOptions]);
  
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  // Get all images including thumbnail
  const allImages = useMemo(() => {
    const images: { id: string; url: string }[] = [];
    if (product.thumbnail) {
      images.push({ id: "thumbnail", url: product.thumbnail });
    }
    if (product.images) {
      product.images.forEach((img) => {
        if (img.url !== product.thumbnail) {
          images.push(img);
        }
      });
    }
    return images;
  }, [product.images, product.thumbnail]);

  // Format price
  const price = useMemo(() => {
    if (!selectedVariant?.prices?.[0]) return null;
    
    return new Intl.NumberFormat("mn-MN", {
      style: "currency",
      currency: selectedVariant.prices[0].currency_code,
    }).format(selectedVariant.prices[0].amount);
  }, [selectedVariant]);

  // Handle option selection
  const handleOptionSelect = (optionId: string, value: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionId]: value,
    }));
  };

  // Check if an option value is a color
  const isColorOption = (optionTitle: string) => {
    const colorKeywords = ["color", "colour", "өнгө"];
    return colorKeywords.some((kw) => optionTitle.toLowerCase().includes(kw));
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    
    setIsAdding(true);
    
    // Immediately show notification with optimistic data
    const optimisticItem = {
      id: "temp-" + Date.now(),
      variantId: selectedVariant.id,
      productId: product.id,
      title: product.title,
      quantity: quantity,
      thumbnail: product.thumbnail,
      unitPrice: selectedVariant.prices?.[0]?.amount || 0,
      handle: product.handle
    };
    
    addItem(optimisticItem);
    openCartNotification();
    setIsAdding(false);
    
    // Do API calls in background
    (async () => {
      try {
        let currentCartId = cartId;

        // Create cart if it doesn't exist
        if (!currentCartId) {
          // First get a region
          const { regions } = await medusa.store.region.list();
          if (!regions || regions.length === 0) {
            console.error("No regions available");
            return;
          }
          
          const { cart } = await medusa.store.cart.create({
            region_id: regions[0].id
          });
          currentCartId = cart.id;
          setCartId(cart.id);
        }

        if (!currentCartId) return;

        // Add item to Medusa cart
        await medusa.store.cart.createLineItem(currentCartId, {
          variant_id: selectedVariant.id,
          quantity: quantity,
        });

        // Sync cart state from server in background
        syncCart();
        
      } catch (error) {
        console.error("Error adding to cart:", error);
      }
    })();
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-sm text-[#86868b] mb-8 md:mb-12">
        <Link href="/" className="hover:text-[#1d1d1f] transition-colors">Нүүр</Link>
        <ChevronRight className="w-4 h-4 mx-2 text-gray-300" />
        <Link href="/products" className="hover:text-[#1d1d1f] transition-colors">Бүтээгдэхүүн</Link>
        <ChevronRight className="w-4 h-4 mx-2 text-gray-300" />
        <span className="text-[#1d1d1f] font-medium truncate max-w-[200px]">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 xl:gap-24">
        {/* Image Gallery - Sticky on Desktop */}
        <div className="space-y-4 lg:sticky lg:top-24 h-fit">
          {/* Main Image */}
          <div className="aspect-square relative bg-linear-to-br from-[#f5f5f7] to-[#e8e8ed] rounded-3xl overflow-hidden group">
            <CloudinaryImage
              src={allImages[selectedImageIndex]?.url || product.thumbnail}
              alt={product.title}
              width={1000}
              height={1000}
              className="w-full h-full object-contain p-6 md:p-10 transition-transform duration-700 group-hover:scale-105"
              priority
            />
            
            {/* Image Navigation Arrows */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110"
                  aria-label="Өмнөх зураг"
                >
                  <ChevronLeft className="w-5 h-5 text-[#1d1d1f]" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110"
                  aria-label="Дараагийн зураг"
                >
                  <ChevronRight className="w-5 h-5 text-[#1d1d1f]" />
                </button>
              </>
            )}

            {/* Image Counter */}
            {allImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full">
                {selectedImageIndex + 1} / {allImages.length}
              </div>
            )}
          </div>
          
          {/* Thumbnail Grid */}
          {allImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              {allImages.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`shrink-0 w-20 h-20 relative bg-[#f5f5f7] rounded-xl overflow-hidden transition-all duration-200 ${
                    selectedImageIndex === index 
                      ? "ring-2 ring-[#0071e3] ring-offset-2" 
                      : "hover:ring-2 hover:ring-gray-300 hover:ring-offset-1"
                  }`}
                >
                  <CloudinaryImage
                    src={image.url}
                    alt={product.title}
                    width={160}
                    height={160}
                    className="w-full h-full object-contain p-2"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          {/* Header */}
          <div className="mb-6">
            {/* Rating placeholder */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-sm text-[#86868b]">(128 үнэлгээ)</span>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-[42px] font-semibold text-[#1d1d1f] mb-4 tracking-tight leading-tight">
              {product.title}
            </h1>
            
            {price && (
              <div className="flex items-baseline gap-3">
                <p className="text-2xl md:text-3xl text-[#1d1d1f] font-semibold">{price}</p>
                {/* Optional: Show original price if on sale */}
                {/* <p className="text-lg text-[#86868b] line-through">₮1,500,000</p> */}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-linear-to-r from-gray-200 via-gray-100 to-transparent mb-6" />

          {/* Options Selector */}
          {product.options && product.options.length > 0 && (
            <div className="space-y-6 mb-8">
              {product.options.map((option) => (
                <div key={option.id}>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-[#1d1d1f]">
                      {option.title}
                    </label>
                    {selectedOptions[option.id] && (
                      <span className="text-sm text-[#86868b]">
                        {selectedOptions[option.id]}
                      </span>
                    )}
                  </div>
                  
                  {isColorOption(option.title) ? (
                    // Color swatches
                    <div className="flex flex-wrap gap-3">
                      {option.values.map((value) => {
                        const colorCode = colorMap[value.value.toLowerCase()] || "#ccc";
                        const isSelected = selectedOptions[option.id] === value.value;
                        const isWhite = colorCode.toLowerCase() === "#ffffff" || colorCode.toLowerCase() === "#f3f4f6";
                        
                        return (
                          <button
                            key={value.id}
                            onClick={() => handleOptionSelect(option.id, value.value)}
                            className={`w-10 h-10 rounded-full transition-all duration-200 relative ${
                              isSelected 
                                ? "ring-2 ring-offset-2 ring-[#0071e3]" 
                                : "hover:scale-110"
                            } ${isWhite ? "border border-gray-200" : ""}`}
                            style={{ backgroundColor: colorCode }}
                            title={value.value}
                          >
                            {isSelected && (
                              <Check className={`w-4 h-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${
                                isWhite ? "text-[#1d1d1f]" : "text-white"
                              }`} />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    // Regular option buttons
                    <div className="flex flex-wrap gap-2">
                      {option.values.map((value) => (
                        <button
                          key={value.id}
                          onClick={() => handleOptionSelect(option.id, value.value)}
                          className={`py-2.5 px-5 rounded-full text-sm font-medium transition-all duration-200 ${
                            selectedOptions[option.id] === value.value
                              ? "bg-[#1d1d1f] text-white shadow-md"
                              : "bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e8e8ed]"
                          }`}
                        >
                          {value.value}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Quantity Selector */}
          <div className="mb-8">
            <label className="text-sm font-medium text-[#1d1d1f] mb-3 block">
              Тоо ширхэг
            </label>
            <div className="inline-flex items-center bg-[#f5f5f7] rounded-full">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="w-12 h-12 flex items-center justify-center text-[#1d1d1f] hover:bg-gray-200 rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center font-medium text-[#1d1d1f]">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-12 h-12 flex items-center justify-center text-[#1d1d1f] hover:bg-gray-200 rounded-full transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4 mb-8">
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={isAdding || !selectedVariant}
                className="flex-1 bg-[#0071e3] text-white rounded-full py-4 px-8 text-[17px] font-medium hover:bg-[#0077ed] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-blue-500/25"
              >
                {isAdding ? (
                  <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5 mr-2" />
                    Сагсанд нэмэх
                  </>
                )}
              </button>
              
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 ${
                  isWishlisted 
                    ? "bg-red-50 text-red-500" 
                    : "bg-[#f5f5f7] text-[#86868b] hover:text-red-500 hover:bg-red-50"
                }`}
                title="Хадгалах"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`} />
              </button>
              
              <button
                className="w-14 h-14 bg-[#f5f5f7] text-[#86868b] rounded-full flex items-center justify-center hover:bg-[#e8e8ed] hover:text-[#1d1d1f] transition-all duration-200"
                title="Хуваалцах"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="flex items-center gap-3 bg-[#f5f5f7] p-4 rounded-2xl">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                <Truck className="w-5 h-5 text-[#0071e3]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#1d1d1f]">Үнэгүй хүргэлт</p>
                <p className="text-xs text-[#86868b]">2-3 хоногт</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-[#f5f5f7] p-4 rounded-2xl">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                <RotateCcw className="w-5 h-5 text-[#0071e3]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#1d1d1f]">Буцаалт</p>
                <p className="text-xs text-[#86868b]">14 хоногийн дотор</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-[#f5f5f7] p-4 rounded-2xl">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                <Shield className="w-5 h-5 text-[#0071e3]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#1d1d1f]">Баталгаат</p>
                <p className="text-xs text-[#86868b]">1 жилийн баталгаа</p>
              </div>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="border-t border-gray-100 pt-8">
              <h3 className="text-lg font-semibold text-[#1d1d1f] mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-[#0071e3] rounded-full" />
                Бүтээгдэхүүний тайлбар
              </h3>
              <div className="prose prose-gray max-w-none">
                <p className="text-[#424245] leading-relaxed text-[15px]">
                  {product.description}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}