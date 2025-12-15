"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useCartStore, useUIStore, useUserStore } from "@/lib/store";
import { useWishlistStore } from "@/lib/store/wishlist-store";
import { useComparisonStore } from "@/lib/store/comparison-store";
import { CloudinaryImage } from "@/components/Cloudinary";
import { toast } from "@/lib/toast";
import { addToCart as addToCartHelper } from "@/lib/cart/addToCart";
import { API_KEY, API_URL } from "@/lib/config/api";
import { isTradeInEligibleAppleProductText, TRADE_IN_BADGE_TEXT, TRADE_IN_BADGE_TITLE } from "@/lib/tradein";
import Link from "next/link";
import { ViewingCounter } from "./ViewingCounter";
import { RecentSales } from "./RecentSales";
import { CustomerReviews } from "./CustomerReviews";
import { ReviewForm } from "./ReviewForm";
import { TrustBadges } from "./TrustBadges";
import ShareButton from "./ShareButton";
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
  Star,
  ChevronLeft,
  Sparkles,
  Clock3,
  BadgeCheck,
  CreditCard
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
  metadata?: Record<string, unknown> | null;
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

  const isTradeInEligible = useMemo(() => {
    const explicit = (product as unknown as { metadata?: Record<string, unknown> | null })?.metadata?.trade_in_eligible;
    if (typeof explicit === "boolean") return explicit;
    if (explicit != null) return Boolean(explicit);
    return isTradeInEligibleAppleProductText({ handle: product.handle, title: product.title });
  }, [product]);

  const [showTradeInForm, setShowTradeInForm] = useState(false);
  const [isEstimatingTradeIn, setIsEstimatingTradeIn] = useState(false);
  const [isApplyingTradeIn, setIsApplyingTradeIn] = useState(false);
  const [isRemovingTradeIn, setIsRemovingTradeIn] = useState(false);
  const [tradeInEstimate, setTradeInEstimate] = useState<
    | { estimated_amount: number; currency_code: string; matched: boolean }
    | null
  >(null);
  const [appliedTradeIn, setAppliedTradeIn] = useState<
    | { estimated_amount: number; currency_code: string; promotion_code?: string; trade_in_request_id?: string }
    | null
  >(null);

  const [ratingSummary, setRatingSummary] = useState<{ average: number; count: number } | null>(null);
  const [isRatingLoading, setIsRatingLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const actionRef = useRef<HTMLDivElement | null>(null);
  const [openSections, setOpenSections] = useState<{ description: boolean; reviews: boolean }>({
    description: true,
    reviews: false,
  });

  useEffect(() => {
    if (!isTradeInEligible) {
      setShowTradeInForm(false);
    }
  }, [isTradeInEligible]);

  useEffect(() => {
    if (appliedTradeIn) {
      setShowTradeInForm(true);
    }
  }, [appliedTradeIn]);

  // Fetch rating summary for header stars
  useEffect(() => {
    let cancelled = false;
    const fetchRating = async () => {
      const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL;
      if (!backendUrl) {
        setIsRatingLoading(false);
        return;
      }
      setIsRatingLoading(true);
      try {
        const res = await fetch(`${backendUrl}/store/product-analytics/reviews/${product.id}?limit=0`);
        const data = await res.json().catch(() => ({}));
        if (!cancelled && data?.rating) {
          setRatingSummary({
            average: Number(data.rating.average) || 0,
            count: Number(data.rating.count) || 0,
          });
        }
      } catch (error) {
        console.error("Failed to load rating:", error);
      } finally {
        if (!cancelled) setIsRatingLoading(false);
      }
    };

    fetchRating();
    return () => {
      cancelled = true;
    };
  }, [product.id]);

  // Media query + sticky bar visibility
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const handleMatch = () => setIsMobile(mq.matches);
    handleMatch();
    mq.addEventListener("change", handleMatch);
    return () => mq.removeEventListener("change", handleMatch);
  }, []);

  useEffect(() => {
    if (!isMobile) {
      setShowStickyBar(false);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setShowStickyBar(!entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (actionRef.current) {
      observer.observe(actionRef.current);
    }

    return () => {
      if (actionRef.current) observer.unobserve(actionRef.current);
      observer.disconnect();
    };
  }, [isMobile]);

  type TradeInCondition = "like_new" | "good" | "fair" | "broken";
  const [tradeInForm, setTradeInForm] = useState({
    old_device_condition: "good" as TradeInCondition,
    serial_number: "",
    device_checks: {
      power_on: true,
      buttons_ok: true,
      cosmetics_ok: true,
      face_id_touch_ok: true,
      audio_ok: true,
    },
  });

  const deviceCheckQuestions: { key: keyof typeof tradeInForm.device_checks; label: string }[] = [
    { key: "power_on", label: "Асаад ажиллаж байна уу?" },
    { key: "buttons_ok", label: "Товчлуурууд бүрэн үү?" },
    { key: "cosmetics_ok", label: "Гадаад байдал сайн уу?" },
    { key: "face_id_touch_ok", label: "Face ID/Touch/дэлгэц хэвийн үү?" },
    { key: "audio_ok", label: "Дуугаралт/микрофон хэвийн үү?" },
  ];

  const setDeviceCheck = (key: keyof typeof tradeInForm.device_checks, value: boolean) => {
    setTradeInForm((p) => ({
      ...p,
      device_checks: {
        ...p.device_checks,
        [key]: value,
      },
    }));
  };
  
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

  const estimateTradeIn = async () => {
    const serial = tradeInForm.serial_number.trim();
    if (!serial) {
      toast.error("Сериал дугаараа оруулна уу");
      return;
    }

    setIsEstimatingTradeIn(true);
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(API_KEY ? { "x-publishable-api-key": API_KEY } : {}),
      };

      const res = await fetch(`${API_URL}/store/trade-in/estimate`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          new_product_id: product.id,
          old_device_model: serial,
          old_device_condition: tradeInForm.old_device_condition,
          serial_number: serial,
          device_checks: tradeInForm.device_checks,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message = data?.error || data?.message || "Алдаа гарлаа. Дахин оролдоно уу.";
        throw new Error(message);
      }

      setTradeInEstimate({
        estimated_amount: Number(data?.estimated_amount || 0),
        currency_code: (data?.currency_code || "mnt") as string,
        matched: Boolean(data?.matched),
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Алдаа гарлаа. Дахин оролдоно уу.";
      toast.error(message);
      setTradeInEstimate(null);
    } finally {
      setIsEstimatingTradeIn(false);
    }
  };

  const applyTradeInToCart = async () => {
    if (!cartId) {
      toast.error("Эхлээд бүтээгдэхүүнээ сагсанд нэмнэ үү");
      return;
    }
    const serial = tradeInForm.serial_number.trim();
    if (!serial) {
      toast.error("Сериал дугаараа оруулна уу");
      return;
    }

    setIsApplyingTradeIn(true);
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(API_KEY ? { "x-publishable-api-key": API_KEY } : {}),
      };

      const res = await fetch(`${API_URL}/store/trade-in/apply`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          cart_id: cartId,
          new_product_id: product.id,
          old_device_model: serial,
          old_device_condition: tradeInForm.old_device_condition,
          serial_number: serial,
          device_checks: tradeInForm.device_checks,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message = data?.error || data?.message || "Алдаа гарлаа. Дахин оролдоно уу.";
        throw new Error(message);
      }

      if (!data?.applied) {
        toast.error("Тохирох санал олдсонгүй");
        return;
      }

      setAppliedTradeIn({
        estimated_amount: Number(data?.estimated_amount || 0),
        currency_code: (data?.currency_code || "mnt") as string,
        promotion_code: data?.promotion_code,
        trade_in_request_id: data?.trade_in_request_id,
      });

      toast.success("Трейд-ин хөнгөлөлт сагсанд хэрэглэгдлээ");
      await syncCart();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Алдаа гарлаа. Дахин оролдоно уу.";
      toast.error(message);
    } finally {
      setIsApplyingTradeIn(false);
    }
  };

  const removeTradeInFromCart = async () => {
    if (!cartId) return;
    setIsRemovingTradeIn(true);
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(API_KEY ? { "x-publishable-api-key": API_KEY } : {}),
      };

      const res = await fetch(`${API_URL}/store/trade-in/remove`, {
        method: "POST",
        headers,
        body: JSON.stringify({ cart_id: cartId }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message = data?.error || data?.message || "Алдаа гарлаа. Дахин оролдоно уу.";
        throw new Error(message);
      }

      setAppliedTradeIn(null);
      toast.success("Трейд-ин хөнгөлөлт устгагдлаа");
      await syncCart();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Алдаа гарлаа. Дахин оролдоно уу.";
      toast.error(message);
    } finally {
      setIsRemovingTradeIn(false);
    }
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

      {/* Experience rail */}
      <div className="relative mb-10">
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#e8f0ff] via-white to-[#e5f6ff] blur-3xl opacity-70" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="flex items-start gap-3 rounded-2xl border border-white bg-white/70 backdrop-blur shadow-[0_15px_45px_-32px_rgba(0,0,0,0.45)] p-4">
            <span className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#0b6cd4]/10 text-[#0b6cd4]">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-[#1d1d1f]">Шинэ ирэлт</p>
              <p className="text-xs text-[#6b7280]">Хязгаарлагдмал тоотой багц, шуурхай хүргэлт</p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-white bg-white/70 backdrop-blur shadow-[0_15px_45px_-32px_rgba(0,0,0,0.45)] p-4">
            <span className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#0071e3]/10 text-[#0071e3]">
              <Truck className="w-5 h-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-[#1d1d1f]">Экспресс хүргэлт</p>
              <p className="text-xs text-[#6b7280]">Хот дотор 3 цаг, аймагт 24-48 цаг</p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-white bg-white/70 backdrop-blur shadow-[0_15px_45px_-32px_rgba(0,0,0,0.45)] p-4">
            <span className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#10b981]/10 text-[#0f9b6d]">
              <BadgeCheck className="w-5 h-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-[#1d1d1f]">100% оригинал</p>
              <p className="text-xs text-[#6b7280]">Албан ёсны эх үүсвэр, баталгаат сервис</p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-white bg-white/70 backdrop-blur shadow-[0_15px_45px_-32px_rgba(0,0,0,0.45)] p-4">
            <span className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#f97316]/10 text-[#ea580c]">
              <CreditCard className="w-5 h-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-[#1d1d1f]">0₮ урьдчилгаа зөвлөгөө</p>
              <p className="text-xs text-[#6b7280]">Лизинг, трейд-ин, хослолын зөвлөмжийг шууд ав</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 xl:gap-24">
        {/* Image Gallery - Sticky on Desktop */}
        <div className="space-y-4 lg:sticky lg:top-24 h-fit" key={`gallery-${selectedColor || 'default'}`}>
          {/* Main Image */}
          <div className="aspect-square relative bg-linear-to-br from-[#f5f5f7] to-[#e8e8ed] rounded-3xl overflow-hidden group flex items-center justify-center">
            {isTradeInEligible && (
              <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm text-[#1d1d1f] px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm border border-gray-200">
                {TRADE_IN_BADGE_TEXT}
              </div>
            )}
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
            {/* Rating wired to backend */}
            <div className="flex items-center gap-2 mb-3">
              {ratingSummary && ratingSummary.count > 0 ? (
                <>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.round(ratingSummary.average)
                            ? "fill-amber-400 text-amber-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-[#86868b]">
                    {ratingSummary.average.toFixed(1)} / 5 · {ratingSummary.count} үнэлгээ
                  </span>
                </>
              ) : isRatingLoading ? (
                <span className="text-sm text-[#86868b]">Үнэлгээ ачааллаж байна...</span>
              ) : (
                <span className="text-sm text-[#86868b]">Одоогоор үнэлгээ алга</span>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-[42px] font-semibold text-[#1d1d1f] mb-4 tracking-tight leading-tight">
              {product.title}
            </h1>
            
            {priceInfo && (
              <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-[#f5f8ff] via-white to-[#f2f4ff] p-4 shadow-[0_18px_55px_-42px_rgba(0,0,0,0.55)]">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <p className={`text-[26px] md:text-[32px] font-semibold leading-none ${priceInfo.isOnSale ? 'text-[#d93025]' : 'text-[#111827]'}`}>
                        {priceInfo.currentPrice}
                      </p>
                      {priceInfo.isOnSale && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#d93025] text-white text-[11px] font-semibold px-3 py-1 shadow-sm">
                          <Sparkles className="w-4 h-4" />
                          -{priceInfo.discountPercentage}%
                        </span>
                      )}
                    </div>
                    {priceInfo.isOnSale && priceInfo.originalPrice && (
                      <p className="text-[15px] text-[#6b7280] line-through">
                        {priceInfo.originalPrice}
                      </p>
                    )}
                    <p className="text-xs text-[#6b7280]">Үнэ МНТ, татвар багтсан. Онлайнд өдрийн турш нэг ижил үнэ.</p>
                  </div>

                  <div className="flex flex-col items-end gap-2 text-right">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#0b6cd4]/10 text-[#0b6cd4] text-[12px] font-semibold px-3 py-1">
                      <Clock3 className="w-4 h-4" />
                      Шуурхай нөөц шалгалт
                    </span>
                    {isTradeInEligible && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#e8f2ff] text-[#0b6cd4] text-[12px] font-semibold px-3 py-1">
                        <CreditCard className="w-4 h-4" />
                        Trade-in боломжтой
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Stock Status */}
            {selectedVariant && (
              <div className="mt-3 flex items-center gap-3 text-sm">
                {isInStock ? (
                  <span className="inline-flex items-center gap-1.5 text-green-700 bg-green-50 border border-green-100 px-3 py-1.5 rounded-full">
                    <span className="w-2 h-2 bg-green-500 rounded-full" />
                    Бэлэн байгаа
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-red-600 bg-red-50 border border-red-100 px-3 py-1.5 rounded-full">
                    <span className="w-2 h-2 bg-red-500 rounded-full" />
                    Дууссан
                  </span>
                )}
                <span className="text-[#6b7280]">Салбар дээр урьдчилан баталгаажуулж захиалга өгөх боломжтой.</span>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-linear-to-r from-gray-200 via-gray-100 to-transparent mb-6" />

          {isTradeInEligible && (
            <div id="tradein-form" className="mb-8 rounded-3xl border border-gray-200 bg-white shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-linear-to-r from-[#f2f6ff] via-white to-[#f9fbff] border-b border-gray-100 px-4 py-3 rounded-t-3xl">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.08em] text-[#6b7280]">Алхам 1</p>
                  <h3 className="text-base md:text-lg font-semibold text-[#1d1d1f]">Төхөөрөмжөө үнэлүүлээд шууд хөнгөлөлт аваарай</h3>
                  <p className="text-xs text-[#6b7280]">IMEI/Serial баталгаажуулалт, хурдан шалгалт</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {appliedTradeIn ? (
                    <span className="text-xs md:text-sm px-3 py-1.5 rounded-full bg-[#e8f2ff] text-[#0b6cd4] border border-[#b6d5ff]">
                      Хөнгөлөлт идэвхтэй
                    </span>
                  ) : tradeInEstimate && tradeInEstimate.matched ? (
                    <span className="text-xs md:text-sm px-3 py-1.5 rounded-full bg-[#f5f5f7] text-[#1d1d1f] border border-gray-200">
                      Урьдчилсан: {formatPrice(tradeInEstimate.estimated_amount, tradeInEstimate.currency_code)}
                    </span>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => {
                      setShowTradeInForm((prev) => !prev)
                      if (!showTradeInForm) {
                        setTimeout(() => {
                          document.getElementById("tradein-form")?.scrollIntoView({ behavior: "smooth", block: "start" })
                        }, 0)
                      }
                    }}
                    className="text-sm font-semibold rounded-full px-4 py-2 bg-[#0071e3] text-white hover:bg-[#005bbd] transition-colors"
                  >
                    {showTradeInForm ? "Хураах" : "Үнэлгээ эхлүүлэх"}
                  </button>
                </div>
              </div>

              {showTradeInForm ? (
                <div className="grid md:grid-cols-2 gap-6 p-4 md:p-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-xs text-[#86868b]">Сериал / IMEI</label>
                      <input
                        value={tradeInForm.serial_number}
                        onChange={(e) => setTradeInForm((p) => ({ ...p, serial_number: e.target.value }))}
                        className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0071e3]/70"
                        placeholder="15-17 оронтой дугаар"
                        inputMode="numeric"
                      />
                      <p className="text-[11px] text-[#9ca3af]">* IMEI 1 ашиглаарай. Шалгалтын үед тулгаж баталгаажуулна.</p>
                    </div>

                    <div>
                      <label className="block text-xs text-[#86868b] mb-1">Төлөв</label>
                      <select
                        value={tradeInForm.old_device_condition}
                        onChange={(e) =>
                          setTradeInForm((p) => ({ ...p, old_device_condition: e.target.value as TradeInCondition }))
                        }
                        className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0071e3]/70"
                      >
                        <option value="like_new">Шинэ мэт</option>
                        <option value="good">Сайн</option>
                        <option value="fair">Дунд</option>
                        <option value="broken">Эвдрэлтэй</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={estimateTradeIn}
                        disabled={isEstimatingTradeIn}
                        className="w-full rounded-2xl border border-gray-200 bg-white py-3 text-sm font-semibold text-[#1d1d1f] disabled:opacity-60"
                      >
                        {isEstimatingTradeIn ? "Тооцоолж байна..." : "Үнэлгээ авах"}
                      </button>

                      <button
                        type="button"
                        onClick={applyTradeInToCart}
                        disabled={isApplyingTradeIn || !cartId}
                        className="w-full rounded-2xl bg-[#0071e3] text-white py-3 text-sm font-semibold disabled:opacity-60"
                      >
                        {isApplyingTradeIn ? "Хэрэглэж байна..." : "Сагсанд хөнгөлөлт хэрэглэх"}
                      </button>
                    </div>

                    {!cartId && (
                      <p className="text-xs text-[#9ca3af]">Хөнгөлөлт хэрэглэхийн тулд эхлээд бүтээгдэхүүнээ сагсанд нэмнэ үү.</p>
                    )}

                    {tradeInEstimate && (
                      <div className="rounded-2xl bg-[#f5f5f7] p-4">
                        {tradeInEstimate.matched && tradeInEstimate.estimated_amount > 0 ? (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-[#1d1d1f] font-semibold">Урьдчилсан үнэлгээ</span>
                            <span className="text-sm text-[#1d1d1f] font-semibold">
                              {formatPrice(tradeInEstimate.estimated_amount, tradeInEstimate.currency_code)}
                            </span>
                          </div>
                        ) : (
                          <p className="text-sm text-[#86868b]">Тохирох санал олдсонгүй. Шалгалтын хариуг сайжруулна уу.</p>
                        )}
                      </div>
                    )}

                    {appliedTradeIn && (
                      <div className="rounded-2xl border border-gray-200 p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-[#1d1d1f]">Хөнгөлөлт хэрэглэгдсэн</p>
                            <p className="text-xs text-[#86868b]">Хямдрал сагс/тооцоонд харагдана.</p>
                          </div>
                          <button
                            type="button"
                            onClick={removeTradeInFromCart}
                            disabled={isRemovingTradeIn}
                            className="text-sm text-[#0071e3] hover:underline disabled:opacity-60"
                          >
                            {isRemovingTradeIn ? "Устгаж байна..." : "Устгах"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl border border-gray-100 bg-[#f9fafb] p-4 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <p className="text-sm font-semibold text-[#1d1d1f]">Төлөвийн шалгалт</p>
                        <p className="text-xs text-[#86868b]">"Үгүй" сонговол үнэлгээ автоматаар татгалзана.</p>
                      </div>
                      <span className="text-[11px] px-2 py-1 bg-white border border-gray-200 rounded-full text-[#6b7280]">IMEI баталгаажна</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {deviceCheckQuestions.map((q) => {
                        const value = tradeInForm.device_checks[q.key];
                        return (
                          <div key={q.key} className="rounded-xl bg-white border border-gray-200 p-3 flex items-center justify-between gap-3">
                            <p className="text-xs text-[#1d1d1f] mr-2 leading-snug">{q.label}</p>
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() => setDeviceCheck(q.key, true)}
                                className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all ${
                                  value
                                    ? "bg-[#e8f2ff] text-[#0b6cd4] border border-[#b6d5ff]"
                                    : "bg-white text-[#6b7280] border border-gray-200"
                                }`}
                              >
                                Тийм
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeviceCheck(q.key, false)}
                                className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all ${
                                  value === false
                                    ? "bg-[#fef2f2] text-[#b91c1c] border border-[#fecdd3]"
                                    : "bg-white text-[#6b7280] border border-gray-200"
                                }`}
                              >
                                Үгүй
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <div className="rounded-xl bg-white border border-dashed border-gray-200 p-3 text-xs text-[#6b7280] leading-relaxed">
                      • Нүдэн дээр шалгаж баталгаажуулна • Урамшуулал зөвхөн энэ сагсанд хүчинтэй • Бодит үнэлгээ шалгалтын дүнгээр шинэчлэгдэнэ
                    </div>
                  </div>
                </div>
              ) : (
                <div className="px-4 py-3 text-sm text-[#6b7280] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <span>Serial/IMEI оруулаад, төлөвөө сонгон үнэлгээгээ харах боломжтой.</span>
                  <div className="flex flex-wrap gap-2">
                    {appliedTradeIn && (
                      <span className="text-xs md:text-sm px-3 py-1.5 rounded-full bg-[#e8f2ff] text-[#0b6cd4] border border-[#b6d5ff]">
                        Хөнгөлөлт идэвхтэй
                      </span>
                    )}
                    {tradeInEstimate && tradeInEstimate.matched && (
                      <span className="text-xs md:text-sm px-3 py-1.5 rounded-full bg-[#f5f5f7] text-[#1d1d1f] border border-gray-200">
                        Урьдчилсан: {formatPrice(tradeInEstimate.estimated_amount, tradeInEstimate.currency_code)}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

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
          <div className="space-y-4 mb-8" ref={actionRef}>
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
              
              <ShareButton product={product} />
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
            <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_20px_60px_-48px_rgba(0,0,0,0.6)]">
              <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-[#0071e3]/5" />
              <div className="relative flex items-center gap-3">
                <div className="w-11 h-11 bg-[#0071e3]/10 text-[#0071e3] rounded-xl flex items-center justify-center">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1d1d1f]">Экспресс + үнэгүй хүргэлт</p>
                  <p className="text-xs text-[#6b7280]">Улаанбаатар дотор үнэгүй, аймаг руу даатгалтай</p>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_20px_60px_-48px_rgba(0,0,0,0.6)]">
              <div className="absolute -left-8 -bottom-8 h-24 w-24 rounded-full bg-[#0f9b6d]/5" />
              <div className="relative flex items-center gap-3">
                <div className="w-11 h-11 bg-[#0f9b6d]/10 text-[#0f9b6d] rounded-xl flex items-center justify-center">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1d1d1f]">14 хоногийн уян буцаалт</p>
                  <p className="text-xs text-[#6b7280]">Сав баглаа бүрэн байвал шууд сольж/буцаана</p>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_20px_60px_-48px_rgba(0,0,0,0.6)]">
              <div className="absolute right-0 bottom-0 h-16 w-24 bg-gradient-to-l from-[#111827]/5 to-transparent" />
              <div className="relative flex items-center gap-3">
                <div className="w-11 h-11 bg-[#1f2937]/10 text-[#111827] rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1d1d1f]">1 жилийн баталгаа + сервис</p>
                  <p className="text-xs text-[#6b7280]">Албан ёсны сервис, сэлбэгийн нөөц баталгаатай</p>
                </div>
              </div>
            </div>
          </div>

          {/* Accordion: Description */}
          {product.description && (
            <div className="mb-6 rounded-2xl border border-gray-100 overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenSections((p) => ({ ...p, description: !p.description }))}
                className="w-full flex items-center justify-between px-4 py-3 bg-white text-left"
              >
                <span className="flex items-center gap-2 text-lg font-semibold text-[#1d1d1f]">
                  <span className="w-1 h-5 bg-[#0071e3] rounded-full" />
                  Бүтээгдэхүүний тайлбар
                </span>
                <ChevronRight
                  className={`w-5 h-5 text-[#6b7280] transition-transform ${openSections.description ? "rotate-90" : ""}`}
                />
              </button>
              {openSections.description && (
                <div className="px-4 pb-4">
                  <div className="prose prose-gray max-w-none">
                    <p className="text-[#424245] leading-relaxed text-[15px]">
                      {product.description}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Accordion: Customer Reviews */}
          <div className="mb-8 rounded-2xl border border-gray-100 overflow-hidden">
            <button
              type="button"
              onClick={() => setOpenSections((p) => ({ ...p, reviews: !p.reviews }))}
              className="w-full flex items-center justify-between px-4 py-3 bg-white text-left"
            >
              <span className="flex items-center gap-2 text-lg font-semibold text-[#1d1d1f]">
                <span className="w-1 h-5 bg-[#0071e3] rounded-full" />
                Үнэлгээ, сэтгэгдэл
              </span>
              <ChevronRight
                className={`w-5 h-5 text-[#6b7280] transition-transform ${openSections.reviews ? "rotate-90" : ""}`}
              />
            </button>
            {openSections.reviews && (
              <div className="px-4 pb-6 space-y-8">
                <ReviewForm 
                  productId={product.id}
                  onSuccess={() => {
                    window.location.reload();
                  }}
                />
                <CustomerReviews productId={product.id} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile sticky add-to-cart */}
      {showStickyBar && selectedVariant && isInStock && priceInfo && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-sm text-[#6b7280] line-clamp-1">{product.title}</span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-[#1d1d1f]">{priceInfo.currentPrice}</span>
                {priceInfo.isOnSale && priceInfo.originalPrice && (
                  <span className="text-sm line-through text-[#9ca3af]">{priceInfo.originalPrice}</span>
                )}
              </div>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={isAdding || !selectedVariant || !isInStock}
              className="rounded-full bg-[#0071e3] text-white px-4 py-3 text-sm font-semibold shadow-lg shadow-blue-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAdding ? "Нэмэж байна..." : "Сагсанд нэмэх"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}