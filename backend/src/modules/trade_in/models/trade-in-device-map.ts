import { model } from "@medusajs/framework/utils"

const TradeInDeviceMap = model.define("trade_in_device_map", {
  id: model.id().primaryKey(),

  // TAC (IMEI) prefix, typically first 8 digits
  tac_prefix: model.text().searchable(),

  brand: model.text().default("apple"),
  device_type: model.text().nullable(),

  // The keyword we should use to match against offers
  model_keyword: model.text().searchable(),

  priority: model.number().default(0),
  active: model.boolean().default(true),

  metadata: model.json().nullable(),
})

export default TradeInDeviceMap
