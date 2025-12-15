import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules, PromotionActions } from "@medusajs/framework/utils"
import type { IPromotionModuleService } from "@medusajs/types"

import { updateCartPromotionsWorkflowId } from "@medusajs/core-flows"

import { TRADE_IN_MODULE } from "../../../../modules/trade_in"
import {
  type TradeInCondition,
  normalize,
  makePromoCode,
  findBestTradeInOffer,
  checkProductTradeInEligibility,
  resolveModelKeyword,
} from "../utils"

interface ApplyBody {
  cart_id: string
  new_product_id: string
  old_device_model?: string
  old_device_condition: TradeInCondition
  serial_number: string
  device_checks?: Record<string, boolean>
}

export async function POST(req: MedusaRequest<ApplyBody>, res: MedusaResponse) {
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)

  const { cart_id, new_product_id, old_device_model, old_device_condition, serial_number, device_checks } =
    req.body || ({} as ApplyBody)

  if (!cart_id || !new_product_id || !old_device_condition || !serial_number) {
    return res
      .status(400)
      .json({ error: "cart_id, new_product_id, old_device_condition, serial_number are required" })
  }

  const productService = req.scope.resolve(Modules.PRODUCT)
  const promotionService: IPromotionModuleService = req.scope.resolve(Modules.PROMOTION)
  const cartService = req.scope.resolve(Modules.CART)
  const workflowEngine = req.scope.resolve(Modules.WORKFLOW_ENGINE)
  const tradeInService = req.scope.resolve(TRADE_IN_MODULE)

  // Enforce non-hardcoded eligibility: product metadata must explicitly opt-in.
  const { eligible, product } = await checkProductTradeInEligibility(productService, new_product_id)
  if (!eligible) {
    return res.status(400).json({ error: "This product is not eligible for trade-in" })
  }

  const { modelInput, resolvedFrom } = await resolveModelKeyword({
    tradeInService,
    old_device_model,
    serial_number,
  })

  if (!modelInput) {
    return res.status(200).json({ applied: false, reason: "no_model_match" })
  }

  const condition = normalize(old_device_condition) as TradeInCondition

  const checks = device_checks || {}
  const failedChecks = [
    "power_on",
    "buttons_ok",
    "cosmetics_ok",
    "face_id_touch_ok",
    "audio_ok",
  ].filter((k) => checks[k] === false)

  if (failedChecks.length > 0) {
    return res.status(200).json({ applied: false, reason: "device_checks_failed", failed_checks: failedChecks })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const offers = (await tradeInService.listTradeInOffers(
    {
      active: true,
      brand: "apple",
      condition,
    },
    { take: 200 }
  )) as any[]

  const best = findBestTradeInOffer({
    offers,
    modelInput,
    logger,
    context: "[Apply]",
  })
  if (!best || !best.amount || best.amount <= 0) {
    return res.status(200).json({ applied: false, reason: "no_offer_match" })
  }

  // Remove previously applied trade-in promo (if any) from cart metadata
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const existingCart = (await cartService.retrieveCart(cart_id, { relations: ["items"] })) as any
  const existingPromo = existingCart?.metadata?.trade_in_promo_code

  try {
    if (existingPromo) {
      await workflowEngine.run(updateCartPromotionsWorkflowId, {
        input: {
          promo_codes: [existingPromo],
          cart_id,
          action: PromotionActions.REMOVE,
        },
      })
    }
  } catch (e) {
    logger.warn(`[TradeIn][Apply] Failed removing previous promo: ${(e as Error)?.message}`)
  }

  // Create a one-time fixed discount promotion
  const promoCode = makePromoCode()

  await promotionService.createPromotions({
    code: promoCode,
    type: "standard",
    status: "active",
    is_automatic: false,
    limit: 1,
    application_method: {
      type: "fixed",
      target_type: "order",
      value: best.amount,
      currency_code: best.currency_code || "mnt",
    },
  })

  await workflowEngine.run(updateCartPromotionsWorkflowId, {
    input: {
      promo_codes: [promoCode],
      cart_id,
      action: PromotionActions.ADD,
    },
  })

  // Create request record for later verification
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const request = await tradeInService.createTradeInRequests({
    cart_id,
    new_product_id: product.id,
    new_product_handle: (product as any).handle,
    new_product_title: (product as any).title,
    old_device_model: modelInput,
    old_device_condition,
    serial_number,
    estimated_amount: best.amount,
    currency_code: best.currency_code || "mnt",
    promotion_code: promoCode,
    status: "applied",
    metadata: {
      offer_id: best.id,
      device_checks: checks,
      failed_checks: failedChecks,
      serial_number,
      resolved_from: resolvedFrom,
    },
  } as any)

  // Persist cart metadata pointers
  await cartService.updateCarts(cart_id, {
    metadata: {
      ...(existingCart?.metadata || {}),
      trade_in_request_id: request.id,
      trade_in_promo_code: promoCode,
      trade_in_estimated_amount: best.amount,
      trade_in_currency_code: best.currency_code || "mnt",
      trade_in_serial_number: serial_number,
    },
  })

  // Refetch cart for client totals
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updatedCart = (await cartService.retrieveCart(cart_id, {
    relations: ["items", "shipping_methods", "payment_collection", "payment_collection.payment_sessions"],
  })) as any

  return res.status(200).json({
    applied: true,
    promotion_code: promoCode,
    trade_in_request_id: request.id,
    estimated_amount: best.amount,
    currency_code: best.currency_code || "mnt",
    cart: updatedCart,
  })
}
