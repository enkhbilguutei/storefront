import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";

export default async function simplifyPricing({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const pricingModuleService = container.resolve(Modules.PRICING);
  const productModuleService = container.resolve(Modules.PRODUCT);
  const regionModuleService = container.resolve(Modules.REGION);
  
  logger.info("=== Simplifying Pricing ===\n");
  
  // Get region
  const regions = await regionModuleService.listRegions({}, { relations: ["countries"] });
  const mongoliaRegion = regions.find(r => r.countries?.some(c => c.iso_2 === "mn"));
  
  if (!mongoliaRegion) {
    logger.error("Mongolia region not found!");
    return;
  }
  
  logger.info(`Region: ${mongoliaRegion.name} (${mongoliaRegion.id})`);
  
  // Get all products with variants
  const products = await productModuleService.listProducts(
    {},
    { relations: ["variants", "variants.prices"] }
  );
  
  logger.info(`Found ${products.length} products\n`);
  
  for (const product of products) {
    logger.info(`Product: ${product.title}`);
    
    for (const variant of product.variants || []) {
      const prices = variant.prices || [];
      
      // Find region price and currency price
      const regionPrice = prices.find((p: any) => p.rules && Object.keys(p.rules).length > 0);
      const currencyPrice = prices.find((p: any) => !p.rules || Object.keys(p.rules).length === 0);
      
      logger.info(`  Variant: ${variant.title || variant.id}`);
      logger.info(`    Region price: ${regionPrice?.amount ?? 'none'}`);
      logger.info(`    Currency price: ${currencyPrice?.amount ?? 'none'}`);
      
      // If region price exists but currency price is different or missing, sync them
      if (regionPrice && currencyPrice && regionPrice.amount !== currencyPrice.amount) {
        logger.info(`    -> Prices differ! Region: ${regionPrice.amount}, Currency: ${currencyPrice.amount}`);
      }
    }
    logger.info("");
  }
  
  logger.info("=== Summary ===");
  logger.info("To set up discounts properly:");
  logger.info("1. Go to Admin → Pricing → Price Lists");
  logger.info("2. Create a new Price List with type 'Sale'");
  logger.info("3. Add products and set discounted prices");
  logger.info("4. The storefront will automatically show original vs sale price");
}
