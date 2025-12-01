"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function SortSelect({ currentSort }: { currentSort?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("sort", value);
    } else {
      params.delete("sort");
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <select
      className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
      defaultValue={currentSort || ""}
      onChange={(e) => handleSortChange(e.target.value)}
    >
      <option value="">Анхдагч</option>
      <option value="newest">Шинэ эхэнд</option>
      <option value="price_asc">Үнэ (бага → их)</option>
      <option value="price_desc">Үнэ (их → бага)</option>
    </select>
  );
}
