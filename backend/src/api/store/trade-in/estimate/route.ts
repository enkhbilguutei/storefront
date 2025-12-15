import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

import { TRADE_IN_MODULE } from "../../../../modules/trade_in"
import { 
  type TradeInCondition, 
  normalize, 
  findBestTradeInOffer,
  checkProductTradeInEligibility,
  resolveModelKeyword,
} from "../utils"

interface EstimateBody {
  new_product_id: string
  old_device_model?: string
  old_device_condition: TradeInCondition
  serial_number: string
  device_checks?: Record<string, boolean>
}

export async function POST(req: MedusaRequest<EstimateBody>, res: MedusaResponse) {
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)

  const { new_product_id, old_device_model, old_device_condition, serial_number, device_checks } = req.body ||
    ({} as EstimateBody)

  if (!new_product_id || !old_device_condition || !serial_number) {
    return res
      .status(400)
      .json({ error: "new_product_id, old_device_condition, serial_number are required" })
  }

  const productService = req.scope.resolve(Modules.PRODUCT)
  const tradeInService = req.scope.resolve(TRADE_IN_MODULE)

  // Enforce non-hardcoded eligibility: product metadata must explicitly opt-in.
  const { eligible } = await checkProductTradeInEligibility(productService, new_product_id)
  if (!eligible) {
    return res.status(400).json({ error: "This product is not eligible for trade-in" })
  }

  const { modelInput } = await resolveModelKeyword({
    tradeInService,
    old_device_model,
    serial_number,
  })

  if (!modelInput) {
    return res.status(200).json({ estimated_amount: 0, currency_code: "mnt", matched: false })
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
    return res.status(200).json({
      estimated_amount: 0,
      currency_code: "mnt",
      matched: false,
      reason: "device_checks_failed",
      failed_checks: failedChecks,
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const offers = (await tradeInService.listTradeInOffers(
    {
      active: true,
      brand: "apple",
      condition,
    },
    {
      take: 200,
    }
  )) as any[]

  const best = findBestTradeInOffer({
    offers,
    modelInput,
    logger,
    context: "[Estimate]",
  })

  if (!best) {
    return res.status(200).json({ estimated_amount: 0, currency_code: "mnt", matched: false })
  }

  return res.status(200).json({
    estimated_amount: best.amount,
    currency_code: best.currency_code || "mnt",
    matched: true,
  })
}
