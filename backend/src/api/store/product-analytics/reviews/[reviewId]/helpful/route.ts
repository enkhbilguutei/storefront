import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

// POST /store/product-analytics/reviews/:reviewId/helpful
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const reviewId = req.params.reviewId

  if (!reviewId) {
    return res.status(400).json({ message: "reviewId is required" })
  }

  try {
    const analyticsService = req.scope.resolve("product_analytics")

    await analyticsService.markReviewHelpful(reviewId)

    return res.json({ success: true })
  } catch (error) {
    return res.status(500).json({ message: "Failed to mark review as helpful" })
  }
}

export const AUTHENTICATE = false
