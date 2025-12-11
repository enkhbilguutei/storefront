"use client";

import { useComparisonStore } from "@/lib/store/comparison-store";
import { CloudinaryImage } from "@/components/Cloudinary";
import { X, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export function ComparisonBar() {
  const { products, removeProduct, clearAll, isBarVisible, setBarVisible } = useComparisonStore();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted || !isBarVisible || products.length === 0) {
    return null;
  }

  const formatPrice = (amount: number) => {
    const formatted = new Intl.NumberFormat("mn-MN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
    
    return `₮${formatted}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-2xl z-40 animate-slide-up">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Products List */}
          <div className="flex items-center gap-3 flex-1 overflow-x-auto no-scrollbar">
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Харьцуулах ({products.length}/4):
            </span>
            
            <div className="flex gap-3">
              {products.map((product) => (
                <div
                  key={product.variantId}
                  className="relative flex items-center gap-2 bg-gray-50 rounded-lg p-2 pr-8 border border-gray-200 group hover:border-blue-500 transition-colors"
                >
                  <div className="w-12 h-12 bg-white rounded-md overflow-hidden shrink-0">
                    {product.thumbnail ? (
                      <CloudinaryImage
                        src={product.thumbnail}
                        alt={product.title}
                        width={48}
                        height={48}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100" />
                    )}
                  </div>
                  
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-medium text-gray-900 truncate max-w-[120px]">
                      {product.title}
                    </span>
                    {product.price && (
                      <span className="text-xs text-gray-600">
                        {formatPrice(product.price.amount)}
                      </span>
                    )}
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={() => removeProduct(product.variantId)}
                    className="absolute top-1 right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-red-50 hover:text-red-600 transition-colors"
                    aria-label="Хасах"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              
              {/* Empty slots */}
              {Array.from({ length: 4 - products.length }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="w-[200px] h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-xs text-gray-400"
                >
                  Бүтээгдэхүүн нэмэх
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={clearAll}
              className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Бүгдийг устгах
            </button>
            
            <Link
              href="/compare"
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-full font-medium hover:bg-blue-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Харьцуулах
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              onClick={() => setBarVisible(false)}
              className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Хаах"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
