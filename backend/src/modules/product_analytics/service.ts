import { MedusaService } from "@medusajs/framework/utils"
import ProductView from "./models/product-view"
import ProductSale from "./models/product-sale"
import ProductReview from "./models/product-review"

class ProductAnalyticsModuleService extends MedusaService({
  ProductView,
  ProductSale,
  ProductReview,
}) {
  // Track product view
  async trackView(data: {
    product_id: string
    customer_id?: string
    session_id?: string
    ip_address?: string
  }) {
    return await this.createProductViews({
      ...data,
      viewed_at: new Date(),
    })
  }

  // Get current viewers count (last 5 minutes)
  async getCurrentViewers(productId: string): Promise<number> {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    
    const views = await this.listProductViews({
      product_id: productId,
      viewed_at: {
        $gte: fiveMinutesAgo,
      },
    })

    // Count unique viewers (by customer_id or session_id)
    const uniqueViewers = new Set()
    views.forEach((view) => {
      const identifier = view.customer_id || view.session_id
      if (identifier) {
        uniqueViewers.add(identifier)
      }
    })

    return uniqueViewers.size
  }

  // Track product sale
  async trackSale(data: {
    product_id: string
    order_id: string
    quantity: number
  }) {
    return await this.createProductSales({
      ...data,
      sold_at: new Date(),
    })
  }

  // Get recent sales count (last 24 hours)
  async getRecentSalesCount(productId: string): Promise<number> {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    
    const sales = await this.listProductSales({
      product_id: productId,
      sold_at: {
        $gte: twentyFourHoursAgo,
      },
    })

    return sales.reduce((total, sale) => total + sale.quantity, 0)
  }

  // Create product review
  async createReview(data: {
    product_id: string
    customer_id: string
    customer_name: string
    rating: number
    title?: string
    comment: string
    photos?: string[]
    verified_purchase?: boolean
  }) {
    const photosJson = data.photos && data.photos.length > 0 
      ? data.photos.reduce((acc: any, url, idx) => { acc[idx] = url; return acc; }, {})
      : null

    return await this.createProductReviews({
      product_id: data.product_id,
      customer_id: data.customer_id,
      customer_name: data.customer_name,
      rating: data.rating,
      title: data.title || null,
      comment: data.comment,
      photos: photosJson,
      verified_purchase: data.verified_purchase ?? false,
      is_approved: false,
      helpful_count: 0,
    })
  }

  // Get approved reviews for a product
  async getProductReviews(
    productId: string,
    options?: { limit?: number; offset?: number }
  ) {
    return await this.listProductReviews(
      {
        product_id: productId,
        is_approved: true,
      },
      {
        skip: options?.offset || 0,
        take: options?.limit || 10,
        order: { created_at: "DESC" },
      }
    )
  }

  // Get average rating for a product
  async getAverageRating(productId: string): Promise<{ average: number; count: number }> {
    const reviews = await this.listProductReviews({
      product_id: productId,
      is_approved: true,
    })

    if (reviews.length === 0) {
      return { average: 0, count: 0 }
    }

    const total = reviews.reduce((sum, review) => sum + review.rating, 0)
    return {
      average: Number((total / reviews.length).toFixed(1)),
      count: reviews.length,
    }
  }

  // Approve review (admin)
  async approveReview(reviewId: string) {
    const review = await this.retrieveProductReview(reviewId)
    return await this.updateProductReviews({
      id: reviewId,
      is_approved: true,
    })
  }

  // Increment helpful count
  async markReviewHelpful(reviewId: string) {
    const review = await this.retrieveProductReview(reviewId)
    return await this.updateProductReviews({
      id: reviewId,
      helpful_count: review.helpful_count + 1,
    })
  }
}

export default ProductAnalyticsModuleService
