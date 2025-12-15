import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BANNER_MODULE } from "../../../modules/banner"
import type BannerModuleService from "../../../modules/banner/service"

/**
 * GET /store/banners
 * 
 * Fetches active banners, optionally filtered by placement and section.
 * Query params:
 *   - placement: Filter by placement type (hero, bento, product_grid)
 *   - section: Filter by section (for product_grid: apple, gaming, etc.)
 * 
 * Response: { banners: Banner[] }
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const bannerService = req.scope.resolve<BannerModuleService>(BANNER_MODULE)
    const placement = req.query.placement as string | undefined
    const section = req.query.section as string | undefined
    
    // Build filters
    const filters: Record<string, unknown> = { is_active: true }
    if (placement) filters.placement = placement
    if (section) filters.section = section
    
    // For product_grid, fetch by section
    const banners = await bannerService.listBanners(filters, {
      order: { sort_order: "ASC" },
    })
    
    // Filter by date range (Medusa doesn't support complex date queries)
    const now = new Date()
    const activeBanners = banners.filter((banner) => {
      const startsAt = banner.starts_at ? new Date(banner.starts_at) : null
      const endsAt = banner.ends_at ? new Date(banner.ends_at) : null
      
      if (startsAt && now < startsAt) return false
      if (endsAt && now > endsAt) return false
      
      return true
    })
    
    res.json({ banners: activeBanners })
  } catch (error) {
    console.error("Failed to fetch banners:", error)
    res.status(500).json({ 
      message: "Failed to fetch banners",
      error: error instanceof Error ? error.message : "Unknown error"
    })
  }
}
