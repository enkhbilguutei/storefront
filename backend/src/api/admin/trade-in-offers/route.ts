import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { TRADE_IN_MODULE } from "../../../modules/trade_in"

type TradeInCondition = "like_new" | "good" | "fair" | "broken"

interface CreateOfferBody {
  brand?: string
  device_type?: string | null
  model_keyword: string
  condition: TradeInCondition
  amount: number
  currency_code?: string
  active?: boolean
  priority?: number
  metadata?: Record<string, unknown>
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const tradeInService = req.scope.resolve(TRADE_IN_MODULE)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const offers = (await tradeInService.listTradeInOffers({}, { take: 500 })) as any[]
  res.json({ offers })
}

export async function POST(req: MedusaRequest<CreateOfferBody>, res: MedusaResponse) {
  const tradeInService = req.scope.resolve(TRADE_IN_MODULE)
  const body = req.body || ({} as CreateOfferBody)

  if (!body.model_keyword || !body.condition || typeof body.amount !== "number") {
    return res.status(400).json({ error: "model_keyword, condition, amount are required" })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const offer = await tradeInService.createTradeInOffers({
    brand: body.brand || "apple",
    device_type: body.device_type ?? null,
    model_keyword: body.model_keyword,
    condition: body.condition,
    amount: body.amount,
    currency_code: body.currency_code || "mnt",
    active: body.active ?? true,
    priority: body.priority ?? 0,
    metadata: body.metadata ?? null,
  } as any)

  res.status(201).json({ offer })
}
