import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";

/**
 * Subscriber that ensures newly created products have shipping profiles
 * This prevents checkout errors from products without shipping profiles
 */
export default async function ensureProductShippingProfile({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const productModuleService = container.resolve(Modules.PRODUCT);
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);

  const productId = data.id;

  try {
    // Check if product has shipping profile
    const [product] = await productModuleService.listProducts(
      { id: productId },
      { select: ["id", "title", "shipping_profile_id"] }
    );

    if (!product) {
      return;
    }

    // If product already has a shipping profile, skip
    if (product.shipping_profile_id) {
      return;
    }

    logger.info(`Product "${product.title}" created without shipping profile. Auto-assigning default...`);

    // Get default shipping profile
    const shippingProfiles = await fulfillmentModuleService.listShippingProfiles({
      type: "default",
    });

    if (!shippingProfiles.length) {
      logger.error("No default shipping profile found. Cannot auto-assign.");
      return;
    }

    const defaultProfile = shippingProfiles[0];

    // Create link between product and shipping profile
    await link.create({
      [Modules.PRODUCT]: {
        product_id: productId,
      },
      [Modules.FULFILLMENT]: {
        shipping_profile_id: defaultProfile.id,
      },
    });

    logger.info(`✓ Assigned default shipping profile to product "${product.title}"`);
  } catch (error) {
    logger.error(`Failed to auto-assign shipping profile to product ${productId}:`, error);
  }
}

export const config: SubscriberConfig = {
  event: "product.created",
};
