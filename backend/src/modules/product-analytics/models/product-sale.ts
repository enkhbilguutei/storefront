import { model } from "@medusajs/framework/utils"

const ProductSale = model.define("product_sale", {
  id: model.id().primaryKey(),
  product_id: model.text().searchable(),
  order_id: model.text(),
  quantity: model.number(),
  sold_at: model.dateTime(),
  metadata: model.json().nullable(),
})

export default ProductSale
