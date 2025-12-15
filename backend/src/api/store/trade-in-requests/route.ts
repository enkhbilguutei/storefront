import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { TRADE_IN_MODULE } from "../../../modules/trade_in"
import TradeInService from "../../../modules/trade_in/service"

const APPLE_KEYWORDS = [
  "iphone",
  "ipad",
  "watch",
  "apple-watch",
  "mac",
  "macbook",
  "imac",
  "airpods",
  "airpod",
] as const

function looksLikeApple(text: string | null | undefined) {
  if (!text) return false
  const v = text.toLowerCase()
  return APPLE_KEYWORDS.some((kw) => v.includes(kw))
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const tradeInService: TradeInService = req.scope.resolve(TRADE_IN_MODULE)

    const {
      customer_name,
      phone,
      old_device_model,
      old_device_condition,
      note,
      new_product_id,
      new_product_handle,
      new_product_title,
    } = (req.body ?? {}) as any

    if (!customer_name || typeof customer_name !== "string") {
      return res.status(400).json({ message: "Нэр оруулна уу" })
    }

    if (!phone || typeof phone !== "string") {
      return res.status(400).json({ message: "Утасны дугаар оруулна уу" })
    }

    if (!old_device_model || typeof old_device_model !== "string") {
      return res.status(400).json({ message: "Хуучин төхөөрөмжийн мэдээлэл оруулна уу" })
    }

    if (!old_device_condition || typeof old_device_condition !== "string") {
      return res.status(400).json({ message: "Төхөөрөмжийн төлөв сонгоно уу" })
    }

    // Apple-only rule
    if (!looksLikeApple(new_product_handle) && !looksLikeApple(new_product_title)) {
      return res.status(400).json({ message: "Трейд-ин зөвхөн Apple бүтээгдэхүүнд боломжтой" })
    }

    const trade_in_request = await tradeInService.createTradeInRequests({
      customer_name: customer_name.trim(),
      phone: phone.trim(),
      old_device_model: old_device_model.trim(),
      old_device_condition: old_device_condition.trim(),
      note: typeof note === "string" && note.trim() ? note.trim() : null,
      new_product_id: typeof new_product_id === "string" ? new_product_id : null,
      new_product_handle: typeof new_product_handle === "string" ? new_product_handle : null,
      new_product_title: typeof new_product_title === "string" ? new_product_title : null,
      status: "new",
    } as any)

    return res.json({ trade_in_request })
  } catch (error) {
    console.error("Error in POST /store/trade-in-requests:", error)
    return res.status(500).json({
      message: "Internal Server Error",
      error: error instanceof Error ? error.message : String(error),
    })
  }
}
