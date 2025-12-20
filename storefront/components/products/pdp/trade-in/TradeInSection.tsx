"use client";

import { useState } from "react";

interface TradeInSectionProps {
  isTradeInEligible: boolean;
  cartId: string | null;
  onEstimate: (form: TradeInFormData) => Promise<void>;
  onApply: (form: TradeInFormData) => Promise<void>;
  onRemove: () => Promise<void>;
  tradeInEstimate: { matched: boolean; estimated_amount: number; currency_code: string } | null;
  appliedTradeIn: {
    estimated_amount: number;
    currency_code: string;
    promotion_code?: string;
    trade_in_request_id?: string;
  } | null;
  formatPrice: (amount: number, currency: string) => string;
  isEstimatingTradeIn: boolean;
  isApplyingTradeIn: boolean;
  isRemovingTradeIn: boolean;
}

export type TradeInCondition = "like_new" | "good" | "fair" | "broken";

export interface TradeInFormData {
  serial_number: string;
  old_device_condition: TradeInCondition;
  device_checks: {
    screen_cracked: boolean | null;
    liquid_damage: boolean | null;
    buttons_working: boolean | null;
    camera_working: boolean | null;
  };
}

const deviceCheckQuestions = [
  { key: "screen_cracked" as const, label: "Дэлгэц бүтэн эсэх?" },
  { key: "liquid_damage" as const, label: "Усанд орсон уу?" },
  { key: "buttons_working" as const, label: "Товч ажиллах уу?" },
  { key: "camera_working" as const, label: "Камер ажиллах уу?" },
];

