"use client";

import { ArrowRight, Lock, Calendar, ReceiptText, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils/price";

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
  const today = new Date().toLocaleDateString("mn-MN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return (
    <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      {/* Header gradient matching checkout */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#0f4ab8] to-[#1d8dd8]" aria-hidden />
      
      {/* Decorative elements */}
      <div className="absolute -left-4 top-32 h-8 w-8 rounded-full border border-slate-200 bg-slate-50" aria-hidden />
      <div className="absolute -right-4 top-48 h-8 w-8 rounded-full border border-slate-200 bg-slate-50" aria-hidden />

      <div className="relative z-10 p-5 space-y-5">
        {/* Header with icon */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-r from-[#0f4ab8] to-[#1d8dd8] flex items-center justify-center shadow-sm">
                <ShoppingBag className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Төлбөрийн баримт</p>
                <h2 className="text-lg font-bold text-slate-900">Захиалгын мэдээлэл</h2>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 ml-11">
              <Calendar className="w-3.5 h-3.5" />
              <span className="font-mono">{today}</span>
            </div>
          </div>
          <div className="shrink-0 rounded-lg bg-slate-900 text-white px-3 py-2 flex items-center gap-2 text-xs font-semibold shadow-sm">
            <ReceiptText className="w-4 h-4" />
            <span>Баримт</span>
          </div>
        </div>

        {/* Price breakdown */}
        <div className="space-y-3 rounded-lg border border-slate-100 bg-slate-50/60 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Барааны үнэ</span>
            <span className="font-semibold text-slate-900 font-mono">{formatPrice(cart.subtotal || 0, cart.currency_code)}</span>
          </div>

          {cart.discount_total && cart.discount_total > 0 ? (
            <div className="flex items-center justify-between text-sm text-emerald-600">
              <span>Хямдрал</span>
              <span className="font-semibold font-mono">-{formatPrice(cart.discount_total, cart.currency_code)}</span>
            </div>
          ) : null}

          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Хүргэлт</span>
            <span className="font-semibold text-slate-900 font-mono">
              {cart.shipping_total ? formatPrice(cart.shipping_total, cart.currency_code) : "Тооцоологдоогүй"}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Татвар</span>
            <span className="font-semibold text-slate-900 font-mono">{formatPrice(cart.tax_total || 0, cart.currency_code)}</span>
          </div>

          {/* Total section */}
          <div className="border-t border-dashed border-slate-200 pt-3 mt-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold text-slate-900">Нийт</span>
                <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">НӨАТ орсон</span>
              </div>
              <span className="text-2xl font-black tracking-tight text-slate-900 font-mono">
                {formatPrice(cart.total || 0, cart.currency_code)}
              </span>
            </div>
          </div>
        </div>

        {/* Payment info banner */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 border border-dashed border-slate-200 rounded-lg px-3 py-2">
          <span>Төлбөр хийхдээ QR болон карт ашиглах боломжтой.</span>
          <span className="font-semibold text-slate-700">Аюулгүй</span>
        </div>

        {/* Checkout button */}
        <Link
          href="/checkout"
          className="hidden lg:flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#0f4ab8] to-[#1d8dd8] py-4 px-6 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
        >
          <span>Худалдан авах</span>
          <ArrowRight className="w-4 h-4" />
        </Link>

        {/* Security notice */}
        <div className="hidden lg:flex items-center justify-center gap-2 text-xs text-slate-500">
          <Lock className="w-3.5 h-3.5" />
          <span>Аюулгүй төлбөрийн систем</span>
        </div>
      </div>
    </div>
  );
}
