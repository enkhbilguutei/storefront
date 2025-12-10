import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { WISHLIST_MODULE } from "../../../../modules/wishlist";
import WishlistService from "../../../../modules/wishlist/service";

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  try {
    const wishlistService: WishlistService = req.scope.resolve(WISHLIST_MODULE);
    const { id } = req.params;

    const customerId = (req as any).auth_context?.actor_id;
    if (!customerId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Retrieve the item with wishlist relation
    const item = await wishlistService.retrieveWishlistItem(id, {
      relations: ["wishlist"],
    });

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Verify the item belongs to the customer's wishlist
    if (item.wishlist.customer_id !== customerId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Delete the item
    await wishlistService.deleteWishlistItems(id);

    return res.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /store/wishlist/[id]:", error);
    return res.status(500).json({ 
      message: "Internal Server Error", 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
}