export function TradeInSection({
  isTradeInEligible,
  cartId,
  onEstimate,
  onApply,
  onRemove,
  tradeInEstimate,
  appliedTradeIn,
  formatPrice,
  isEstimatingTradeIn,
  isApplyingTradeIn,
  isRemovingTradeIn,
}: TradeInSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<TradeInFormData>({
    serial_number: "",
    old_device_condition: "good",
    device_checks: {
      screen_cracked: null,
      liquid_damage: null,
      buttons_working: null,
      camera_working: null,
    },
  });

  const setDeviceCheck = (key: keyof TradeInFormData["device_checks"], value: boolean) => {
    setForm((p) => ({
      ...p,
      device_checks: { ...p.device_checks, [key]: value },
    }));
  };

  const handleEstimate = async () => {
    await onEstimate(form);
  };

  const handleApply = async () => {
    await onApply(form);
  };

  if (!isTradeInEligible) {
    return null;
  }

  return (
    <div id="tradein-form" className="mb-8 rounded-3xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-linear-to-r from-[#f2f6ff] via-white to-[#f9fbff] border-b border-gray-100 px-4 py-3 rounded-t-3xl">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.08em] text-[#6b7280]">Алхам 1</p>
          <h3 className="text-base md:text-lg font-semibold text-[#1d1d1f]">
            Төхөөрөмжөө үнэлүүлээд шууд хөнгөлөлт аваарай
          </h3>
          <p className="text-xs text-[#6b7280]">IMEI/Serial баталгаажуулалт, хурдан шалгалт</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {appliedTradeIn ? (
            <span className="text-xs md:text-sm px-3 py-1.5 rounded-full bg-[#e8f2ff] text-[#0b6cd4] border border-[#b6d5ff]">
              Хөнгөлөлт идэвхтэй
            </span>
          ) : tradeInEstimate && tradeInEstimate.matched ? (
            <span className="text-xs md:text-sm px-3 py-1.5 rounded-full bg-[#f5f5f7] text-[#1d1d1f] border border-gray-200">
              Урьдчилсан: {formatPrice(tradeInEstimate.estimated_amount, tradeInEstimate.currency_code)}
            </span>
          ) : null}
          <button
            type="button"
            onClick={() => {
              setShowForm((prev) => !prev);
              if (!showForm) {
                setTimeout(() => {
                  document.getElementById("tradein-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 0);
              }
            }}
            className="text-sm font-semibold rounded-full px-4 py-2 bg-[#0071e3] text-white hover:bg-[#005bbd] transition-colors"
          >
            {showForm ? "Хураах" : "Үнэлгээ эхлүүлэх"}
          </button>
        </div>
      </div>

      {showForm ? (
        <div className="grid md:grid-cols-2 gap-6 p-4 md:p-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-xs text-[#86868b]">Сериал / IMEI</label>
              <input
                value={form.serial_number}
                onChange={(e) => setForm((p) => ({ ...p, serial_number: e.target.value }))}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0071e3]/70"
                placeholder="15-17 оронтой дугаар"
                inputMode="numeric"
              />
              <p className="text-[11px] text-[#9ca3af]">* IMEI 1 ашиглаарай. Шалгалтын үед тулгаж баталгаажуулна.</p>
            </div>

            <div>
              <label className="block text-xs text-[#86868b] mb-1">Төлөв</label>
              <select
                value={form.old_device_condition}
                onChange={(e) => setForm((p) => ({ ...p, old_device_condition: e.target.value as TradeInCondition }))}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0071e3]/70"
              >
                <option value="like_new">Шинэ мэт</option>
                <option value="good">Сайн</option>
                <option value="fair">Дунд</option>
                <option value="broken">Эвдрэлтэй</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleEstimate}
                disabled={isEstimatingTradeIn}
                className="w-full rounded-2xl border border-gray-200 bg-white py-3 text-sm font-semibold text-[#1d1d1f] disabled:opacity-60"
              >
                {isEstimatingTradeIn ? "Тооцоолж байна..." : "Үнэлгээ авах"}
              </button>

              <button
                type="button"
                onClick={handleApply}
                disabled={isApplyingTradeIn || !cartId}
                className="w-full rounded-2xl bg-[#0071e3] text-white py-3 text-sm font-semibold disabled:opacity-60"
              >
                {isApplyingTradeIn ? "Хэрэглэж байна..." : "Сагсанд хөнгөлөлт хэрэглэх"}
              </button>
            </div>

            {!cartId && (
              <p className="text-xs text-[#9ca3af]">Хөнгөлөлт хэрэглэхийн тулд эхлээд бүтээгдэхүүнээ сагсанд нэмнэ үү.</p>
            )}

            {tradeInEstimate && (
              <div className="rounded-2xl bg-[#f5f5f7] p-4">
                {tradeInEstimate.matched && tradeInEstimate.estimated_amount > 0 ? (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#1d1d1f] font-semibold">Урьдчилсан үнэлгээ</span>
                    <span className="text-sm text-[#1d1d1f] font-semibold">
                      {formatPrice(tradeInEstimate.estimated_amount, tradeInEstimate.currency_code)}
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-[#86868b]">Тохирох санал олдсонгүй. Шалгалтын хариуг сайжруулна уу.</p>
                )}
              </div>
            )}

            {appliedTradeIn && (
              <div className="rounded-2xl border border-gray-200 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#1d1d1f]">Хөнгөлөлт хэрэглэгдсэн</p>
                    <p className="text-xs text-[#86868b]">Хямдрал сагс/тооцоонд харагдана.</p>
                  </div>
                  <button
                    type="button"
                    onClick={onRemove}
                    disabled={isRemovingTradeIn}
                    className="text-sm text-[#0071e3] hover:underline disabled:opacity-60"
                  >
                    {isRemovingTradeIn ? "Устгаж байна..." : "Устгах"}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-gray-100 bg-[#f9fafb] p-4 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <p className="text-sm font-semibold text-[#1d1d1f]">Төлөвийн шалгалт</p>
                <p className="text-xs text-[#86868b]">"Үгүй" сонговол үнэлгээ автоматаар татгалзана.</p>
              </div>
              <span className="text-[11px] px-2 py-1 bg-white border border-gray-200 rounded-full text-[#6b7280]">
                IMEI баталгаажна
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {deviceCheckQuestions.map((q) => {
                const value = form.device_checks[q.key];
                return (
                  <div
                    key={q.key}
                    className="rounded-xl bg-white border border-gray-200 p-3 flex items-center justify-between gap-3"
                  >
                    <p className="text-xs text-[#1d1d1f] mr-2 leading-snug">{q.label}</p>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => setDeviceCheck(q.key, true)}
                        className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all ${
                          value
                            ? "bg-[#e8f2ff] text-[#0b6cd4] border border-[#b6d5ff]"
                            : "bg-white text-[#6b7280] border border-gray-200"
                        }`}
                      >
                        Тийм
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeviceCheck(q.key, false)}
                        className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all ${
                          value === false
                            ? "bg-[#fef2f2] text-[#b91c1c] border border-[#fecdd3]"
                            : "bg-white text-[#6b7280] border border-gray-200"
                        }`}
                      >
                        Үгүй
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="rounded-xl bg-white border border-dashed border-gray-200 p-3 text-xs text-[#6b7280] leading-relaxed">
              • Нүдэн дээр шалгаж баталгаажуулна • Урамшуулал зөвхөн энэ сагсанд хүчинтэй • Бодит үнэлгээ шалгалтын дүнгээр
              шинэчлэгдэнэ
            </div>
          </div>
        </div>
      ) : (
        <div className="px-4 py-3 text-sm text-[#6b7280] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <span>Serial/IMEI оруулаад, төлөвөө сонгон үнэлгээгээ харах боломжтой.</span>
          <div className="flex flex-wrap gap-2">
            {appliedTradeIn && (
              <span className="text-xs md:text-sm px-3 py-1.5 rounded-full bg-[#e8f2ff] text-[#0b6cd4] border border-[#b6d5ff]">
                Хөнгөлөлт идэвхтэй
              </span>
            )}
            {tradeInEstimate && tradeInEstimate.matched && (
              <span className="text-xs md:text-sm px-3 py-1.5 rounded-full bg-[#f5f5f7] text-[#1d1d1f] border border-gray-200">
                Урьдчилсан: {formatPrice(tradeInEstimate.estimated_amount, tradeInEstimate.currency_code)}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
