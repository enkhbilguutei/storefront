import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";

export default async function checkPricing({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  
  logger.info("=== Checking Pricing Setup ===\n");
  
  // Use Query to get products with prices
  const { data: products } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "title",
      "variants.id",
      "variants.title",
      "variants.prices.*",
    ],
  });
  
  logger.info(`Found ${products.length} products\n`);
  
  for (const product of products.slice(0, 5)) { // Show first 5 products
    logger.info(`Product: ${product.title}`);
    
    for (const variant of (product as any).variants || []) {
      logger.info(`  Variant: ${variant.title || variant.id}`);
      
      const prices = variant.prices || [];
      for (const price of prices) {
        const hasRules = price.rules_count > 0 || (price.price_rules && price.price_rules.length > 0);
        logger.info(`    Price: ${price.amount} ${price.currency_code} ${hasRules ? '(with rules - region price)' : '(no rules - currency price)'}`);
      }
    }
    logger.info("");
  }
  
  logger.info("=== How to set up DISCOUNTS properly ===");
  logger.info("");
  logger.info("In Medusa Admin:");
  logger.info("1. Go to Pricing → Price Lists");
  logger.info("2. Click 'Create Price List'");
  logger.info("3. Set Type = 'Sale'");
  logger.info("4. Add products and enter DISCOUNTED prices");
  logger.info("5. Save");
  logger.info("");
  logger.info("The storefront will automatically show:");
  logger.info("  - Original price (strikethrough)");
  logger.info("  - Sale price (highlighted)");
  logger.info("  - Discount percentage badge");
}
