"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, SlidersHorizontal, X, Loader2 } from "lucide-react";
import { ProductCard } from "@/components/products/ProductCard";
import { useRouter } from "next/navigation";

interface SearchHit {
  id: string;
  title: string;
  handle: string;
  description?: string | null;
  thumbnail?: string | null;
  collection_title?: string | null;
  category_names?: string[];
  min_price?: number;
  max_price?: number;
  variants?: {
    id: string;
    title: string;
    prices?: {
      amount: number;
      currency_code: string;
    }[];
  }[];
}

interface SearchResult {
  hits: SearchHit[];
  query: string;
  processingTimeMs: number;
  estimatedTotalHits?: number;
  limit?: number;
  offset?: number;
}

interface SearchResultsProps {
  initialQuery: string;
}

const SORT_OPTIONS = [
  { value: "", label: "Хамааралтай" },
  { value: "min_price:asc", label: "Үнэ: Бага → Их" },
  { value: "min_price:desc", label: "Үнэ: Их → Бага" },
  { value: "title:asc", label: "Нэр: А → Я" },
  { value: "title:desc", label: "Нэр: Я → А" },
];

export function SearchResults({ initialQuery }: SearchResultsProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sort, setSort] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const performSearch = useCallback(async (searchQuery: string, sortOption: string = "", offset: number = 0) => {
    if (!searchQuery.trim()) {
      setResults(null);
      return;
    }

    setIsLoading(true);
    try {
      let url = `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/search?q=${encodeURIComponent(searchQuery)}&limit=20&offset=${offset}`;
      if (sortOption) {
        url += `&sort=${encodeURIComponent(sortOption)}`;
      }
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setResults(data);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial search on mount
  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery, sort);
    }
  }, [initialQuery, sort, performSearch]);

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      performSearch(query, sort);
    }
  };

  // Transform hits to ProductCard format
  const transformHitToProduct = (hit: SearchHit) => ({
    id: hit.variants?.[0]?.id ?? hit.id,
    title: hit.title,
    handle: hit.handle,
    thumbnail: hit.thumbnail || undefined,
    price: hit.min_price
      ? {
          amount: hit.min_price,
          currencyCode: "mnt",
        }
      : undefined,
    collection: hit.collection_title 
      ? {
          id: "",
          title: hit.collection_title,
          handle: "",
        }
      : null,
  });

  return (
    <div className="space-y-8">
      {/* Search Input */}
      <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Бүтээгдэхүүн хайх..."
          className="w-full pl-14 pr-32 py-4 text-lg bg-white rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent shadow-sm"
        />
        <button
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-2 bg-foreground text-white rounded-xl font-medium hover:bg-foreground/90 transition-colors"
        >
          Хайх
        </button>
      </form>

      {/* Filters & Sort Bar */}
      {results && results.hits.length > 0 && (
        <div className="flex items-center justify-between gap-4 bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                showFilters 
                  ? "bg-foreground text-white border-foreground" 
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="text-sm font-medium">Шүүлтүүр</span>
            </button>
            <p className="text-sm text-gray-500">
              {results.estimatedTotalHits || results.hits.length} илэрц олдлоо
              <span className="text-gray-400 ml-2">({results.processingTimeMs}ms)</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Эрэмбэлэх:</label>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                performSearch(query, e.target.value);
              }}
              className="px-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-xl p-6 shadow-sm animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Шүүлтүүр</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-gray-500">
            Нэмэлт шүүлтүүрүүд удахгүй нэмэгдэнэ...
          </p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
        </div>
      )}

      {/* Results Grid */}
      {!isLoading && results && results.hits.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {results.hits.map((hit) => {
            const product = transformHitToProduct(hit);
            return (
              <ProductCard
                key={hit.id}
                id={product.id}
                title={product.title}
                handle={product.handle}
                thumbnail={product.thumbnail}
                price={product.price}
                collection={product.collection}
              />
            );
          })}
        </div>
      )}

      {/* No Results */}
      {!isLoading && results && results.hits.length === 0 && query && (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
            <Search className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Илэрц олдсонгүй
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            &ldquo;{query}&rdquo; гэсэн хайлтаар бүтээгдэхүүн олдсонгүй. 
            Өөр түлхүүр үгээр хайж үзнэ үү.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {["iPhone", "MacBook", "iPad", "AirPods"].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => {
                  setQuery(suggestion);
                  router.push(`/search?q=${encodeURIComponent(suggestion)}`);
                  performSearch(suggestion, sort);
                }}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty State (No Query) */}
      {!isLoading && !results && !query && (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-linear-to-br from-accent/20 to-accent/30 flex items-center justify-center">
            <Search className="w-10 h-10 text-accent" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Юу хайх вэ?
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Дээрх хайлтын талбарт бүтээгдэхүүний нэр, категори, 
            эсвэл түлхүүр үг оруулна уу.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {["iPhone 16", "MacBook Pro", "iPad Air", "AirPods Pro", "Apple Watch"].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => {
                  setQuery(suggestion);
                  router.push(`/search?q=${encodeURIComponent(suggestion)}`);
                  performSearch(suggestion, sort);
                }}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
