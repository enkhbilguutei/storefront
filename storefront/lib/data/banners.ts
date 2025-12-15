import { unstable_cache } from "next/cache"
import { API_URL, API_KEY } from "@/lib/config/api"

const BACKEND_URL = API_URL
const PUBLISHABLE_KEY = API_KEY

/**
 * Banner placement types matching the backend module
 */
export type BannerPlacement = "hero" | "bento" | "product_grid"

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
 * Get bento grid banners
 * Cached with 60-second ISR revalidation
 */
export const getBentoBanners = unstable_cache(
  async (): Promise<Banner[]> => {
    return fetchBanners("bento")
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
