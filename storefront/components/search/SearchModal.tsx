"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, ArrowRight, Loader2, Clock, TrendingUp, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useUIStore } from "@/lib/store";
import { CloudinaryImage } from "@/components/Cloudinary";

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

const POPULAR_SEARCHES = ["iPhone", "MacBook", "iPad", "AirPods", "Watch"];
const RECENT_SEARCHES_KEY = "alimhan_recent_searches";

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
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch {
        setRecentSearches([]);
      }
    }
  }, []);

  // Save recent searches to localStorage
  const saveRecentSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return;
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  }, [recentSearches]);

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

    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/search?q=${encodeURIComponent(searchQuery)}&limit=8`,
        {
          headers: {
            "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
          },
        }
      );
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

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      performSearch(query);
    }, 200);
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, performSearch]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!results?.hits.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => (prev < results.hits.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : results.hits.length - 1));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      const hit = results.hits[selectedIndex];
      saveRecentSearch(query);
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

  return (
    <div 
      className="fixed inset-0 z-100 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      <div className="flex items-start justify-center pt-[10vh] px-4">
        <div 
          ref={modalRef}
          className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl animate-in slide-in-from-top-4 duration-300 overflow-hidden"
        >
          {/* Search Input */}
          <div className="relative border-b border-gray-100">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Бүтээгдэхүүн хайх..."
              className="w-full pl-14 pr-14 py-5 text-lg bg-transparent focus:outline-none placeholder:text-gray-400"
            />
            {isLoading ? (
              <Loader2 className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 animate-spin" />
            ) : query ? (
              <button
                onClick={() => setQuery("")}
                className="absolute right-5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            ) : (
              <kbd className="absolute right-5 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-400 bg-gray-100 rounded border border-gray-200">
                <span className="text-sm">⌘</span>K
              </kbd>
            )}
          </div>

          {/* Content */}
          <div className="max-h-[60vh] overflow-y-auto">
            {/* Search Results */}
            {results && results.hits.length > 0 && (
              <div className="p-2">
                <div className="flex items-center justify-between px-3 py-2">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Илэрц ({results.estimatedTotalHits || results.hits.length})
                  </p>
                  <p className="text-xs text-gray-400">
                    {results.processingTimeMs}ms
                  </p>
                </div>
                <div className="space-y-1">
                  {results.hits.map((hit, index) => (
                    <Link
                      key={hit.id}
                      href={`/products/${hit.handle}`}
                      onClick={() => {
                        saveRecentSearch(query);
                        closeSearch();
                      }}
                      className={`flex items-center gap-4 p-3 rounded-xl transition-all ${
                        selectedIndex === index 
                          ? "bg-gray-100" 
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                        {hit.thumbnail ? (
                          hit.thumbnail.includes("cloudinary") ? (
                            <CloudinaryImage
                              src={hit.thumbnail}
                              alt={hit.title}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Image
                              src={hit.thumbnail}
                              alt={hit.title}
                              fill
                              sizes="64px"
                              className="object-cover"
                            />
                          )
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <Sparkles className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">
                          {hit.title}
                        </h3>
                        {hit.category_names && hit.category_names.length > 0 && (
                          <p className="text-sm text-gray-500 truncate">
                            {hit.category_names.join(" • ")}
                          </p>
                        )}
                        {hit.min_price !== undefined && hit.min_price > 0 && (
                          <p className="text-sm font-medium text-accent mt-0.5">
                            {formatPrice(hit.min_price)}
                            {hit.max_price && hit.max_price !== hit.min_price && (
                              <span className="text-gray-400"> - {formatPrice(hit.max_price)}</span>
                            )}
                          </p>
                        )}
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 shrink-0" />
                    </Link>
                  ))}
                </div>
                {results.estimatedTotalHits && results.estimatedTotalHits > results.hits.length && (
                  <Link
                    href={`/products?search=${encodeURIComponent(query)}`}
                    onClick={() => {
                      saveRecentSearch(query);
                      closeSearch();
                    }}
                    className="flex items-center justify-center gap-2 mt-2 py-3 text-sm font-medium text-accent hover:bg-gray-50 rounded-xl transition-colors"
                  >
                    Бүх илэрц үзэх ({results.estimatedTotalHits})
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            )}

            {/* No Results */}
            {results && results.hits.length === 0 && query && (
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <Search className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  Илэрц олдсонгүй
                </h3>
                <p className="text-sm text-gray-500">
                  &ldquo;{query}&rdquo; гэсэн хайлтаар илэрц олдсонгүй
                </p>
              </div>
            )}

            {/* Initial State - Recent & Popular Searches */}
            {!results && !query && (
              <div className="p-4 space-y-6">
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 px-2 mb-3">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Сүүлд хайсан
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((search) => (
                        <button
                          key={search}
                          onClick={() => setQuery(search)}
                          className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                        >
                          {search}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular Searches */}
                <div>
                  <div className="flex items-center gap-2 px-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-gray-400" />
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Түгээмэл хайлт
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_SEARCHES.map((search) => (
                      <button
                        key={search}
                        onClick={() => setQuery(search)}
                        className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Links */}
                <div className="border-t border-gray-100 pt-4">
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider px-2 mb-3">
                    Шууд холбоос
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/products"
                      onClick={closeSearch}
                      className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">Бүх бүтээгдэхүүн</p>
                        <p className="text-xs text-gray-500">Каталог үзэх</p>
                      </div>
                    </Link>
                    <Link
                      href="/collections"
                      onClick={closeSearch}
                      className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-linear-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">Цуглуулга</p>
                        <p className="text-xs text-gray-500">Онцлох бүтээгдэхүүн</p>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 px-4 py-3 flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-medium">↑↓</kbd>
                Сонгох
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-medium">↵</kbd>
                Нээх
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-medium">esc</kbd>
                Хаах
              </span>
            </div>
            <span className="hidden sm:inline">MeiliSearch ⚡️</span>
          </div>
        </div>
      </div>
    </div>
  );
}
