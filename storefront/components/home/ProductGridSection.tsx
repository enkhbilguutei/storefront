"use client";

import { ProductCard } from "@/components/products/ProductCard";
import { ChevronRight } from "lucide-react";
import { useState } from "react";

interface Product {
  id: string;
  title: string;
  handle: string;
  thumbnail?: string;
  price?: {
    amount: number;
    currencyCode: string;
  };
  originalPrice?: {
    amount: number;
    currencyCode: string;
  };
  badge?: "Best Seller" | "Recommended" | "New Arrival" | "Trending" | "Featured" | null;
  soldCount?: number;
}

interface ProductGridSectionProps {
  title: string;
  subtitle?: string;
  products: Product[];
  tabs?: string[];
  viewAllLink?: string;
}

export function ProductGridSection({ title, subtitle, products, tabs, viewAllLink }: ProductGridSectionProps) {
  const [activeTab, setActiveTab] = useState(tabs?.[0] || "");
  
  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">{title}</h2>
            {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
          </div>
          {viewAllLink && (
            <a href={viewAllLink} className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1">
              Бүгдийг үзэх <ChevronRight className="h-4 w-4" />
            </a>
          )}
        </div>

        {/* Category Tabs */}
        {tabs && tabs.length > 0 && (
          <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide pb-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>
    </section>
  );
}
