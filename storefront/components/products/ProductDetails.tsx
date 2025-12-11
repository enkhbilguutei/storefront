"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useCartStore, useUIStore, useUserStore } from "@/lib/store";
import { useWishlistStore } from "@/lib/store/wishlist-store";
import { useComparisonStore } from "@/lib/store/comparison-store";
import { CloudinaryImage } from "@/components/Cloudinary";
import { toast } from "@/lib/toast";
import { addToCart as addToCartHelper } from "@/lib/cart/addToCart";
import Link from "next/link";
import { ViewingCounter } from "./ViewingCounter";
import { RecentSales } from "./RecentSales";
import { CustomerReviews } from "./CustomerReviews";
import { ReviewForm } from "./ReviewForm";
import { TrustBadges } from "./TrustBadges";
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
  title?: string | null;
  prices?: {
    amount: number;
    currency_code: string;
  }[];
  calculated_price?: {
    calculated_amount: number | null;
    original_amount: number | null;
    currency_code: string | null;
    is_calculated_price_price_list?: boolean;
    is_calculated_price_tax_inclusive?: boolean;
  };
  options?: {
    id: string;
    option_id?: string | null;
    value: string;
  }[] | null;
  thumbnail?: string | null;
  images?: ProductImage[] | null;
  inventory_quantity?: number | null;
  manage_inventory?: boolean | null;
  allow_backorder?: boolean | null;
}

interface ProductOption {
  id: string;
  title: string;
  values?: {
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
  description?: string | null;
  thumbnail?: string | null;
  images?: ProductImage[] | null;
  variants?: ProductVariant[] | null;
  options?: ProductOption[] | null;
}

interface ProductDetailsProps {
  product: Product;
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const { cartId, setCartId, addItem, syncCart } = useCartStore();
  const { openCartNotification, openWishlistNotification, openAuthModal } = useUIStore();
  const { isAuthenticated } = useUserStore();
  const { items: wishlistItems, addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();
  const { toggleProduct, isInComparison } = useComparisonStore();
  
  // Scroll to top when navigating to product page
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [product.id]);
  
