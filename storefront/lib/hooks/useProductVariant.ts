import { useMemo, useState, useCallback } from "react";

interface ProductVariant {
  id: string;
  title?: string | null;
  prices?: { amount: number; currency_code: string }[];
  calculated_price?: {
    calculated_amount: number | null;
    original_amount: number | null;
    currency_code: string | null;
  };
  options?: { id: string; option_id?: string | null; value: string }[] | null;
  thumbnail?: string | null;
  images?: { id: string; url: string }[] | null;
  inventory_quantity?: number | null;
  manage_inventory?: boolean | null;
  allow_backorder?: boolean | null;
}

interface Product {
  variants?: ProductVariant[] | null;
  options?: { id: string; title: string }[] | null;
}

export function useProductVariant(product: Product) {
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

  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) return null;
    if (product.variants.length === 1) return product.variants[0];

    return (
      product.variants.find((variant) => {
        if (!variant.options) return false;
        return variant.options.every(
          (opt) => opt.option_id && selectedOptions[opt.option_id] === opt.value
        );
      }) || product.variants[0]
    );
  }, [product.variants, selectedOptions]);

  const isInStock = useMemo(() => {
    if (!selectedVariant) return false;
    if (selectedVariant.manage_inventory === false) return true;
    if (selectedVariant.allow_backorder) return true;
    const qty = selectedVariant.inventory_quantity ?? 0;
    return qty > 0;
  }, [selectedVariant]);

  const handleOptionSelect = useCallback((optionId: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [optionId]: value }));
  }, []);

  // Check if an option is a color option
  const isColorOption = useCallback((optionTitle: string) => {
    const colorKeywords = ["color", "colour", "өнгө", "өнг"];
    const lowerTitle = optionTitle.toLowerCase();
    return colorKeywords.some((kw) => lowerTitle.includes(kw));
  }, []);

  const colorOptionId = useMemo(() => {
    const colorOption = product.options?.find((opt) => isColorOption(opt.title));
    return colorOption?.id || null;
  }, [product.options, isColorOption]);

  const selectedColor = colorOptionId ? selectedOptions[colorOptionId] : null;

  return {
    selectedOptions,
    selectedVariant,
    isInStock,
    handleOptionSelect,
    isColorOption,
    colorOptionId,
    selectedColor,
  };
}
