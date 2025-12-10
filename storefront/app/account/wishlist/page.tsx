"use client";

import { Heart, ShoppingBag, X, Loader2 } from "lucide-react";
import Link from "next/link";
import { useWishlistStore } from "@/lib/store/wishlist-store";
import { useEffect, useState } from "react";
import { medusa } from "@/lib/medusa";
import { CloudinaryImage } from "@/components/Cloudinary";
import { useCartStore, useUIStore } from "@/lib/store";

interface ProductDetails {
  id: string;
  title: string;
  handle: string;
  thumbnail?: string;
  variants?: Array<{
    id: string;
    title?: string;
    prices?: Array<{
      amount: number;
      currency_code: string;
    }>;
    calculated_price?: {
      calculated_amount: number;
      original_amount: number;
      currency_code: string;
    };
  }>;
}

export default function WishlistPage() {
  const { items: wishlistItems, removeItem, isLoading } = useWishlistStore();
  const { addItem } = useCartStore();
  const { openCartNotification } = useUIStore();
  const [products, setProducts] = useState<Map<string, ProductDetails>>(new Map());
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());
  const [addingToCart, setAddingToCart] = useState<Set<string>>(new Set());
  
  // Fetch product details for wishlist items
  useEffect(() => {
    async function fetchProducts() {
      if (wishlistItems.length === 0) {
        setLoadingProducts(false);
        return;
      }
      
      try {
        const productMap = new Map<string, ProductDetails>();
        
        // Fetch all products in parallel
        const productPromises = wishlistItems.map(async (item) => {
          try {
            const { product } = await medusa.store.product.retrieve(item.product_id);
            productMap.set(item.product_id, product as ProductDetails);
          } catch (error) {
            console.error(`Failed to fetch product ${item.product_id}:`, error);
          }
        });
        
        await Promise.all(productPromises);
        setProducts(productMap);
      } catch (error) {
        console.error('Failed to fetch wishlist products:', error);
      } finally {
        setLoadingProducts(false);
      }
    }
    
    fetchProducts();
  }, [wishlistItems]);
  
  const handleRemove = async (itemId: string) => {
    setRemovingItems(prev => new Set([...prev, itemId]));
    try {
      await removeItem(itemId);
    } catch (error) {
      console.error('Failed to remove item:', error);
    } finally {
      setRemovingItems(prev => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };
  
  const handleAddToCart = async (item: typeof wishlistItems[0], product: ProductDetails) => {
    setAddingToCart(prev => new Set([...prev, item.id]));
    try {
      const variant = item.variant_id 
        ? product.variants?.find(v => v.id === item.variant_id)
        : product.variants?.[0];
      
      if (!variant) {
        throw new Error('Variant not found');
      }
      
      await addItem({
        id: `temp-${Date.now()}`,
        variantId: variant.id,
        productId: product.id,
        title: product.title,
        quantity: 1,
        thumbnail: product.thumbnail,
        unitPrice: variant.prices?.[0]?.amount || 0,
        handle: product.handle,
      });
      openCartNotification();
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setAddingToCart(prev => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  };
  
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("mn-MN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  if (isLoading || loadingProducts) {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <h2 className="font-semibold text-foreground">Хүслийн жагсаалт</h2>
          <p className="text-secondary text-sm">Дуртай бүтээгдэхүүнүүдээ хадгалаарай</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <h2 className="font-semibold text-foreground">Хүслийн жагсаалт</h2>
        <p className="text-secondary text-sm">
          {wishlistItems.length > 0 
            ? `${wishlistItems.length} бүтээгдэхүүн хадгалагдсан` 
            : "Дуртай бүтээгдэхүүнүүдээ хадгалаарай"}
        </p>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-5">
              <Heart className="h-8 w-8 text-gray-400" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">Хүслийн жагсаалт хоосон</h2>
            <p className="text-secondary text-sm mb-6 max-w-xs mx-auto">
              Бүтээгдэхүүн дээрх зүрхэн товчийг дарж хүслийн жагсаалтдаа нэмээрэй.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-foreground text-background text-sm rounded-lg hover:bg-foreground/90 transition-colors"
            >
              <ShoppingBag className="h-4 w-4" />
              Бүтээгдэхүүн үзэх
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {wishlistItems.map((item) => {
            const product = products.get(item.product_id);
            if (!product) return null;
            
            const variant = item.variant_id
              ? product.variants?.find(v => v.id === item.variant_id)
              : product.variants?.[0];
            
            const price = variant?.calculated_price?.calculated_amount || variant?.prices?.[0]?.amount || 0;
            const originalPrice = variant?.calculated_price?.original_amount;
            const isOnSale = originalPrice && price < originalPrice;
            
            return (
              <div key={item.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden group hover:shadow-lg transition-shadow">
                <Link href={`/products/${product.handle}`} className="block relative aspect-square bg-gray-50">
                  <CloudinaryImage
                    src={product.thumbnail}
                    alt={product.title}
                    width={400}
                    height={400}
                    className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform"
                  />
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleRemove(item.id);
                    }}
                    disabled={removingItems.has(item.id)}
                    className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50"
                  >
                    {removingItems.has(item.id) ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <X className="w-4 h-4" />
                    )}
                  </button>
                </Link>
                <div className="p-4">
                  <Link href={`/products/${product.handle}`}>
                    <h3 className="font-medium text-foreground text-sm mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                      {product.title}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg font-semibold text-foreground">
                      ₮{formatPrice(price)}
                    </span>
                    {isOnSale && originalPrice && (
                      <span className="text-sm text-gray-500 line-through">
                        ₮{formatPrice(originalPrice)}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleAddToCart(item, product)}
                    disabled={addingToCart.has(item.id)}
                    className="w-full py-2 px-4 bg-foreground text-background text-sm rounded-lg hover:bg-foreground/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {addingToCart.has(item.id) ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        Сагсанд нэмэх
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info Card */}
      <div className="bg-linear-to-br from-pink-50 to-red-50 rounded-xl border border-pink-100 p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0">
            <Heart className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <h3 className="font-medium text-foreground text-sm mb-1">Хүслийн жагсаалтын тухай</h3>
            <p className="text-xs text-secondary">
              Бүтээгдэхүүнийг хүслийн жагсаалтад нэмснээр үнэ буурах, нөөц дуусахаас өмнө мэдэгдэл авах боломжтой.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
