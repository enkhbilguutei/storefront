import { unstable_cache } from "next/cache"

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

/**
 * Banner placement types matching the backend module
 */
export type BannerPlacement = "hero"

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
