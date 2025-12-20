import { useState, useEffect } from "react";
import { API_KEY, API_URL } from "@/lib/config/api";

interface RatingSummary {
  average: number;
  count: number;
}

export function useProductRating(productId: string) {
  const [ratingSummary, setRatingSummary] = useState<RatingSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchRating = async () => {
      const backendUrl = API_URL;
      if (!backendUrl || !API_KEY) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const res = await fetch(`${backendUrl}/store/product-analytics/reviews/${productId}?limit=0`, {
          headers: {
            "x-publishable-api-key": API_KEY,
          },
        });
        const data = await res.json().catch(() => ({}));
        if (!cancelled && data?.rating) {
          setRatingSummary({
            average: Number(data.rating.average) || 0,
            count: Number(data.rating.count) || 0,
          });
        }
      } catch (error) {
        console.error("Failed to load rating:", error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchRating();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  return { ratingSummary, isLoading };
}
