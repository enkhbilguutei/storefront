"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useEffect, useSyncExternalStore } from "react";
import { ChevronDown, X, SlidersHorizontal, Check } from "lucide-react";
import { createPortal } from "react-dom";

// SSR-safe check for client-side
const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

function useIsClient() {
  return useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);
}

interface Category {
  id: string;
  name: string;
  handle: string;
}

interface Collection {
  id: string;
  title: string;
  handle: string;
}

interface ProductTag {
  id: string;
  value: string;
}

interface ProductFiltersProps {
  categories?: Category[];
  collections?: Collection[];
  tags?: ProductTag[];
  availableOptions?: {
    name: string;
    values: string[];
  }[];
  priceRange?: {
    min: number;
    max: number;
  };
  pageType?: "products" | "category" | "collection" | "search";
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
  { value: "name_asc", label: "Нэр: А-Я" },
  { value: "name_desc", label: "Нэр: Я-А" },
];

// Collapsible Filter Section Component
function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 text-left hover:bg-[#f5f5f7]/50 transition-colors px-4"
      >
        <span className="text-[14px] font-semibold text-[#1d1d1f]">{title}</span>
        <ChevronDown
          className={`w-4 h-4 text-[#86868b] transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && <div className="px-4 pb-4 space-y-2">{children}</div>}
    </div>
  );
}

// Checkbox Filter Item
function FilterCheckbox({
  label,
  checked,
  count,
  onChange,
}: {
  label: string;
  checked: boolean;
  count?: number;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group py-2">
      <div
        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
          checked
            ? "bg-[#0071e3] border-[#0071e3]"
            : "border-[#d2d2d7] group-hover:border-[#86868b]"
        }`}
      >
        {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
      </div>
      <span className="flex-1 text-[13px] text-[#1d1d1f] group-hover:text-[#0071e3] transition-colors">
        {label}
      </span>
      {count !== undefined && (
        <span className="text-[11px] text-[#86868b]">({count})</span>
      )}
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
    </label>
  );
}

