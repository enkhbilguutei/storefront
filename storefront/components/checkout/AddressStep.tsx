"use client";

import { Check, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import type { CheckoutAddressInput } from "@/lib/validations";

interface ShippingOption {
  id: string;
  name: string;
  amount: number;
  description?: string;
}

interface AddressStepProps {
  address: Partial<CheckoutAddressInput>;
  onAddressChange: (field: keyof CheckoutAddressInput, value: string) => void;
  shippingOptions: ShippingOption[];
  selectedShippingOption: string | null;
  onShippingOptionChange: (optionId: string) => void;
  isExpanded: boolean;
  isCompleted: boolean;
  onToggle: () => void;
  isDisabled?: boolean;
  isLoadingShipping?: boolean;
  currencyCode: string;
  errors?: Partial<Record<keyof CheckoutAddressInput, string>>;
}

export function AddressStep({
  address,
  onAddressChange,
  shippingOptions,
  selectedShippingOption,
  onShippingOptionChange,
  isExpanded,
  isCompleted,
  onToggle,
  isDisabled,
  isLoadingShipping,
  currencyCode,
  errors,
}: AddressStepProps) {
  const formatPrice = (amount: number) => {
    if (amount === 0) return "Үнэгүй";
    return new Intl.NumberFormat("mn-MN", {
      style: "currency",
      currency: currencyCode.toUpperCase(),
    }).format(amount);
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
              <span className="text-[14px] font-semibold text-[#1d1d1f]">3</span>
            )}
          </div>
          <div className="text-left">
            <h3 className="text-[16px] font-semibold text-[#1d1d1f]">
              Хүргэлтийн хаяг
            </h3>
            {isCompleted && !isExpanded && address.city && (
              <p className="text-[13px] text-[#86868b] mt-0.5 line-clamp-1">
                {address.city}, {address.district}, {address.khoroo}
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
        <div className="px-5 pb-5 space-y-4">
          {/* City / Aimag */}
          <div>
            <label className="block text-[14px] font-medium text-[#1d1d1f] mb-2">
              Хот/Аймаг *
            </label>
            <select
              value={address.city || ""}
              onChange={(e) => onAddressChange("city", e.target.value)}
              className={`w-full px-4 py-3.5 bg-[#f5f5f7] border rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 focus:border-[#0071e3] transition-all appearance-none cursor-pointer ${
                errors?.city ? "border-red-500" : "border-transparent"
              }`}
            >
              <option value="">Сонгоно уу</option>
              <option value="Улаанбаатар">Улаанбаатар</option>
              <option value="Дархан-Уул">Дархан-Уул</option>
              <option value="Орхон">Орхон (Эрдэнэт)</option>
              <option value="Архангай">Архангай</option>
              <option value="Баян-Өлгий">Баян-Өлгий</option>
              <option value="Баянхонгор">Баянхонгор</option>
              <option value="Булган">Булган</option>
              <option value="Говь-Алтай">Говь-Алтай</option>
              <option value="Говьсүмбэр">Говьсүмбэр</option>
              <option value="Дорноговь">Дорноговь</option>
              <option value="Дорнод">Дорнод</option>
              <option value="Дундговь">Дундговь</option>
              <option value="Завхан">Завхан</option>
              <option value="Өвөрхангай">Өвөрхангай</option>
              <option value="Өмнөговь">Өмнөговь</option>
              <option value="Сүхбаатар">Сүхбаатар</option>
              <option value="Сэлэнгэ">Сэлэнгэ</option>
              <option value="Төв">Төв</option>
              <option value="Увс">Увс</option>
              <option value="Ховд">Ховд</option>
              <option value="Хөвсгөл">Хөвсгөл</option>
              <option value="Хэнтий">Хэнтий</option>
            </select>
            {errors?.city && (
              <p className="text-red-500 text-[13px] mt-1.5">{errors.city}</p>
            )}
          </div>

          {/* District / Sum */}
          <div>
            <label className="block text-[14px] font-medium text-[#1d1d1f] mb-2">
              Дүүрэг/Сум *
            </label>
            {address.city === "Улаанбаатар" ? (
              <select
                value={address.district || ""}
                onChange={(e) => onAddressChange("district", e.target.value)}
                className={`w-full px-4 py-3.5 bg-[#f5f5f7] border rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 focus:border-[#0071e3] transition-all appearance-none cursor-pointer ${
                  errors?.district ? "border-red-500" : "border-transparent"
                }`}
              >
                <option value="">Сонгоно уу</option>
                <option value="Багануур">Багануур</option>
                <option value="Багахангай">Багахангай</option>
                <option value="Баянгол">Баянгол</option>
                <option value="Баянзүрх">Баянзүрх</option>
                <option value="Налайх">Налайх</option>
                <option value="Сонгинохайрхан">Сонгинохайрхан</option>
                <option value="Сүхбаатар">Сүхбаатар</option>
                <option value="Хан-Уул">Хан-Уул</option>
                <option value="Чингэлтэй">Чингэлтэй</option>
              </select>
            ) : (
              <input
                type="text"
                value={address.district || ""}
                onChange={(e) => onAddressChange("district", e.target.value)}
                placeholder="Сум"
                className={`w-full px-4 py-3.5 bg-[#f5f5f7] border rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 focus:border-[#0071e3] transition-all ${
                  errors?.district ? "border-red-500" : "border-transparent"
                }`}
              />
            )}
            {errors?.district && (
              <p className="text-red-500 text-[13px] mt-1.5">{errors.district}</p>
            )}
          </div>

          {/* Khoroo / Bag */}
          <div>
            <label className="block text-[14px] font-medium text-[#1d1d1f] mb-2">
              Хороо/Баг *
            </label>
            <input
              type="text"
              value={address.khoroo || ""}
              onChange={(e) => onAddressChange("khoroo", e.target.value)}
              placeholder={address.city === "Улаанбаатар" ? "Хороо (жишээ: 1-р хороо)" : "Баг"}
              className={`w-full px-4 py-3.5 bg-[#f5f5f7] border rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 focus:border-[#0071e3] transition-all ${
                errors?.khoroo ? "border-red-500" : "border-transparent"
              }`}
            />
            {errors?.khoroo && (
              <p className="text-red-500 text-[13px] mt-1.5">{errors.khoroo}</p>
            )}
          </div>

          {/* Street */}
          <div>
            <label className="block text-[14px] font-medium text-[#1d1d1f] mb-2">
              Гудамж *
            </label>
            <input
              type="text"
              value={address.street || ""}
              onChange={(e) => onAddressChange("street", e.target.value)}
              placeholder="Гудамжийн нэр"
              className={`w-full px-4 py-3.5 bg-[#f5f5f7] border rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 focus:border-[#0071e3] transition-all ${
                errors?.street ? "border-red-500" : "border-transparent"
              }`}
            />
            {errors?.street && (
              <p className="text-red-500 text-[13px] mt-1.5">{errors.street}</p>
            )}
          </div>

          {/* Building and Apartment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[14px] font-medium text-[#1d1d1f] mb-2">
                Байрны дугаар *
              </label>
              <input
                type="text"
                value={address.building || ""}
                onChange={(e) => onAddressChange("building", e.target.value)}
                placeholder="Байрны дугаар"
                className={`w-full px-4 py-3.5 bg-[#f5f5f7] border rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 focus:border-[#0071e3] transition-all ${
                  errors?.building ? "border-red-500" : "border-transparent"
                }`}
              />
              {errors?.building && (
                <p className="text-red-500 text-[13px] mt-1.5">{errors.building}</p>
              )}
            </div>
            <div>
              <label className="block text-[14px] font-medium text-[#1d1d1f] mb-2">
                Тоот *
              </label>
              <input
                type="text"
                value={address.apartment || ""}
                onChange={(e) => onAddressChange("apartment", e.target.value)}
                placeholder="Орц, давхар, тоот"
                className={`w-full px-4 py-3.5 bg-[#f5f5f7] border rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 focus:border-[#0071e3] transition-all ${
                  errors?.apartment ? "border-red-500" : "border-transparent"
                }`}
              />
              {errors?.apartment && (
                <p className="text-red-500 text-[13px] mt-1.5">{errors.apartment}</p>
              )}
            </div>
          </div>

          {/* Additional info */}
          <div>
            <label className="block text-[14px] font-medium text-[#1d1d1f] mb-2">
              Нэмэлт мэдээлэл
            </label>
            <textarea
              value={address.additionalInfo || ""}
              onChange={(e) => onAddressChange("additionalInfo", e.target.value)}
              placeholder="Хүргэлтийн нэмэлт зааварчилгаа (жишээ: урд хаалга, код 1234)"
              rows={2}
              className="w-full px-4 py-3.5 bg-[#f5f5f7] border border-transparent rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 focus:border-[#0071e3] transition-all resize-none"
            />
          </div>

          {/* Shipping Options */}
          <div className="pt-4 border-t border-gray-100">
            <label className="block text-[14px] font-medium text-[#1d1d1f] mb-3">
              Хүргэлтийн сонголт *
            </label>
            
            {isLoadingShipping ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-6 h-6 animate-spin text-[#0071e3]" />
                <span className="ml-2 text-[14px] text-[#86868b]">Хүргэлт тооцоолж байна...</span>
              </div>
            ) : shippingOptions.length > 0 ? (
              <div className="space-y-2">
                {shippingOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => onShippingOptionChange(option.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                      selectedShippingOption === option.id
                        ? "border-[#0071e3] bg-[#0071e3]/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedShippingOption === option.id
                          ? "border-[#0071e3]"
                          : "border-gray-300"
                      }`}>
                        {selectedShippingOption === option.id && (
                          <div className="w-2.5 h-2.5 rounded-full bg-[#0071e3]" />
                        )}
                      </div>
                      <div className="text-left">
                        <p className="text-[14px] font-medium text-[#1d1d1f]">
                          {option.name}
                        </p>
                        {option.description && (
                          <p className="text-[12px] text-[#86868b]">
                            {option.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className={`text-[14px] font-medium ${
                      option.amount === 0 ? "text-[#34c759]" : "text-[#1d1d1f]"
                    }`}>
                      {formatPrice(option.amount)}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-[14px] text-[#86868b] text-center py-4">
                Хаягаа бөглөж дууссаны дараа хүргэлтийн сонголтууд гарч ирнэ
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
