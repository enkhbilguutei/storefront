"use client";

import { useEffect, useRef, useCallback, useSyncExternalStore, useMemo } from "react";
import { useCartStore, useUIStore } from "@/lib/store";
import { CloudinaryImage } from "@/components/Cloudinary";
import Link from "next/link";
import { X, Check, ShoppingBag } from "lucide-react";
import { AnimatedCounter } from "@/components/animations/MotionComponents";
import { formatPrice } from "@/lib/utils/price";

// Simple visibility store to avoid setState in effects
const createVisibilityStore = () => {
  let isVisible = false;
  let isAnimatingOut = false;
  // Cache the snapshot object to avoid infinite loop with useSyncExternalStore
  let snapshot = { isVisible, isAnimatingOut };
  const listeners = new Set<() => void>();
  
  const updateSnapshot = () => {
    snapshot = { isVisible, isAnimatingOut };
    listeners.forEach(l => l());
  };
  
  return {
    getSnapshot: () => snapshot,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    show: () => {
      isVisible = true;
      isAnimatingOut = false;
      updateSnapshot();
    },
    startClose: () => {
      isAnimatingOut = true;
      updateSnapshot();
    },
    hide: () => {
      isVisible = false;
      isAnimatingOut = false;
      updateSnapshot();
    },
  };
};

const visibilityStore = createVisibilityStore();

