import { model } from "@medusajs/framework/utils"

const TradeInRequest = model.define("trade_in_request", {
  id: model.id().primaryKey(),

  // New (desired) product
  new_product_id: model.text().searchable().nullable(),
  new_product_handle: model.text().searchable().nullable(),
  new_product_title: model.text().nullable(),

  // Cart / order linkage
  cart_id: model.text().searchable().nullable(),
  order_id: model.text().searchable().nullable(),

  // Estimate and promotion
  estimated_amount: model.number().nullable(),
  final_amount: model.number().nullable(),
  currency_code: model.text().default("mnt"),
  promotion_code: model.text().searchable().nullable(),

  // Customer info
  customer_name: model.text().nullable(),
  phone: model.text().nullable(),

  // Device identity
  serial_number: model.text().nullable(),

  // Old device being traded in
  old_device_model: model.text(),
  old_device_condition: model.text(), // like_new | good | fair | broken
  note: model.text().nullable(),

  status: model.text().default("new"),

  metadata: model.json().nullable(),
})

export default TradeInRequest
