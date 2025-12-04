"use client";

import { Building2, Banknote, Check, ChevronDown, ChevronUp, Info, Copy, CheckCheck } from "lucide-react";
import { useState } from "react";
import type { CheckoutPaymentMethod } from "@/lib/validations";

// Bank transfer info
const BANK_INFO = {
  bankName: "Хаан Банк",
  accountNumber: "5000 1234 5678",
  accountName: "Алимхан ХХК",
  note: "Гүйлгээний утга дээр захиалгын дугаар бичнэ үү",
};

interface PaymentStepProps {
  paymentMethod: CheckoutPaymentMethod | null;
  onPaymentMethodChange: (method: CheckoutPaymentMethod) => void;
  isExpanded: boolean;
  isCompleted: boolean;
  onToggle: () => void;
  isDisabled?: boolean;
}

export function PaymentStep({
  paymentMethod,
  onPaymentMethodChange,
  isExpanded,
  isCompleted,
  onToggle,
  isDisabled,
}: PaymentStepProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

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
              <span className="text-[14px] font-semibold text-[#1d1d1f]">4</span>
            )}
          </div>
          <div className="text-left">
            <h3 className="text-[16px] font-semibold text-[#1d1d1f]">
              Төлбөрийн хэлбэр
            </h3>
            {isCompleted && !isExpanded && paymentMethod && (
              <p className="text-[13px] text-[#86868b] mt-0.5">
                {paymentMethod === "bank_transfer" ? "Банкны шилжүүлэг" : "Хүргэлтээр төлөх"}
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
          {/* Bank Transfer Option */}
          <button
            type="button"
            onClick={() => onPaymentMethodChange("bank_transfer")}
            className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 transition-all ${
              paymentMethod === "bank_transfer"
                ? "border-[#0071e3] bg-[#0071e3]/5"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              paymentMethod === "bank_transfer" ? "bg-[#0071e3]" : "bg-[#f5f5f7]"
            }`}>
              <Building2 className={`w-5 h-5 ${
                paymentMethod === "bank_transfer" ? "text-white" : "text-[#1d1d1f]"
              }`} />
            </div>
            <div className="flex-1 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[15px] font-semibold text-[#1d1d1f]">
                  Банкны шилжүүлэг
                </span>
                {paymentMethod === "bank_transfer" && (
                  <Check className="w-5 h-5 text-[#0071e3]" />
                )}
              </div>
              <p className="text-[13px] text-[#86868b] mt-1">
                Банкны апп эсвэл интернет банкаар шилжүүлнэ
              </p>
            </div>
          </button>

          {/* Bank Transfer Info */}
          {paymentMethod === "bank_transfer" && (
            <div className="mt-3 p-4 bg-[#f5f5f7] rounded-xl space-y-3">
              <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg">
                <Info className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <p className="text-[13px] text-amber-800">
                  Захиалга баталгаажсаны дараа доорх данс руу шилжүүлээрэй. 
                  Төлбөр баталгаажсаны дараа бараа илгээгдэнэ.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div>
                    <p className="text-[12px] text-[#86868b]">Банк</p>
                    <p className="text-[14px] font-medium text-[#1d1d1f]">{BANK_INFO.bankName}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div>
                    <p className="text-[12px] text-[#86868b]">Дансны дугаар</p>
                    <p className="text-[14px] font-medium text-[#1d1d1f]">{BANK_INFO.accountNumber}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(BANK_INFO.accountNumber.replace(/\s/g, ""), "account")}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {copiedField === "account" ? (
                      <CheckCheck className="w-4 h-4 text-[#34c759]" />
                    ) : (
                      <Copy className="w-4 h-4 text-[#86868b]" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div>
                    <p className="text-[12px] text-[#86868b]">Хүлээн авагч</p>
                    <p className="text-[14px] font-medium text-[#1d1d1f]">{BANK_INFO.accountName}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(BANK_INFO.accountName, "name")}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {copiedField === "name" ? (
                      <CheckCheck className="w-4 h-4 text-[#34c759]" />
                    ) : (
                      <Copy className="w-4 h-4 text-[#86868b]" />
                    )}
                  </button>
                </div>
              </div>

              <p className="text-[12px] text-[#86868b] pt-2 border-t border-gray-200">
                {BANK_INFO.note}
              </p>
            </div>
          )}

          {/* Cash on Delivery Option */}
          <button
            type="button"
            onClick={() => onPaymentMethodChange("cash_on_delivery")}
            className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 transition-all ${
              paymentMethod === "cash_on_delivery"
                ? "border-[#0071e3] bg-[#0071e3]/5"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              paymentMethod === "cash_on_delivery" ? "bg-[#0071e3]" : "bg-[#f5f5f7]"
            }`}>
              <Banknote className={`w-5 h-5 ${
                paymentMethod === "cash_on_delivery" ? "text-white" : "text-[#1d1d1f]"
              }`} />
            </div>
            <div className="flex-1 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[15px] font-semibold text-[#1d1d1f]">
                  Хүргэлтээр төлөх
                </span>
                {paymentMethod === "cash_on_delivery" && (
                  <Check className="w-5 h-5 text-[#0071e3]" />
                )}
              </div>
              <p className="text-[13px] text-[#86868b] mt-1">
                Бараа хүлээн авахдаа бэлнээр төлнө
              </p>
            </div>
          </button>

          {paymentMethod === "cash_on_delivery" && (
            <div className="mt-3 p-4 bg-[#f5f5f7] rounded-xl">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-[#86868b] mt-0.5 shrink-0" />
                <p className="text-[13px] text-[#1d1d1f]">
                  Хүргэлтийн ажилтанд бэлэн мөнгө эсвэл QPay-ээр төлнө үү
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
