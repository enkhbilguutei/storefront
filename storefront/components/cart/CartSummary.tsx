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
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Захиалгын мэдээлэл</h2>

      <div className="space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Барааны үнэ</span>
          <span className="font-medium text-gray-900">{formatPrice(cart.subtotal || 0)}</span>
        </div>

        {cart.discount_total && cart.discount_total > 0 ? (
          <div className="flex justify-between text-sm text-green-600">
            <span>Хямдрал</span>
            <span className="font-medium">-{formatPrice(cart.discount_total)}</span>
          </div>
        ) : null}

        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Хүргэлт</span>
          <span className="font-medium text-gray-900">
            {cart.shipping_total ? formatPrice(cart.shipping_total) : "Тооцоологдоогүй"}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Татвар</span>
          <span className="font-medium text-gray-900">{formatPrice(cart.tax_total || 0)}</span>
        </div>

        <div className="border-t border-gray-100 pt-6 mt-6">
          <div className="flex justify-between items-baseline">
            <span className="text-base font-semibold text-gray-900">Нийт</span>
            <div className="text-right">
              <span className="text-2xl font-bold text-gray-900">
                {formatPrice(cart.total || 0)}
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-right">
            НӨАТ орсон
          </p>
        </div>
      </div>

      <Link
        href="/checkout"
        className="w-full bg-gray-900 text-white rounded-xl py-4 px-6 mt-8 font-semibold text-sm hover:bg-gray-800 active:scale-[0.98] transition-all shadow-lg shadow-gray-200 hover:shadow-xl flex items-center justify-center gap-2"
      >
        <span>Худалдан авах</span>
        <ArrowRight className="w-4 h-4" />
      </Link>

      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
        <Lock className="w-3.5 h-3.5" />
        <span>Аюулгүй төлбөрийн систем</span>
      </div>
      
      {/* Trust Badges */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-center gap-2 text-xs text-gray-500">
        <ShieldCheck className="w-4 h-4 text-green-600" />
        <span>Баталгаатай бүтээгдэхүүн</span>
      </div>
    </div>
  );
}
