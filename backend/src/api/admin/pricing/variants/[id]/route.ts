import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import type { IPricingModuleService, IProductModuleService } from "@medusajs/framework/types"
import { validateBody, updatePriceSchema } from "../../../../validations"

/**
 * POST /admin/pricing/variants/:id
 * 
 * Update a variant's price
 * Body: { amount: number, currency_code: string }
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const variantId = req.params.id
    
    // Validate request body
    const validationResult = validateBody(updatePriceSchema, req.body)
    if (!validationResult.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: validationResult.errors,
      })
      return
    }

    const { amount, currency_code = "mnt" } = validationResult.data

    const productService: IProductModuleService = req.scope.resolve(Modules.PRODUCT)
    const pricingService: IPricingModuleService = req.scope.resolve(Modules.PRICING)

    // Get the variant to find its price_set_id
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [variant] = await productService.listProductVariants(
      { id: variantId },
      { relations: ["prices"] }
    ) as any[]

    if (!variant) {
      res.status(404).json({ message: "Variant not found" })
      return
    }

    // Get the existing prices for this variant
    // In Medusa v2, prices are managed through the pricing module
    // We need to update the price set associated with this variant
    
    // Find existing price with same currency
    const existingPrice = variant.prices?.find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (p: any) => p.currency_code === currency_code
    )

    if (existingPrice) {
      // Update existing price through price set
      await pricingService.updatePriceSets(existingPrice.id, {
        prices: [{
          amount,
          currency_code,
        }]
      })
    } else {
      // Create new price - this requires the price_set_id
      // In Medusa v2, prices are part of price sets
      // We need to add a price to the variant's price set
      
      // This is complex in Medusa v2 - prices are managed through workflows
      // For now, return an error indicating this needs workflow
      res.status(400).json({ 
        message: "Cannot create new price directly. Use Medusa workflows.",
        info: "In Medusa v2, price management requires workflows. Please update existing prices only."
      })
      return
    }

    res.json({ 
      success: true,
      variant_id: variantId,
      updated_price: {
        amount,
        currency_code,
      }
    })
  } catch (error) {
    console.error("Failed to update variant price:", error)
    res.status(500).json({
      message: "Failed to update variant price",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
