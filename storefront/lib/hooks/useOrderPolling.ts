"use client";

import { useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { API_KEY, API_URL } from "@/lib/config/api";

interface Order {
  id: string;
  display_id: number;
  status: string;
  fulfillment_status?: string;
  payment_status?: string;
  created_at: string;
  total: number;
  currency_code: string;
  items: Array<{
    id: string;
    title: string;
    quantity: number;
    thumbnail?: string;
    unit_price?: number;
    product_title?: string;
    variant_title?: string;
  }>;
  payment_method?: string;
}

interface UseOrderPollingOptions {
  onOrdersUpdate: (orders: Order[]) => void;
  pollingInterval?: number;
  enabled?: boolean;
}

export function useOrderPolling({
  onOrdersUpdate,
  pollingInterval = 30000, // 30 seconds
  enabled = true,
}: UseOrderPollingOptions) {
  const { data: session, status: sessionStatus } = useSession();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchRef = useRef<number>(0);

  const fetchOrders = useCallback(async () => {
    if (!session || sessionStatus !== "authenticated") return;

    const accessToken = (session as { accessToken?: string }).accessToken;
    if (!accessToken) return;

    const now = Date.now();
    // Prevent rapid polling
    if (now - lastFetchRef.current < 10000) return;
    lastFetchRef.current = now;

    try {
      const response = await fetch(
        `${API_URL}/store/custom/orders?limit=50&order=-created_at`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "x-publishable-api-key": API_KEY,
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        onOrdersUpdate(data.orders || []);
      }
    } catch (err) {
      console.error("Order polling error:", err);
    }
  }, [session, sessionStatus, onOrdersUpdate]);

  useEffect(() => {
    if (!enabled || !session || sessionStatus !== "authenticated") {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Start polling
    intervalRef.current = setInterval(fetchOrders, pollingInterval);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, session, sessionStatus, pollingInterval, fetchOrders]);

  // Manual refresh function
  const refresh = useCallback(() => {
    fetchOrders();
  }, [fetchOrders]);

  return { refresh };
}
