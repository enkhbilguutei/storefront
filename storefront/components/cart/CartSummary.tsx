"use client";

import { ArrowRight, ShieldCheck, Lock } from "lucide-react";
import Link from "next/link";

interface CartSummaryProps {
  cart: {
    subtotal?: number;
    discount_total?: number;
    shipping_total?: number;
    tax_total?: number;
    total?: number;
    currency_code: string;
  };
}

export function CartSummary({ cart }: CartSummaryProps) {
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("mn-MN", {
      style: "currency",
      currency: cart.currency_code.toUpperCase(),
    }).format(amount);
  };

  return (
    <div className="bg-white border border-gray-100 rounded-[1.5rem] p-6 lg:p-7">
      <h2 className="text-[19px] font-semibold text-[#1d1d1f] mb-6">Захиалгын мэдээлэл</h2>

      <div className="space-y-3">
        <div className="flex justify-between text-[15px]">
          <span className="text-[#86868b]">Барааны үнэ</span>
          <span className="font-medium text-[#1d1d1f]">{formatPrice(cart.subtotal || 0)}</span>
        </div>

        {cart.discount_total && cart.discount_total > 0 ? (
          <div className="flex justify-between text-[15px] text-[#34c759]">
            <span>Хямдрал</span>
            <span className="font-medium">-{formatPrice(cart.discount_total)}</span>
          </div>
        ) : null}

        <div className="flex justify-between text-[15px]">
          <span className="text-[#86868b]">Хүргэлт</span>
          <span className="font-medium text-[#1d1d1f]">
            {cart.shipping_total ? formatPrice(cart.shipping_total) : "Тооцоологдоогүй"}
          </span>
        </div>

        <div className="flex justify-between text-[15px]">
          <span className="text-[#86868b]">Татвар</span>
          <span className="font-medium text-[#1d1d1f]">{formatPrice(cart.tax_total || 0)}</span>
        </div>

        <div className="border-t border-gray-100 pt-4 mt-4">
          <div className="flex justify-between items-baseline">
            <span className="text-[17px] font-semibold text-[#1d1d1f]">Нийт</span>
            <div className="text-right">
              <span className="text-[24px] font-semibold text-[#1d1d1f]">
                {formatPrice(cart.total || 0)}
              </span>
            </div>
          </div>
          <p className="text-[13px] text-[#86868b] mt-1 text-right">
            НӨАТ орсон
          </p>
        </div>
      </div>

      <Link
        href="/checkout"
        className="w-full bg-[#0071e3] text-white rounded-[0.75rem] py-4 px-6 mt-6 font-semibold text-[17px] hover:bg-[#0077ed] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
      >
        <span>Худалдан авах</span>
        <ArrowRight className="w-5 h-5" />
      </Link>

      <div className="mt-5 flex items-center justify-center gap-2 text-[13px] text-[#86868b]">
        <Lock className="w-3.5 h-3.5" />
        <span>Аюулгүй төлбөрийн систем</span>
      </div>
      
      {/* Trust Badges */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-center gap-1.5 text-[12px] text-[#86868b]">
        <ShieldCheck className="w-4 h-4 text-[#34c759]" />
        <span>Баталгаатай бүтээгдэхүүн</span>
      </div>
    </div>
  );
}
