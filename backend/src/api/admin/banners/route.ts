import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BANNER_MODULE } from "../../../modules/banner"
import type BannerModuleService from "../../../modules/banner/service"

/**
 * GET /admin/banners
 * 
 * Lists all banners (including inactive) for admin management.
 * Query params:
 *   - placement: Filter by placement type
 *   - is_active: Filter by active status
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const bannerService = req.scope.resolve<BannerModuleService>(BANNER_MODULE)
    
    const filters: Record<string, unknown> = {}
    
    if (req.query.placement) {
      filters.placement = req.query.placement
    }
    
    if (req.query.is_active !== undefined) {
      filters.is_active = req.query.is_active === "true"
    }
    
    const banners = await bannerService.listBanners(filters, {
      order: { sort_order: "ASC" },
    })
    
    res.json({ banners })
  } catch (error) {
    console.error("Failed to fetch banners:", error)
    res.status(500).json({ 
      message: "Failed to fetch banners",
      error: error instanceof Error ? error.message : "Unknown error"
    })
  }
}

/**
 * POST /admin/banners
 * 
 * Creates a new banner.
 * Body: Banner data (title, image_url, link, placement, etc.)
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const bannerService = req.scope.resolve<BannerModuleService>(BANNER_MODULE)
    
    const {
      title,
      subtitle,
      description,
      image_url,
      link,
      alt_text,
      placement,
      sort_order = 0,
      is_active = true,
      dark_text = false,
      starts_at,
      ends_at,
      metadata,
    } = req.body as Record<string, unknown>
    
    // Validate required fields (title is optional per model)
    if (!image_url || !link || !placement) {
      res.status(400).json({
        message: "Missing required fields: image_url, link, placement",
      })
      return
    }
    
    const banner = await bannerService.createBanners({
      title: title as string,
      subtitle: subtitle as string | null,
      description: description as string | null,
      image_url: image_url as string,
      link: link as string,
      alt_text: alt_text as string | null,
      placement: placement as string,
      sort_order: sort_order as number,
      is_active: is_active as boolean,
      dark_text: dark_text as boolean,
      starts_at: starts_at ? new Date(starts_at as string) : null,
      ends_at: ends_at ? new Date(ends_at as string) : null,
      metadata: metadata as Record<string, unknown> | null,
    })
    
    res.status(201).json({ banner })
  } catch (error) {
    console.error("Failed to create banner:", error)
    res.status(500).json({ 
      message: "Failed to create banner",
      error: error instanceof Error ? error.message : "Unknown error"
    })
  }
}
