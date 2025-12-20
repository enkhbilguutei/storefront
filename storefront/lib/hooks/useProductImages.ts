import { useMemo } from "react";

interface ProductImage {
  id: string;
  url: string;
}

interface ProductVariant {
  id: string;
  options?: { id: string; option_id?: string | null; value: string }[] | null;
  images?: ProductImage[] | null;
  thumbnail?: string | null;
}

interface Product {
  id: string;
  title: string;
  handle: string;
  thumbnail?: string | null;
  images?: ProductImage[] | null;
  variants?: ProductVariant[] | null;
}

interface UseProductImagesProps {
  product: Product;
  selectedVariant: ProductVariant | null;
  colorOptionId: string | null;
  selectedColor: string | null;
}

export function useProductImages({
  product,
  selectedVariant,
  colorOptionId,
  selectedColor,
}: UseProductImagesProps) {
  const allImages = useMemo(() => {
    const images: ProductImage[] = [];
    const addedUrls = new Set<string>();

    const addImage = (id: string, url: string) => {
      if (url && !addedUrls.has(url)) {
        addedUrls.add(url);
        images.push({ id, url });
      }
    };

    // If there's a selected color, show images for that color
    if (colorOptionId && selectedColor) {
      const colorVariants =
        product.variants?.filter((v) =>
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
  }, [product, selectedVariant, colorOptionId, selectedColor]);

  const getThumbnailForColorValue = (optionId: string, colorValue: string) => {
    const variantWithThumbnail = product.variants?.find((v) => {
      const hasColor = v.options?.some(
        (opt) => opt.option_id === optionId && opt.value === colorValue
      );
      return hasColor && v.thumbnail;
    });

    return variantWithThumbnail?.thumbnail || product.thumbnail;
  };

  return {
    allImages,
    getThumbnailForColorValue,
  };
}
