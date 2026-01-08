"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, Loader2 } from "lucide-react";
import Link from "next/link";
import { useUIStore } from "@/lib/store";
import { CloudinaryImage } from "@/components/Cloudinary";
import { toast } from "@/lib/toast";
import { API_KEY, API_URL } from "@/lib/config/api";

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
}

interface SuggestionHit {
  title: string;
  handle: string;
  thumbnail?: string | null;
  min_price?: number | null;
  collection_title?: string | null;
}

const POPULAR_SEARCHES = ["iPhone 16 Pro", "MacBook Pro", "Galaxy S24", "PlayStation 5", "Ray-Ban Meta"];

function formatPrice(amount: number, currencyCode: string = "mnt") {
  return new Intl.NumberFormat("mn-MN", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function SearchModal() {
  const { isSearchOpen, closeSearch } = useUIStore();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recommendedProducts, setRecommendedProducts] = useState<SearchHit[]>([]);
  const [popularSearches, setPopularSearches] = useState<string[]>(POPULAR_SEARCHES);
  const [suggestions, setSuggestions] = useState<SuggestionHit[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch recommended products + popular searches on mount
  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const response = await fetch(`${API_URL}/store/search/popular`);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data?.terms) && data.terms.length) {
            setPopularSearches(data.terms);
          }
          if (Array.isArray(data?.featured) && data.featured.length) {
            setRecommendedProducts(data.featured);
          }
        }
      } catch (error) {
        // Silently fail - not critical
      }
    };

    const fetchRecommended = async () => {
      if (typeof window === "undefined") return;

      const backendUrl = API_URL;
      const publishableKey = API_KEY;

      try {
        const response = await fetch(
          `${backendUrl}/store/search?q=&limit=4`,
          {
            headers: {
              "x-publishable-api-key": publishableKey || "",
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          if (!data?.hits?.length) return;
          setRecommendedProducts(data.hits || []);
        }
      } catch (error) {
        console.error("Failed to fetch recommended products:", error);
      }
    };

    fetchPopular();
    fetchRecommended();
  }, []);

  // Focus input when modal opens
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setQuery("");
      setResults(null);
      setSelectedIndex(-1);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSearchOpen]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isSearchOpen) {
        closeSearch();
      }
      // Cmd/Ctrl + K to open search
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        useUIStore.getState().toggleSearch();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen, closeSearch]);

  // Search function
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults(null);
      return;
    }

    const backendUrl = API_URL;
    const publishableKey = API_KEY;

    setIsLoading(true);
    try {
      const response = await fetch(
        `${backendUrl}/store/search?q=${encodeURIComponent(searchQuery)}&limit=8`,
        {
          headers: {
            "x-publishable-api-key": publishableKey || "",
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setResults(data);
      } else {
        toast.error("Хайлт хийхэд алдаа гарлаа. Дахин оролдоно уу.");
      }
    } catch (error) {
      toast.error("Хайлт хийхэд алдаа гарлаа. Дахин оролдоно уу.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    const backendUrl = API_URL;
    const publishableKey = API_KEY;
    setIsSuggesting(true);

    try {
      const response = await fetch(
        `${backendUrl}/store/search/suggestions?q=${encodeURIComponent(searchQuery)}&limit=6`,
        {
          headers: {
            "x-publishable-api-key": publishableKey || "",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      // Silently fail for suggestions
    } finally {
      setIsSuggesting(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      if (query.trim().length >= 2) {
        performSearch(query);
        fetchSuggestions(query);
      } else {
        setResults(null);
        setSuggestions([]);
      }
    }, 220);
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, performSearch, fetchSuggestions]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const items = results?.hits || recommendedProducts;
    if (!items.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => (prev < items.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : items.length - 1));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      const hit = items[selectedIndex];
      closeSearch();
      window.location.href = `/products/${hit.handle}`;
    }
  };

  // Handle click outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      closeSearch();
    }
  };

  if (!isSearchOpen) return null;

  // Products to display - search results or recommended
  const displayProducts = results?.hits || recommendedProducts;

  return (
    <div 
      className="fixed inset-0 z-100 bg-black/60 animate-in fade-in duration-150"
      onClick={handleBackdropClick}
    >
      {/* Desktop: Half page from top / Mobile: Full page */}
      <div 
        ref={modalRef}
        className="w-full bg-white animate-in slide-in-from-top duration-200 
                   h-full lg:h-auto lg:max-h-[55vh] overflow-hidden"
      >
        {/* Search Header */}
        <div className="border-b border-gray-200">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 sm:gap-4 py-4 sm:py-5 lg:py-6">
              <Search className="h-5 w-5 sm:h-6 sm:w-6 text-foreground/50 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Бүтээгдэхүүн, брэнд, ангилал хайх"
                className="flex-1 text-lg sm:text-xl lg:text-2xl font-light bg-transparent focus:outline-none placeholder:text-foreground/40"
              />
              {isLoading ? (
                <Loader2 className="h-5 w-5 text-foreground/40 animate-spin shrink-0" />
              ) : (
                <button
                  onClick={closeSearch}
                  className="p-1.5 sm:p-2 text-foreground/60 hover:text-foreground rounded-full hover:bg-foreground/5 transition-colors shrink-0"
                >
                  <X className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 lg:py-8 overflow-y-auto h-[calc(100%-65px)] sm:h-[calc(100%-75px)] lg:h-auto lg:max-h-[calc(55vh-90px)]">
          {/* Suggestions bar */}
          {suggestions.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {suggestions.map((item) => (
                <button
                  key={`${item.handle}`}
                  onClick={() => {
                    setQuery(item.title);
                    closeSearch();
                    window.location.href = `/products/${item.handle}`;
                  }}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-sm"
                >
                  <span className="font-medium text-foreground">{item.title}</span>
                  {item.min_price ? (
                    <span className="text-foreground/60 text-xs">{formatPrice(item.min_price)}</span>
                  ) : null}
                </button>
              ))}
              {isSuggesting && <Loader2 className="h-4 w-4 animate-spin text-foreground/40" />}
            </div>
          )}

          {/* Mobile/Tablet Layout: Stacked */}
          <div className="lg:hidden space-y-6 sm:space-y-8">
            {/* Popular Searches */}
            {!query && (
              <div>
                <h3 className="text-[10px] sm:text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-3 sm:mb-4">
                  ИХ ХАЙЛДАГ
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  {popularSearches.map((search) => (
                    <button
                      key={search}
                      onClick={() => setQuery(search)}
                      className="block text-sm sm:text-base font-semibold text-foreground hover:text-foreground/70 transition-colors"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Products */}
            <div>
              <h3 className="text-[10px] sm:text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-3 sm:mb-4">
                {query ? `ҮР ДҮН (${results?.estimatedTotalHits || displayProducts.length})` : "САНАЛ БОЛГОЖ БУЙ"}
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {displayProducts.map((product, index) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.handle}`}
                    onClick={closeSearch}
                    className={`group ${selectedIndex === index ? 'ring-2 ring-foreground/20 rounded-xl' : ''}`}
                  >
                    <div className="aspect-[4/5] bg-gray-50 rounded-xl overflow-hidden mb-2 sm:mb-3 flex items-center justify-center">
                      {product.thumbnail ? (
                        product.thumbnail.includes("cloudinary") ? (
                          <CloudinaryImage
                            src={product.thumbnail}
                            alt={product.title}
                            width={220}
                            height={220}
                            className="h-3/4 w-3/4 object-contain transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.thumbnail}
                            alt={product.title}
                            className="h-3/4 w-3/4 object-contain transition-transform duration-300 group-hover:scale-105"
                          />
                        )
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-foreground/20">
                          <Search className="w-6 h-6 sm:w-8 sm:h-8" />
                        </div>
                      )}
                    </div>
                    <h4 className="text-xs sm:text-sm font-medium text-foreground line-clamp-2 mb-0.5 sm:mb-1">
                      {product.title}
                    </h4>
                    {product.min_price !== undefined && product.min_price > 0 && (
                      <p className="text-xs sm:text-sm text-foreground/70">
                        {formatPrice(product.min_price)}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </div>

            {/* No Results */}
            {results && results.hits.length === 0 && query && (
              <div className="text-center py-6 sm:py-8">
                <Search className="w-10 h-10 sm:w-12 sm:h-12 text-foreground/20 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-foreground mb-1 sm:mb-2">
                  Илэрц олдсонгүй
                </h3>
                <p className="text-xs sm:text-sm text-foreground/50">
                  &ldquo;{query}&rdquo; гэсэн хайлтаар илэрц олдсонгүй
                </p>
              </div>
            )}
          </div>

          {/* Desktop Layout: Side by side */}
          <div className="hidden lg:flex gap-8 xl:gap-12">
            {/* Left Column - Popular Searches */}
            {!query && (
              <div className="w-40 xl:w-48 shrink-0">
                <h3 className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-3 xl:mb-4">
                  ИХ ХАЙЛДАГ
                </h3>
                <div className="space-y-2 xl:space-y-3">
                  {popularSearches.map((search) => (
                    <button
                      key={search}
                      onClick={() => setQuery(search)}
                      className="block text-sm xl:text-base font-semibold text-foreground hover:text-foreground/70 transition-colors"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Right Column - Products */}
            <div className="flex-1">
              <h3 className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-3 xl:mb-4">
                {query ? `ҮР ДҮН (${results?.estimatedTotalHits || displayProducts.length})` : "САНАЛ БОЛГОЖ БУЙ"}
              </h3>
              
              {/* No Results */}
              {results && results.hits.length === 0 && query ? (
                <div className="text-center py-10 xl:py-12">
                  <Search className="w-10 h-10 xl:w-12 xl:h-12 text-foreground/20 mx-auto mb-3 xl:mb-4" />
                  <h3 className="text-base xl:text-lg font-medium text-foreground mb-1 xl:mb-2">
                    Илэрц олдсонгүй
                  </h3>
                  <p className="text-xs xl:text-sm text-foreground/50">
                    &ldquo;{query}&rdquo; гэсэн хайлтаар илэрц олдсонгүй
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 xl:grid-cols-4 gap-4 xl:gap-6">
                  {displayProducts.slice(0, 4).map((product, index) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.handle}`}
                      onClick={closeSearch}
                      className={`group ${selectedIndex === index ? 'ring-2 ring-foreground/20 rounded-xl' : ''}`}
                    >
                      <div className="aspect-[4/5] bg-gray-50 rounded-xl overflow-hidden mb-2 xl:mb-3 flex items-center justify-center">
                        {product.thumbnail ? (
                          product.thumbnail.includes("cloudinary") ? (
                            <CloudinaryImage
                              src={product.thumbnail}
                              alt={product.title}
                              width={200}
                              height={200}
                              className="h-3/4 w-3/4 object-contain group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={product.thumbnail}
                              alt={product.title}
                              className="h-3/4 w-3/4 object-contain group-hover:scale-105 transition-transform duration-300"
                            />
                          )
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-foreground/20">
                            <Search className="w-6 h-6 xl:w-8 xl:h-8" />
                          </div>
                        )}
                      </div>
                      <h4 className="text-xs xl:text-sm font-medium text-foreground line-clamp-2 mb-0.5 xl:mb-1">
                        {product.title}
                      </h4>
                      {product.min_price !== undefined && product.min_price > 0 && (
                        <p className="text-xs xl:text-sm text-foreground/70">
                          {formatPrice(product.min_price)}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              )}

              {/* View All Results Link */}
              {results && results.estimatedTotalHits && results.estimatedTotalHits > 4 && (
                <div className="mt-4 xl:mt-6">
                  <Link
                    href={`/products?search=${encodeURIComponent(query)}`}
                    onClick={closeSearch}
                    className="text-xs xl:text-sm font-medium text-blue-600 hover:underline"
                  >
                    Бүх илэрц үзэх ({results.estimatedTotalHits}) →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
