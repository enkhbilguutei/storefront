interface StickyAddToCartProps {
  show: boolean;
  productTitle: string;
  currentPrice: string;
  originalPrice?: string;
  isOnSale: boolean;
  isAdding: boolean;
  isInStock: boolean;
  selectedVariant: any;
  onAddToCart: () => void;
}

export function StickyAddToCart({
  show,
  productTitle,
  currentPrice,
  originalPrice,
  isOnSale,
  isAdding,
  isInStock,
  selectedVariant,
  onAddToCart,
}: StickyAddToCartProps) {
  if (!show || !selectedVariant || !isInStock) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-sm text-[#6b7280] line-clamp-1">{productTitle}</span>
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-[#1d1d1f]">{currentPrice}</span>
            {isOnSale && originalPrice && (
              <span className="text-sm line-through text-[#9ca3af]">{originalPrice}</span>
            )}
          </div>
        </div>
        <button
          onClick={onAddToCart}
          disabled={isAdding || !selectedVariant || !isInStock}
          className="rounded-full bg-[#0071e3] text-white px-4 py-3 text-sm font-semibold shadow-lg shadow-blue-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAdding ? "Нэмэж байна..." : "Сагсанд нэмэх"}
        </button>
      </div>
    </div>
  );
}
