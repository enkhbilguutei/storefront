import { useMemo } from "react";
import { formatPrice } from "@/lib/utils/price";

interface ProductVariant {
  prices?: { amount: number; currency_code: string }[];
  calculated_price?: {
    calculated_amount: number | null;
    original_amount: number | null;
    currency_code: string | null;
  };
}

export function useProductPrice(selectedVariant: ProductVariant | null) {
  return useMemo(() => {
    if (!selectedVariant) return null;

    const calculatedPrice = selectedVariant.calculated_price;
    const regularPrice = selectedVariant.prices?.[0];

    if (
      calculatedPrice &&
      calculatedPrice.calculated_amount !== null &&
      calculatedPrice.original_amount !== null &&
      calculatedPrice.currency_code
    ) {
      const isOnSale = calculatedPrice.calculated_amount < calculatedPrice.original_amount;
      return {
        currentPrice: formatPrice(calculatedPrice.calculated_amount, calculatedPrice.currency_code),
        originalPrice: isOnSale
          ? formatPrice(calculatedPrice.original_amount, calculatedPrice.currency_code)
          : null,
        discountPercentage: isOnSale
          ? Math.round(
              ((calculatedPrice.original_amount - calculatedPrice.calculated_amount) /
                calculatedPrice.original_amount) *
                100
            )
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
}
