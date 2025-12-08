import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { WISHLIST_MODULE } from "../../../../modules/wishlist";
import WishlistService from "../../../../modules/wishlist/service";

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const wishlistService: WishlistService = req.scope.resolve(WISHLIST_MODULE);
  const { id } = req.params;

  const customerId = (req as any).auth_context?.actor_id;
  if (!customerId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const item = await wishlistService.retrieveWishlistItem(id, {
      relations: ["wishlist"],
    });

    if (!item || item.wishlist.customer_id !== customerId) {
      return res.status(404).json({ message: "Item not found" });
    }

    await wishlistService.deleteWishlistItems(id);

    return res.json({ success: true });
  } catch (error) {
    return res.status(404).json({ message: "Item not found" });
  }
}
