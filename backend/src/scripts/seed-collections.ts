import { ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils";

interface CollectionData {
  title: string;
  slug: string;
}

export default async function seedCollections({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const productModuleService = container.resolve(Modules.PRODUCT);

  logger.info("Starting collections seeding...");

  const collections: CollectionData[] = [
    { title: "New Arrivals", slug: "new-arrivals" },
    { title: "Best Sellers", slug: "best-sellers" },
    { title: "Trending Now", slug: "trending-now" },
    { title: "Back in Stock", slug: "back-in-stock" },
    { title: "Deals & Discounts", slug: "deals-and-discounts" },
    { title: "Apple Essentials", slug: "apple-essentials" },
    { title: "Latest iPhone Releases", slug: "latest-iphone" },
    { title: "Mac for Students", slug: "mac-for-students" },
    { title: "Pro Creator Setup", slug: "pro-creator-setup" },
    { title: "Beginner Drones", slug: "beginner-drones" },
    { title: "Pro Cinematic Gear", slug: "pro-cinematic-gear" },
    { title: "Top PS5 Games", slug: "top-ps5-games" },
    { title: "Nintendo Starter Pack", slug: "nintendo-starter-pack" },
    { title: "Gifts Under 10000", slug: "gifts-under-10000" },
    { title: "Holiday Specials", slug: "holiday-specials" },
  ];

  // Fetch existing collections
  const existingCollections = await productModuleService.listProductCollections(
    {},
    { take: 1000, select: ["id", "title", "handle"] }
  );

  const existingHandles = new Set(
    existingCollections.map((col) => col.handle)
  );

  // Filter collections that don't exist
  const collectionsToCreate = collections.filter(
    (col) => !existingHandles.has(col.slug)
  );

  if (collectionsToCreate.length === 0) {
    logger.info("All collections already exist, skipping...");
    return;
  }

  logger.info(`Creating ${collectionsToCreate.length} collections...`);

  // Create collections
  for (const collection of collectionsToCreate) {
    try {
      await productModuleService.createProductCollections({
        title: collection.title,
        handle: collection.slug,
      });
      logger.info(`✓ Created collection: ${collection.title}`);
    } catch (error) {
      logger.error(
        `Failed to create collection "${collection.title}": ${error.message}`
      );
    }
  }

  logger.info("✓ Finished seeding collections!");
  logger.info(`Total collections created: ${collectionsToCreate.length}`);
}
