import { model } from "@medusajs/framework/utils"

const ProductView = model.define("product_view", {
  id: model.id().primaryKey(),
  product_id: model.text().searchable(),
  customer_id: model.text().nullable(),
  session_id: model.text().nullable(),
  ip_address: model.text().nullable(),
  viewed_at: model.dateTime(),
  metadata: model.json().nullable(),
})

export default ProductView
