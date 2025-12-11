import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve("logger")
  const orderService = container.resolve("order")
  const analyticsService = container.resolve("product_analytics")

  try {
    // Fetch the order with items
    const order = await orderService.retrieveOrder(data.id, {
      relations: ["items", "items.variant"],
    })

    if (!order?.items) {
      return
    }

    // Track each product sale
    for (const item of order.items) {
      if (item.product_id) {
        await analyticsService.trackSale({
          product_id: item.product_id,
          order_id: order.id,
          quantity: item.quantity,
        })

        logger.info(`Tracked sale for product ${item.product_id}`)
      }
    }
  } catch (error) {
    logger.error("Failed to track product sales:", error)
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
