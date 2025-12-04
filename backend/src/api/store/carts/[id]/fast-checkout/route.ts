import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";
import { 
  addShippingMethodToCartWorkflow,
  updateCartWorkflow,
} from "@medusajs/medusa/core-flows";

interface FastCheckoutBody {
  email: string;
  shipping_address: {
    first_name: string;
    last_name: string;
    address_1: string;
    address_2?: string;
    city: string;
    province: string;
    postal_code: string;
    country_code: string;
    phone: string;
  };
  billing_address?: {
    first_name: string;
    last_name: string;
    address_1: string;
    address_2?: string;
    city: string;
    province: string;
    postal_code: string;
    country_code: string;
    phone: string;
  };
  shipping_option_id: string;
}

/**
 * Fast checkout endpoint that combines cart update and shipping method in one request
 * Reduces round trips and improves checkout speed
 */
export async function POST(
  req: MedusaRequest<FastCheckoutBody>,
  res: MedusaResponse
) {
  const { id: cartId } = req.params;
  const { email, shipping_address, billing_address, shipping_option_id } = req.body;

  try {
    // Step 1: Update cart with addresses and email
    const updateResult = await updateCartWorkflow(req.scope).run({
      input: {
        id: cartId,
        email,
        shipping_address,
        billing_address: billing_address || shipping_address,
      },
    });
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updatedCart = updateResult.result as any;

    // Step 2: Check if shipping method needs to be added/updated
    const currentShippingMethod = updatedCart?.shipping_methods?.[0];
    const needsShippingUpdate = !currentShippingMethod || 
      currentShippingMethod.shipping_option_id !== shipping_option_id;

    if (needsShippingUpdate) {
      await addShippingMethodToCartWorkflow(req.scope).run({
        input: {
          cart_id: cartId,
          options: [{ id: shipping_option_id }],
        },
      });
    }

    // Step 3: Get the updated cart
    const cartService = req.scope.resolve(Modules.CART);
    const cart = await cartService.retrieveCart(cartId, {
      relations: ["shipping_methods", "payment_collection", "payment_collection.payment_sessions"],
    });

    res.json({ cart });
  } catch (error) {
    console.error("Fast checkout error:", error);
    res.status(400).json({ 
      error: error instanceof Error ? error.message : "Checkout preparation failed" 
    });
  }
}