  // Track selected option values
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    if (product.variants?.[0]?.options) {
      product.variants[0].options.forEach((opt) => {
        if (opt.option_id) {
          initial[opt.option_id] = opt.value;
        }
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
        (opt) => opt.option_id && selectedOptions[opt.option_id] === opt.value
      );
    }) || product.variants[0];
  }, [product.variants, selectedOptions]);
  
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  const isInCompare = isInComparison(selectedVariant?.id || "");
  
  // Check if current product/variant is in wishlist
  const isWishlisted = isInWishlist(product.id, selectedVariant?.id);

  // Check if an option is a color option by name only
  const isColorOption = useCallback((optionTitle: string) => {
    const colorKeywords = ["color", "colour", "өнгө", "өнг"];
    const lowerTitle = optionTitle.toLowerCase();
    return colorKeywords.some((kw) => lowerTitle.includes(kw));
  }, []);

  // Find the color option ID (only by name - not visual detection)
  const colorOptionId = useMemo(() => {
    const colorOption = product.options?.find((opt) => isColorOption(opt.title));
    return colorOption?.id || null;
  }, [product.options, isColorOption]);

  // Get the currently selected color value
  const selectedColor = colorOptionId ? selectedOptions[colorOptionId] : null;

  // Get all images - prioritize color-based images, then variant images, then product images
  const allImages = useMemo(() => {
    const images: { id: string; url: string }[] = [];
    const addedUrls = new Set<string>();
    
    const addImage = (id: string, url: string) => {
      if (url && !addedUrls.has(url)) {
        addedUrls.add(url);
        images.push({ id, url });
      }
    };
    
    // If there's a selected color, show images for that color
    if (colorOptionId && selectedColor) {
      const colorVariants = product.variants?.filter((v) =>
        v.options?.some((opt) => opt.option_id === colorOptionId && opt.value === selectedColor)
      ) || [];
      
      colorVariants.forEach((variant) => {
        variant.images?.forEach((img, idx) => {
          addImage(`color-variant-img-${variant.id}-${idx}`, img.url);
        });
        if (variant.thumbnail) {
          addImage(`color-variant-thumb-${variant.id}`, variant.thumbnail);
        }
      });
      
      if (images.length > 0) return images;
    }
    
    // Fallback to selected variant's images
    if (selectedVariant?.images && selectedVariant.images.length > 0) {
      selectedVariant.images.forEach((img, idx) => {
        addImage(`variant-img-${selectedVariant.id}-${idx}`, img.url);
      });
    }
    if (selectedVariant?.thumbnail) {
      addImage(`variant-thumb-${selectedVariant.id}`, selectedVariant.thumbnail);
    }
    if (images.length > 0) return images;
    
    // Fallback to product images
    product.images?.forEach((img) => addImage(img.id, img.url));
    
    // Last fallback to product thumbnail
    if (images.length === 0 && product.thumbnail) {
      addImage("thumbnail", product.thumbnail);
    }
    
    return images;
  }, [product.images, product.thumbnail, product.variants, selectedVariant, colorOptionId, selectedColor]);

  // Format price - use consistent formatting to avoid hydration mismatch
  const formatPrice = (amount: number, currencyCode: string) => {
    const formatted = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
    
    // Use consistent currency symbol
    const symbol = currencyCode.toUpperCase() === "MNT" ? "₮" : currencyCode;
    return `${symbol}${formatted}`;
  };

  // Get price info including sale prices from calculated_price
  const priceInfo = useMemo(() => {
    if (!selectedVariant) return null;
    
    const calculatedPrice = selectedVariant.calculated_price;
    const regularPrice = selectedVariant.prices?.[0];
    
    if (calculatedPrice && calculatedPrice.calculated_amount !== null && calculatedPrice.original_amount !== null && calculatedPrice.currency_code) {
      const isOnSale = calculatedPrice.calculated_amount < calculatedPrice.original_amount;
      return {
        currentPrice: formatPrice(calculatedPrice.calculated_amount, calculatedPrice.currency_code),
        originalPrice: isOnSale 
          ? formatPrice(calculatedPrice.original_amount, calculatedPrice.currency_code)
          : null,
        discountPercentage: isOnSale 
          ? Math.round(((calculatedPrice.original_amount - calculatedPrice.calculated_amount) / calculatedPrice.original_amount) * 100)
          : 0,
        isOnSale,
      };
    }
    
    if (regularPrice) {
      return {
        currentPrice: formatPrice(regularPrice.amount, regularPrice.currency_code),
        originalPrice: null,
        discountPercentage: 0,
        isOnSale: false,
      };
    }
    
    return null;
  }, [selectedVariant]);

  const price = priceInfo?.currentPrice ?? null;

  // Check if the selected variant is in stock
  const isInStock = useMemo(() => {
    if (!selectedVariant) return false;
    
    // If inventory is not managed, assume it's in stock
    if (selectedVariant.manage_inventory === false) return true;
    
    // If backorders are allowed, it's always "in stock"
    if (selectedVariant.allow_backorder) return true;
    
    // Check actual inventory quantity
    const qty = selectedVariant.inventory_quantity ?? 0;
    return qty > 0;
  }, [selectedVariant]);

  // Handle option selection - reset image index when variant changes
  const handleOptionSelect = (optionId: string, value: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionId]: value,
    }));
    setSelectedImageIndex(0);
  };

  // Get thumbnail URL for a color option value
  // This searches ALL variants with the given color and returns the first one with a thumbnail
  // This way you only need to upload the color image once (e.g., to "Cosmic Orange / 256GB")
  // and it will show for all storage options of that color
  const getThumbnailForColorValue = (optionId: string, colorValue: string) => {
    // Find any variant with this color that has a thumbnail
    const variantWithThumbnail = product.variants?.find((v) => {
      const hasColor = v.options?.some(
        (opt) => opt.option_id === optionId && opt.value === colorValue
      );
      return hasColor && v.thumbnail;
    });
    
    if (variantWithThumbnail?.thumbnail) {
      return variantWithThumbnail.thumbnail;
    }
    
    // Fallback to product thumbnail
    return product.thumbnail;
  };

  const handleAddToCart = async () => {
    if (!selectedVariant || isAdding) return;
    
    setIsAdding(true);
    
    try {
      await addToCartHelper({
        variantId: selectedVariant.id,
        quantity: quantity,
        productInfo: {
          id: product.id,
          title: product.title,
          thumbnail: product.thumbnail,
          handle: product.handle,
          unitPrice: selectedVariant.prices?.[0]?.amount || 0,
        },
        currentCartId: cartId,
        setCartId,
        syncCart,
        addItem,
        openCartNotification,
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Сагсанд нэмэхэд алдаа гарлаа. Дахин оролдоно уу.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (isTogglingWishlist || !selectedVariant) return;
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      openAuthModal("wishlist", "login");
      return;
    }
    
    setIsTogglingWishlist(true);
    try {
      if (isWishlisted) {
        // Find the wishlist item for this product/variant
        const item = wishlistItems.find(i => 
          i.product_id === product.id && 
          (!selectedVariant || i.variant_id === selectedVariant.id)
        );
        if (item) {
          await removeFromWishlist(item.id);
          openWishlistNotification("Хүслийн жагсаалтаас хассан");
        }
      } else {
        await addToWishlist(product.id, selectedVariant.id);
        openWishlistNotification("Хүслийн жагсаалтад нэмсэн");
      }
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
      openWishlistNotification("Алдаа гарлаа. Дахин оролдоно уу.");
    } finally {
      setIsTogglingWishlist(false);
    }
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
        <div className="space-y-4 lg:sticky lg:top-24 h-fit" key={`gallery-${selectedColor || 'default'}`}>
          {/* Main Image */}
          <div className="aspect-square relative bg-linear-to-br from-[#f5f5f7] to-[#e8e8ed] rounded-3xl overflow-hidden group flex items-center justify-center">
            <CloudinaryImage
              key={`main-${selectedColor || 'default'}-${selectedImageIndex}`}
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
                  key={`${image.id}-${index}`}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`shrink-0 w-20 h-20 relative bg-[#f5f5f7] rounded-xl overflow-hidden transition-all duration-200 flex items-center justify-center ${
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
            
            {priceInfo && (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <p className={`text-2xl md:text-3xl font-semibold ${priceInfo.isOnSale ? 'text-[#e53935]' : 'text-[#1d1d1f]'}`}>
                    {priceInfo.currentPrice}
                  </p>
                  {priceInfo.isOnSale && (
                    <span className="bg-[#e53935] text-white text-xs font-medium px-2 py-1 rounded">
                      -{priceInfo.discountPercentage}%
                    </span>
                  )}
                </div>
                {priceInfo.isOnSale && priceInfo.originalPrice && (
                  <p className="text-lg text-[#86868b] line-through">
                    {priceInfo.originalPrice}
                  </p>
                )}
              </div>
            )}

            {/* Stock Status */}
            {selectedVariant && (
              <div className="mt-3">
                {isInStock ? (
                  <span className="inline-flex items-center gap-1.5 text-sm text-green-600">
                    <span className="w-2 h-2 bg-green-500 rounded-full" />
                    Бэлэн байгаа
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-sm text-red-500">
                    <span className="w-2 h-2 bg-red-500 rounded-full" />
                    Дууссан
                  </span>
                )}
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
                    // Variant thumbnail selector - uses variant's own image
                    // Shows the color image from ANY variant with that color (not storage-specific)
                    <div className="flex flex-wrap gap-3">
                      {option.values?.map((value) => {
                        const isSelected = selectedOptions[option.id] === value.value;
                        const thumbnailUrl = getThumbnailForColorValue(option.id, value.value);
                        
                        return (
                          <button
                            key={value.id}
                            onClick={() => handleOptionSelect(option.id, value.value)}
                            className={`relative w-16 h-16 rounded-xl overflow-hidden transition-all duration-200 bg-[#f5f5f7] flex items-center justify-center ${
                              isSelected 
                                ? "ring-2 ring-offset-2 ring-[#0071e3]" 
                                : "hover:ring-2 hover:ring-gray-300 hover:ring-offset-1"
                            }`}
                            title={value.value}
                          >
                            <CloudinaryImage
                              src={thumbnailUrl}
                              alt={value.value}
                              width={128}
                              height={128}
                              className="w-full h-full object-contain p-1"
                            />
                            {isSelected && (
                              <div className="absolute inset-0 bg-[#0071e3]/10 flex items-center justify-center">
                                <Check className="w-5 h-5 text-[#0071e3]" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    // Regular option buttons
                    <div className="flex flex-wrap gap-2">
                      {option.values?.map((value) => (
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
                disabled={isAdding || !selectedVariant || !isInStock}
                className={`flex-1 rounded-full py-4 px-8 text-[17px] font-medium active:scale-[0.98] transition-all disabled:cursor-not-allowed flex items-center justify-center ${
                  !isInStock 
                    ? "bg-gray-200 text-gray-500" 
                    : "bg-[#0071e3] text-white hover:bg-[#0077ed] shadow-lg shadow-blue-500/25 disabled:opacity-50"
                }`}
              >
                {isAdding ? (
                  <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : !isInStock ? (
                  "Дууссан"
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5 mr-2" />
                    Сагсанд нэмэх
                  </>
                )}
              </button>
              
              <button
                onClick={handleToggleWishlist}
                disabled={isTogglingWishlist}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isWishlisted 
                    ? "bg-red-50 text-red-500" 
                    : "bg-[#f5f5f7] text-[#86868b] hover:text-red-500 hover:bg-red-50"
                }`}
                title={isWishlisted ? "Хүслийн жагсаалтаас хасах" : "Хүслийн жагсаалтад нэмэх"}
              >
                {isTogglingWishlist ? (
                  <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Heart className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`} />
                )}
              </button>
              
              <button
                onClick={() => {
                  if (selectedVariant) {
                    const calculatedPrice = selectedVariant.calculated_price;
                    const firstPrice = selectedVariant.prices?.[0];
                    const price = calculatedPrice?.calculated_amount ?? firstPrice?.amount;
                    const currencyCode = calculatedPrice?.currency_code ?? firstPrice?.currency_code ?? "MNT";
                    
                    toggleProduct({
                      id: product.id,
                      variantId: selectedVariant.id,
                      title: product.title,
                      handle: product.handle,
                      thumbnail: product.thumbnail,
                      price: price ? { amount: price, currencyCode } : undefined,
                    });
                  }
                }}
                disabled={!selectedVariant}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isInCompare 
                    ? "bg-blue-50 text-blue-600" 
                    : "bg-[#f5f5f7] text-[#86868b] hover:text-blue-600 hover:bg-blue-50"
                }`}
                title={isInCompare ? "Харьцуулалтаас хасах" : "Харьцуулалтад нэмэх"}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </button>
              
              <button
                className="w-14 h-14 bg-[#f5f5f7] text-[#86868b] rounded-full flex items-center justify-center hover:bg-[#e8e8ed] hover:text-[#1d1d1f] transition-all duration-200"
                title="Хуваалцах"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Social Proof Indicators */}
          <div className="space-y-3 mb-8">
            <ViewingCounter productId={product.id} />
            <RecentSales productId={product.id} />
          </div>

          {/* Trust Badges */}
          <div className="mb-8">
            <TrustBadges variant="compact" />
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
            <div className="border-t border-gray-100 pt-8 mb-8">
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

          {/* Customer Reviews */}
          <div className="border-t border-gray-100 pt-8 space-y-8">
            {/* Review Form */}
            <ReviewForm 
              productId={product.id}
              onSuccess={() => {
                // Trigger reviews refresh by reloading the page or use a state refresh
                window.location.reload();
              }}
            />
            
            {/* Existing Reviews */}
            <CustomerReviews productId={product.id} />
          </div>
        </div>
      </div>
    </div>
  );
}