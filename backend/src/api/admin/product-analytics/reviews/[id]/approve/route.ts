import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

// POST /admin/product-analytics/reviews/:id/approve
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params

  if (!id) {
    return res.status(400).json({ message: "Review ID is required" })
  }

  try {
    const analyticsService = req.scope.resolve("product_analytics")
    const review = await analyticsService.approveReview(id)
    return res.json({ review, message: "Үнэлгээ баталгаажлаа" })
  } catch (error) {
    console.error("Failed to approve review:", error)
    return res.status(500).json({ message: "Failed to approve review" })
  }
}
