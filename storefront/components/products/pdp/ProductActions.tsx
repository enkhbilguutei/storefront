import { Heart, ShoppingBag } from "lucide-react";
import ShareButton from "../ShareButton";

interface ProductActionsProps {
  isInStock: boolean;
  isAdding: boolean;
  onAddToCart: () => void;
  isWishlisted: boolean;
  isTogglingWishlist: boolean;
  onToggleWishlist: () => void;
  isInCompare: boolean;
  onToggleCompare: () => void;
  selectedVariant: any;
  product: any;
  actionRef?: React.RefObject<HTMLDivElement>;
}

export function ProductActions({
  isInStock,
  isAdding,
  onAddToCart,
  isWishlisted,
  isTogglingWishlist,
  onToggleWishlist,
  isInCompare,
  onToggleCompare,
  selectedVariant,
  product,
  actionRef,
}: ProductActionsProps) {
  return (
    <div className="space-y-4 mb-8" ref={actionRef}>
      <div className="flex gap-3">
        <button
          onClick={onAddToCart}
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
          onClick={onToggleWishlist}
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
          onClick={onToggleCompare}
          disabled={!selectedVariant}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
            isInCompare
              ? "bg-blue-50 text-blue-600"
              : "bg-[#f5f5f7] text-[#86868b] hover:text-blue-600 hover:bg-blue-50"
          }`}
          title={isInCompare ? "Харьцуулалтаас хасах" : "Харьцуулалтад нэмэх"}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </button>

        <ShareButton product={product} />
      </div>
    </div>
  );
}
