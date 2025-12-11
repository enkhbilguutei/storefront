import { model } from "@medusajs/framework/utils"

const ProductReview = model.define("product_review", {
  id: model.id().primaryKey(),
  product_id: model.text().searchable(),
  customer_id: model.text(),
  customer_name: model.text(),
  rating: model.number(),
  title: model.text().nullable(),
  comment: model.text(),
  photos: model.json().nullable(),
  verified_purchase: model.boolean().default(false),
  is_approved: model.boolean().default(false),
  helpful_count: model.number().default(0),
  created_at: model.dateTime(),
  updated_at: model.dateTime(),
  metadata: model.json().nullable(),
})

export default ProductReview
