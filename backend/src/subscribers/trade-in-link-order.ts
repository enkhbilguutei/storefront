import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { TRADE_IN_MODULE } from "../modules/trade_in"

export default async function tradeInLinkOrderHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const tradeInService = container.resolve(TRADE_IN_MODULE)

  try {
    const { data: orders } = await query.graph({
      entity: "order",
      fields: ["id", "cart_id", "metadata"],
      filters: { id: data.id },
    })

    const order = orders?.[0] as any
    const cartId = order?.cart_id as string | undefined
    if (!cartId) return

    // Pull cart metadata so we can find the trade-in request id
    const { data: carts } = await query.graph({
      entity: "cart",
      fields: ["id", "metadata"],
      filters: { id: cartId },
    })

    const cart = carts?.[0]
    const tradeInRequestId = cart?.metadata?.trade_in_request_id

    if (!tradeInRequestId) {
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await tradeInService.updateTradeInRequests({
      id: tradeInRequestId,
      order_id: order.id,
      status: "ordered",
    } as any)

    logger.info(`[TradeIn] Linked request ${tradeInRequestId} to order ${order.id}`)
  } catch (e) {
    logger.warn(`[TradeIn] Failed linking trade-in to order: ${(e as Error)?.message}`)
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
