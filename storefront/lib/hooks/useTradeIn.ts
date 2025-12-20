import { useState, useCallback } from "react";
import { toast } from "@/lib/toast";
import { API_KEY, API_URL } from "@/lib/config/api";

interface TradeInFormData {
  serial_number: string;
  old_device_condition: string;
  device_checks: {
    screen_cracked: boolean | null;
    liquid_damage: boolean | null;
    buttons_working: boolean | null;
    camera_working: boolean | null;
  };
}

interface TradeInEstimate {
  estimated_amount: number;
  currency_code: string;
  matched: boolean;
}

interface AppliedTradeIn {
  estimated_amount: number;
  currency_code: string;
  promotion_code?: string;
  trade_in_request_id?: string;
}

export function useTradeIn(
  productId: string,
  cartId: string | null,
  syncCart: () => Promise<unknown>
) {
  const [isEstimating, setIsEstimating] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [estimate, setEstimate] = useState<TradeInEstimate | null>(null);
  const [applied, setApplied] = useState<AppliedTradeIn | null>(null);

  const estimateTradeIn = useCallback(
    async (form: TradeInFormData) => {
      const serial = form.serial_number.trim();
      if (!serial) {
        toast.error("Сериал дугаараа оруулна уу");
        return;
      }

      setIsEstimating(true);
      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          ...(API_KEY ? { "x-publishable-api-key": API_KEY } : {}),
        };

        const res = await fetch(`${API_URL}/store/trade-in/estimate`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            new_product_id: productId,
            old_device_model: serial,
            old_device_condition: form.old_device_condition,
            serial_number: serial,
            device_checks: form.device_checks,
          }),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          const message = data?.error || data?.message || "Алдаа гарлаа. Дахин оролдоно уу.";
          throw new Error(message);
        }

        setEstimate({
          estimated_amount: Number(data?.estimated_amount || 0),
          currency_code: (data?.currency_code || "mnt") as string,
          matched: Boolean(data?.matched),
        });
      } catch (e) {
        const message = e instanceof Error ? e.message : "Алдаа гарлаа. Дахин оролдоно уу.";
        toast.error(message);
        setEstimate(null);
      } finally {
        setIsEstimating(false);
      }
    },
    [productId]
  );

  const applyTradeIn = useCallback(
    async (form: TradeInFormData) => {
      if (!cartId) {
        toast.error("Эхлээд бүтээгдэхүүнээ сагсанд нэмнэ үү");
        return;
      }
      const serial = form.serial_number.trim();
      if (!serial) {
        toast.error("Сериал дугаараа оруулна уу");
        return;
      }

      setIsApplying(true);
      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          ...(API_KEY ? { "x-publishable-api-key": API_KEY } : {}),
        };

        const res = await fetch(`${API_URL}/store/trade-in/apply`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            cart_id: cartId,
            new_product_id: productId,
            old_device_model: serial,
            old_device_condition: form.old_device_condition,
            serial_number: serial,
            device_checks: form.device_checks,
          }),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          const message = data?.error || data?.message || "Алдаа гарлаа. Дахин оролдоно уу.";
          throw new Error(message);
        }

        if (!data?.applied) {
          toast.error("Тохирох санал олдсонгүй");
          return;
        }

        setApplied({
          estimated_amount: Number(data?.estimated_amount || 0),
          currency_code: (data?.currency_code || "mnt") as string,
          promotion_code: data?.promotion_code,
          trade_in_request_id: data?.trade_in_request_id,
        });

        toast.success("Трейд-ин хөнгөлөлт сагсанд хэрэглэгдлээ");
        await syncCart();
      } catch (e) {
        const message = e instanceof Error ? e.message : "Алдаа гарлаа. Дахин оролдоно уу.";
        toast.error(message);
      } finally {
        setIsApplying(false);
      }
    },
    [cartId, productId, syncCart]
  );

  const removeTradeIn = useCallback(async () => {
    if (!cartId) return;
    setIsRemoving(true);
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(API_KEY ? { "x-publishable-api-key": API_KEY } : {}),
      };

      const res = await fetch(`${API_URL}/store/trade-in/remove`, {
        method: "POST",
        headers,
        body: JSON.stringify({ cart_id: cartId }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message = data?.error || data?.message || "Алдаа гарлаа. Дахин оролдоно уу.";
        throw new Error(message);
      }

      setApplied(null);
      toast.success("Трейд-ин хөнгөлөлт устгагдлаа");
      await syncCart();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Алдаа гарлаа. Дахин оролдоно уу.";
      toast.error(message);
    } finally {
      setIsRemoving(false);
    }
  }, [cartId, syncCart]);

  return {
    isEstimating,
    isApplying,
    isRemoving,
    estimate,
    applied,
    estimateTradeIn,
    applyTradeIn,
    removeTradeIn,
  };
}
