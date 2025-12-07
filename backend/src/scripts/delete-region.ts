import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";

export default async function deleteRegion({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const regionModuleService = container.resolve(Modules.REGION);
  
  const regions = await regionModuleService.listRegions({});
  
  logger.info(`Found ${regions.length} regions`);
  
  for (const region of regions) {
    logger.info(`Deleting region: ${region.name} (${region.id})`);
    try {
      await regionModuleService.deleteRegions([region.id]);
      logger.info(`  Deleted!`);
    } catch (error: any) {
      logger.error(`  Failed: ${error.message}`);
    }
  }
  
  logger.info("Done!");
}
