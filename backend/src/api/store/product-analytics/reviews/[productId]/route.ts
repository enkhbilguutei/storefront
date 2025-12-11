import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

// GET /store/product-analytics/reviews/:productId
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const productId = req.params.productId
  const limit = parseInt(req.query.limit as string) || 10
  const offset = parseInt(req.query.offset as string) || 0

  if (!productId) {
    return res.status(400).json({ message: "productId is required" })
  }

  try {
    const analyticsService = req.scope.resolve("product_analytics")

    const reviews = await analyticsService.getProductReviews(productId, {
      limit,
      offset,
    })

    const ratingData = await analyticsService.getAverageRating(productId)

    return res.json({
      reviews,
      rating: ratingData,
      limit,
      offset,
    })
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch reviews" })
  }
}

// POST /store/product-analytics/reviews/:productId
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const productId = req.params.productId
  const { rating, title, comment, photos } = req.body as { 
    rating: number; 
    title: string; 
    comment: string; 
    photos?: string[];
  }

  if (!productId || !rating || !comment) {
    return res.status(400).json({ 
      message: "productId, rating, and comment are required" 
    })
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating must be between 1 and 5" })
  }

  try {
    const analyticsService = req.scope.resolve("product_analytics")
    const customerService = req.scope.resolve("customer")

    // Get customer info from context (set by auth middleware)
    const customer_id = (req as any).auth?.actor_id
    if (!customer_id) {
      return res.status(401).json({ message: "Authentication required" })
    }

    const customer = await customerService.retrieveCustomer(customer_id)

    // Check if customer has purchased this product
    const orderService = req.scope.resolve("order")
    const orders = await orderService.listOrders(
      { customer_id },
      { relations: ["items"], take: 100 }
    )

    const hasPurchased = orders.some((order: any) =>
      order.items?.some((item: any) => item.product_id === productId)
    )

    const review = await analyticsService.createReview({
      product_id: productId,
      customer_id,
      customer_name: customer.first_name 
        ? `${customer.first_name} ${customer.last_name || ''}`.trim()
        : customer.email,
      rating,
      title,
      comment,
      photos,
      verified_purchase: hasPurchased,
    })

    return res.json({ 
      review,
      message: "Таны үнэлгээ хянагдаж байна. Баталгаажсаны дараа харагдах болно." 
    })
  } catch (error) {
    return res.status(500).json({ message: "Failed to create review" })
  }
}

export const AUTHENTICATE = false
