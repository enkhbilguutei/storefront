"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface Collection {
  id: string;
  title: string;
}

interface ProductFiltersProps {
  collections: Collection[];
}

export function ProductFilters({ collections }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  const handleCollectionChange = (collectionId: string) => {
    router.push(`?${createQueryString("collection_id", collectionId)}`);
  };

  const handleSortChange = (sort: string) => {
    router.push(`?${createQueryString("order", sort)}`);
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
          Ангилал
        </h3>
        <div className="space-y-3">
          <button
            onClick={() => handleCollectionChange("")}
            className={`block text-sm transition-colors ${
              !searchParams.get("collection_id")
                ? "font-medium text-black"
                : "text-gray-500 hover:text-black"
            }`}
          >
            Бүгд
          </button>
          {collections.map((c) => (
            <button
              key={c.id}
              onClick={() => handleCollectionChange(c.id)}
              className={`block text-sm text-left w-full transition-colors ${
                searchParams.get("collection_id") === c.id
                  ? "font-medium text-black"
                  : "text-gray-500 hover:text-black"
              }`}
            >
              {c.title}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
          Эрэмбэлэх
        </h3>
        <div className="relative">
          <select
            className="w-full appearance-none bg-white border border-gray-200 text-gray-700 py-2 px-3 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500 text-sm"
            value={searchParams.get("order") || ""}
            onChange={(e) => handleSortChange(e.target.value)}
          >
            <option value="">Шинэ нь эхэндээ</option>
            <option value="price_asc">Үнэ: Багаас их рүү</option>
            <option value="price_desc">Үнэ: Ихээс бага руу</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
