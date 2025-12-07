import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";

export default async function cleanupRegions({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const regionModuleService = container.resolve(Modules.REGION);
  
  logger.info("Fetching all regions...");
  
  const regions = await regionModuleService.listRegions(
    {},
    { relations: ["countries"] }
  );
  
  logger.info(`Found ${regions.length} regions:`);
  regions.forEach((r) => {
    const countries = r.countries?.map(c => c.iso_2).join(", ") || "none";
    logger.info(`  - ${r.name} (${r.id}) - Currency: ${r.currency_code}, Countries: ${countries}`);
  });
  
  // Find Mongolia region (keep this one)
  const mongoliaRegion = regions.find(r => 
    r.countries?.some(c => c.iso_2 === "mn") || 
    r.name?.toLowerCase().includes("монгол") ||
    r.name?.toLowerCase().includes("mongol")
  );
  
  if (mongoliaRegion) {
    logger.info(`\nKeeping Mongolia region: ${mongoliaRegion.name} (${mongoliaRegion.id})`);
  }
  
  // Delete all other regions
  const regionsToDelete = regions.filter(r => r.id !== mongoliaRegion?.id);
  
  if (regionsToDelete.length > 0) {
    logger.info(`\nDeleting ${regionsToDelete.length} other regions...`);
    for (const region of regionsToDelete) {
      try {
        await regionModuleService.deleteRegions([region.id]);
        logger.info(`  Deleted: ${region.name} (${region.id})`);
      } catch (error) {
        logger.error(`  Failed to delete ${region.name}: ${error}`);
      }
    }
  } else {
    logger.info("\nNo other regions to delete.");
  }
  
  logger.info("\nDone! Only Mongolia region remains.");
}
