"use client";

import { Truck, ShieldCheck, PhoneCall, Lock } from "lucide-react";

export const FREE_SHIPPING_THRESHOLD_DEFAULT = 300000;

interface FreeShippingProgressProps {
  subtotal: number;
  threshold?: number;
  compact?: boolean;
  className?: string;
}

export function FreeShippingProgress({
  subtotal,
  threshold = FREE_SHIPPING_THRESHOLD_DEFAULT,
  compact = false,
  className = "",
}: FreeShippingProgressProps) {
  const progress = Math.min(100, Math.round((subtotal / threshold) * 100));
  const remaining = Math.max(0, threshold - subtotal);

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat("mn-MN").format(Math.max(0, Math.round(amount)));

  return (
    <div className={className}>
      <div className="flex items-center justify-between text-sm font-semibold text-gray-900">
        <span>Үнэгүй хүргэлт</span>
        <span>{progress}%</span>
      </div>
      <div className="relative h-2.5 rounded-full bg-white border border-blue-100 overflow-hidden mt-2">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-600 via-blue-500 to-teal-400 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between text-xs text-gray-500">
        <span>₮0</span>
        <span>₮{formatAmount(threshold)}</span>
      </div>
      <p className="text-xs text-gray-600 mt-2">
        {remaining > 0
          ? `Үнэгүй хүргэлтэд хүрэхэд ₮${formatAmount(remaining)} дутуу байна.`
          : "Баяр хүргэе! Үнэгүй хүргэлт идэвхтэй."}
      </p>
      {!compact && remaining > 0 && (
        <p className="text-[11px] text-gray-500 mt-1">
          Сагсандаа нэмэлт бүтээгдэхүүн нэмснээр хүргэлт таны зардалгүй болно.
        </p>
      )}
    </div>
  );
}

interface TrustBadgesProps {
  variant?: "grid" | "inline";
  supportPhone?: string;
  className?: string;
}

export function TrustBadges({
  variant = "grid",
  supportPhone = "7777-7777",
  className = "",
}: TrustBadgesProps) {
  const badges = [
    { icon: Truck, label: "24-48 цаг хүргэлт", tone: "text-gray-700" },
    { icon: ShieldCheck, label: "Албан ёсны баталгаа", tone: "text-green-600" },
    { icon: Lock, label: "3D Secure карт", tone: "text-gray-700" },
    { icon: PhoneCall, label: `Дэмжлэг: ${supportPhone}`, tone: "text-blue-600" },
  ];

  const layoutClass =
    variant === "grid"
      ? "grid grid-cols-2 gap-3"
      : "flex flex-wrap items-center gap-2";

  const itemClass =
    variant === "grid"
      ? "flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs text-gray-600"
      : "flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-full px-3 py-1.5 text-xs text-gray-600";

  return (
    <div className={`${layoutClass} ${className}`}>
      {badges.map((badge) => (
        <div key={badge.label} className={itemClass}>
          <badge.icon className={`w-4 h-4 ${badge.tone}`} />
          <span>{badge.label}</span>
        </div>
      ))}
    </div>
  );
}
