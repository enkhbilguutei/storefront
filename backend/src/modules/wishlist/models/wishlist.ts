import { model } from "@medusajs/framework/utils"
import WishlistItem from "./wishlist-item"

const Wishlist = model.define("wishlist", {
  id: model.id().primaryKey(),
  customer_id: model.text().searchable(),
  region_id: model.text().nullable(),
  items: model.hasMany(() => WishlistItem, { mappedBy: "wishlist" }),
  metadata: model.json().nullable(),
})

export default Wishlist
