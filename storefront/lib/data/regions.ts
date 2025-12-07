import { medusa } from "@/lib/medusa";
import { cache } from "react";

export interface Region {
  id: string;
  name: string;
  currency_code: string;
  countries?: { iso_2: string; name: string }[];
}

// Cache the regions fetch - regions rarely change
export const getRegions = cache(async (): Promise<Region[]> => {
  try {
    const { regions } = await medusa.store.region.list({
      fields: "id,name,currency_code,countries.*",
    });
    
    return regions as Region[];
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