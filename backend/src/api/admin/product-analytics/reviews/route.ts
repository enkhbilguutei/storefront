import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

// GET /admin/product-analytics/reviews
// Query: status=pending|approved|all (default pending), limit, offset
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { status = "pending" } = req.query as { status?: string }
  const limit = parseInt((req.query.limit as string) || "50", 10)
  const offset = parseInt((req.query.offset as string) || "0", 10)

  try {
    const analyticsService = req.scope.resolve("product_analytics")

    const filters: Record<string, unknown> = {}
    if (status === "pending") {
      filters.is_approved = false
    } else if (status === "approved") {
      filters.is_approved = true
    }
    // Note: when status is "all", no filter is added

    const reviews = await analyticsService.listProductReviews(filters, {
      skip: offset,
      take: limit,
      order: { created_at: "DESC" },
    })

    return res.json({ reviews, limit, offset })
  } catch (error) {
    console.error("Failed to list reviews:", error)
    return res.status(500).json({ 
      message: "Failed to list reviews", 
      error: error instanceof Error ? error.message : "Unknown error" 
    })
  }
}
