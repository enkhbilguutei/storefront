import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BANNER_MODULE } from "../../../modules/banner"
import type BannerModuleService from "../../../modules/banner/service"

/**
 * GET /store/banners
 * 
 * Fetches active banners, optionally filtered by placement.
 * Query params:
 *   - placement: Filter by placement type (hero, iphone, dji, promo)
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
    
    const banners = await bannerService.listActiveBanners(placement)
    
    res.json({ banners })
  } catch (error) {
    console.error("Failed to fetch banners:", error)
    res.status(500).json({ 
      message: "Failed to fetch banners",
      error: error instanceof Error ? error.message : "Unknown error"
    })
  }
}
