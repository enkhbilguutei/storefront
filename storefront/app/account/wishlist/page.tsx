"use client";

import { Heart, ShoppingBag } from "lucide-react";
import Link from "next/link";

// Note: Wishlist functionality requires extending Medusa with a custom module
// For now, we'll show a placeholder UI that can be connected later
export default function WishlistPage() {
  // TODO: Connect to Medusa wishlist module when implemented
  const wishlist: never[] = [];

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <h2 className="font-semibold text-foreground">Хүслийн жагсаалт</h2>
        <p className="text-secondary text-sm">Дуртай бүтээгдэхүүнүүдээ хадгалаарай</p>
      </div>

      {wishlist.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-5">
              <Heart className="h-8 w-8 text-gray-400" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">Хүслийн жагсаалт хоосон</h2>
            <p className="text-secondary text-sm mb-6 max-w-xs mx-auto">
              Бүтээгдэхүүн дээрх зүрхэн товчийг дарж хүслийн жагсаалтдаа нэмээрэй.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-foreground text-background text-sm rounded-lg hover:bg-foreground/90 transition-colors"
            >
              <ShoppingBag className="h-4 w-4" />
              Бүтээгдэхүүн үзэх
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Wishlist items would be rendered here */}
        </div>
      )}

      {/* Info Card */}
      <div className="bg-linear-to-br from-pink-50 to-red-50 rounded-xl border border-pink-100 p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0">
            <Heart className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <h3 className="font-medium text-foreground text-sm mb-1">Хүслийн жагсаалтын тухай</h3>
            <p className="text-xs text-secondary">
              Бүтээгдэхүүнийг хүслийн жагсаалтад нэмснээр үнэ буурах, нөөц дуусахаас өмнө мэдэгдэл авах боломжтой.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
