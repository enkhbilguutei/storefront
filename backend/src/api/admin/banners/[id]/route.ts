import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BANNER_MODULE } from "../../../../modules/banner"
import type BannerModuleService from "../../../../modules/banner/service"

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
    
    const {
      title,
      subtitle,
      description,
      image_url,
      mobile_image_url,
      link,
      alt_text,
      placement,
      sort_order,
      is_active,
      dark_text,
      starts_at,
      ends_at,
      metadata,
    } = req.body as Record<string, unknown>
    
    // Build update data - only include provided fields
    const updateData: Record<string, unknown> = {}
    
    // For nullable text fields, convert empty strings to null
    if (title !== undefined) {
      updateData.title = title === "" ? null : title
    }
    if (subtitle !== undefined) {
      updateData.subtitle = subtitle === "" ? null : subtitle
    }
    if (description !== undefined) {
      updateData.description = description === "" ? null : description
    }
    if (alt_text !== undefined) {
      updateData.alt_text = alt_text === "" ? null : alt_text
    }
    if (mobile_image_url !== undefined) {
      updateData.mobile_image_url = mobile_image_url === "" ? null : mobile_image_url
    }
    
    // Required fields
    if (image_url !== undefined) updateData.image_url = image_url
    if (link !== undefined) updateData.link = link
    if (placement !== undefined) updateData.placement = placement
    
    // Numeric and boolean fields
    if (sort_order !== undefined) updateData.sort_order = sort_order
    if (is_active !== undefined) updateData.is_active = is_active
    if (dark_text !== undefined) updateData.dark_text = dark_text
    
    // Date fields
    if (starts_at !== undefined) {
      updateData.starts_at = starts_at ? new Date(starts_at as string) : null
    }
    if (ends_at !== undefined) {
      updateData.ends_at = ends_at ? new Date(ends_at as string) : null
    }
    
    // Metadata
    if (metadata !== undefined) updateData.metadata = metadata
    
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
