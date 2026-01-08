import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BANNER_MODULE } from "../../../modules/banner"
import type BannerModuleService from "../../../modules/banner/service"
import { validateBody, createBannerSchema } from "../../validations"

/**
 * GET /admin/banners
 * 
 * Lists all banners (including inactive) for admin management.
 * Query params:
 *   - placement: Filter by placement type
 *   - section: Filter by section (for product_grid)
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
    
    if (req.query.section) {
      filters.section = req.query.section
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
    
    // Validate request body
    const validationResult = validateBody(createBannerSchema, req.body)
    if (!validationResult.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: validationResult.errors,
      })
      return
    }

    const bannerData = validationResult.data as Record<string, unknown>
    
    const banner = await bannerService.createBanners({
      title: bannerData.title as string,
      subtitle: bannerData.subtitle as string | null,
      description: bannerData.description as string | null,
      image_url: bannerData.image_url as string,
      mobile_image_url: bannerData.mobile_image_url as string | null,
      link: bannerData.link as string,
      alt_text: bannerData.alt_text as string | null,
      placement: bannerData.placement as string,
      section: bannerData.section as string | null,
      grid_size: (bannerData.grid_size as string) || "3x3",
      sort_order: (bannerData.sort_order as number) || 0,
      is_active: (bannerData.is_active as boolean) ?? true,
      dark_text: (bannerData.dark_text as boolean) ?? false,
      starts_at: bannerData.starts_at ? new Date(bannerData.starts_at as string) : null,
      ends_at: bannerData.ends_at ? new Date(bannerData.ends_at as string) : null,
      metadata: (bannerData.metadata as Record<string, unknown>) || null,
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
