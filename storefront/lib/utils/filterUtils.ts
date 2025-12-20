/**
 * Utility functions for extracting dynamic filter options from products
 */

interface Product {
  options?: Array<{
    id: string;
    title: string;
    values?: Array<{ id: string; value: string }>;
  }> | null;
  tags?: Array<{
    id: string;
    value: string;
  }> | null;
  variants?: Array<{
    prices?: Array<{ amount: number }>;
    calculated_price?: { calculated_amount: number };
  }> | null;
}

interface FilterOptions {
  availableOptions: Array<{
    name: string;
    values: string[];
  }>;
  tags: Array<{
    id: string;
    value: string;
  }>;
  priceRange: {
    min: number;
    max: number;
  };
}

/**
 * Extract unique filter options from an array of products
 * Dynamically discovers available options (Size, Color, Material, etc.)
 * and their possible values
 */
export function extractFilterOptions(products: Product[]): FilterOptions {
  const optionsMap = new Map<string, Set<string>>();
  const tagsMap = new Map<string, { id: string; value: string }>();
  let minPrice = Infinity;
  let maxPrice = -Infinity;

  products.forEach((product) => {
    // Extract options (e.g., Size, Color, Material)
    if (product.options) {
      product.options.forEach((option) => {
        if (!option.values) return;

        if (!optionsMap.has(option.title)) {
          optionsMap.set(option.title, new Set());
        }

        const optionValues = optionsMap.get(option.title)!;
        option.values.forEach((val) => {
          optionValues.add(val.value);
        });
      });
    }

    // Extract tags
    if (product.tags) {
      product.tags.forEach((tag) => {
        if (!tagsMap.has(tag.id)) {
          tagsMap.set(tag.id, tag);
        }
      });
    }

    // Calculate price range
    if (product.variants) {
      product.variants.forEach((variant) => {
        const price =
          variant.calculated_price?.calculated_amount ||
          variant.prices?.[0]?.amount ||
          0;

        if (price > 0) {
          minPrice = Math.min(minPrice, price);
          maxPrice = Math.max(maxPrice, price);
        }
      });
    }
  });

  // Convert options map to array
  const availableOptions = Array.from(optionsMap.entries())
    .map(([name, values]) => ({
      name,
      values: Array.from(values).sort((a, b) => a.localeCompare(b, "mn")),
    }))
    // Sort by common option order (Size, Color, Material, etc.)
    .sort((a, b) => {
      const orderMap: Record<string, number> = {
        Size: 1,
        "Хэмжээ": 1,
        Color: 2,
        "Өнгө": 2,
        Material: 3,
        "Материал": 3,
        Storage: 4,
        "Санах ой": 4,
        Memory: 4,
      };

      const orderA = orderMap[a.name] || 999;
      const orderB = orderMap[b.name] || 999;

      if (orderA !== orderB) {
        return orderA - orderB;
      }

      return a.name.localeCompare(b.name, "mn");
    });

  return {
    availableOptions,
    tags: Array.from(tagsMap.values()),
    priceRange: {
      min: minPrice === Infinity ? 0 : minPrice,
      max: maxPrice === -Infinity ? 0 : maxPrice,
    },
  };
}

/**
 * Filter products based on selected options
 */
export function filterProducts<T extends Product>(
  products: T[],
  filters: {
    options?: Record<string, string[]>;
    tags?: string[];
    priceMin?: number | null;
    priceMax?: number | null;
  }
): T[] {
  return products.filter((product) => {
    // Filter by options (e.g., Size, Color)
    if (filters.options && Object.keys(filters.options).length > 0) {
      const hasMatchingOption = Object.entries(filters.options).every(
        ([optionName, selectedValues]) => {
          if (selectedValues.length === 0) return true;

          const productOption = product.options?.find(
            (opt) => opt.title === optionName
          );
          if (!productOption?.values) return false;

          return productOption.values.some((val) =>
            selectedValues.includes(val.value)
          );
        }
      );

      if (!hasMatchingOption) return false;
    }

    // Filter by tags
    if (filters.tags && filters.tags.length > 0) {
      const productTags = product.tags?.map((t) => t.value) || [];
      const hasMatchingTag = filters.tags.some((tag) =>
        productTags.includes(tag)
      );

      if (!hasMatchingTag) return false;
    }

    // Filter by price range
    if (filters.priceMin !== null || filters.priceMax !== null) {
      const variant = product.variants?.[0];
      const price =
        variant?.calculated_price?.calculated_amount ||
        variant?.prices?.[0]?.amount ||
        0;

      if (filters.priceMin !== undefined && filters.priceMin !== null && price < filters.priceMin) return false;
      if (filters.priceMax !== undefined && filters.priceMax !== null && price > filters.priceMax) return false;
    }

    return true;
  });
}
