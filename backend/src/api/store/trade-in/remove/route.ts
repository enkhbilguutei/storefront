import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules, PromotionActions } from "@medusajs/framework/utils"

import { updateCartPromotionsWorkflowId } from "@medusajs/core-flows"

interface RemoveBody {
  cart_id: string
}

export async function POST(req: MedusaRequest<RemoveBody>, res: MedusaResponse) {
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)
  const { cart_id } = req.body || ({} as RemoveBody)

  if (!cart_id) {
    return res.status(400).json({ error: "cart_id is required" })
  }

  const cartService = req.scope.resolve(Modules.CART)
  const workflowEngine = req.scope.resolve(Modules.WORKFLOW_ENGINE)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cart = (await cartService.retrieveCart(cart_id, { relations: ["items"] })) as any
  const promoCode = cart?.metadata?.trade_in_promo_code

  if (promoCode) {
    try {
      await workflowEngine.run(updateCartPromotionsWorkflowId, {
        input: {
          promo_codes: [promoCode],
          cart_id,
          action: PromotionActions.REMOVE,
        },
      })
    } catch (e) {
      logger.warn(`[TradeIn][Remove] Failed removing promo: ${(e as Error)?.message}`)
    }
  }

  await cartService.updateCarts(cart_id, {
    metadata: {
      ...(cart?.metadata || {}),
      trade_in_request_id: null,
      trade_in_promo_code: null,
      trade_in_estimated_amount: null,
      trade_in_currency_code: null,
    },
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updatedCart = (await cartService.retrieveCart(cart_id, {
    relations: ["items", "shipping_methods", "payment_collection", "payment_collection.payment_sessions"],
  })) as any

  return res.status(200).json({ removed: true, cart: updatedCart })
}
