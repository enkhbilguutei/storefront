import { model } from "@medusajs/framework/utils"
import Wishlist from "./wishlist"

const WishlistItem = model.define("wishlist_item", {
  id: model.id().primaryKey(),
  wishlist: model.belongsTo(() => Wishlist, { mappedBy: "items" }),
  product_id: model.text(),
  variant_id: model.text().nullable(),
  metadata: model.json().nullable(),
})

export default WishlistItem
