import { unstable_cache } from "next/cache"
import { API_URL, API_KEY } from "@/lib/config/api"

const BACKEND_URL = API_URL
const PUBLISHABLE_KEY = API_KEY

/**
 * Banner placement types matching the backend module
 */
export type BannerPlacement = "hero" | "bento" | "bento_grid" | "product_grid"

/**
 * Banner types matching the backend module
 */
export interface Banner {
  id: string
  title: string | null
  subtitle: string | null
  description: string | null
  image_url: string
  mobile_image_url: string | null
  link: string
  alt_text: string | null
  placement: BannerPlacement
  section: string | null
  grid_size: string // For bento_grid: "3x3" (pos1), "1x1" (pos2-4), "2x3" (pos5)
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
async function fetchBanners(placement?: BannerPlacement, section?: string): Promise<Banner[]> {
  try {
    const url = new URL(`${BACKEND_URL}/store/banners`)
    if (placement) {
      url.searchParams.set("placement", placement)
    }
    if (section) {
      url.searchParams.set("section", section)
    }
    
    const response = await fetch(url.toString(), {
      headers: {
        "x-publishable-api-key": PUBLISHABLE_KEY,
      },
      next: { revalidate: 60 }, // ISR: revalidate every 60 seconds
      // Add timeout and better error handling for connection issues
      signal: AbortSignal.timeout(5000), // 5 second timeout
    })
    
    if (!response.ok) {
      console.error(`Failed to fetch banners: ${response.status}`)
      return []
    }
    
    const data = await response.json()
    return data.banners || []
  } catch (error) {
    // More detailed error logging for debugging
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.error("Banner fetch timeout - backend may not be running")
      } else if (error.message.includes('ECONNREFUSED')) {
        console.error("Cannot connect to backend - ensure it's running on", BACKEND_URL)
      } else {
        console.error("Failed to fetch banners:", error.message)
      }
    } else {
      console.error("Failed to fetch banners:", error)
    }
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
 * Get bento grid banners (multi-tile layout)
 * Cached with 60-second ISR revalidation
 * Returns all active bento_grid banners sorted by sort_order
 */
export const getBentoBanners = unstable_cache(
  async (): Promise<Banner[]> => {
    return fetchBanners("bento_grid")
  },
  ["bento-banners"],
  { revalidate: 60 }
)

/**
 * Get product grid banner by section
 * Cached with 60-second ISR revalidation
 */
export const getProductGridBanner = unstable_cache(
  async (section: string): Promise<Banner | null> => {
    const banners = await fetchBanners("product_grid", section)
    return banners[0] || null
  },
  ["product-grid-banner"],
  { revalidate: 60 }
)
