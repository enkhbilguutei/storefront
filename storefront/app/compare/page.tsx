"use client";

import { useComparisonStore } from "@/lib/store/comparison-store";
import { HeaderClient } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CloudinaryImage } from "@/components/Cloudinary";
import { X, ShoppingBag, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { medusa } from "@/lib/medusa";
import { useCartStore, useUIStore } from "@/lib/store";
import { addToCart } from "@/lib/cart/addToCart";

interface ProductDetails {
  id: string;
  title: string;
  handle: string;
  description?: string | null;
  thumbnail?: string | null;
  variants?: Array<{
    id: string;
    title?: string;
    options?: Array<{
      option_id: string;
      value: string;
    }>;
    prices?: Array<{
      amount: number;
      currency_code: string;
    }>;
    calculated_price?: {
      calculated_amount: number;
      currency_code: string;
    };
    inventory_quantity: number;
  }>;
  options?: Array<{
    id: string;
    title: string;
    values?: Array<{
      id: string;
      value: string;
    }>;
  }>;
}

export default function ComparePage() {
  const { products, removeProduct, clearAll } = useComparisonStore();
  const [productDetails, setProductDetails] = useState<(ProductDetails | null)[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addItem } = useCartStore();
  const { openCartNotification } = useUIStore();
  const [addingToCart, setAddingToCart] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchProductDetails = async () => {
      setIsLoading(true);
      try {
        const details = await Promise.all(
          products.map(async (product) => {
            try {
              const response = await medusa.store.product.retrieve(product.id, {
                fields: "+variants.inventory_quantity,+variants.options,+variants.prices,+variants.calculated_price,+options.values",
              });
              return response.product;
            } catch (error) {
              console.error(`Failed to fetch product ${product.id}:`, error);
              return null;
            }
          })
        );
        setProductDetails(details as (ProductDetails | null)[]);
      } catch (error) {
        console.error("Failed to fetch product details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (products.length > 0) {
      fetchProductDetails();
    } else {
      setIsLoading(false);
    }
  }, [products]);

  const formatPrice = (amount: number) => {
    const formatted = new Intl.NumberFormat("mn-MN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
    
    return `₮${formatted}`;
  };

  const handleAddToCart = async (variantId: string, productId: string, title: string, thumbnail?: string | null, unitPrice: number = 0, handle: string = "") => {
    setAddingToCart({ ...addingToCart, [variantId]: true });
    try {
      const { cartId, setCartId, syncCart, addItem, openCartNotification } = useCartStore.getState();
      
      await addToCart({
        variantId,
        quantity: 1,
        productInfo: {
          id: productId,
          title,
          thumbnail,
          handle,
          unitPrice,
        },
        currentCartId: cartId,
        setCartId,
        syncCart,
        addItem,
        openCartNotification,
      });
    } catch (error) {
      console.error('Failed to add item to cart:', error);
    } finally {
      setAddingToCart({ ...addingToCart, [variantId]: false });
    }
  };

  // Extract all unique spec categories from all products
  const getComparisonRows = () => {
    const rows: Array<{
      label: string;
      values: (string | number | boolean | null)[];
    }> = [];

    // Price row
    rows.push({
      label: "Үнэ",
      values: products.map((product) => {
        const detail = productDetails.find(d => d?.id === product.id);
        const variant = detail?.variants?.find(v => v.id === product.variantId);
        const price = variant?.calculated_price?.calculated_amount ?? variant?.prices?.[0]?.amount;
        return price ? formatPrice(price) : "—";
      }),
    });

    // Stock availability
    rows.push({
      label: "Боломжит эсэх",
      values: products.map((product) => {
        const detail = productDetails.find(d => d?.id === product.id);
        const variant = detail?.variants?.find(v => v.id === product.variantId);
        return variant && variant.inventory_quantity > 0 ? "Бэлэн байгаа" : "Дууссан";
      }),
    });

    // Options (Color, Storage, etc.)
    const allOptions = new Set<string>();
    productDetails.forEach((detail) => {
      detail?.options?.forEach((option) => {
        allOptions.add(option.title);
      });
    });

    allOptions.forEach((optionTitle) => {
      rows.push({
        label: optionTitle,
        values: products.map((product) => {
          const detail = productDetails.find(d => d?.id === product.id);
          const variant = detail?.variants?.find(v => v.id === product.variantId);
          const option = variant?.options?.find(o => {
            const productOption = detail?.options?.find(po => po.id === o.option_id);
            return productOption?.title === optionTitle;
          });
          return option?.value ?? "—";
        }),
      });
    });

    // Description row
    rows.push({
      label: "Тайлбар",
      values: productDetails.map((detail) => detail?.description ?? "—"),
    });

    return rows;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <HeaderClient categories={[]} />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-3 text-gray-600">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
            <span>Ачааллаж байна...</span>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <HeaderClient categories={[]} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              Харьцуулах бүтээгдэхүүн алга
            </h2>
            <p className="text-gray-600 mb-8">
              Бүтээгдэхүүнүүдийг харьцуулахын тулд эхлээд тэдгээрийг сонгоно уу
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-full font-medium hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Бүтээгдэхүүн үзэх
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const comparisonRows = getComparisonRows();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <HeaderClient categories={[]} />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-3 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Буцах
              </Link>
              <h1 className="text-3xl md:text-4xl font-semibold text-gray-900">
                Бүтээгдэхүүн харьцуулах
              </h1>
              <p className="text-gray-600 mt-2">
                {products.length} бүтээгдэхүүнийг харьцуулж байна
              </p>
            </div>

            <button
              onClick={clearAll}
              className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
            >
              Бүгдийг устгах
            </button>
          </div>

          {/* Comparison Table */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Product Headers */}
            <div className="grid gap-4 p-6 bg-gray-50 border-b border-gray-200" style={{ gridTemplateColumns: `200px repeat(${products.length}, 1fr)` }}>
              <div className="font-semibold text-gray-900">Харьцуулалт</div>
              {products.map((product) => {
                return (
                  <div key={product.variantId} className="relative">
                    <button
                      onClick={() => removeProduct(product.variantId)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors z-10"
                      aria-label="Хасах"
                    >
                      <X className="w-3 h-3" />
                    </button>

                    <Link href={`/products/${product.handle}`} className="block group">
                      <div className="aspect-square bg-white rounded-lg mb-3 overflow-hidden border border-gray-200 p-4 group-hover:border-blue-500 transition-colors">
                        {product.thumbnail ? (
                          <CloudinaryImage
                            src={product.thumbnail}
                            alt={product.title}
                            width={300}
                            height={300}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100" />
                        )}
                      </div>
                      <h3 className="font-medium text-gray-900 text-sm line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {product.title}
                      </h3>
                    </Link>

                    <button
                      onClick={() => handleAddToCart(product.variantId, product.id, product.title, product.thumbnail)}
                      disabled={addingToCart[product.variantId]}
                      className="w-full mt-3 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {addingToCart[product.variantId] ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4" />
                          Сагсанд нэмэх
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Comparison Rows */}
            <div className="divide-y divide-gray-200">
              {comparisonRows.map((row, index) => (
                <div
                  key={index}
                  className="grid gap-4 p-6 hover:bg-gray-50 transition-colors"
                  style={{ gridTemplateColumns: `200px repeat(${products.length}, 1fr)` }}
                >
                  <div className="font-medium text-gray-700">{row.label}</div>
                  {row.values.map((value, i) => (
                    <div key={i} className="text-gray-900">
                      {row.label === "Тайлбар" ? (
                        <p className="text-sm line-clamp-3">{value?.toString() ?? "—"}</p>
                      ) : (
                        <span className={row.label === "Боломжит эсэх" ? (value === "Бэлэн байгаа" ? "text-green-600 font-medium" : "text-red-600") : ""}>
                          {value?.toString() ?? "—"}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
