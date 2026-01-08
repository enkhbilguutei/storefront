"use client";

import { ArrowRight, Lock, Tag, Percent } from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils/price";
import { useState } from "react";

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
  const [couponCode, setCouponCode] = useState("");
  const [showCouponInput, setShowCouponInput] = useState(false);

  return (
    <div className="space-y-4">
      {/* Voucher/Coupon Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center">
                <Tag className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Купон код</h3>
                <p className="text-xs text-gray-500">Хөнгөлөлт авах</p>
              </div>
            </div>
            {!showCouponInput && (
              <button
                onClick={() => setShowCouponInput(true)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Нэмэх
              </button>
            )}
          </div>

          {showCouponInput && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Код оруулах"
                  className="flex-1 px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase font-mono"
                />
                <button
                  disabled={!couponCode}
                  className="px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Хэрэглэх
                </button>
              </div>
              <button
                onClick={() => {
                  setShowCouponInput(false);
                  setCouponCode("");
                }}
                className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                Цуцлах
              </button>
            </div>
          )}

          {/* Available coupons hint */}
          <div className="mt-4 p-3 bg-gradient-to-r from-orange-50 to-pink-50 border border-orange-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Percent className="w-4 h-4 text-orange-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-900">Хөнгөлөлттэй купон байна</p>
                <p className="text-xs text-gray-600 mt-0.5">Та купон кодоо оруулаад хямдруулаарай</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Нийт дүн</h2>
        </div>

        <div className="p-5 space-y-4">
          {/* Price breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Барааны үнэ</span>
              <span className="font-semibold text-gray-900">{formatPrice(cart.subtotal || 0, cart.currency_code)}</span>
            </div>

            {cart.discount_total && cart.discount_total > 0 ? (
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-600">Хямдрал</span>
                <span className="font-semibold text-green-600">-{formatPrice(cart.discount_total, cart.currency_code)}</span>
              </div>
            ) : null}

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Хүргэлтийн төлбөр</span>
              <span className="font-semibold text-gray-900">
                {cart.shipping_total ? formatPrice(cart.shipping_total, cart.currency_code) : (
                  <span className="text-xs text-gray-500">Захиалгаар тооцоологдоно</span>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">НӨАТ (10%)</span>
              <span className="font-semibold text-gray-900">{formatPrice(cart.tax_total || 0, cart.currency_code)}</span>
            </div>
          </div>

          {/* Total */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-base font-bold text-gray-900">Нийт төлөх</span>
              <span className="text-2xl font-bold text-gray-900">
                {formatPrice(cart.total || 0, cart.currency_code)}
              </span>
            </div>
            <p className="text-xs text-gray-500">НӨАТ орсон</p>
          </div>

          {/* Checkout button */}
          <Link
            href="/checkout"
            className="hidden lg:flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-4 px-6 text-sm font-bold text-white hover:bg-blue-700 transition-all active:scale-[0.98] shadow-sm"
          >
            <span>Худалдан авах</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          {/* Security notice */}
          <div className="hidden lg:flex items-center justify-center gap-2 text-xs text-gray-500 pt-2">
            <Lock className="w-3.5 h-3.5" />
            <span>Аюулгүй төлбөрийн систем</span>
          </div>
        </div>
      </div>

      {/* Benefits banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
        <div className="space-y-2">
          <div className="flex items-start gap-2 text-xs">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
            <span className="text-gray-700">Үнэгүй хүргэлт 300,000₮-с дээш</span>
          </div>
          <div className="flex items-start gap-2 text-xs">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
            <span className="text-gray-700">14 хоногийн буцаалтын баталгаа</span>
          </div>
          <div className="flex items-start gap-2 text-xs">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
            <span className="text-gray-700">Жинхэнэ барааны баталгаа</span>
          </div>
        </div>
      </div>
    </div>
  );
}
