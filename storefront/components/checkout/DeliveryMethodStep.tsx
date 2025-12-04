"use client";

import { Truck, Store, Check, ChevronDown, ChevronUp, Clock, MapPin } from "lucide-react";
import type { CheckoutDeliveryMethod } from "@/lib/validations";

// Store pickup location info
const STORE_INFO = {
  name: "Alimhan Store",
  address: "Сүхбаатар дүүрэг, 1-р хороо, Бага тойруу, Peace Tower, 1 давхар",
  city: "Улаанбаатар",
  hours: "Даваа-Баасан: 10:00 - 20:00, Бямба-Ням: 11:00 - 18:00",
  phone: "7700-1234",
};

interface DeliveryMethodStepProps {
  deliveryMethod: CheckoutDeliveryMethod | null;
  onDeliveryMethodChange: (method: CheckoutDeliveryMethod) => void;
  isExpanded: boolean;
  isCompleted: boolean;
  onToggle: () => void;
  isDisabled?: boolean;
}

export function DeliveryMethodStep({
  deliveryMethod,
  onDeliveryMethodChange,
  isExpanded,
  isCompleted,
  onToggle,
  isDisabled,
}: DeliveryMethodStepProps) {
  return (
    <div className={`bg-white border border-gray-100 rounded-2xl overflow-hidden ${
      isDisabled ? "opacity-60 pointer-events-none" : ""
    }`}>
      {/* Header */}
      <button
        type="button"
        onClick={onToggle}
        disabled={isDisabled}
        className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors disabled:hover:bg-white"
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isCompleted ? "bg-[#34c759]" : "bg-[#f5f5f7]"
          }`}>
            {isCompleted ? (
              <Check className="w-4 h-4 text-white" />
            ) : (
              <span className="text-[14px] font-semibold text-[#1d1d1f]">2</span>
            )}
          </div>
          <div className="text-left">
            <h3 className="text-[16px] font-semibold text-[#1d1d1f]">
              Хүргэлтийн төрөл
            </h3>
            {isCompleted && !isExpanded && deliveryMethod && (
              <p className="text-[13px] text-[#86868b] mt-0.5">
                {deliveryMethod === "delivery" ? "Хүргэлт" : "Дэлгүүрээс авах"}
              </p>
            )}
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-[#86868b]" />
        ) : (
          <ChevronDown className="w-5 h-5 text-[#86868b]" />
        )}
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="px-5 pb-5 space-y-3">
          {/* Delivery Option */}
          <button
            type="button"
            onClick={() => onDeliveryMethodChange("delivery")}
            className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 transition-all ${
              deliveryMethod === "delivery"
                ? "border-[#0071e3] bg-[#0071e3]/5"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              deliveryMethod === "delivery" ? "bg-[#0071e3]" : "bg-[#f5f5f7]"
            }`}>
              <Truck className={`w-5 h-5 ${
                deliveryMethod === "delivery" ? "text-white" : "text-[#1d1d1f]"
              }`} />
            </div>
            <div className="flex-1 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[15px] font-semibold text-[#1d1d1f]">
                  Хүргэлт
                </span>
                {deliveryMethod === "delivery" && (
                  <Check className="w-5 h-5 text-[#0071e3]" />
                )}
              </div>
              <p className="text-[13px] text-[#86868b] mt-1">
                Таны хаягт хүргэнэ
              </p>
            </div>
          </button>

          {/* Pickup Option */}
          <button
            type="button"
            onClick={() => onDeliveryMethodChange("pickup")}
            className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 transition-all ${
              deliveryMethod === "pickup"
                ? "border-[#0071e3] bg-[#0071e3]/5"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              deliveryMethod === "pickup" ? "bg-[#0071e3]" : "bg-[#f5f5f7]"
            }`}>
              <Store className={`w-5 h-5 ${
                deliveryMethod === "pickup" ? "text-white" : "text-[#1d1d1f]"
              }`} />
            </div>
            <div className="flex-1 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[15px] font-semibold text-[#1d1d1f]">
                  Дэлгүүрээс авах
                </span>
                <span className="text-[13px] font-medium text-[#34c759]">
                  Үнэгүй
                </span>
              </div>
              <p className="text-[13px] text-[#86868b] mt-1">
                Дэлгүүрт ирж өөрөө авах
              </p>
            </div>
          </button>

          {/* Pickup Store Info */}
          {deliveryMethod === "pickup" && (
            <div className="mt-4 p-4 bg-[#f5f5f7] rounded-xl space-y-3">
              <h4 className="text-[14px] font-semibold text-[#1d1d1f]">
                {STORE_INFO.name}
              </h4>
              
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#86868b] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[13px] text-[#1d1d1f]">{STORE_INFO.address}</p>
                  <p className="text-[13px] text-[#86868b]">{STORE_INFO.city}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#86868b] mt-0.5 flex-shrink-0" />
                <p className="text-[13px] text-[#1d1d1f]">{STORE_INFO.hours}</p>
              </div>

              <div className="pt-2 border-t border-gray-200">
                <p className="text-[12px] text-[#86868b]">
                  Захиалга баталгаажсаны дараа 1-2 цагийн дотор бэлэн болно
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
