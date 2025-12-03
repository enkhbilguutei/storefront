"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useRef, useEffect } from "react";
import { ChevronDown, X, SlidersHorizontal } from "lucide-react";

interface Category {
  id: string;
  name: string;
  handle: string;
}

interface ProductFiltersProps {
  categories: Category[];
}

// Price range options
const priceRanges = [
  { label: "Бүгд", min: null, max: null },
  { label: "₮500,000 хүртэл", min: null, max: 500000 },
  { label: "₮500,000 - ₮1,000,000", min: 500000, max: 1000000 },
  { label: "₮1,000,000 - ₮2,000,000", min: 1000000, max: 2000000 },
  { label: "₮2,000,000 - ₮5,000,000", min: 2000000, max: 5000000 },
  { label: "₮5,000,000+", min: 5000000, max: null },
];

// Sort options
const sortOptions = [
  { value: "", label: "Шинэ нь эхэндээ" },
  { value: "price_asc", label: "Үнэ: Багаас их рүү" },
  { value: "price_desc", label: "Үнэ: Ихээс бага руу" },
];

export function ProductFilters({ categories }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const createQueryString = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([name, value]) => {
        if (value) {
          params.set(name, value);
        } else {
          params.delete(name);
        }
      });
      return params.toString();
    },
    [searchParams]
  );

  const handleCategoryChange = (categoryId: string) => {
    router.push(`?${createQueryString({ category_id: categoryId || null })}`);
    setOpenDropdown(null);
  };

  const handleSortChange = (sort: string) => {
    router.push(`?${createQueryString({ order: sort || null })}`);
    setOpenDropdown(null);
  };

  const handlePriceChange = (min: number | null, max: number | null) => {
    router.push(`?${createQueryString({ 
      price_min: min?.toString() || null, 
      price_max: max?.toString() || null 
    })}`);
    setOpenDropdown(null);
  };

  const clearAllFilters = () => {
    router.push("/products");
    setOpenDropdown(null);
  };

  // Get current selections for display
  const currentCategory = categories.find(c => c.id === searchParams.get("category_id"));
  const currentSort = sortOptions.find(s => s.value === searchParams.get("order")) || sortOptions[0];
  const currentPriceMin = searchParams.get("price_min");
  const currentPriceMax = searchParams.get("price_max");
  const currentPriceRange = priceRanges.find(
    p => (p.min?.toString() || null) === currentPriceMin && (p.max?.toString() || null) === currentPriceMax
  ) || priceRanges[0];

  const hasActiveFilters = currentCategory || currentPriceMin || currentPriceMax || searchParams.get("order");

  const FilterDropdown = ({ 
    id, 
    label, 
    value 
  }: { 
    id: string; 
    label: string; 
    value: string;
  }) => (
    <button
      onClick={() => setOpenDropdown(openDropdown === id ? null : id)}
      className={`flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium rounded-full transition-all ${
        openDropdown === id 
          ? "bg-[#1d1d1f] text-white" 
          : value !== label
            ? "bg-[#f5f5f7] text-[#1d1d1f]"
            : "text-[#1d1d1f] hover:bg-[#f5f5f7]"
      }`}
    >
      <span>{value}</span>
      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openDropdown === id ? "rotate-180" : ""}`} />
    </button>
  );

  return (
    <>
      {/* Desktop Filters - Horizontal */}
      <div ref={dropdownRef} className="hidden md:flex items-center gap-2 py-4">
        {/* Category Filter */}
        <div className="relative">
          <FilterDropdown 
            id="category" 
            label="Ангилал" 
            value={currentCategory?.name || "Ангилал"} 
          />
          {openDropdown === "category" && (
            <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <button
                onClick={() => handleCategoryChange("")}
                className={`w-full text-left px-4 py-2.5 text-[13px] transition-colors ${
                  !currentCategory 
                    ? "bg-[#f5f5f7] font-medium text-[#1d1d1f]" 
                    : "text-[#424245] hover:bg-[#f5f5f7]"
                }`}
              >
                Бүгд
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleCategoryChange(c.id)}
                  className={`w-full text-left px-4 py-2.5 text-[13px] transition-colors ${
                    currentCategory?.id === c.id 
                      ? "bg-[#f5f5f7] font-medium text-[#1d1d1f]" 
                      : "text-[#424245] hover:bg-[#f5f5f7]"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Price Filter */}
        <div className="relative">
          <FilterDropdown 
            id="price" 
            label="Үнэ" 
            value={currentPriceRange.label === "Бүгд" ? "Үнэ" : currentPriceRange.label} 
          />
          {openDropdown === "price" && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              {priceRanges.map((range, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePriceChange(range.min, range.max)}
                  className={`w-full text-left px-4 py-2.5 text-[13px] transition-colors ${
                    currentPriceRange.label === range.label 
                      ? "bg-[#f5f5f7] font-medium text-[#1d1d1f]" 
                      : "text-[#424245] hover:bg-[#f5f5f7]"
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sort */}
        <div className="relative">
          <FilterDropdown 
            id="sort" 
            label="Эрэмбэлэх" 
            value={currentSort.label === "Шинэ нь эхэндээ" ? "Эрэмбэлэх" : currentSort.label} 
          />
          {openDropdown === "sort" && (
            <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSortChange(option.value)}
                  className={`w-full text-left px-4 py-2.5 text-[13px] transition-colors ${
                    currentSort.value === option.value 
                      ? "bg-[#f5f5f7] font-medium text-[#1d1d1f]" 
                      : "text-[#424245] hover:bg-[#f5f5f7]"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-1.5 px-3 py-2 text-[13px] text-[#86868b] hover:text-[#1d1d1f] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span>Цэвэрлэх</span>
          </button>
        )}
      </div>

      {/* Mobile Filters */}
      <div className="md:hidden py-3 flex items-center gap-2">
        <button
          onClick={() => setShowMobileFilters(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium text-[#1d1d1f] bg-[#f5f5f7] rounded-full"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Шүүлтүүр</span>
          {hasActiveFilters && (
            <span className="w-5 h-5 bg-[#0071e3] text-white text-[10px] rounded-full flex items-center justify-center font-semibold">
              {[currentCategory, currentPriceMin, searchParams.get("order")].filter(Boolean).length}
            </span>
          )}
        </button>

        {currentCategory && (
          <span className="px-3 py-2 text-[12px] bg-[#f5f5f7] text-[#1d1d1f] rounded-full">
            {currentCategory.name}
          </span>
        )}
      </div>

      {/* Mobile Filter Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileFilters(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
              <h2 className="text-[17px] font-semibold text-[#1d1d1f]">Шүүлтүүр</h2>
              <button 
                onClick={() => setShowMobileFilters(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f5f5f7]"
              >
                <X className="w-5 h-5 text-[#86868b]" />
              </button>
            </div>

            {/* Filter Options */}
            <div className="p-5 space-y-6">
              {/* Categories */}
              <div>
                <h3 className="text-[13px] font-semibold text-[#86868b] uppercase tracking-wide mb-3">Ангилал</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleCategoryChange("")}
                    className={`px-4 py-2 text-[13px] rounded-full transition-all ${
                      !currentCategory 
                        ? "bg-[#1d1d1f] text-white font-medium" 
                        : "bg-[#f5f5f7] text-[#1d1d1f]"
                    }`}
                  >
                    Бүгд
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => handleCategoryChange(c.id)}
                      className={`px-4 py-2 text-[13px] rounded-full transition-all ${
                        currentCategory?.id === c.id 
                          ? "bg-[#1d1d1f] text-white font-medium" 
                          : "bg-[#f5f5f7] text-[#1d1d1f]"
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div>
                <h3 className="text-[13px] font-semibold text-[#86868b] uppercase tracking-wide mb-3">Үнэ</h3>
                <div className="flex flex-wrap gap-2">
                  {priceRanges.map((range, idx) => (
                    <button
                      key={idx}
                      onClick={() => handlePriceChange(range.min, range.max)}
                      className={`px-4 py-2 text-[13px] rounded-full transition-all ${
                        currentPriceRange.label === range.label 
                          ? "bg-[#1d1d1f] text-white font-medium" 
                          : "bg-[#f5f5f7] text-[#1d1d1f]"
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div>
                <h3 className="text-[13px] font-semibold text-[#86868b] uppercase tracking-wide mb-3">Эрэмбэлэх</h3>
                <div className="flex flex-wrap gap-2">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleSortChange(option.value)}
                      className={`px-4 py-2 text-[13px] rounded-full transition-all ${
                        currentSort.value === option.value 
                          ? "bg-[#1d1d1f] text-white font-medium" 
                          : "bg-[#f5f5f7] text-[#1d1d1f]"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-100 p-5 flex gap-3">
              {hasActiveFilters && (
                <button
                  onClick={() => {
                    clearAllFilters();
                    setShowMobileFilters(false);
                  }}
                  className="flex-1 py-3 text-[15px] font-medium text-[#1d1d1f] bg-[#f5f5f7] rounded-full"
                >
                  Цэвэрлэх
                </button>
              )}
              <button
                onClick={() => setShowMobileFilters(false)}
                className="flex-1 py-3 text-[15px] font-medium text-white bg-[#0071e3] rounded-full"
              >
                Үзүүлэх
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
