"use client";

import { useEffect, useState, useCallback } from "react";
import { useCartStore, useUIStore } from "@/lib/store";
import { CloudinaryImage } from "@/components/Cloudinary";
import Link from "next/link";
import { X, Check, ShoppingBag, Sparkles } from "lucide-react";

export function CartNotification() {
  const { lastAddedItem, items, syncCart } = useCartStore();
  const { isCartNotificationOpen, closeCartNotification } = useUIStore();
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [displayItem, setDisplayItem] = useState(lastAddedItem);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      closeCartNotification();
    }, 300);
  }, [closeCartNotification]);

  // Handle animation states and sync cart to get correct data
  useEffect(() => {
    if (isCartNotificationOpen && lastAddedItem) {
      setDisplayItem(lastAddedItem);
      setIsVisible(true);
      setIsClosing(false);
      
      // Sync cart to ensure we have fresh data
      syncCart();
      
      const timer = setTimeout(() => {
        handleClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isCartNotificationOpen, lastAddedItem, handleClose, syncCart]);

  // Update displayItem when items change (after sync)
  useEffect(() => {
    if (displayItem && items.length > 0) {
      const updatedItem = items.find(item => item.variantId === displayItem.variantId);
      if (updatedItem && updatedItem.thumbnail !== displayItem.thumbnail) {
        setDisplayItem(prev => prev ? { ...prev, thumbnail: updatedItem.thumbnail } : prev);
      }
    }
  }, [items, displayItem]);

  const formatPrice = (amount: number) => {
    const formatted = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
    return `₮ ${formatted}`;
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

  if (!isVisible || !displayItem) return null;

  return (
    <>
      {/* Backdrop - subtle blur */}
      <div 
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isClosing ? "opacity-0" : "opacity-100"
        }`}
        onClick={handleClose}
      />

      {/* Notification Card */}
      <div 
        className={`fixed z-50 transition-all duration-300 ease-out
          bottom-0 left-0 right-0 
          md:bottom-auto md:left-auto md:top-24 md:right-6 md:w-[400px]
          ${isClosing 
            ? "translate-y-full md:translate-y-[-20px] md:opacity-0 md:scale-95" 
            : "translate-y-0 md:translate-y-0 md:opacity-100 md:scale-100"
          }`}
      >
        <div className="bg-white shadow-2xl shadow-black/20 rounded-t-3xl md:rounded-3xl overflow-hidden border border-gray-100">
          {/* Mobile drag handle */}
          <div className="md:hidden flex justify-center pt-3 pb-1">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
          </div>
          
          {/* Success Header with gradient */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#34c759] to-[#30d158] opacity-10" />
            <div className="relative px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#34c759] to-[#30d158] rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
                  <Check className="w-5 h-5 text-white" strokeWidth={3} />
                </div>
                <div>
                  <span className="text-[16px] font-semibold text-[#1d1d1f] block">Сагсанд нэмэгдлээ!</span>
                  <span className="text-[12px] text-[#86868b]">Та хүссэн үедээ дэлгүүр хэсэх боломжтой</span>
                </div>
              </div>
              <button 
                onClick={handleClose}
                className="text-[#86868b] hover:text-[#1d1d1f] transition-all p-2 hover:bg-gray-100 rounded-full hover:rotate-90 duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          {/* Product Card */}
          <div className="px-5 py-4">
            <div className="flex gap-4 p-4 bg-gradient-to-br from-[#fafafa] to-[#f5f5f7] rounded-2xl">
              {/* Product Image */}
              <Link 
                href={displayItem.handle ? `/products/${displayItem.handle}` : '#'}
                onClick={handleClose}
                className="relative h-24 w-24 shrink-0 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow group"
              >
                {displayItem.thumbnail ? (
                  <CloudinaryImage
                    src={displayItem.thumbnail}
                    alt={displayItem.title}
                    width={96}
                    height={96}
                    className="h-full w-full object-contain p-2 group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gray-50">
                    <ShoppingBag className="w-8 h-8 text-gray-300" />
                  </div>
                )}
              </Link>
              
              {/* Product Details */}
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <Link 
                  href={displayItem.handle ? `/products/${displayItem.handle}` : '#'}
                  onClick={handleClose}
                  className="text-[15px] font-semibold text-[#1d1d1f] line-clamp-2 leading-snug hover:text-[#0071e3] transition-colors"
                >
                  {displayItem.title}
                </Link>
                
                {/* Variant Attributes */}
                {displayItem.variantTitle && displayItem.variantTitle !== "Default" && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {displayItem.variantTitle.split(" / ").map((attr, idx) => (
                      <span 
                        key={idx}
                        className="inline-flex items-center px-2.5 py-1 bg-white text-[#1d1d1f] text-[11px] font-medium rounded-lg shadow-sm border border-gray-100"
                      >
                        {attr}
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Price & Quantity */}
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-[17px] font-bold text-[#1d1d1f]">
                    {formatPrice(displayItem.unitPrice)}
                  </span>
                  <span className="text-[13px] text-[#86868b]">
                    × {displayItem.quantity}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Cart Summary */}
          <div className="px-5 pb-4">
            <div className="flex items-center justify-between py-3 px-4 bg-[#f5f5f7] rounded-xl">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#86868b]" />
                <span className="text-[13px] text-[#86868b]">Сагсанд {totalItems} бараа</span>
              </div>
              <span className="text-[15px] font-semibold text-[#1d1d1f]">
                {formatPrice(totalPrice)}
              </span>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="px-5 pb-6 flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 py-3.5 px-4 rounded-xl border-2 border-gray-200 text-[15px] font-semibold text-[#1d1d1f] hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-[0.98]"
            >
              Үргэлжлүүлэх
            </button>
            <Link
              href="/cart"
              onClick={handleClose}
              className="flex-1 py-3.5 px-4 rounded-xl bg-[#0071e3] text-[15px] font-semibold text-white hover:bg-[#0077ed] transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
            >
              <span>Сагс үзэх</span>
              <Sparkles className="w-4 h-4" />
            </Link>
          </div>
          
          {/* Progress bar for auto-close */}
          {!isClosing && (
            <div className="h-1 bg-gray-100">
              <div 
                className="h-full bg-gradient-to-r from-[#0071e3] to-[#34c759] rounded-full"
                style={{ 
                  animation: "shrink-width 5s linear forwards"
                }}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
