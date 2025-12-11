import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

// POST /store/product-analytics/view
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { product_id } = req.body as { product_id: string }

  if (!product_id) {
    return res.status(400).json({ message: "product_id is required" })
  }

  try {
    const analyticsService = req.scope.resolve("product_analytics")
    const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)

    // Get customer/session identifiers
    const customer_id = (req as any).auth?.actor_id
    const session_id = req.session?.id || req.headers["x-session-id"] as string
    const ip_address = req.headers["x-forwarded-for"] as string || req.socket?.remoteAddress

    await analyticsService.trackView({
      product_id,
      customer_id,
      session_id,
      ip_address,
    })

    // Get current viewers count
    const currentViewers = await analyticsService.getCurrentViewers(product_id)

    return res.json({ 
      success: true,
      current_viewers: currentViewers 
    })
  } catch (error) {
    const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)
    logger.error("Failed to track product view:", error)
    return res.status(500).json({ message: "Failed to track view" })
  }
}

export const AUTHENTICATE = false