export function CartNotification() {
  const { lastAddedItem, items, fetchCart } = useCartStore();
  const { isCartNotificationOpen, closeCartNotification } = useUIStore();
  const { isVisible, isAnimatingOut } = useSyncExternalStore(
    visibilityStore.subscribe,
    visibilityStore.getSnapshot,
    visibilityStore.getSnapshot
  );
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hasSyncedRef = useRef(false);

  const handleClose = useCallback(() => {
    if (isAnimatingOut) return;
    visibilityStore.startClose();
    setTimeout(() => {
      visibilityStore.hide();
      closeCartNotification();
    }, 200);
  }, [closeCartNotification, isAnimatingOut]);

  // Handle open/close based on store state
  useEffect(() => {
    if (isCartNotificationOpen && lastAddedItem) {
      // Clear any existing timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      
      visibilityStore.show();
      
      // Fetch cart once to get fresh data (uses caching)
      if (!hasSyncedRef.current) {
        hasSyncedRef.current = true;
        fetchCart();
      }
      
      // Auto close after 4 seconds
      timerRef.current = setTimeout(handleClose, 4000);
    } else {
      hasSyncedRef.current = false;
    }
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isCartNotificationOpen, lastAddedItem, handleClose, fetchCart]);

  // Get the most up-to-date item data from synced cart
  const displayItem = lastAddedItem 
    ? items.find(item => item.variantId === lastAddedItem.variantId) || lastAddedItem 
    : null;

  // Calculate totals from items array, but ensure lastAddedItem is included
  // This handles the case where the store hasn't fully synced yet
  const { totalItems, totalPrice } = useMemo(() => {
    // Start with the items from store
    let calculatedItems = [...items];
    
    // If lastAddedItem exists and isn't in items yet, include it
    if (lastAddedItem) {
      const existingItem = calculatedItems.find(item => item.variantId === lastAddedItem.variantId);
      if (!existingItem) {
        calculatedItems = [...calculatedItems, lastAddedItem];
      }
    }
    
    const total = calculatedItems.reduce((sum, item) => sum + item.quantity, 0);
    const price = calculatedItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    
    return { totalItems: total, totalPrice: price };
  }, [items, lastAddedItem]);

  if (!isVisible || !displayItem) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/20 backdrop-blur-[2px] z-50 transition-opacity duration-200 ${
          isAnimatingOut ? "opacity-0" : "opacity-100"
        }`}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Notification - Centered on desktop, bottom sheet on mobile */}
      <div 
        role="dialog"
        aria-labelledby="cart-notification-title"
        className={`fixed z-50 transition-all duration-200 ease-out
          inset-x-0 bottom-0 mx-auto
          sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:inset-auto sm:w-[380px]
          ${isAnimatingOut 
            ? "translate-y-full sm:translate-y-0 sm:opacity-0 sm:scale-95" 
            : "translate-y-0 sm:translate-y-[-50%] sm:opacity-100 sm:scale-100"
          }`}
      >
        <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden">
          {/* Mobile drag indicator */}
          <div className="sm:hidden flex justify-center pt-3">
            <div className="w-10 h-1 bg-gray-300 rounded-full" />
          </div>

          {/* Header */}
          <div className="px-5 pt-4 pb-3 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#34c759] rounded-full flex items-center justify-center shrink-0">
                <Check className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h3 id="cart-notification-title" className="text-[15px] font-semibold text-[#1d1d1f]">
                  Сагсанд нэмэгдлээ
                </h3>
                <p className="text-[13px] text-[#86868b]">Худалдан авалтаа үргэлжлүүлэх боломжтой</p>
              </div>
            </div>
            <button 
              onClick={handleClose}
              aria-label="Хаах"
              className="p-1.5 -mr-1.5 -mt-0.5 text-[#86868b] hover:text-[#1d1d1f] hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Divider */}
          <div className="mx-5 h-px bg-gray-100" />
          
          {/* Product */}
          <div className="p-5">
            <div className="flex gap-4">
              {/* Image */}
              <Link 
                href={displayItem.handle ? `/products/${displayItem.handle}` : '#'}
                onClick={handleClose}
                className="w-20 h-20 shrink-0 rounded-xl bg-[#f5f5f7] flex items-center justify-center overflow-hidden"
              >
                {displayItem.thumbnail ? (
                  <CloudinaryImage
                    src={displayItem.thumbnail}
                    alt={displayItem.title}
                    width={80}
                    height={80}
                    className="w-full h-full object-contain p-2"
                  />
                ) : (
                  <ShoppingBag className="w-8 h-8 text-[#d1d1d6]" />
                )}
              </Link>
              
              {/* Details */}
              <div className="flex-1 min-w-0 py-0.5">
                <Link 
                  href={displayItem.handle ? `/products/${displayItem.handle}` : '#'}
                  onClick={handleClose}
                  className="text-[15px] font-medium text-[#1d1d1f] line-clamp-2 leading-tight hover:text-[#0066cc] transition-colors"
                >
                  {displayItem.title}
                </Link>
                
                {displayItem.variantTitle && displayItem.variantTitle !== "Default" && (
                  <p className="text-[13px] text-[#86868b] mt-1 truncate">
                    {displayItem.variantTitle}
                  </p>
                )}
                
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-[15px] font-semibold text-[#1d1d1f]">
                    {formatPrice(displayItem.unitPrice, "mnt")}
                  </span>
                  {displayItem.quantity > 1 && (
                    <span className="text-[13px] text-[#86868b]">
                      × {displayItem.quantity}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Cart summary */}
          <div className="mx-5 py-3 px-4 bg-[#f5f5f7] rounded-xl flex items-center justify-between">
            <span className="text-[13px] text-[#86868b]">
              Сагсанд <AnimatedCounter value={totalItems} className="inline-block font-semibold text-[#1d1d1f]" /> бараа
            </span>
            <span className="text-[15px] font-semibold text-[#1d1d1f]">
              {formatPrice(totalPrice, "mnt")}
            </span>
          </div>
          
          {/* Actions */}
          <div className="p-5 pt-4 flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 h-12 rounded-xl border border-gray-200 text-[15px] font-medium text-[#1d1d1f] hover:bg-gray-50 active:scale-[0.98] transition-all"
            >
              Үргэлжлүүлэх
            </button>
            <Link
              href="/cart"
              onClick={handleClose}
              className="flex-1 h-12 rounded-xl bg-[#0066cc] text-[15px] font-medium text-white hover:bg-[#0055b3] active:scale-[0.98] transition-all flex items-center justify-center"
            >
              Сагс үзэх
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
