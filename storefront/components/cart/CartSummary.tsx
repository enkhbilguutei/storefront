"use client";

import { ArrowRight, ShieldCheck } from "lucide-react";
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
    <div className="bg-gray-50 rounded-2xl p-6 lg:p-8 h-fit sticky top-24">
      <h2 className="text-xl font-semibold text-[#1d1d1f] mb-6">Захиалгын мэдээлэл</h2>

      <div className="space-y-4">
        <div className="flex justify-between text-[#424245]">
          <span>Барааны үнэ</span>
          <span className="font-medium">{formatPrice(cart.subtotal || 0)}</span>
        </div>

        {cart.discount_total && cart.discount_total > 0 ? (
          <div className="flex justify-between text-green-600">
            <span>Хямдрал</span>
            <span className="font-medium">-{formatPrice(cart.discount_total)}</span>
          </div>
        ) : null}

        <div className="flex justify-between text-[#424245]">
          <span>Хүргэлт</span>
          <span className="font-medium">
            {cart.shipping_total ? formatPrice(cart.shipping_total) : "Тооцоологдоогүй"}
          </span>
        </div>

        <div className="flex justify-between text-[#424245]">
          <span>Татвар</span>
          <span className="font-medium">{formatPrice(cart.tax_total || 0)}</span>
        </div>

        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="flex justify-between items-end">
            <span className="text-lg font-semibold text-[#1d1d1f]">Нийт дүн</span>
            <div className="text-right">
              <span className="text-2xl font-bold text-[#1d1d1f] block">
                {formatPrice(cart.total || 0)}
              </span>
              <span className="text-xs text-[#86868b] mt-1 block">
                НӨАТ орсон дүн
              </span>
            </div>
          </div>
        </div>
      </div>

      <Link
        href="/checkout"
        className="w-full bg-[#0071e3] text-white rounded-xl py-4 px-6 mt-8 font-medium hover:bg-[#0077ed] active:scale-[0.98] transition-all flex items-center justify-center group shadow-lg shadow-blue-500/20"
      >
        <span>Худалдан авах</span>
        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
      </Link>

      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[#86868b]">
        <ShieldCheck className="w-4 h-4" />
        <span>Төлбөрийн найдвартай байдал хангагдсан</span>
      </div>
    </div>
  );
}
