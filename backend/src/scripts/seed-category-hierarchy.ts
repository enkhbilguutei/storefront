import { ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils";

interface CategoryNode {
  name: string;
  slug: string;
  children?: CategoryNode[];
}

interface CategoryStructure {
  categories: CategoryNode[];
}

export default async function seedCategoryHierarchy({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const productModuleService = container.resolve(Modules.PRODUCT);

  logger.info("Starting category hierarchy seeding...");

  const categoryStructure: CategoryStructure = {
    categories: [
      {
        name: "Apple",
        slug: "apple",
        children: [
          {
            name: "iPhone",
            slug: "iphone",
            children: [
              { name: "iPhone 16 Series", slug: "iphone-16-series" },
              { name: "iPhone 15 Series", slug: "iphone-15-series" },
              { name: "Older iPhones", slug: "older-iphones" },
              { name: "iPhone Accessories", slug: "iphone-accessories" },
            ],
          },
          {
            name: "iPad",
            slug: "ipad",
            children: [
              { name: "iPad Pro", slug: "ipad-pro" },
              { name: "iPad Air", slug: "ipad-air" },
              { name: "iPad 11th Gen", slug: "ipad-11th-gen" },
              { name: "iPad Mini", slug: "ipad-mini" },
              { name: "iPad Accessories", slug: "ipad-accessories" },
            ],
          },
          {
            name: "Mac",
            slug: "mac",
            children: [
              { name: "MacBook Pro", slug: "macbook-pro" },
              { name: "MacBook Air", slug: "macbook-air" },
              { name: "iMac", slug: "imac" },
              { name: "Mac mini", slug: "mac-mini" },
              { name: "Mac Studio", slug: "mac-studio" },
              { name: "Mac Accessories", slug: "mac-accessories" },
            ],
          },
          {
            name: "Apple Watch",
            slug: "apple-watch",
            children: [
              { name: "Watch Series", slug: "watch-series" },
              { name: "Watch SE", slug: "watch-se" },
              { name: "Watch Bands", slug: "watch-bands" },
              { name: "Watch Accessories", slug: "watch-accessories" },
            ],
          },
          {
            name: "AirPods",
            slug: "airpods",
            children: [
              { name: "AirPods Pro", slug: "airpods-pro" },
              { name: "AirPods 3rd Gen", slug: "airpods-3rd-gen" },
              { name: "AirPods Max", slug: "airpods-max" },
              { name: "AirPods Accessories", slug: "airpods-accessories" },
            ],
          },
          {
            name: "Apple Accessories",
            slug: "apple-accessories",
            children: [
              { name: "MagSafe Chargers", slug: "magsafe-chargers" },
              { name: "Cables & Adapters", slug: "cables-adapters" },
              { name: "Power Banks", slug: "power-banks" },
            ],
          },
        ],
      },
      {
        name: "DJI",
        slug: "dji",
        children: [
          {
            name: "Drones",
            slug: "drones",
            children: [
              { name: "Mini Series", slug: "mini-series" },
              { name: "Air Series", slug: "air-series" },
              { name: "Mavic Series", slug: "mavic-series" },
              { name: "FPV / Avata", slug: "fpv-avata" },
            ],
          },
          {
            name: "Gimbals",
            slug: "gimbals",
            children: [
              { name: "Osmo Mobile", slug: "osmo-mobile" },
              { name: "Osmo Pocket", slug: "osmo-pocket" },
              { name: "Ronin Series", slug: "ronin-series" },
            ],
          },
          {
            name: "Action Cameras",
            slug: "action-cameras",
            children: [{ name: "Osmo Action", slug: "osmo-action" }],
          },
          {
            name: "DJI Accessories",
            slug: "dji-accessories",
            children: [
              { name: "Batteries", slug: "batteries" },
              { name: "Propellers", slug: "propellers" },
              { name: "ND Filters", slug: "nd-filters" },
              { name: "Chargers", slug: "chargers" },
              { name: "Cases", slug: "cases" },
            ],
          },
        ],
      },
      {
        name: "Gaming",
        slug: "gaming",
        children: [
          {
            name: "PlayStation",
            slug: "playstation",
            children: [
              { name: "PS5 Console", slug: "ps5-console" },
              { name: "PS5 Controllers", slug: "ps5-controllers" },
              { name: "PS5 Games", slug: "ps5-games" },
              { name: "PS5 Accessories", slug: "ps5-accessories" },
            ],
          },
          {
            name: "Nintendo",
            slug: "nintendo",
            children: [
              { name: "Switch OLED", slug: "switch-oled" },
              { name: "Switch Lite", slug: "switch-lite" },
              { name: "Switch Games", slug: "switch-games" },
              { name: "Switch Accessories", slug: "switch-accessories" },
            ],
          },
        ],
      },
      {
        name: "Eyewear",
        slug: "eyewear",
        children: [
          {
            name: "Ray-Ban Meta Glasses",
            slug: "rayban-meta",
            children: [
              { name: "Wayfarer", slug: "wayfarer" },
              { name: "Headliner", slug: "headliner" },
              { name: "Glasses Accessories", slug: "glasses-accessories" },
            ],
          },
        ],
      },
      {
        name: "Collectibles",
        slug: "collectibles",
        children: [
          {
            name: "Pop Mart",
            slug: "pop-mart",
            children: [
              { name: "Blind Boxes", slug: "blind-boxes" },
              { name: "Limited Editions", slug: "limited-editions" },
              { name: "Series Collections", slug: "series-collections" },
            ],
          },
        ],
      },
    ],
  };

  // Fetch all existing categories
  const existingCategories = await productModuleService.listProductCategories(
    {},
    { take: 10000, select: ["id", "name", "handle", "parent_category_id"] }
  );

  const existingCategoryMap = new Map(
    existingCategories.map((cat) => [cat.handle, cat])
  );

  // Track created categories for parent-child relationships
  const createdCategoryMap = new Map<string, any>();

  // Helper function to create category recursively
  async function createCategory(
    category: CategoryNode,
    parentId?: string
  ): Promise<void> {
    const handle = category.slug;

    // Check if category already exists
    if (existingCategoryMap.has(handle)) {
      const existing = existingCategoryMap.get(handle)!;
      createdCategoryMap.set(handle, existing);
      logger.info(`Category "${category.name}" already exists, skipping...`);
      
      // Process children if they exist
      if (category.children && category.children.length > 0) {
        for (const child of category.children) {
          await createCategory(child, existing.id);
        }
      }
      return;
    }

    // Create the category
    logger.info(
      `Creating category "${category.name}" (handle: ${handle})${
        parentId ? ` under parent ID: ${parentId}` : ""
      }`
    );

    const categoryData: any = {
      name: category.name,
      handle: handle,
      is_active: true,
      is_internal: false,
    };

    if (parentId) {
      categoryData.parent_category_id = parentId;
    }

    try {
      const [createdCategory] = await productModuleService.createProductCategories([
        categoryData,
      ]);

      createdCategoryMap.set(handle, createdCategory);
      logger.info(`✓ Created category: ${category.name}`);

      // Process children if they exist
      if (category.children && category.children.length > 0) {
        for (const child of category.children) {
          await createCategory(child, createdCategory.id);
        }
      }
    } catch (error) {
      logger.error(
        `Failed to create category "${category.name}": ${error.message}`
      );
      throw error;
    }
  }

  // Create all categories
  for (const topLevelCategory of categoryStructure.categories) {
    await createCategory(topLevelCategory);
  }

  logger.info("✓ Finished seeding category hierarchy!");
  logger.info(
    `Total categories created/verified: ${createdCategoryMap.size + existingCategoryMap.size}`
  );
}
