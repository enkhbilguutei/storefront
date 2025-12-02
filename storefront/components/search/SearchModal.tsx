"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, ArrowRight, Loader2, Clock, TrendingUp, Sparkles } from "lucide-react";
import Link from "next/link";
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
      className="fixed inset-0 z-100 bg-black/50 backdrop-blur-xl animate-in fade-in duration-150"
      onClick={handleBackdropClick}
    >
      <div className="flex items-start justify-center pt-[8vh] px-4">
        <div 
          ref={modalRef}
          className="w-full max-w-[680px] bg-[rgba(251,251,253,0.98)] rounded-2xl shadow-2xl animate-in slide-in-from-top-2 duration-200 overflow-hidden"
        >
          {/* Search Input */}
          <div className="relative border-b border-gray-200/50">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/40" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Хайх..."
              className="w-full pl-14 pr-14 py-4 text-base bg-transparent focus:outline-none placeholder:text-foreground/40"
            />
            {isLoading ? (
              <Loader2 className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40 animate-spin" />
            ) : query ? (
              <button
                onClick={() => setQuery("")}
                className="absolute right-5 top-1/2 -translate-y-1/2 p-1 text-foreground/40 hover:text-foreground/60 rounded-full hover:bg-foreground/5 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            ) : (
              <kbd className="absolute right-5 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-foreground/40 bg-foreground/5 rounded-md">
                <span className="text-xs">⌘</span>K
              </kbd>
            )}
          </div>

          {/* Content */}
          <div className="max-h-[55vh] overflow-y-auto">
            {/* Search Results */}
            {results && results.hits.length > 0 && (
              <div className="p-2">
                <div className="flex items-center justify-between px-3 py-1.5">
                  <p className="text-[10px] font-medium text-foreground/40 uppercase tracking-wider">
                    Илэрц ({results.estimatedTotalHits || results.hits.length})
                  </p>
                  <p className="text-[10px] text-foreground/30">
                    {results.processingTimeMs}ms
                  </p>
                </div>
                <div className="space-y-0.5">
                  {results.hits.map((hit, index) => (
                    <Link
                      key={hit.id}
                      href={`/products/${hit.handle}`}
                      onClick={() => {
                        saveRecentSearch(query);
                        closeSearch();
                      }}
                      className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                        selectedIndex === index 
                          ? "bg-foreground/5" 
                          : "hover:bg-foreground/[0.03]"
                      }`}
                    >
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-[#f5f5f7] shrink-0">
                        {hit.thumbnail ? (
                          hit.thumbnail.includes("cloudinary") ? (
                            <CloudinaryImage
                              src={hit.thumbnail}
                              alt={hit.title}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={hit.thumbnail}
                              alt={hit.title}
                              className="w-full h-full object-cover"
                            />
                          )
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-foreground/20">
                            <Sparkles className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-foreground truncate">
                          {hit.title}
                        </h3>
                        {hit.category_names && hit.category_names.length > 0 && (
                          <p className="text-xs text-foreground/50 truncate">
                            {hit.category_names.join(" • ")}
                          </p>
                        )}
                        {hit.min_price !== undefined && hit.min_price > 0 && (
                          <p className="text-xs font-medium text-foreground/70 mt-0.5">
                            {formatPrice(hit.min_price)}
                            {hit.max_price && hit.max_price !== hit.min_price && (
                              <span className="text-foreground/40"> - {formatPrice(hit.max_price)}</span>
                            )}
                          </p>
                        )}
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-foreground/30 shrink-0" />
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
                    className="flex items-center justify-center gap-1.5 mt-1.5 py-2.5 text-xs font-medium text-blue-600 hover:bg-foreground/[0.03] rounded-xl transition-colors"
                  >
                    Бүх илэрц үзэх ({results.estimatedTotalHits})
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            )}

            {/* No Results */}
            {results && results.hits.length === 0 && query && (
              <div className="p-8 text-center">
                <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-foreground/5 flex items-center justify-center">
                  <Search className="w-6 h-6 text-foreground/20" />
                </div>
                <h3 className="text-base font-medium text-foreground mb-1">
                  Илэрц олдсонгүй
                </h3>
                <p className="text-xs text-foreground/50">
                  &ldquo;{query}&rdquo; гэсэн хайлтаар илэрц олдсонгүй
                </p>
              </div>
            )}

            {/* Initial State - Recent & Popular Searches */}
            {!results && !query && (
              <div className="p-3 space-y-4">
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 px-2 mb-2">
                      <Clock className="w-3.5 h-3.5 text-foreground/40" />
                      <h3 className="text-[10px] font-medium text-foreground/40 uppercase tracking-wider">
                        Сүүлд хайсан
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {recentSearches.map((search) => (
                        <button
                          key={search}
                          onClick={() => setQuery(search)}
                          className="px-3 py-1.5 text-xs text-foreground/70 bg-foreground/5 rounded-full hover:bg-foreground/10 transition-colors"
                        >
                          {search}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular Searches */}
                <div>
                  <div className="flex items-center gap-1.5 px-2 mb-2">
                    <TrendingUp className="w-3.5 h-3.5 text-foreground/40" />
                    <h3 className="text-[10px] font-medium text-foreground/40 uppercase tracking-wider">
                      Түгээмэл хайлт
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_SEARCHES.map((search) => (
                      <button
                        key={search}
                        onClick={() => setQuery(search)}
                        className="px-3 py-1.5 text-xs text-foreground/70 bg-foreground/5 rounded-full hover:bg-foreground/10 transition-colors"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Links */}
                <div className="border-t border-gray-200/50 pt-3">
                  <h3 className="text-[10px] font-medium text-foreground/40 uppercase tracking-wider px-2 mb-2">
                    Шууд холбоос
                  </h3>
                  <div className="grid grid-cols-2 gap-1.5">
                    <Link
                      href="/products"
                      onClick={closeSearch}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl bg-foreground/[0.03] hover:bg-foreground/5 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-xs">Бүх бүтээгдэхүүн</p>
                        <p className="text-[10px] text-foreground/50">Каталог үзэх</p>
                      </div>
                    </Link>
                    <Link
                      href="/collections"
                      onClick={closeSearch}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl bg-foreground/[0.03] hover:bg-foreground/5 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-xs">Цуглуулга</p>
                        <p className="text-[10px] text-foreground/50">Онцлох бүтээгдэхүүн</p>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200/50 px-4 py-2.5 flex items-center justify-between text-[10px] text-foreground/40">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-foreground/5 rounded text-[9px] font-medium">↑↓</kbd>
                Сонгох
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-foreground/5 rounded text-[9px] font-medium">↵</kbd>
                Нээх
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-foreground/5 rounded text-[9px] font-medium">esc</kbd>
                Хаах
              </span>
            </div>
            <span className="hidden sm:inline text-foreground/30">MeiliSearch</span>
          </div>
        </div>
      </div>
    </div>
  );
}
