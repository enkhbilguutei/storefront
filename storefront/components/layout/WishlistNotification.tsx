"use client";

import { useEffect } from "react";
import { useUIStore } from "@/lib/store";
import { Heart, X } from "lucide-react";

export function WishlistNotification() {
  const { isWishlistNotificationOpen, wishlistNotificationMessage, closeWishlistNotification } = useUIStore();

  useEffect(() => {
    if (isWishlistNotificationOpen) {
      const timer = setTimeout(() => {
        closeWishlistNotification();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isWishlistNotificationOpen, closeWishlistNotification]);

  if (!isWishlistNotificationOpen) return null;

  return (
    <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-top-5 fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 pr-12 min-w-[280px] max-w-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center shrink-0">
            <Heart className="w-5 h-5 text-red-500 fill-current" />
          </div>
          <p className="text-sm font-medium text-gray-900">
            {wishlistNotificationMessage}
          </p>
        </div>
        <button
          onClick={closeWishlistNotification}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Хаах"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