// Mobile Filter Modal Component
function MobileFilterModal({
  isOpen,
  onClose,
  children,
  hasActiveFilters,
  onClearAll,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  hasActiveFilters: boolean;
  onClearAll: () => void;
}) {
  const isClient = useIsClient();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isClient || !isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-9999">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
          <h2 className="text-[17px] font-semibold text-[#1d1d1f]">Шүүлтүүр</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f5f5f7] active:bg-[#e8e8ed]"
          >
            <X className="w-5 h-5 text-[#86868b]" />
          </button>
        </div>

        {/* Content - scrollable area */}
        <div className="overflow-y-auto flex-1">{children}</div>

        {/* Footer */}
        <div
          className="p-5 border-t border-gray-100 flex gap-3 shrink-0"
          style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
        >
          {hasActiveFilters && (
            <button
              onClick={() => {
                onClearAll();
                onClose();
              }}
              className="flex-1 py-3.5 text-[15px] font-medium text-[#1d1d1f] bg-[#f5f5f7] rounded-full active:bg-[#e8e8ed]"
            >
              Цэвэрлэх
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 py-3.5 text-[15px] font-medium text-white bg-[#0071e3] rounded-full active:bg-[#0062c4]"
          >
            Үзүүлэх
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

export function ProductFiltersSidebar({
  categories = [],
  collections = [],
  tags = [],
  availableOptions = [],
  pageType = "products",
}: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showMobileFilters, setShowMobileFilters] = useState(false);

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

  // Parse current filters from URL
  const currentCategoryId = searchParams.get("category_id");
  const currentCollectionId = searchParams.get("collection_id");
  const currentTags = searchParams.get("tags")?.split(",").filter(Boolean) || [];
  const currentPriceMin = searchParams.get("price_min");
  const currentPriceMax = searchParams.get("price_max");
  const currentSort = searchParams.get("order") || "";
  
  // Parse option filters (e.g., ?option_Size=42mm,46mm)
  const currentOptions: Record<string, string[]> = {};
  availableOptions.forEach((opt) => {
    const paramValue = searchParams.get(`option_${opt.name}`);
    if (paramValue) {
      currentOptions[opt.name] = paramValue.split(",").filter(Boolean);
    }
  });

  const handleCategoryChange = (categoryId: string) => {
    router.push(`?${createQueryString({ category_id: categoryId || null })}`);
  };

  const handleCollectionChange = (collectionId: string) => {
    router.push(`?${createQueryString({ collection_id: collectionId || null })}`);
  };

  const handleTagToggle = (tag: string) => {
    const newTags = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag];
    router.push(
      `?${createQueryString({ tags: newTags.length ? newTags.join(",") : null })}`
    );
  };

  const handleOptionToggle = (optionName: string, value: string) => {
    const current = currentOptions[optionName] || [];
    const newValues = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];

    router.push(
      `?${createQueryString({
        [`option_${optionName}`]: newValues.length ? newValues.join(",") : null,
      })}`
    );
  };

  const handlePriceChange = (min: number | null, max: number | null) => {
    router.push(
      `?${createQueryString({
        price_min: min?.toString() || null,
        price_max: max?.toString() || null,
      })}`
    );
  };

  const handleSortChange = (sort: string) => {
    router.push(`?${createQueryString({ order: sort || null })}`);
  };

  const clearAllFilters = () => {
    router.push(window.location.pathname);
  };

  // Determine current selections for display
  const currentPriceRange =
    priceRanges.find(
      (p) =>
        (p.min?.toString() || null) === currentPriceMin &&
        (p.max?.toString() || null) === currentPriceMax
    ) || priceRanges[0];

  const hasActiveFilters =
    currentCategoryId ||
    currentCollectionId ||
    currentTags.length > 0 ||
    Object.keys(currentOptions).length > 0 ||
    currentPriceMin ||
    currentPriceMax ||
    currentSort;

  const activeFilterCount =
    (currentCategoryId ? 1 : 0) +
    (currentCollectionId ? 1 : 0) +
    currentTags.length +
    Object.values(currentOptions).flat().length +
    (currentPriceMin || currentPriceMax ? 1 : 0) +
    (currentSort ? 1 : 0);

  // Sidebar content
  const sidebarContent = (
    <div className="space-y-0">
      {/* Categories - only show if not on a category page */}
      {pageType !== "category" && categories.length > 0 && (
        <FilterSection title="Ангилал">
          <div className="space-y-1">
            {categories.map((category) => (
              <FilterCheckbox
                key={category.id}
                label={category.name}
                checked={currentCategoryId === category.id}
                onChange={() =>
                  handleCategoryChange(
                    currentCategoryId === category.id ? "" : category.id
                  )
                }
              />
            ))}
          </div>
        </FilterSection>
      )}

      {/* Collections - only show if not on a collection page */}
      {pageType !== "collection" && collections.length > 0 && (
        <FilterSection title="Цуглуулга">
          <div className="space-y-1">
            {collections.map((collection) => (
              <FilterCheckbox
                key={collection.id}
                label={collection.title}
                checked={currentCollectionId === collection.id}
                onChange={() =>
                  handleCollectionChange(
                    currentCollectionId === collection.id ? "" : collection.id
                  )
                }
              />
            ))}
          </div>
        </FilterSection>
      )}

      {/* Price Range */}
      <FilterSection title="Үнийн хүрээ">
        <div className="space-y-1">
          {priceRanges.map((range, idx) => (
            <FilterCheckbox
              key={idx}
              label={range.label}
              checked={currentPriceRange.label === range.label}
              onChange={() => handlePriceChange(range.min, range.max)}
            />
          ))}
        </div>
      </FilterSection>

      {/* Dynamic Options (e.g., Size, Color, Material) */}
      {availableOptions.map((option) => (
        <FilterSection key={option.name} title={option.name}>
          <div className="space-y-1">
            {option.values.map((value) => (
              <FilterCheckbox
                key={value}
                label={value}
                checked={currentOptions[option.name]?.includes(value) || false}
                onChange={() => handleOptionToggle(option.name, value)}
              />
            ))}
          </div>
        </FilterSection>
      ))}

      {/* Tags */}
      {tags.length > 0 && (
        <FilterSection title="Шошго">
          <div className="space-y-1">
            {tags.map((tag) => (
              <FilterCheckbox
                key={tag.id}
                label={tag.value}
                checked={currentTags.includes(tag.value)}
                onChange={() => handleTagToggle(tag.value)}
              />
            ))}
          </div>
        </FilterSection>
      )}

      {/* Sort */}
      <FilterSection title="Эрэмбэлэх">
        <div className="space-y-1">
          {sortOptions.map((option) => (
            <FilterCheckbox
              key={option.value}
              label={option.label}
              checked={currentSort === option.value}
              onChange={() => handleSortChange(option.value)}
            />
          ))}
        </div>
      </FilterSection>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <div className="sticky top-24 bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-[#1d1d1f]">Шүүлтүүр</h2>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-[12px] text-[#0071e3] hover:text-[#0062c4] font-medium"
              >
                Цэвэрлэх
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="max-h-[calc(100vh-12rem)] overflow-y-auto">
            {sidebarContent}
          </div>
        </div>
      </div>

      {/* Mobile: Floating Filter Button */}
      <div className="lg:hidden">
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <button
            onClick={() => setShowMobileFilters(true)}
            className="flex items-center gap-3 px-6 py-3.5 bg-[#1d1d1f] text-white rounded-full shadow-2xl active:scale-95 transition-transform"
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span className="text-[15px] font-medium">Шүүлтүүр</span>
            {activeFilterCount > 0 && (
              <span className="min-w-[22px] h-[22px] px-1.5 bg-[#0071e3] text-white text-[11px] rounded-full flex items-center justify-center font-semibold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Filter Modal */}
      <MobileFilterModal
        isOpen={showMobileFilters}
        onClose={() => setShowMobileFilters(false)}
        hasActiveFilters={!!hasActiveFilters}
        onClearAll={clearAllFilters}
      >
        {sidebarContent}
      </MobileFilterModal>
    </>
  );
}
