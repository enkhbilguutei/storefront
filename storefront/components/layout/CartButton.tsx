"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/lib/store";

export function CartButton() {
  const { items } = useCartStore();

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <Link 
      href="/cart" 
      className="text-foreground/80 hover:text-foreground transition-colors p-2 rounded-full w-10 h-10 flex items-center justify-center relative"
      aria-label="Сагс"
    >
      <ShoppingCart className="h-5 w-5" strokeWidth={1.5} />
      {itemCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-foreground text-background text-[10px] flex items-center justify-center font-medium">
          {itemCount > 9 ? "9+" : itemCount}
        </span>
      )}
    </Link>
  );
}
