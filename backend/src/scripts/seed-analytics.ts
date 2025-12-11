import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export default async function seedAnalytics({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productService = container.resolve("product")
  const analyticsService = container.resolve("product_analytics")

  try {
    logger.info("Starting to seed product analytics data...")

    // Get all products
    const products = await productService.listProducts(
      {},
      { take: 20 }
    )

    if (products.length === 0) {
      logger.warn("No products found. Please seed products first.")
      return
    }

    // Seed product views (last 24 hours)
    for (const product of products) {
      const viewCount = Math.floor(Math.random() * 20) + 5 // 5-25 views
      
      for (let i = 0; i < viewCount; i++) {
        const minutesAgo = Math.floor(Math.random() * 1440) // Random time in last 24h
        const viewedAt = new Date(Date.now() - minutesAgo * 60 * 1000)
        
        await analyticsService.createProductViews({
          product_id: product.id,
          session_id: `demo_session_${Math.random().toString(36).substring(2, 9)}`,
          viewed_at: viewedAt,
        })
      }
      
      logger.info(`Seeded ${viewCount} views for product: ${product.title}`)
    }

    // Seed product sales (last 24 hours)
    for (const product of products) {
      const saleCount = Math.floor(Math.random() * 5) + 1 // 1-5 sales
      
      for (let i = 0; i < saleCount; i++) {
        const hoursAgo = Math.floor(Math.random() * 24)
        const soldAt = new Date(Date.now() - hoursAgo * 60 * 60 * 1000)
        
        await analyticsService.createProductSales({
          product_id: product.id,
          order_id: `demo_order_${Math.random().toString(36).substring(2, 9)}`,
          quantity: Math.floor(Math.random() * 3) + 1,
          sold_at: soldAt,
        })
      }
      
      logger.info(`Seeded ${saleCount} sales for product: ${product.title}`)
    }

    // Seed some reviews for first 10 products
    const reviewTexts = [
      {
        title: "Маш сайн бүтээгдэхүүн",
        comment: "Чанар сайтай, хүргэлт хурдан байсан. Үнэхээр сэтгэл хангалуун байна!",
        rating: 5,
      },
      {
        title: "Сайн",
        comment: "Хүлээлтээс давсан. Үнийн харьцаа сайн.",
        rating: 4,
      },
      {
        title: "Зөвлөж байна",
        comment: "Найз нөхөддөө зөвлөх болно. Алимханд баярлалаа!",
        rating: 5,
      },
      {
        title: "Гайхалтай",
        comment: "Жинхэнэ бүтээгдэхүүн, баталгаатай. Маш их баяртай байна.",
        rating: 5,
      },
      {
        title: "Сэтгэл хангалуун",
        comment: "Үйлчилгээ сайн, бүтээгдэхүүн чанартай.",
        rating: 4,
      },
    ]

    const reviewerNames = [
      "Бат-Эрдэнэ",
      "Энхтуяа",
      "Түмэнбаяр",
      "Сарангэрэл",
      "Мөнхбат",
      "Оюунчимэг",
      "Ганболд",
      "Цэцэгмаа",
    ]

    for (let i = 0; i < Math.min(10, products.length); i++) {
      const product = products[i]
      const reviewCount = Math.floor(Math.random() * 3) + 2 // 2-4 reviews per product
      
      for (let j = 0; j < reviewCount; j++) {
        const reviewData = reviewTexts[Math.floor(Math.random() * reviewTexts.length)]
        const createdDaysAgo = Math.floor(Math.random() * 30) // Last 30 days
        
        await analyticsService.createReview({
          product_id: product.id,
          customer_id: `demo_customer_${i}_${j}`,
          customer_name: reviewerNames[Math.floor(Math.random() * reviewerNames.length)],
          rating: reviewData.rating,
          title: reviewData.title,
          comment: reviewData.comment,
          verified_purchase: Math.random() > 0.3, // 70% verified
        })
      }
      
      logger.info(`Seeded ${reviewCount} reviews for product: ${product.title}`)
    }

    logger.info("✅ Successfully seeded product analytics data!")
  } catch (error) {
    logger.error("Failed to seed analytics data:", error)
    throw error
  }
}
