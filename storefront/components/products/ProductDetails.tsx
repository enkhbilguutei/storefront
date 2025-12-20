"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useCartStore, useUIStore, useUserStore } from "@/lib/store";
import { useWishlistStore } from "@/lib/store/wishlist-store";
import { useComparisonStore } from "@/lib/store/comparison-store";
import { toast } from "@/lib/toast";
import { addToCart as addToCartHelper } from "@/lib/cart/addToCart";
import { isTradeInEligibleAppleProductText } from "@/lib/tradein";
import { formatPrice } from "@/lib/utils/price";
import { useProductVariant } from "@/lib/hooks/useProductVariant";
import { useProductImages } from "@/lib/hooks/useProductImages";
import { useProductPrice } from "@/lib/hooks/useProductPrice";
import { useTradeIn } from "@/lib/hooks/useTradeIn";
import { useProductRating } from "@/lib/hooks/useProductRating";
import { useStickyBar } from "@/lib/hooks/useStickyBar";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import Link from "next/link";
import { ViewingCounter } from "./ViewingCounter";
import { RecentSales } from "./RecentSales";
import { CustomerReviews } from "./CustomerReviews";
import { ReviewForm } from "./ReviewForm";
import { ProductImageGallery } from "./pdp/ProductImageGallery";
import { PriceInfo } from "./pdp/PriceInfo";
import { ProductOptionsSelector } from "./pdp/ProductOptionsSelector";
import { ProductActions } from "./pdp/ProductActions";
import { FeatureCards } from "./pdp/FeatureCards";
import { StickyAddToCart } from "./pdp/StickyAddToCart";
import { TradeInSection } from "./pdp/trade-in/TradeInSection";
import { Badge } from "@/components/ui/Badge";
import { QuantitySelector } from "@/components/ui/QuantitySelector";
import { Accordion } from "@/components/ui/Accordion";
import { ChevronRight, Star } from "lucide-react";

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
  const { isInComparison } = useComparisonStore();

  // Scroll to top on product change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [product.id]);

  // Custom hooks for cleaner state management
  const {
    selectedOptions,
    selectedVariant,
    isInStock,
    handleOptionSelect,
    isColorOption,
    colorOptionId,
    selectedColor,
  } = useProductVariant(product);

  const { allImages, getThumbnailForColorValue } = useProductImages({
    product,
    selectedVariant,
    colorOptionId,
    selectedColor,
  });

  const priceInfo = useProductPrice(selectedVariant);
  const { ratingSummary, isLoading: isRatingLoading } = useProductRating(product.id);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { showStickyBar, actionRef } = useStickyBar(isMobile);

  // Trade-in eligibility check
  const isTradeInEligible = useMemo(() => {
    const explicit = (product as unknown as { metadata?: Record<string, unknown> | null })?.metadata?.trade_in_eligible;
    if (typeof explicit === "boolean") return explicit;
    if (explicit != null) return Boolean(explicit);
    return isTradeInEligibleAppleProductText({ handle: product.handle, title: product.title });
  }, [product]);

  // Trade-in hook
  const tradeIn = useTradeIn(product.id, cartId, syncCart);

  // UI state
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
  const [openSections, setOpenSections] = useState({
    description: true,
    reviews: false,
  });

  const isInCompare = isInComparison(selectedVariant?.id || "");
  const isWishlisted = isInWishlist(product.id, selectedVariant?.id);

  // Cart actions
  const handleAddToCart = useCallback(async () => {
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
  }, [selectedVariant, isAdding, quantity, product, cartId, setCartId, syncCart, addItem, openCartNotification]);

  // Wishlist actions
  const handleToggleWishlist = useCallback(async () => {
    if (isTogglingWishlist || !selectedVariant) return;

    if (!isAuthenticated) {
      openAuthModal("wishlist", "login");
      return;
    }

    setIsTogglingWishlist(true);
    try {
      if (isWishlisted) {
        const item = wishlistItems.find(
          (i) => i.product_id === product.id && (!selectedVariant || i.variant_id === selectedVariant.id)
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
      console.error("Failed to toggle wishlist:", error);
      openWishlistNotification("Алдаа гарлаа. Дахин оролдоно уу.");
    } finally {
      setIsTogglingWishlist(false);
    }
  }, [
    isTogglingWishlist,
    selectedVariant,
    isAuthenticated,
    isWishlisted,
    wishlistItems,
    product.id,
    removeFromWishlist,
    addToWishlist,
    openWishlistNotification,
    openAuthModal,
  ]);

  // Comparison actions
  const handleToggleCompare = useCallback(() => {
    if (!selectedVariant) return;

    const calculatedPrice = selectedVariant.calculated_price;
    const firstPrice = selectedVariant.prices?.[0];
    const price = calculatedPrice?.calculated_amount ?? firstPrice?.amount;
    const currencyCode = calculatedPrice?.currency_code ?? firstPrice?.currency_code ?? "MNT";

    const { toggleProduct } = useComparisonStore.getState();
    toggleProduct({
      id: product.id,
      variantId: selectedVariant.id,
      title: product.title,
      handle: product.handle,
      thumbnail: product.thumbnail,
      price: price ? { amount: price, currencyCode } : undefined,
    });
  }, [selectedVariant, product]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-sm text-[#8D99AF] mb-6" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-[#2B2D42] transition-colors font-medium">
          Нүүр
        </Link>
        <ChevronRight className="w-3.5 h-3.5 mx-2 opacity-40" aria-hidden="true" />
        <Link href="/products" className="hover:text-[#2B2D42] transition-colors font-medium">
          Бүтээгдэхүүн
        </Link>
        <ChevronRight className="w-3.5 h-3.5 mx-2 opacity-40" aria-hidden="true" />
        <span className="text-[#2B2D42] font-semibold truncate max-w-[200px]">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
        {/* Image Gallery */}
        <ProductImageGallery
          productTitle={product.title}
          thumbnail={product.thumbnail || ""}
          allImages={allImages}
          isTradeInEligible={isTradeInEligible}
          selectedColor={selectedColor || undefined}
        />

        {/* Product Info */}
        <div className="flex flex-col space-y-5">
          {/* Header with Rating */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              {ratingSummary && ratingSummary.count > 0 ? (
                <>
                  <div className="flex items-center gap-0.5" aria-label={`Rating: ${ratingSummary.average} out of 5`}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.round(ratingSummary.average)
                            ? "fill-[#EF233C] text-[#EF233C]"
                            : "text-[#8D99AF]/30"
                        }`}
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                  <span className="text-sm text-[#8D99AF]">
                    {ratingSummary.average.toFixed(1)} · {ratingSummary.count} үнэлгээ
                  </span>
                </>
              ) : isRatingLoading ? (
                <div className="h-4 w-48 bg-gray-100 rounded animate-pulse" />
              ) : null}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-[#2B2D42] mb-4">
              {product.title}
            </h1>

            {priceInfo && (
              <PriceInfo
                currentPrice={priceInfo.currentPrice}
                originalPrice={priceInfo.originalPrice || undefined}
                discountPercentage={priceInfo.discountPercentage}
                isOnSale={priceInfo.isOnSale}
                isTradeInEligible={isTradeInEligible}
              />
            )}

            {/* Stock Status */}
            {selectedVariant && (
              <div className="mt-4 flex items-center gap-3 text-sm">
                {isInStock ? (
                  <Badge variant="success" showDot>
                    Нөөцтэй
                  </Badge>
                ) : (
                  <Badge variant="error" showDot>
                    Дууссан
                  </Badge>
                )}
                <span className="text-[#8D99AF]">
                  Салбараар урьдчилан захиалга авна.
                </span>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-linear-to-r from-[#8D99AF]/20 via-[#8D99AF]/10 to-transparent" />

          {/* Trade-In Section */}
          {isTradeInEligible && (
            <TradeInSection
              isTradeInEligible={isTradeInEligible}
              cartId={cartId}
              onEstimate={tradeIn.estimateTradeIn}
              onApply={tradeIn.applyTradeIn}
              onRemove={tradeIn.removeTradeIn}
              tradeInEstimate={tradeIn.estimate}
              appliedTradeIn={tradeIn.applied}
              formatPrice={formatPrice}
              isEstimatingTradeIn={tradeIn.isEstimating}
              isApplyingTradeIn={tradeIn.isApplying}
              isRemovingTradeIn={tradeIn.isRemoving}
            />
          )}

          {/* Options Selector */}
          <ProductOptionsSelector
            options={product.options || []}
            selectedOptions={selectedOptions}
            onOptionSelect={handleOptionSelect}
            getThumbnailForColorValue={(optionId, value) => getThumbnailForColorValue(optionId, value) || ""}
            isColorOption={isColorOption}
          />

          {/* Quantity Selector */}
          <div>
            <label htmlFor="quantity" className="text-sm font-medium text-[#2B2D42] mb-2 block">
              Тоо ширхэг
            </label>
            <QuantitySelector
              quantity={quantity}
              onIncrement={() => setQuantity(quantity + 1)}
              onDecrement={() => setQuantity(Math.max(1, quantity - 1))}
              min={1}
            />
          </div>

          {/* Actions */}
          <ProductActions
            isInStock={isInStock}
            isAdding={isAdding}
            onAddToCart={handleAddToCart}
            isWishlisted={isWishlisted}
            isTogglingWishlist={isTogglingWishlist}
            onToggleWishlist={handleToggleWishlist}
            isInCompare={isInCompare}
            onToggleCompare={handleToggleCompare}
            selectedVariant={selectedVariant}
            product={product}
            actionRef={actionRef}
          />

          {/* Social Proof & Features */}
          <div className="space-y-4">
            <ViewingCounter productId={product.id} />
            <RecentSales productId={product.id} />
          </div>

          <FeatureCards />

          {/* Accordion: Description */}
          <div className="space-y-4 mt-8 border-t pt-6">
            {product.description && (
              <Accordion
                title="Тайлбар"
                isOpen={openSections.description}
                onToggle={() => setOpenSections((p) => ({ ...p, description: !p.description }))}
                showIndicator
              >
                <p className="text-[#8D99AF]">{product.description}</p>
              </Accordion>
            )}

            {/* Accordion: Customer Reviews */}
            <Accordion
              title="Үнэлгээ ба сэтгэгдэл"
              isOpen={openSections.reviews}
              onToggle={() => setOpenSections((p) => ({ ...p, reviews: !p.reviews }))}
              showIndicator
            >
              <CustomerReviewsWrapper productId={product.id} />
            </Accordion>
          </div>
        </div>
      </div>

      {/* Mobile sticky add-to-cart */}
      {priceInfo && (
        <StickyAddToCart
          show={showStickyBar}
          productTitle={product.title}
          currentPrice={priceInfo.currentPrice}
          originalPrice={priceInfo.originalPrice || undefined}
          isOnSale={priceInfo.isOnSale}
          isAdding={isAdding}
          isInStock={isInStock}
          selectedVariant={selectedVariant}
          onAddToCart={handleAddToCart}
        />
      )}
    </div>
  );
}

function CustomerReviewsWrapper({ productId }: { productId: string }) {
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div className="space-y-6">
      <ReviewForm
        productId={productId}
        onSuccess={() => setRefreshKey((k) => k + 1)}
      />
      <CustomerReviews productId={productId} refreshKey={refreshKey} />
    </div>
  )
}