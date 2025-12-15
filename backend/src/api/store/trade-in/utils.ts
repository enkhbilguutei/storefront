import type { IProductModuleService } from "@medusajs/framework/types"

export type TradeInCondition = "like_new" | "good" | "fair" | "broken"

export function normalize(str: string): string {
  return (str || "").trim().toLowerCase()
}

export function makePromoCode(): string {
  // not user-friendly on purpose; prevents reuse.
  return `TRADEIN-${Math.random().toString(36).slice(2, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`
}

export interface TradeInOffer {
  id: string
  model_keyword: string
  amount: number
  currency_code?: string
  priority?: number
  active: boolean
  brand: string
  condition: TradeInCondition
}

export interface FindBestOfferParams {
  offers: TradeInOffer[]
  modelInput: string
  logger?: any
  context?: string
}

export function findBestTradeInOffer({
  offers,
  modelInput,
  logger,
  context = "",
}: FindBestOfferParams): TradeInOffer | null {
  const normalizedInput = normalize(modelInput)

  const matches = offers
    .map((o) => {
      const kw = normalize(o.model_keyword)
      const contains = kw && normalizedInput.includes(kw)
      return { offer: o, kw, contains }
    })
    .filter((m) => m.contains)
    .sort((a, b) => {
      const kwLen = (b.kw?.length || 0) - (a.kw?.length || 0)
      if (kwLen !== 0) return kwLen
      return (b.offer.priority || 0) - (a.offer.priority || 0)
    })

  const best = matches[0]?.offer

  if (!best && logger) {
    logger.info(`[TradeIn]${context} No offer match for model="${modelInput}"`)
  }

  return best || null
}

function extractTac(serial: string): string | null {
  const digits = (serial || "").replace(/[^0-9]/g, "")
  if (digits.length < 8) return null
  return digits.slice(0, 8)
}

export async function resolveModelKeyword({
  tradeInService,
  old_device_model,
  serial_number,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tradeInService: any
  old_device_model?: string | null
  serial_number?: string | null
}): Promise<{ modelInput: string; resolvedFrom: "old_device_model" | "tac" | "serial" }> {
  const trimmedModel = (old_device_model || "").trim()
  if (trimmedModel) {
    return { modelInput: trimmedModel, resolvedFrom: "old_device_model" }
  }

  const serial = (serial_number || "").trim()
  const tac = extractTac(serial)

  if (tac) {
    // Try to find TAC match
    const mappings = await tradeInService.listTradeInDeviceMaps({
      tac_prefix: tac,
      active: true,
    }, {
      take: 1,
      order: {
        priority: "DESC",
      },
    })

    if (mappings?.[0]?.model_keyword) {
      return { modelInput: mappings[0].model_keyword, resolvedFrom: "tac" }
    }
  }

  if (serial) {
    return { modelInput: serial, resolvedFrom: "serial" }
  }

  return { modelInput: "", resolvedFrom: "serial" }
}

export async function checkProductTradeInEligibility(
  productService: IProductModuleService,
  productId: string
): Promise<{ eligible: boolean; product: any }> {
  const product = await productService.retrieveProduct(productId, {
    select: ["id", "title", "handle", "metadata"],
  })

  const eligible = Boolean((product as any)?.metadata?.trade_in_eligible)
  
  return { eligible, product }
}
