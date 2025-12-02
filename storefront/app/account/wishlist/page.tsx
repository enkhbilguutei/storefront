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
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-foreground mb-1">Хүслийн жагсаалт</h2>
        <p className="text-secondary text-sm">Дуртай бүтээгдэхүүнүүдээ хадгалаарай</p>
      </div>

      {wishlist.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 shadow-sm">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
              <Heart className="h-10 w-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Хүслийн жагсаалт хоосон</h2>
            <p className="text-secondary mb-6">
              Бүтээгдэхүүн дээрх зүрхэн товчийг дарж хүслийн жагсаалтдаа нэмээрэй.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-xl font-medium hover:bg-foreground/90 transition-all"
            >
              <ShoppingBag className="h-5 w-5" />
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
      <div className="bg-linear-to-br from-pink-50 to-red-50 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0">
            <Heart className="h-6 w-6 text-red-500" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">Хүслийн жагсаалтын тухай</h3>
            <p className="text-sm text-secondary">
              Бүтээгдэхүүнийг хүслийн жагсаалтад нэмснээр үнэ буурах, нөөц дуусахаас өмнө мэдэгдэл авах боломжтой.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
