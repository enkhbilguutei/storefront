import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BANNER_MODULE } from "../../../../modules/banner"
import type BannerModuleService from "../../../../modules/banner/service"
import { validateBody, updateBannerSchema, formatValidationErrors } from "../../../validations"

/**
 * GET /admin/banners/:id
 * 
 * Retrieves a single banner by ID.
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const bannerService = req.scope.resolve<BannerModuleService>(BANNER_MODULE)
    const { id } = req.params
    
    const banner = await bannerService.retrieveBanner(id)
    
    if (!banner) {
      res.status(404).json({ message: "Banner not found" })
      return
    }
    
    res.json({ banner })
  } catch (error) {
    console.error("Failed to fetch banner:", error)
    res.status(500).json({ 
      message: "Failed to fetch banner",
      error: error instanceof Error ? error.message : "Unknown error"
    })
  }
}

/**
 * PUT /admin/banners/:id
 * 
 * Updates an existing banner.
 */
export async function PUT(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const bannerService = req.scope.resolve<BannerModuleService>(BANNER_MODULE)
    const { id } = req.params
    
    // Validate request body
    const validationResult = validateBody(updateBannerSchema, req.body)
    if (!validationResult.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: formatValidationErrors(validationResult.errors),
      })
      return
    }

    const bannerData = validationResult.data as Record<string, unknown>
    
    // Build update data - only include provided fields
    const updateData: Record<string, unknown> = {}
    
    // For nullable text fields, convert empty strings to null
    if (bannerData.title !== undefined) {
      updateData.title = (bannerData.title as string) === "" ? null : bannerData.title
    }
    if (bannerData.subtitle !== undefined) {
      updateData.subtitle = (bannerData.subtitle as string) === "" ? null : bannerData.subtitle
    }
    if (bannerData.description !== undefined) {
      updateData.description = (bannerData.description as string) === "" ? null : bannerData.description
    }
    if (bannerData.alt_text !== undefined) {
      updateData.alt_text = (bannerData.alt_text as string) === "" ? null : bannerData.alt_text
    }
    if (bannerData.mobile_image_url !== undefined) {
      updateData.mobile_image_url = (bannerData.mobile_image_url as string) === "" ? null : bannerData.mobile_image_url
    }
    
    // Required fields
    if (bannerData.image_url !== undefined) updateData.image_url = bannerData.image_url
    if (bannerData.link !== undefined) updateData.link = bannerData.link
    if (bannerData.placement !== undefined) updateData.placement = bannerData.placement
    if (bannerData.section !== undefined) updateData.section = bannerData.section
    if (bannerData.grid_size !== undefined) updateData.grid_size = bannerData.grid_size
    if (bannerData.sort_order !== undefined) updateData.sort_order = bannerData.sort_order
    if (bannerData.is_active !== undefined) updateData.is_active = bannerData.is_active
    if (bannerData.dark_text !== undefined) updateData.dark_text = bannerData.dark_text
    if (bannerData.starts_at !== undefined) {
      updateData.starts_at = bannerData.starts_at ? new Date(bannerData.starts_at as string) : null
    }
    if (bannerData.ends_at !== undefined) {
      updateData.ends_at = bannerData.ends_at ? new Date(bannerData.ends_at as string) : null
    }
    if (bannerData.metadata !== undefined) updateData.metadata = bannerData.metadata
    
    const [banner] = await bannerService.updateBanners([{
      id,
      ...updateData,
    }])
    
    res.json({ banner })
  } catch (error) {
    console.error("Failed to update banner:", error)
    res.status(500).json({ 
      message: "Failed to update banner",
      error: error instanceof Error ? error.message : "Unknown error"
    })
  }
}

/**
 * DELETE /admin/banners/:id
 * 
 * Deletes a banner.
 */
export async function DELETE(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const bannerService = req.scope.resolve<BannerModuleService>(BANNER_MODULE)
    const { id } = req.params
    
    await bannerService.deleteBanners(id)
    
    res.status(204).send()
  } catch (error) {
    console.error("Failed to delete banner:", error)
    res.status(500).json({ 
      message: "Failed to delete banner",
      error: error instanceof Error ? error.message : "Unknown error"
    })
  }
}
