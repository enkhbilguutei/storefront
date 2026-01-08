import { ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils";

/**
 * Fix products that are missing shipping profiles
 * This assigns the default shipping profile to all products that don't have one
 * 
 * Run with: cd backend && medusa exec ./src/scripts/fix-product-shipping-profiles.ts
 */
export default async function fixProductShippingProfiles({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const productModuleService = container.resolve(Modules.PRODUCT);
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);

  logger.info("Checking for products without shipping profiles...");

  // Get default shipping profile
  const shippingProfiles = await fulfillmentModuleService.listShippingProfiles({
    type: "default",
  });

  if (!shippingProfiles.length) {
    logger.error("No default shipping profile found! Please run the seed script first.");
    return;
  }

  const defaultProfile = shippingProfiles[0];
  logger.info(`Using default shipping profile: ${defaultProfile.id} (${defaultProfile.name})`);

  // Get all products - need to check in batches
  let offset = 0;
  const limit = 100;
  let productsWithoutProfile = [];
  let totalProducts = 0;

  while (true) {
    const products = await productModuleService.listProducts(
      {},
      { 
        skip: offset, 
        take: limit,
        select: ["id", "title", "handle"]
      }
    );

    if (products.length === 0) break;

    totalProducts += products.length;

    // Check each product for shipping_profile_id
    for (const product of products) {
      const [fullProduct] = await productModuleService.listProducts(
        { id: product.id },
        { select: ["id", "title", "handle", "shipping_profile_id"] }
      );

      if (!fullProduct.shipping_profile_id) {
        productsWithoutProfile.push({
          id: fullProduct.id,
          title: fullProduct.title,
          handle: fullProduct.handle,
        });
      }
    }

    offset += limit;

    // Safety break
    if (offset > 10000) {
      logger.warn("Reached 10k product limit, stopping...");
      break;
    }
  }

  logger.info(`Scanned ${totalProducts} products`);
  logger.info(`Found ${productsWithoutProfile.length} products without shipping profiles`);

  if (productsWithoutProfile.length === 0) {
    logger.info("All products have shipping profiles! ✓");
    return;
  }

  logger.info("Products without shipping profiles:");
  productsWithoutProfile.forEach((p) => {
    logger.info(`  - ${p.title} (${p.handle}) [${p.id}]`);
  });

  logger.info("\nAssigning default shipping profile to these products...");

  // Use link service to create product <-> shipping profile associations
  for (let i = 0; i < productsWithoutProfile.length; i++) {
    const product = productsWithoutProfile[i];
    
    await link.create({
      [Modules.PRODUCT]: {
        product_id: product.id,
      },
      [Modules.FULFILLMENT]: {
        shipping_profile_id: defaultProfile.id,
      },
    });

    if ((i + 1) % 10 === 0 || i === productsWithoutProfile.length - 1) {
      logger.info(`Updated ${i + 1}/${productsWithoutProfile.length} products`);
    }
  }

  logger.info("\n✓ Successfully assigned shipping profiles to all products!");
  logger.info("You can now proceed with checkout without shipping profile errors.");
}
