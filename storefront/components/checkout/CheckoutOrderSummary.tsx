"use client";

import Image from "next/image";
import { Package, ShoppingBag } from "lucide-react";

interface LineItem {
  id: string;
  title: string;
  quantity: number;
  thumbnail?: string;
  unit_price: number;
  variant?: {
    title?: string;
  };
}

interface CheckoutOrderSummaryProps {
  items: LineItem[];
  subtotal: number;
  shippingTotal: number;
  discountTotal: number;
  taxTotal: number;
  total: number;
  currencyCode: string;
  itemCount: number;
}

export function CheckoutOrderSummary({
  items,
  subtotal,
  shippingTotal,
  discountTotal,
  taxTotal,
  total,
  currencyCode,
  itemCount,
}: CheckoutOrderSummaryProps) {
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("mn-MN", {
      style: "currency",
      currency: currencyCode.toUpperCase(),
    }).format(amount);
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 sticky top-24">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
        <ShoppingBag className="w-5 h-5 text-[#1d1d1f]" />
        <h2 className="text-[17px] font-semibold text-[#1d1d1f]">
          Захиалгын мэдээлэл
        </h2>
        <span className="ml-auto text-[13px] text-[#86868b]">
          {itemCount} бараа
        </span>
      </div>

      {/* Items */}
      <div className="space-y-3 max-h-[300px] overflow-y-auto mb-4 pb-4 border-b border-gray-100">
        {items.map((item) => (
          <div key={item.id} className="flex gap-3">
            <div className="relative w-16 h-16 bg-[#f5f5f7] rounded-xl overflow-hidden shrink-0">
              {item.thumbnail ? (
                <Image
                  src={item.thumbnail}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-6 h-6 text-[#86868b]" />
                </div>
              )}
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#1d1d1f] text-white text-[11px] font-medium rounded-full flex items-center justify-center">
                {item.quantity}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-medium text-[#1d1d1f] line-clamp-1">
                {item.title}
              </p>
              {item.variant?.title && item.variant.title !== "Default" && (
                <p className="text-[12px] text-[#86868b] mt-0.5">
                  {item.variant.title}
                </p>
              )}
              <p className="text-[13px] font-medium text-[#1d1d1f] mt-1">
                {formatPrice(item.unit_price * item.quantity)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="space-y-2">
        <div className="flex justify-between text-[14px]">
          <span className="text-[#86868b]">Барааны үнэ</span>
          <span className="font-medium text-[#1d1d1f]">{formatPrice(subtotal)}</span>
        </div>

        {discountTotal > 0 && (
          <div className="flex justify-between text-[14px] text-[#34c759]">
            <span>Хямдрал</span>
            <span className="font-medium">-{formatPrice(discountTotal)}</span>
          </div>
        )}

        <div className="flex justify-between text-[14px]">
          <span className="text-[#86868b]">Хүргэлт</span>
          <span className="font-medium text-[#1d1d1f]">
            {shippingTotal > 0 ? formatPrice(shippingTotal) : "Үнэгүй"}
          </span>
        </div>

        <div className="flex justify-between text-[14px]">
          <span className="text-[#86868b]">Татвар</span>
          <span className="font-medium text-[#1d1d1f]">{formatPrice(taxTotal)}</span>
        </div>

        <div className="border-t border-gray-100 pt-3 mt-3">
          <div className="flex justify-between items-baseline">
            <span className="text-[16px] font-semibold text-[#1d1d1f]">Нийт</span>
            <div className="text-right">
              <span className="text-[22px] font-semibold text-[#1d1d1f]">
                {formatPrice(total)}
              </span>
            </div>
          </div>
          <p className="text-[12px] text-[#86868b] mt-0.5 text-right">
            НӨАТ орсон
          </p>
        </div>
      </div>
    </div>
  );
}
