import { cache } from "react";
import { API_KEY, API_URL } from "@/lib/config/api";

export interface Region {
  id: string;
  name: string;
  currency_code: string;
  countries?: { iso_2: string; name: string }[];
}

const BACKEND_URL = API_URL;
const PUBLISHABLE_KEY = API_KEY;
const FETCH_TIMEOUT_MS = 2000;

// Cache the regions fetch - regions rarely change
export const getRegions = cache(async (): Promise<Region[]> => {
  try {
    const response = await fetch(`${BACKEND_URL}/store/regions`, {
      headers: {
        "x-publishable-api-key": PUBLISHABLE_KEY,
      },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch regions: ${response.statusText}`);
    }

    const data = await response.json();
    return (data?.regions ?? []) as Region[];
  } catch (error) {
    console.error("Failed to fetch regions:", error);
    return [];
  }
});

// Get the default region (first one or MN region)
export const getDefaultRegion = cache(async (): Promise<Region | null> => {
  try {
    const regions = await getRegions();
    
    if (!regions || regions.length === 0) {
      return null;
    }

    // Try to find Mongolia region first
    const mnRegion = regions.find(
      (r) => r.countries?.some((c) => c.iso_2 === "mn" || c.iso_2 === "MN")
    );

    return mnRegion || regions[0];
  } catch (error) {
    console.error("Failed to get default region:", error);
    return null;
  }
});

// Get region by country code
export const getRegionByCountry = cache(async (countryCode: string): Promise<Region | null> => {
  try {
    const regions = await getRegions();
    
    const region = regions.find(
      (r) => r.countries?.some(
        (c) => c.iso_2.toLowerCase() === countryCode.toLowerCase()
      )
    );

    return region || null;
  } catch (error) {
    console.error("Failed to get region by country:", error);
    return null;
  }
});