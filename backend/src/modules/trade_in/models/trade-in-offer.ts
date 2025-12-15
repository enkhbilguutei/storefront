import { model } from "@medusajs/framework/utils"

const TradeInOffer = model.define("trade_in_offer", {
  id: model.id().primaryKey(),

  // Matching fields
  brand: model.text().default("apple"),
  device_type: model.text().nullable(), // iphone | mac | ipad | watch | airpods | other
  model_keyword: model.text().searchable(), // used as a contains-match against user input
  condition: model.text(), // like_new | good | fair | broken

  // Offer value
  amount: model.number(),
  currency_code: model.text().default("mnt"),

  // Control
  active: model.boolean().default(true),
  priority: model.number().default(0),

  metadata: model.json().nullable(),
})

export default TradeInOffer
