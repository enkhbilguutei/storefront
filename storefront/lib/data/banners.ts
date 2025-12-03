import { unstable_cache } from "next/cache"

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

/**
 * Banner placement types matching the backend module
 * Each type has a specific aspect ratio for consistent display
 */
export type BannerPlacement = 
  | "hero"        // 16:6 - Main homepage carousel (wide)
  | "iphone"      // 16:10 - iPhone product banners (2-column grid)  
  | "dji_large"   // 4:3 - DJI bento large card (spans 2 cols)
  | "dji_small"   // 4:3 - DJI bento small cards
  | "promo"       // 3:1 - Long promotional banner
  | "mobile_hero" // 9:16 - Mobile-optimized hero
  | "square"      // 1:1 - Square tile banners
  // Legacy support
  | "dji"         // Maps to dji_large for backwards compatibility

/**
 * Banner types matching the backend module
 */
export interface Banner {
  id: string
  title: string | null
  subtitle: string | null
  description: string | null
  image_url: string
  link: string
  alt_text: string | null
  placement: BannerPlacement
  sort_order: number
  is_active: boolean
  dark_text: boolean
  starts_at: string | null
  ends_at: string | null
  metadata: Record<string, unknown> | null
}

/**
 * Fetch banners from the backend API with ISR caching
 * Revalidates every 60 seconds
 */
async function fetchBanners(placement?: BannerPlacement): Promise<Banner[]> {
  try {
    const url = new URL(`${BACKEND_URL}/store/banners`)
    if (placement) {
      url.searchParams.set("placement", placement)
    }
    
    const response = await fetch(url.toString(), {
      headers: {
        "x-publishable-api-key": PUBLISHABLE_KEY,
      },
      next: { revalidate: 60 }, // ISR: revalidate every 60 seconds
    })
    
    if (!response.ok) {
      console.error(`Failed to fetch banners: ${response.status}`)
      return []
    }
    
    const data = await response.json()
    return data.banners || []
  } catch (error) {
    console.error("Failed to fetch banners:", error)
    return []
  }
}

/**
 * Get hero carousel banners
 * Cached with 60-second ISR revalidation
 */
export const getHeroBanners = unstable_cache(
  async (): Promise<Banner[]> => {
    return fetchBanners("hero")
  },
  ["hero-banners"],
  { revalidate: 60 }
)

/**
 * Get iPhone section banners
 * Cached with 60-second ISR revalidation
 */
export const getIPhoneBanners = unstable_cache(
  async (): Promise<Banner[]> => {
    return fetchBanners("iphone")
  },
  ["iphone-banners"],
  { revalidate: 60 }
)

/**
 * Get DJI bento grid banners (both large and small)
 * Fetches dji_large and dji_small placements, falls back to legacy "dji"
 * Cached with 60-second ISR revalidation
 */
export const getDJIBanners = unstable_cache(
  async (): Promise<Banner[]> => {
    // Fetch both new and legacy placements in parallel
    const [largeBanners, smallBanners, legacyBanners] = await Promise.all([
      fetchBanners("dji_large"),
      fetchBanners("dji_small"),
      fetchBanners("dji"), // Legacy support
    ])
    
    // Combine results, preferring new placements
    const allBanners = [...largeBanners, ...smallBanners]
    
    // If no new-style banners, fall back to legacy
    if (allBanners.length === 0 && legacyBanners.length > 0) {
      return legacyBanners
    }
    
    // Sort by sort_order
    return allBanners.sort((a, b) => a.sort_order - b.sort_order)
  },
  ["dji-banners"],
  { revalidate: 60 }
)

/**
 * Get promo banners
 * Cached with 60-second ISR revalidation
 */
export const getPromoBanners = unstable_cache(
  async (): Promise<Banner[]> => {
    return fetchBanners("promo")
  },
  ["promo-banners"],
  { revalidate: 60 }
)

/**
 * Get all banners (useful for admin/debugging)
 */
export const getAllBanners = unstable_cache(
  async (): Promise<Banner[]> => {
    return fetchBanners()
  },
  ["all-banners"],
  { revalidate: 60 }
)
