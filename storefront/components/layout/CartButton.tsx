"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { useEffect, useState } from "react";

export function CartButton() {
  const { items } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  if (!mounted) {
    return (
      <Link 
        href="/cart" 
        className="text-foreground hover:text-foreground/80 transition-colors p-2 rounded-full w-10 h-10 flex items-center justify-center relative"
        aria-label="Сагс"
      >
        <ShoppingCart className="h-[22px] w-[22px]" />
      </Link>
    );
  }

  return (
    <Link 
      href="/cart" 
      className="text-foreground hover:text-foreground/80 transition-colors p-2 rounded-full w-10 h-10 flex items-center justify-center relative"
      aria-label="Сагс"
    >
      <ShoppingCart className="h-[22px] w-[22px]" strokeWidth={2.5} />
      {itemCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 h-[18px] w-[18px] rounded-full bg-[#0071e3] text-white text-[10px] flex items-center justify-center font-semibold">
          {itemCount > 9 ? "9+" : itemCount}
        </span>
      )}
    </Link>
  );
}
