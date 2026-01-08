import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import type { IProductModuleService } from "@medusajs/framework/types"

/**
 * POST /admin/products/variants/:id/images
 * 
 * Associate images with a variant and optionally set thumbnail
 * Body: { image_ids: string[], thumbnail_id?: string }
 */
export async function POST(
  req: MedusaRequest<{ image_ids?: string[], thumbnail_id?: string }>,
  res: MedusaResponse
): Promise<void> {
  const { id: variantId } = req.params
  const { image_ids = [], thumbnail_id } = req.body

  try {
    const productModuleService = req.scope.resolve<IProductModuleService>(
      Modules.PRODUCT
    )

    // Get the variant first to find its images
    const [variant] = await productModuleService.listProductVariants(
      { id: [variantId] },
      { relations: ["images"] }
    )

    if (!variant) {
      res.status(404).json({ message: "Variant not found" })
      return
    }

    // Get all images for this variant
    const images = await productModuleService.listProductImages(
      { id: image_ids },
      {}
    )

    let thumbnailUrl: string | null = null

    // If thumbnail_id is provided, find that image's URL
    if (thumbnail_id) {
      const thumbnailImage = images.find(img => img.id === thumbnail_id)
      if (thumbnailImage) {
        thumbnailUrl = thumbnailImage.url
      }
    }

    // Update the variant with the thumbnail
    if (thumbnailUrl) {
      await productModuleService.updateProductVariants([
        {
          id: variantId,
          thumbnail: thumbnailUrl,
        },
      ])
    }

    // Fetch the updated variant
    const [updatedVariant] = await productModuleService.listProductVariants(
      { id: [variantId] },
      { relations: ["images"] }
    )

    res.json({
      success: true,
      variant: updatedVariant,
    })
  } catch (error) {
    console.error("Failed to update variant images:", error)
    res.status(500).json({
      message: "Failed to update variant images",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
