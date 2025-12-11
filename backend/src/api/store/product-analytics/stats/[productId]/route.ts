import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

// GET /store/product-analytics/stats/:productId
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const productId = req.params.productId

  if (!productId) {
    return res.status(400).json({ message: "productId is required" })
  }

  try {
    const analyticsService = req.scope.resolve("product_analytics")

    const [currentViewers, recentSales, ratingData] = await Promise.all([
      analyticsService.getCurrentViewers(productId),
      analyticsService.getRecentSalesCount(productId),
      analyticsService.getAverageRating(productId),
    ])

    return res.json({
      product_id: productId,
      current_viewers: currentViewers,
      recent_sales_24h: recentSales,
      rating: ratingData,
    })
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch stats" })
  }
}

export const AUTHENTICATE = false
