import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { TRADE_IN_MODULE } from "../../../../modules/trade_in"

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const tradeInService = req.scope.resolve(TRADE_IN_MODULE)

  if (!id) {
    return res.status(400).json({ error: "id is required" })
  }

  await tradeInService.deleteTradeInOffers(id)
  res.status(200).json({ deleted: true })
}
