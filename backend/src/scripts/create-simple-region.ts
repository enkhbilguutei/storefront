import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";

export default async function createSimpleRegion({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const regionModuleService = container.resolve(Modules.REGION);
  
  // Check if region exists
  const existingRegions = await regionModuleService.listRegions({});
  if (existingRegions.length > 0) {
    logger.info("Region already exists, skipping creation");
    return;
  }
  
  logger.info("Creating Mongolia region...");
  
  const region = await regionModuleService.createRegions({
    name: "Монгол",
    currency_code: "mnt",
    countries: ["mn"],
  });
  
  logger.info(`Created region: ${region.name} (${region.id})`);
  logger.info("Done!");
}
