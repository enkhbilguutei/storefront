import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { WISHLIST_MODULE } from "../../../modules/wishlist";
import WishlistService from "../../../modules/wishlist/service";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const wishlistService: WishlistService = req.scope.resolve(WISHLIST_MODULE);
  
  const customerId = (req as any).auth_context?.actor_id;
  if (!customerId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const wishlists = await wishlistService.listWishlists({
    customer_id: customerId,
  }, {
    relations: ["items"],
  });

  if (!wishlists.length) {
    return res.json({ wishlist: null });
  }

  return res.json({ wishlist: wishlists[0] });
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const wishlistService: WishlistService = req.scope.resolve(WISHLIST_MODULE);
    
    const customerId = (req as any).auth_context?.actor_id;
    if (!customerId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { product_id, variant_id } = req.body as any;

    if (!product_id) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    let wishlists = await wishlistService.listWishlists({
      customer_id: customerId,
    });
    let wishlist = wishlists[0];

    if (!wishlist) {
      wishlist = await wishlistService.createWishlists({
        customer_id: customerId,
      });
    }

    const safeVariantId = variant_id || null;

    const existingItems = await wishlistService.listWishlistItems({
      wishlist_id: wishlist.id,
      product_id,
      variant_id: safeVariantId,
    });

    if (existingItems.length > 0) {
      return res.json({ wishlist, item: existingItems[0], message: "Item already in wishlist" });
    }

    const item = await wishlistService.createWishlistItems({
      wishlist_id: wishlist.id,
      product_id,
      variant_id: safeVariantId,
    });

    return res.json({ wishlist, item });
  } catch (error) {
    console.error("Error in POST /store/wishlist:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error instanceof Error ? error.message : String(error) });
  }
}
