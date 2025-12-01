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
      <Link href="/cart" className="text-foreground/80 hover:text-foreground hover:bg-foreground/5 transition-all p-2.5 rounded-full w-12 h-12 flex items-center justify-center relative">
        <ShoppingCart className="h-6 w-6" strokeWidth={1.5} />
      </Link>
    );
  }

  return (
    <Link href="/cart" className="text-foreground/80 hover:text-foreground hover:bg-foreground/5 transition-all p-2.5 rounded-full w-12 h-12 flex items-center justify-center relative">
      <ShoppingCart className="h-6 w-6" strokeWidth={1.5} />
      {itemCount > 0 && (
        <span className="absolute top-1 right-1 h-5 w-5 rounded-full bg-accent text-white text-xs flex items-center justify-center font-bold">
          {itemCount}
        </span>
      )}
    </Link>
  );
}
