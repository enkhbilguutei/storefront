import { ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import { createProductCategoriesWorkflow, createProductsWorkflow } from "@medusajs/medusa/core-flows";

export default async function seedRealProducts({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const productModuleService = container.resolve(Modules.PRODUCT);
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);

  logger.info("Starting real product seeding...");

  // Get default sales channel
  const defaultSalesChannel = await salesChannelModuleService.listSalesChannels({
    name: "Default Sales Channel",
  });

  if (!defaultSalesChannel.length) {
    logger.error("Default sales channel not found. Please run the main seed script first.");
    return;
  }

  // Get shipping profile (assuming it exists from main seed)
  const shippingProfile = { id: "sp_01J9X0Z0Z0Z0Z0Z0Z0Z0Z0Z0" }; // Will use existing

  // Delete ALL existing products
  logger.info("Deleting all existing products...");
  const existingProducts = await productModuleService.listProducts({}, { take: 1000 });
  
  if (existingProducts.length > 0) {
    logger.info(`Found ${existingProducts.length} products to delete...`);
    await productModuleService.deleteProducts(existingProducts.map(p => p.id));
    logger.info("All existing products deleted.");
  }

  // Delete and recreate categories (delete deepest children first)
  logger.info("Deleting all existing categories...");
  let existingCategories = await productModuleService.listProductCategories({}, { take: 1000, relations: ["parent_category", "category_children"] });
  
  if (existingCategories.length > 0) {
    // Keep deleting until all are gone - delete leaf nodes first
    let attempts = 0;
    const maxAttempts = 10;
    
    while (existingCategories.length > 0 && attempts < maxAttempts) {
      attempts++;
      logger.info(`Category deletion attempt ${attempts}...`);
      
      // Find categories without children (leaf nodes)
      const leafCategories = existingCategories.filter(cat => 
        !cat.category_children || cat.category_children.length === 0
      );
      
      if (leafCategories.length === 0) {
        logger.warn("No leaf categories found, forcing deletion of all remaining categories");
        // Force delete remaining categories
        for (const category of existingCategories) {
          try {
            await productModuleService.deleteProductCategories([category.id]);
          } catch (error) {
            // Ignore errors on force delete
          }
        }
        break;
      }
      
      // Delete leaf categories
      for (const category of leafCategories) {
        try {
          await productModuleService.deleteProductCategories([category.id]);
          logger.info(`Deleted category: ${category.name}`);
        } catch (error) {
          logger.warn(`Failed to delete category ${category.name}: ${error.message}`);
        }
      }
      
      // Refresh category list
      existingCategories = await productModuleService.listProductCategories({}, { take: 1000, relations: ["parent_category", "category_children"] });
    }
    
    logger.info("All existing categories deleted.");
  }

  // Create new categories
  const categoryNames = [
    "iPhone",
    "iPad",
    "MacBook",
    "AirPods",
    "Apple Watch",
    "Gaming",
    "Collectibles",
    "Accessories",
  ];

  logger.info("Creating new categories...");
  const { result: categoryResult } = await createProductCategoriesWorkflow(container).run({
    input: {
      product_categories: categoryNames.map((name) => ({
        name,
        is_active: true,
      })),
    },
  });

  // Prices in MNT (Mongolian Tugrik)
  const products = [
    // AirPods Pro 2
    {
      title: "AirPods Pro 2",
      category_ids: [categoryResult.find((cat) => cat.name === "AirPods")!.id],
      description: "Adaptive Audio. Active Noise Cancellation. Transparency mode. USB-C charging case.",
      handle: "airpods-pro-2",
      weight: 50,
      status: ProductStatus.PUBLISHED,
      options: [{ title: "Color", values: ["White"] }],
      variants: [
        {
          title: "White",
          sku: "AIRPODS-PRO-2",
          options: { Color: "White" },
          prices: [{ amount: 850000, currency_code: "mnt" }], // ~$249
        },
      ],
      sales_channels: [{ id: defaultSalesChannel[0].id }],
    },
    
    // AirPods 4 with ANC
    {
      title: "AirPods 4 with Active Noise Cancellation",
      category_ids: [categoryResult.find((cat) => cat.name === "AirPods")!.id],
      description: "Updated design with Active Noise Cancellation, Adaptive Audio, and Transparency mode.",
      handle: "airpods-4-anc",
      weight: 45,
      status: ProductStatus.PUBLISHED,
      options: [{ title: "Color", values: ["White"] }],
      variants: [
        {
          title: "White",
          sku: "AIRPODS-4-ANC",
          options: { Color: "White" },
          prices: [{ amount: 610000, currency_code: "mnt" }], // ~$179
        },
      ],
      sales_channels: [{ id: defaultSalesChannel[0].id }],
    },

    // AirPods 4
    {
      title: "AirPods 4",
      category_ids: [categoryResult.find((cat) => cat.name === "AirPods")!.id],
      description: "The next evolution of sound and comfort with personalized spatial audio.",
      handle: "airpods-4",
      weight: 42,
      status: ProductStatus.PUBLISHED,
      options: [{ title: "Color", values: ["White"] }],
      variants: [
        {
          title: "White",
          sku: "AIRPODS-4",
          options: { Color: "White" },
          prices: [{ amount: 440000, currency_code: "mnt" }], // ~$129
        },
      ],
      sales_channels: [{ id: defaultSalesChannel[0].id }],
    },

    // iPhone Air
    {
      title: "iPhone Air",
      category_ids: [categoryResult.find((cat) => cat.name === "iPhone")!.id],
      description: "The thinnest iPhone ever with the power of pro inside.",
      handle: "iphone-air",
      weight: 180,
      status: ProductStatus.PUBLISHED,
      options: [
        { title: "Color", values: ["Sky Blue", "Light Gold", "Cloud White", "Space Black"] },
        { title: "Storage", values: ["128GB", "256GB", "512GB"] },
      ],
      variants: [
        { title: "Sky Blue / 128GB", sku: "IP-AIR-SKYBLU-128", options: { Color: "Sky Blue", Storage: "128GB" }, prices: [{ amount: 3400000, currency_code: "mnt" }] },
        { title: "Sky Blue / 256GB", sku: "IP-AIR-SKYBLU-256", options: { Color: "Sky Blue", Storage: "256GB" }, prices: [{ amount: 3750000, currency_code: "mnt" }] },
        { title: "Sky Blue / 512GB", sku: "IP-AIR-SKYBLU-512", options: { Color: "Sky Blue", Storage: "512GB" }, prices: [{ amount: 4250000, currency_code: "mnt" }] },
        { title: "Light Gold / 128GB", sku: "IP-AIR-GOLD-128", options: { Color: "Light Gold", Storage: "128GB" }, prices: [{ amount: 3400000, currency_code: "mnt" }] },
        { title: "Light Gold / 256GB", sku: "IP-AIR-GOLD-256", options: { Color: "Light Gold", Storage: "256GB" }, prices: [{ amount: 3750000, currency_code: "mnt" }] },
        { title: "Light Gold / 512GB", sku: "IP-AIR-GOLD-512", options: { Color: "Light Gold", Storage: "512GB" }, prices: [{ amount: 4250000, currency_code: "mnt" }] },
        { title: "Cloud White / 128GB", sku: "IP-AIR-WHT-128", options: { Color: "Cloud White", Storage: "128GB" }, prices: [{ amount: 3400000, currency_code: "mnt" }] },
        { title: "Cloud White / 256GB", sku: "IP-AIR-WHT-256", options: { Color: "Cloud White", Storage: "256GB" }, prices: [{ amount: 3750000, currency_code: "mnt" }] },
        { title: "Cloud White / 512GB", sku: "IP-AIR-WHT-512", options: { Color: "Cloud White", Storage: "512GB" }, prices: [{ amount: 4250000, currency_code: "mnt" }] },
        { title: "Space Black / 128GB", sku: "IP-AIR-BLK-128", options: { Color: "Space Black", Storage: "128GB" }, prices: [{ amount: 3400000, currency_code: "mnt" }] },
        { title: "Space Black / 256GB", sku: "IP-AIR-BLK-256", options: { Color: "Space Black", Storage: "256GB" }, prices: [{ amount: 3750000, currency_code: "mnt" }] },
        { title: "Space Black / 512GB", sku: "IP-AIR-BLK-512", options: { Color: "Space Black", Storage: "512GB" }, prices: [{ amount: 4250000, currency_code: "mnt" }] },
      ],
      sales_channels: [{ id: defaultSalesChannel[0].id }],
    },

    // iPhone 17 Pro
    {
      title: "iPhone 17 Pro",
      category_ids: [categoryResult.find((cat) => cat.name === "iPhone")!.id],
      description: "Innovative design for ultimate performance and battery life with Pro Fusion camera system.",
      handle: "iphone-17-pro",
      weight: 199,
      status: ProductStatus.PUBLISHED,
      options: [
        { title: "Color", values: ["Cosmic Orange", "Deep Blue", "Silver"] },
        { title: "Storage", values: ["256GB", "512GB", "1TB"] },
      ],
      variants: [
        { title: "Cosmic Orange / 256GB", sku: "IP17P-ORG-256", options: { Color: "Cosmic Orange", Storage: "256GB" }, prices: [{ amount: 3750000, currency_code: "mnt" }] },
        { title: "Cosmic Orange / 512GB", sku: "IP17P-ORG-512", options: { Color: "Cosmic Orange", Storage: "512GB" }, prices: [{ amount: 4250000, currency_code: "mnt" }] },
        { title: "Cosmic Orange / 1TB", sku: "IP17P-ORG-1TB", options: { Color: "Cosmic Orange", Storage: "1TB" }, prices: [{ amount: 4950000, currency_code: "mnt" }] },
        { title: "Deep Blue / 256GB", sku: "IP17P-BLU-256", options: { Color: "Deep Blue", Storage: "256GB" }, prices: [{ amount: 3750000, currency_code: "mnt" }] },
        { title: "Deep Blue / 512GB", sku: "IP17P-BLU-512", options: { Color: "Deep Blue", Storage: "512GB" }, prices: [{ amount: 4250000, currency_code: "mnt" }] },
        { title: "Deep Blue / 1TB", sku: "IP17P-BLU-1TB", options: { Color: "Deep Blue", Storage: "1TB" }, prices: [{ amount: 4950000, currency_code: "mnt" }] },
        { title: "Silver / 256GB", sku: "IP17P-SLV-256", options: { Color: "Silver", Storage: "256GB" }, prices: [{ amount: 3750000, currency_code: "mnt" }] },
        { title: "Silver / 512GB", sku: "IP17P-SLV-512", options: { Color: "Silver", Storage: "512GB" }, prices: [{ amount: 4250000, currency_code: "mnt" }] },
        { title: "Silver / 1TB", sku: "IP17P-SLV-1TB", options: { Color: "Silver", Storage: "1TB" }, prices: [{ amount: 4950000, currency_code: "mnt" }] },
      ],
      sales_channels: [{ id: defaultSalesChannel[0].id }],
    },

    // iPhone 17 Pro Max
    {
      title: "iPhone 17 Pro Max",
      category_ids: [categoryResult.find((cat) => cat.name === "iPhone")!.id],
      description: "The ultimate iPhone with the largest display and longest battery life.",
      handle: "iphone-17-pro-max",
      weight: 221,
      status: ProductStatus.PUBLISHED,
      options: [
        { title: "Color", values: ["Cosmic Orange", "Deep Blue", "Silver"] },
        { title: "Storage", values: ["256GB", "512GB", "1TB"] },
      ],
      variants: [
        { title: "Cosmic Orange / 256GB", sku: "IP17PM-ORG-256", options: { Color: "Cosmic Orange", Storage: "256GB" }, prices: [{ amount: 4250000, currency_code: "mnt" }] },
        { title: "Cosmic Orange / 512GB", sku: "IP17PM-ORG-512", options: { Color: "Cosmic Orange", Storage: "512GB" }, prices: [{ amount: 4750000, currency_code: "mnt" }] },
        { title: "Cosmic Orange / 1TB", sku: "IP17PM-ORG-1TB", options: { Color: "Cosmic Orange", Storage: "1TB" }, prices: [{ amount: 5450000, currency_code: "mnt" }] },
        { title: "Deep Blue / 256GB", sku: "IP17PM-BLU-256", options: { Color: "Deep Blue", Storage: "256GB" }, prices: [{ amount: 4250000, currency_code: "mnt" }] },
        { title: "Deep Blue / 512GB", sku: "IP17PM-BLU-512", options: { Color: "Deep Blue", Storage: "512GB" }, prices: [{ amount: 4750000, currency_code: "mnt" }] },
        { title: "Deep Blue / 1TB", sku: "IP17PM-BLU-1TB", options: { Color: "Deep Blue", Storage: "1TB" }, prices: [{ amount: 5450000, currency_code: "mnt" }] },
        { title: "Silver / 256GB", sku: "IP17PM-SLV-256", options: { Color: "Silver", Storage: "256GB" }, prices: [{ amount: 4250000, currency_code: "mnt" }] },
        { title: "Silver / 512GB", sku: "IP17PM-SLV-512", options: { Color: "Silver", Storage: "512GB" }, prices: [{ amount: 4750000, currency_code: "mnt" }] },
        { title: "Silver / 1TB", sku: "IP17PM-SLV-1TB", options: { Color: "Silver", Storage: "1TB" }, prices: [{ amount: 5450000, currency_code: "mnt" }] },
      ],
      sales_channels: [{ id: defaultSalesChannel[0].id }],
    },

    // iPhone 17
    {
      title: "iPhone 17",
      category_ids: [categoryResult.find((cat) => cat.name === "iPhone")!.id],
      description: "Even more delightful. Even more durable with Dual Fusion camera system.",
      handle: "iphone-17",
      weight: 170,
      status: ProductStatus.PUBLISHED,
      options: [
        { title: "Color", values: ["Lavender", "Sage", "Mist Blue", "White", "Black"] },
        { title: "Storage", values: ["128GB", "256GB", "512GB"] },
      ],
      variants: [
        { title: "Lavender / 128GB", sku: "IP17-LAV-128", options: { Color: "Lavender", Storage: "128GB" }, prices: [{ amount: 2720000, currency_code: "mnt" }] },
        { title: "Lavender / 256GB", sku: "IP17-LAV-256", options: { Color: "Lavender", Storage: "256GB" }, prices: [{ amount: 3000000, currency_code: "mnt" }] },
        { title: "Lavender / 512GB", sku: "IP17-LAV-512", options: { Color: "Lavender", Storage: "512GB" }, prices: [{ amount: 3400000, currency_code: "mnt" }] },
        { title: "Sage / 128GB", sku: "IP17-SAG-128", options: { Color: "Sage", Storage: "128GB" }, prices: [{ amount: 2720000, currency_code: "mnt" }] },
        { title: "Sage / 256GB", sku: "IP17-SAG-256", options: { Color: "Sage", Storage: "256GB" }, prices: [{ amount: 3000000, currency_code: "mnt" }] },
        { title: "Sage / 512GB", sku: "IP17-SAG-512", options: { Color: "Sage", Storage: "512GB" }, prices: [{ amount: 3400000, currency_code: "mnt" }] },
        { title: "Mist Blue / 128GB", sku: "IP17-MBLU-128", options: { Color: "Mist Blue", Storage: "128GB" }, prices: [{ amount: 2720000, currency_code: "mnt" }] },
        { title: "Mist Blue / 256GB", sku: "IP17-MBLU-256", options: { Color: "Mist Blue", Storage: "256GB" }, prices: [{ amount: 3000000, currency_code: "mnt" }] },
        { title: "Mist Blue / 512GB", sku: "IP17-MBLU-512", options: { Color: "Mist Blue", Storage: "512GB" }, prices: [{ amount: 3400000, currency_code: "mnt" }] },
        { title: "White / 128GB", sku: "IP17-WHT-128", options: { Color: "White", Storage: "128GB" }, prices: [{ amount: 2720000, currency_code: "mnt" }] },
        { title: "White / 256GB", sku: "IP17-WHT-256", options: { Color: "White", Storage: "256GB" }, prices: [{ amount: 3000000, currency_code: "mnt" }] },
        { title: "White / 512GB", sku: "IP17-WHT-512", options: { Color: "White", Storage: "512GB" }, prices: [{ amount: 3400000, currency_code: "mnt" }] },
        { title: "Black / 128GB", sku: "IP17-BLK-128", options: { Color: "Black", Storage: "128GB" }, prices: [{ amount: 2720000, currency_code: "mnt" }] },
        { title: "Black / 256GB", sku: "IP17-BLK-256", options: { Color: "Black", Storage: "256GB" }, prices: [{ amount: 3000000, currency_code: "mnt" }] },
        { title: "Black / 512GB", sku: "IP17-BLK-512", options: { Color: "Black", Storage: "512GB" }, prices: [{ amount: 3400000, currency_code: "mnt" }] },
      ],
      sales_channels: [{ id: defaultSalesChannel[0].id }],
    },

    // iPad Pro (13-inch)
    {
      title: "iPad Pro 13-inch",
      category_ids: [categoryResult.find((cat) => cat.name === "iPad")!.id],
      description: "The ultimate iPad experience with M5 chip and Ultra Retina XDR display.",
      handle: "ipad-pro-13",
      weight: 579,
      status: ProductStatus.PUBLISHED,
      options: [
        { title: "Color", values: ["Space Black", "Silver"] },
        { title: "Storage", values: ["256GB", "512GB", "1TB", "2TB"] },
        { title: "Connectivity", values: ["Wi-Fi", "Wi-Fi + Cellular"] },
      ],
      variants: [
        { title: "Space Black / 256GB / Wi-Fi", sku: "IPADP13-BLK-256-W", options: { Color: "Space Black", Storage: "256GB", Connectivity: "Wi-Fi" }, prices: [{ amount: 3400000, currency_code: "mnt" }] },
        { title: "Space Black / 512GB / Wi-Fi", sku: "IPADP13-BLK-512-W", options: { Color: "Space Black", Storage: "512GB", Connectivity: "Wi-Fi" }, prices: [{ amount: 3750000, currency_code: "mnt" }] },
        { title: "Space Black / 1TB / Wi-Fi", sku: "IPADP13-BLK-1TB-W", options: { Color: "Space Black", Storage: "1TB", Connectivity: "Wi-Fi" }, prices: [{ amount: 4450000, currency_code: "mnt" }] },
        { title: "Silver / 256GB / Wi-Fi", sku: "IPADP13-SLV-256-W", options: { Color: "Silver", Storage: "256GB", Connectivity: "Wi-Fi" }, prices: [{ amount: 3400000, currency_code: "mnt" }] },
        { title: "Silver / 512GB / Wi-Fi", sku: "IPADP13-SLV-512-W", options: { Color: "Silver", Storage: "512GB", Connectivity: "Wi-Fi" }, prices: [{ amount: 3750000, currency_code: "mnt" }] },
        { title: "Silver / 1TB / Wi-Fi", sku: "IPADP13-SLV-1TB-W", options: { Color: "Silver", Storage: "1TB", Connectivity: "Wi-Fi" }, prices: [{ amount: 4450000, currency_code: "mnt" }] },
      ],
      sales_channels: [{ id: defaultSalesChannel[0].id }],
    },

    // iPad Mini
    {
      title: "iPad mini",
      category_ids: [categoryResult.find((cat) => cat.name === "iPad")!.id],
      description: "The full iPad experience in an ultraportable 8.3-inch design.",
      handle: "ipad-mini",
      weight: 293,
      status: ProductStatus.PUBLISHED,
      options: [
        { title: "Color", values: ["Space Gray", "Blue", "Purple", "Starlight"] },
        { title: "Storage", values: ["128GB", "256GB"] },
        { title: "Connectivity", values: ["Wi-Fi", "Wi-Fi + Cellular"] },
      ],
      variants: [
        { title: "Space Gray / 128GB / Wi-Fi", sku: "IPADMINI-SG-128-W", options: { Color: "Space Gray", Storage: "128GB", Connectivity: "Wi-Fi" }, prices: [{ amount: 1700000, currency_code: "mnt" }] },
        { title: "Space Gray / 256GB / Wi-Fi", sku: "IPADMINI-SG-256-W", options: { Color: "Space Gray", Storage: "256GB", Connectivity: "Wi-Fi" }, prices: [{ amount: 2040000, currency_code: "mnt" }] },
        { title: "Blue / 128GB / Wi-Fi", sku: "IPADMINI-BLU-128-W", options: { Color: "Blue", Storage: "128GB", Connectivity: "Wi-Fi" }, prices: [{ amount: 1700000, currency_code: "mnt" }] },
        { title: "Purple / 128GB / Wi-Fi", sku: "IPADMINI-PUR-128-W", options: { Color: "Purple", Storage: "128GB", Connectivity: "Wi-Fi" }, prices: [{ amount: 1700000, currency_code: "mnt" }] },
        { title: "Starlight / 128GB / Wi-Fi", sku: "IPADMINI-STA-128-W", options: { Color: "Starlight", Storage: "128GB", Connectivity: "Wi-Fi" }, prices: [{ amount: 1700000, currency_code: "mnt" }] },
      ],
      sales_channels: [{ id: defaultSalesChannel[0].id }],
    },

    // iPad Air (11-inch)
    {
      title: "iPad Air 11-inch",
      category_ids: [categoryResult.find((cat) => cat.name === "iPad")!.id],
      description: "Serious performance in a thin and light 11-inch design with M4 chip.",
      handle: "ipad-air-11",
      weight: 462,
      status: ProductStatus.PUBLISHED,
      options: [
        { title: "Color", values: ["Space Gray", "Blue", "Purple", "Starlight"] },
        { title: "Storage", values: ["128GB", "256GB", "512GB"] },
        { title: "Connectivity", values: ["Wi-Fi", "Wi-Fi + Cellular"] },
      ],
      variants: [
        { title: "Space Gray / 128GB / Wi-Fi", sku: "IPADAIR11-SG-128-W", options: { Color: "Space Gray", Storage: "128GB", Connectivity: "Wi-Fi" }, prices: [{ amount: 2040000, currency_code: "mnt" }] },
        { title: "Space Gray / 256GB / Wi-Fi", sku: "IPADAIR11-SG-256-W", options: { Color: "Space Gray", Storage: "256GB", Connectivity: "Wi-Fi" }, prices: [{ amount: 2380000, currency_code: "mnt" }] },
        { title: "Blue / 128GB / Wi-Fi", sku: "IPADAIR11-BLU-128-W", options: { Color: "Blue", Storage: "128GB", Connectivity: "Wi-Fi" }, prices: [{ amount: 2040000, currency_code: "mnt" }] },
        { title: "Purple / 256GB / Wi-Fi", sku: "IPADAIR11-PUR-256-W", options: { Color: "Purple", Storage: "256GB", Connectivity: "Wi-Fi" }, prices: [{ amount: 2380000, currency_code: "mnt" }] },
        { title: "Starlight / 512GB / Wi-Fi", sku: "IPADAIR11-STA-512-W", options: { Color: "Starlight", Storage: "512GB", Connectivity: "Wi-Fi" }, prices: [{ amount: 2720000, currency_code: "mnt" }] },
      ],
      sales_channels: [{ id: defaultSalesChannel[0].id }],
    },

    // MacBook Air M4 13-inch
    {
      title: "MacBook Air M4 13-inch",
      category_ids: [categoryResult.find((cat) => cat.name === "MacBook")!.id],
      description: "Strikingly thin and fast with M4 chip. Available in Sky Blue, Silver, Starlight, and Midnight.",
      handle: "macbook-air-m4-13",
      weight: 1240,
      status: ProductStatus.PUBLISHED,
      options: [
        { title: "Color", values: ["Sky Blue", "Silver", "Starlight", "Midnight"] },
        { title: "Memory", values: ["16GB", "24GB"] },
        { title: "Storage", values: ["256GB", "512GB", "1TB"] },
      ],
      variants: [
        { title: "Sky Blue / 16GB / 256GB", sku: "MBA13-M4-BLU-16-256", options: { Color: "Sky Blue", Memory: "16GB", Storage: "256GB" }, prices: [{ amount: 3400000, currency_code: "mnt" }] },
        { title: "Sky Blue / 16GB / 512GB", sku: "MBA13-M4-BLU-16-512", options: { Color: "Sky Blue", Memory: "16GB", Storage: "512GB" }, prices: [{ amount: 3750000, currency_code: "mnt" }] },
        { title: "Silver / 16GB / 256GB", sku: "MBA13-M4-SLV-16-256", options: { Color: "Silver", Memory: "16GB", Storage: "256GB" }, prices: [{ amount: 3400000, currency_code: "mnt" }] },
        { title: "Silver / 24GB / 512GB", sku: "MBA13-M4-SLV-24-512", options: { Color: "Silver", Memory: "24GB", Storage: "512GB" }, prices: [{ amount: 4100000, currency_code: "mnt" }] },
        { title: "Starlight / 16GB / 512GB", sku: "MBA13-M4-STA-16-512", options: { Color: "Starlight", Memory: "16GB", Storage: "512GB" }, prices: [{ amount: 3750000, currency_code: "mnt" }] },
        { title: "Midnight / 16GB / 1TB", sku: "MBA13-M4-MID-16-1TB", options: { Color: "Midnight", Memory: "16GB", Storage: "1TB" }, prices: [{ amount: 4250000, currency_code: "mnt" }] },
      ],
      sales_channels: [{ id: defaultSalesChannel[0].id }],
    },

    // MacBook Pro M4 14-inch
    {
      title: "MacBook Pro M4 14-inch",
      category_ids: [categoryResult.find((cat) => cat.name === "MacBook")!.id],
      description: "The most advanced Mac laptop with M4 chip for demanding workflows.",
      handle: "macbook-pro-m4-14",
      weight: 1550,
      status: ProductStatus.PUBLISHED,
      options: [
        { title: "Color", values: ["Space Black", "Silver"] },
        { title: "Chip", values: ["M4", "M4 Pro", "M4 Max"] },
        { title: "Storage", values: ["512GB", "1TB", "2TB"] },
      ],
      variants: [
        { title: "Space Black / M4 / 512GB", sku: "MBP14-M4-BLK-512", options: { Color: "Space Black", Chip: "M4", Storage: "512GB" }, prices: [{ amount: 5440000, currency_code: "mnt" }] },
        { title: "Silver / M4 / 512GB", sku: "MBP14-M4-SLV-512", options: { Color: "Silver", Chip: "M4", Storage: "512GB" }, prices: [{ amount: 5440000, currency_code: "mnt" }] },
        { title: "Space Black / M4 Pro / 1TB", sku: "MBP14-M4P-BLK-1TB", options: { Color: "Space Black", Chip: "M4 Pro", Storage: "1TB" }, prices: [{ amount: 6800000, currency_code: "mnt" }] },
        { title: "Silver / M4 Max / 2TB", sku: "MBP14-M4MAX-SLV-2TB", options: { Color: "Silver", Chip: "M4 Max", Storage: "2TB" }, prices: [{ amount: 9180000, currency_code: "mnt" }] },
      ],
      sales_channels: [{ id: defaultSalesChannel[0].id }],
    },

    // MacBook Pro M5 14-inch
    {
      title: "MacBook Pro M5 14-inch",
      category_ids: [categoryResult.find((cat) => cat.name === "MacBook")!.id],
      description: "Next-generation speed with the new M5 chip. Perfect for college students and business users.",
      handle: "macbook-pro-m5-14",
      weight: 1550,
      status: ProductStatus.PUBLISHED,
      options: [
        { title: "Color", values: ["Space Black", "Silver"] },
        { title: "Storage", values: ["512GB", "1TB", "2TB"] },
      ],
      variants: [
        { title: "Space Black / 512GB", sku: "MBP14-M5-BLK-512", options: { Color: "Space Black", Storage: "512GB" }, prices: [{ amount: 5780000, currency_code: "mnt" }] },
        { title: "Silver / 512GB", sku: "MBP14-M5-SLV-512", options: { Color: "Silver", Storage: "512GB" }, prices: [{ amount: 5780000, currency_code: "mnt" }] },
        { title: "Space Black / 1TB", sku: "MBP14-M5-BLK-1TB", options: { Color: "Space Black", Storage: "1TB" }, prices: [{ amount: 6460000, currency_code: "mnt" }] },
        { title: "Silver / 2TB", sku: "MBP14-M5-SLV-2TB", options: { Color: "Silver", Storage: "2TB" }, prices: [{ amount: 7820000, currency_code: "mnt" }] },
      ],
      sales_channels: [{ id: defaultSalesChannel[0].id }],
    },

    // Apple Watch Series 11
    {
      title: "Apple Watch Series 11",
      category_ids: [categoryResult.find((cat) => cat.name === "Apple Watch")!.id],
      description: "The ultimate way to watch your health with hypertension notifications and sleep score.",
      handle: "apple-watch-series-11",
      weight: 32,
      status: ProductStatus.PUBLISHED,
      options: [
        { title: "Material", values: ["Aluminum", "Titanium"] },
        { title: "Color", values: ["Space Gray", "Silver", "Rose Gold", "Jet Black", "Natural", "Gold", "Slate"] },
        { title: "Size", values: ["42mm", "46mm"] },
      ],
      variants: [
        { title: "Space Gray Aluminum / 42mm", sku: "AW11-ALU-SG-42", options: { Material: "Aluminum", Color: "Space Gray", Size: "42mm" }, prices: [{ amount: 1360000, currency_code: "mnt" }] },
        { title: "Silver Aluminum / 42mm", sku: "AW11-ALU-SLV-42", options: { Material: "Aluminum", Color: "Silver", Size: "42mm" }, prices: [{ amount: 1360000, currency_code: "mnt" }] },
        { title: "Rose Gold Aluminum / 42mm", sku: "AW11-ALU-RG-42", options: { Material: "Aluminum", Color: "Rose Gold", Size: "42mm" }, prices: [{ amount: 1360000, currency_code: "mnt" }] },
        { title: "Jet Black Aluminum / 42mm", sku: "AW11-ALU-JB-42", options: { Material: "Aluminum", Color: "Jet Black", Size: "42mm" }, prices: [{ amount: 1360000, currency_code: "mnt" }] },
        { title: "Natural Titanium / 46mm", sku: "AW11-TI-NAT-46", options: { Material: "Titanium", Color: "Natural", Size: "46mm" }, prices: [{ amount: 2380000, currency_code: "mnt" }] },
        { title: "Gold Titanium / 46mm", sku: "AW11-TI-GLD-46", options: { Material: "Titanium", Color: "Gold", Size: "46mm" }, prices: [{ amount: 2380000, currency_code: "mnt" }] },
        { title: "Slate Titanium / 46mm", sku: "AW11-TI-SLA-46", options: { Material: "Titanium", Color: "Slate", Size: "46mm" }, prices: [{ amount: 2380000, currency_code: "mnt" }] },
      ],
      sales_channels: [{ id: defaultSalesChannel[0].id }],
    },

    // PlayStation 5 Slim
    {
      title: "PlayStation 5 Slim",
      category_ids: [categoryResult.find((cat) => cat.name === "Gaming")!.id],
      description: "The latest PlayStation 5 console in a sleeker, more compact design.",
      handle: "playstation-5-slim",
      weight: 3200,
      status: ProductStatus.PUBLISHED,
      options: [
        { title: "Version", values: ["Digital Edition", "Disc Edition"] },
        { title: "Storage", values: ["1TB"] },
      ],
      variants: [
        { title: "Digital Edition / 1TB", sku: "PS5-SLIM-DIG-1TB", options: { Version: "Digital Edition", Storage: "1TB" }, prices: [{ amount: 1700000, currency_code: "mnt" }] },
        { title: "Disc Edition / 1TB", sku: "PS5-SLIM-DISC-1TB", options: { Version: "Disc Edition", Storage: "1TB" }, prices: [{ amount: 1870000, currency_code: "mnt" }] },
      ],
      sales_channels: [{ id: defaultSalesChannel[0].id }],
    },

    // Nintendo Switch OLED
    {
      title: "Nintendo Switch OLED Model",
      category_ids: [categoryResult.find((cat) => cat.name === "Gaming")!.id],
      description: "Enhanced model with vibrant 7-inch OLED screen, wider adjustable stand, and improved audio.",
      handle: "nintendo-switch-oled",
      weight: 420,
      status: ProductStatus.PUBLISHED,
      options: [
        { title: "Color", values: ["White", "Neon Blue/Neon Red"] },
      ],
      variants: [
        { title: "White", sku: "NSW-OLED-WHT", options: { Color: "White" }, prices: [{ amount: 1190000, currency_code: "mnt" }] },
        { title: "Neon Blue/Neon Red", sku: "NSW-OLED-NEON", options: { Color: "Neon Blue/Neon Red" }, prices: [{ amount: 1190000, currency_code: "mnt" }] },
      ],
      sales_channels: [{ id: defaultSalesChannel[0].id }],
    },

    // Nintendo Switch
    {
      title: "Nintendo Switch",
      category_ids: [categoryResult.find((cat) => cat.name === "Gaming")!.id],
      description: "Play at home or on the go with the versatile Nintendo Switch gaming console.",
      handle: "nintendo-switch",
      weight: 398,
      status: ProductStatus.PUBLISHED,
      options: [
        { title: "Color", values: ["Neon Blue/Neon Red", "Gray"] },
      ],
      variants: [
        { title: "Neon Blue/Neon Red", sku: "NSW-NEON", options: { Color: "Neon Blue/Neon Red" }, prices: [{ amount: 1020000, currency_code: "mnt" }] },
        { title: "Gray", sku: "NSW-GRAY", options: { Color: "Gray" }, prices: [{ amount: 1020000, currency_code: "mnt" }] },
      ],
      sales_channels: [{ id: defaultSalesChannel[0].id }],
    },

    // PopMart Collectibles - Labubu Series
    {
      title: "PopMart Labubu The Monsters Series",
      category_ids: [categoryResult.find((cat) => cat.name === "Collectibles")!.id],
      description: "Blind box collectible figure from PopMart's popular Labubu series.",
      handle: "popmart-labubu-monsters",
      weight: 100,
      status: ProductStatus.PUBLISHED,
      options: [{ title: "Type", values: ["Blind Box"] }],
      variants: [
        { title: "Blind Box", sku: "PM-LABUBU-MONS", options: { Type: "Blind Box" }, prices: [{ amount: 45000, currency_code: "mnt" }] },
      ],
      sales_channels: [{ id: defaultSalesChannel[0].id }],
    },

    // PopMart Collectibles - Crybaby Series
    {
      title: "PopMart Crybaby Series",
      category_ids: [categoryResult.find((cat) => cat.name === "Collectibles")!.id],
      description: "Collectible designer toy blind box featuring adorable crying babies.",
      handle: "popmart-crybaby",
      weight: 95,
      status: ProductStatus.PUBLISHED,
      options: [{ title: "Type", values: ["Blind Box"] }],
      variants: [
        { title: "Blind Box", sku: "PM-CRYBABY", options: { Type: "Blind Box" }, prices: [{ amount: 45000, currency_code: "mnt" }] },
      ],
      sales_channels: [{ id: defaultSalesChannel[0].id }],
    },

    // AirTag
    {
      title: "AirTag",
      category_ids: [categoryResult.find((cat) => cat.name === "Accessories")!.id],
      description: "Keep track of your items with this easy-to-use tracking device.",
      handle: "airtag",
      weight: 11,
      status: ProductStatus.PUBLISHED,
      options: [
        { title: "Quantity", values: ["1 Pack", "4 Pack"] },
      ],
      variants: [
        { title: "1 Pack", sku: "AIRTAG-1", options: { Quantity: "1 Pack" }, prices: [{ amount: 100000, currency_code: "mnt" }] },
        { title: "4 Pack", sku: "AIRTAG-4", options: { Quantity: "4 Pack" }, prices: [{ amount: 340000, currency_code: "mnt" }] },
      ],
      sales_channels: [{ id: defaultSalesChannel[0].id }],
    },

    // Apple Pencil Pro
    {
      title: "Apple Pencil Pro",
      category_ids: [categoryResult.find((cat) => cat.name === "Accessories")!.id],
      description: "The most advanced Apple Pencil with squeeze, barrel roll, and haptic feedback.",
      handle: "apple-pencil-pro",
      weight: 20,
      status: ProductStatus.PUBLISHED,
      options: [{ title: "Color", values: ["White"] }],
      variants: [
        { title: "White", sku: "PENCIL-PRO", options: { Color: "White" }, prices: [{ amount: 440000, currency_code: "mnt" }] },
      ],
      sales_channels: [{ id: defaultSalesChannel[0].id }],
    },

    // Magic Mouse USB-C
    {
      title: "Magic Mouse USB-C",
      category_ids: [categoryResult.find((cat) => cat.name === "Accessories")!.id],
      description: "Wireless, rechargeable mouse with Multi-Touch surface and USB-C port.",
      handle: "magic-mouse-usbc",
      weight: 99,
      status: ProductStatus.PUBLISHED,
      options: [
        { title: "Color", values: ["White", "Black"] },
      ],
      variants: [
        { title: "White", sku: "MMOUSE-USBC-WHT", options: { Color: "White" }, prices: [{ amount: 270000, currency_code: "mnt" }] },
        { title: "Black", sku: "MMOUSE-USBC-BLK", options: { Color: "Black" }, prices: [{ amount: 340000, currency_code: "mnt" }] },
      ],
      sales_channels: [{ id: defaultSalesChannel[0].id }],
    },

    // HomePod (2nd generation)
    {
      title: "HomePod (2nd generation)",
      category_ids: [categoryResult.find((cat) => cat.name === "Accessories")!.id],
      description: "Immersive, high-fidelity audio with spatial awareness and seamless Apple ecosystem integration.",
      handle: "homepod-2nd-gen",
      weight: 2300,
      status: ProductStatus.PUBLISHED,
      options: [
        { title: "Color", values: ["White", "Midnight"] },
      ],
      variants: [
        { title: "White", sku: "HOMEPOD-2-WHT", options: { Color: "White" }, prices: [{ amount: 1020000, currency_code: "mnt" }] },
        { title: "Midnight", sku: "HOMEPOD-2-MID", options: { Color: "Midnight" }, prices: [{ amount: 1020000, currency_code: "mnt" }] },
      ],
      sales_channels: [{ id: defaultSalesChannel[0].id }],
    },
  ];

  logger.info(`Creating ${products.length} products...`);
  
  // Create products in batches to avoid overwhelming the system
  const batchSize = 5;
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    logger.info(`Creating products ${i + 1}-${Math.min(i + batchSize, products.length)}...`);
    
    await createProductsWorkflow(container).run({
      input: {
        products: batch,
      },
    });
  }

  logger.info("✅ All real products seeded successfully!");
  logger.info("Note: Product images will need to be uploaded separately.");
}
