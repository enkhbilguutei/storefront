"use client";

import { useEffect, useState, useCallback } from "react";
import { useCartStore, useUIStore } from "@/lib/store";
import { CloudinaryImage } from "@/components/Cloudinary";
import Link from "next/link";
import { X, ShoppingBag, ArrowRight, Check } from "lucide-react";

export function CartNotification() {
  const { lastAddedItem, items } = useCartStore();
  const { isCartNotificationOpen, closeCartNotification } = useUIStore();
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      closeCartNotification();
    }, 200);
  }, [closeCartNotification]);

  // Handle animation states
  useEffect(() => {
    if (isCartNotificationOpen && lastAddedItem) {
      setIsVisible(true);
      setIsClosing(false);
      
      const timer = setTimeout(() => {
        handleClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isCartNotificationOpen, lastAddedItem, handleClose]);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("mn-MN", {
      style: "currency",
      currency: "MNT",
    }).format(amount);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  if (!isVisible || !lastAddedItem) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/40 z-50 transition-opacity duration-200 ${
          isClosing ? "opacity-0" : "opacity-100"
        }`}
        onClick={handleClose}
      />

      {/* Notification - Mobile: Bottom Sheet, Desktop: Top Right */}
      <div 
        className={`fixed z-50 transition-all duration-300 ease-out
          bottom-0 left-0 right-0 
          md:bottom-auto md:left-auto md:top-20 md:right-6 md:w-[400px]
          ${isClosing 
            ? "translate-y-full md:translate-y-0 md:translate-x-full md:opacity-0" 
            : "translate-y-0 md:translate-x-0 md:opacity-100"
          }`}
      >
        <div className="bg-white shadow-2xl rounded-t-3xl md:rounded-2xl overflow-hidden border border-gray-100">
          {/* Mobile drag handle */}
          <div className="md:hidden flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 bg-gray-300 rounded-full" />
          </div>
          
          {/* Success header */}
          <div className="bg-linear-to-r from-green-500 to-emerald-500 px-5 py-4 md:py-3 flex items-center gap-3">
            <div className="w-8 h-8 md:w-6 md:h-6 bg-white rounded-full flex items-center justify-center">
              <Check className="w-5 h-5 md:w-4 md:h-4 text-green-500" strokeWidth={3} />
            </div>
            <span className="text-white font-semibold text-base md:text-sm">Сагсанд амжилттай нэмэгдлээ!</span>
            <button 
              onClick={handleClose}
              className="ml-auto text-white/80 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-full"
            >
              <X className="h-6 w-6 md:h-5 md:w-5" />
            </button>
          </div>
          
          {/* Product info */}
          <div className="p-6 md:p-5">
            <div className="flex items-center gap-5 md:gap-4">
              <div className="relative h-28 w-28 md:h-20 md:w-20 shrink-0 rounded-2xl md:rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                {lastAddedItem.thumbnail ? (
                  <CloudinaryImage
                    src={lastAddedItem.thumbnail}
                    alt={lastAddedItem.title}
                    width={112}
                    height={112}
                    className="h-full w-full object-contain p-3 md:p-2"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-gray-300">
                    <ShoppingBag className="h-10 w-10 md:h-8 md:w-8" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-[#1d1d1f] truncate text-lg md:text-base leading-tight">
                  {lastAddedItem.title}
                </h3>
                <p className="text-[#86868b] text-base md:text-sm mt-1.5 md:mt-1">
                  Тоо: {lastAddedItem.quantity}
                </p>
                <p className="text-[#1d1d1f] font-bold text-lg md:text-base mt-1.5 md:mt-1">
                  {formatPrice(lastAddedItem.unitPrice)}
                </p>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="px-6 pb-8 pt-0 md:px-5 md:pb-5">
            <div className="flex flex-col md:flex-row gap-3">
              <Link
                href="/cart"
                onClick={handleClose}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-[#1d1d1f] text-base md:text-sm font-semibold py-4 md:py-3.5 px-4 rounded-full transition-all text-center active:scale-[0.98]"
              >
                Сагс үзэх ({totalItems})
              </Link>
              <Link
                href="/checkout"
                onClick={handleClose}
                className="flex-1 bg-[#0071e3] hover:bg-[#0077ed] text-white text-base md:text-sm font-semibold py-4 md:py-3.5 px-4 rounded-full transition-all text-center flex items-center justify-center gap-2 active:scale-[0.98] shadow-lg shadow-blue-500/25"
              >
                Төлбөр төлөх
                <ArrowRight className="h-5 w-5 md:h-4 md:w-4" />
              </Link>
            </div>
          </div>
          
          {/* Progress bar for auto-close */}
          {!isClosing && (
            <div className="h-1 bg-gray-100">
              <div 
                className="h-full bg-linear-to-r from-[#0071e3] to-[#00a1e3] animate-shrink-width"
                style={{ animationDuration: "4s" }}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
