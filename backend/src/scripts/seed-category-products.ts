import { CreateInventoryLevelInput, ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createInventoryLevelsWorkflow,
  createProductsWorkflow,
} from "@medusajs/core-flows";

interface ProductVariant {
  title: string;
  sku: string;
  options: Record<string, string>;
  prices: { amount: number; currency_code: string }[];
}

interface ProductData {
  title: string;
  category_name: string;
  description: string;
  handle: string;
  weight: number;
  images: { url: string }[];
  options: { title: string; values: string[] }[];
  variants: ProductVariant[];
}

export default async function seedCategoryProducts({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const productModuleService = container.resolve(Modules.PRODUCT);
  const inventoryModuleService = container.resolve(Modules.INVENTORY);
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);
  const stockLocationModuleService = container.resolve(Modules.STOCK_LOCATION);
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);

  logger.info("Starting category products seeding...");

  // Get default sales channel
  const defaultSalesChannel = await salesChannelModuleService.listSalesChannels({
    name: "Default Sales Channel",
  });
  if (!defaultSalesChannel.length) {
    throw new Error("Default Sales Channel not found. Please run seed script first.");
  }

  // Get shipping profile
  const shippingProfiles = await fulfillmentModuleService.listShippingProfiles({
    type: "default",
  });
  if (!shippingProfiles.length) {
    throw new Error("Shipping profile not found. Please run seed script first.");
  }

  // Get stock location
  const stockLocations = await stockLocationModuleService.listStockLocations({
    name: "Улаанбаатар агуулах",
  });
  if (!stockLocations.length) {
    throw new Error("Stock location not found. Please run seed script first.");
  }

  const salesChannelId = defaultSalesChannel[0].id;
  const shippingProfileId = shippingProfiles[0].id;
  const stockLocationId = stockLocations[0].id;

  // Get all categories
  const categories = await productModuleService.listProductCategories(
    {},
    { take: 1000, select: ["id", "name", "handle"] }
  );

  const categoryMap = new Map(categories.map((c) => [c.name, c.id]));

  logger.info(`Found ${categories.length} categories`);

  // Define products for each category
  const categoryProducts: ProductData[] = [
    // ========== iPhone Products ==========
    {
      title: "iPhone 16 Pro Max",
      category_name: "iPhone",
      description: "Хамгийн том дэлгэц, хамгийн урт батарей. A18 Pro чип.",
      handle: "iphone-16-pro-max",
      weight: 227,
      images: [{ url: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-pro-finish-select-202409-6-7inch-deserttitanium?wid=5120&hei=2880&fmt=webp&qlt=70&.v=1725567099145" }],
      options: [
        { title: "Color", values: ["Desert Titanium", "Natural Titanium", "Black Titanium", "White Titanium"] },
        { title: "Storage", values: ["256GB", "512GB", "1TB"] },
      ],
      variants: [
        { title: "Desert Titanium / 256GB", sku: "IP16PM-DT-256", options: { Color: "Desert Titanium", Storage: "256GB" }, prices: [{ amount: 4500000, currency_code: "mnt" }] },
        { title: "Natural Titanium / 512GB", sku: "IP16PM-NT-512", options: { Color: "Natural Titanium", Storage: "512GB" }, prices: [{ amount: 5200000, currency_code: "mnt" }] },
        { title: "Black Titanium / 1TB", sku: "IP16PM-BT-1TB", options: { Color: "Black Titanium", Storage: "1TB" }, prices: [{ amount: 6200000, currency_code: "mnt" }] },
      ],
    },
    {
      title: "iPhone 16",
      category_name: "iPhone",
      description: "Шинэ A18 чип, Camera Control товч. Apple Intelligence.",
      handle: "iphone-16",
      weight: 170,
      images: [{ url: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-finish-select-202409-6-1inch-ultramarine?wid=5120&hei=2880&fmt=webp&qlt=70&.v=1723168182061" }],
      options: [
        { title: "Color", values: ["Ultramarine", "Teal", "Pink", "White", "Black"] },
        { title: "Storage", values: ["128GB", "256GB", "512GB"] },
      ],
      variants: [
        { title: "Ultramarine / 128GB", sku: "IP16-UM-128", options: { Color: "Ultramarine", Storage: "128GB" }, prices: [{ amount: 2900000, currency_code: "mnt" }] },
        { title: "Teal / 256GB", sku: "IP16-TL-256", options: { Color: "Teal", Storage: "256GB" }, prices: [{ amount: 3300000, currency_code: "mnt" }] },
        { title: "Pink / 512GB", sku: "IP16-PK-512", options: { Color: "Pink", Storage: "512GB" }, prices: [{ amount: 3900000, currency_code: "mnt" }] },
      ],
    },
    {
      title: "iPhone 16 Plus",
      category_name: "iPhone",
      description: "Том дэлгэц, урт батарей. A18 чип.",
      handle: "iphone-16-plus",
      weight: 199,
      images: [{ url: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-plus-finish-select-202409-6-7inch-ultramarine?wid=5120&hei=2880&fmt=webp&qlt=70&.v=1723168182064" }],
      options: [
        { title: "Color", values: ["Ultramarine", "Teal", "Pink", "White", "Black"] },
        { title: "Storage", values: ["128GB", "256GB", "512GB"] },
      ],
      variants: [
        { title: "Ultramarine / 128GB", sku: "IP16P-UM-128", options: { Color: "Ultramarine", Storage: "128GB" }, prices: [{ amount: 3300000, currency_code: "mnt" }] },
        { title: "Black / 256GB", sku: "IP16P-BK-256", options: { Color: "Black", Storage: "256GB" }, prices: [{ amount: 3700000, currency_code: "mnt" }] },
      ],
    },
    {
      title: "iPhone SE (4th Gen)",
      category_name: "iPhone",
      description: "Apple-ийн хамгийн хямд iPhone. A15 Bionic чип.",
      handle: "iphone-se-4",
      weight: 144,
      images: [{ url: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-se-finish-select-202203-midnight?wid=5120&hei=2880&fmt=webp&qlt=70&.v=1645554218211" }],
      options: [
        { title: "Color", values: ["Midnight", "Starlight", "Red"] },
        { title: "Storage", values: ["64GB", "128GB", "256GB"] },
      ],
      variants: [
        { title: "Midnight / 64GB", sku: "IPSE4-MN-64", options: { Color: "Midnight", Storage: "64GB" }, prices: [{ amount: 1500000, currency_code: "mnt" }] },
        { title: "Starlight / 128GB", sku: "IPSE4-SL-128", options: { Color: "Starlight", Storage: "128GB" }, prices: [{ amount: 1700000, currency_code: "mnt" }] },
      ],
    },

    // ========== MacBook Products ==========
    {
      title: "MacBook Air 13 M3",
      category_name: "Macbook Air",
      description: "M3 чип, 18 цагийн батарей, хөнгөн, тунгалаг дэлгэц.",
      handle: "macbook-air-13-m3",
      weight: 1240,
      images: [{ url: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mba13-midnight-select-202402?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1708367688034" }],
      options: [
        { title: "Color", values: ["Midnight", "Starlight", "Space Gray", "Silver"] },
        { title: "Memory", values: ["8GB", "16GB", "24GB"] },
      ],
      variants: [
        { title: "Midnight / 8GB", sku: "MBA13M3-MN-8", options: { Color: "Midnight", Memory: "8GB" }, prices: [{ amount: 4200000, currency_code: "mnt" }] },
        { title: "Starlight / 16GB", sku: "MBA13M3-SL-16", options: { Color: "Starlight", Memory: "16GB" }, prices: [{ amount: 4800000, currency_code: "mnt" }] },
        { title: "Space Gray / 24GB", sku: "MBA13M3-SG-24", options: { Color: "Space Gray", Memory: "24GB" }, prices: [{ amount: 5500000, currency_code: "mnt" }] },
      ],
    },
    {
      title: "MacBook Air 15 M3",
      category_name: "Macbook Air",
      description: "Том 15 инчийн дэлгэцтэй MacBook Air. M3 чип.",
      handle: "macbook-air-15-m3",
      weight: 1510,
      images: [{ url: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mba15-midnight-select-202306?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1684518479433" }],
      options: [
        { title: "Color", values: ["Midnight", "Starlight", "Space Gray", "Silver"] },
        { title: "Memory", values: ["8GB", "16GB", "24GB"] },
      ],
      variants: [
        { title: "Midnight / 8GB", sku: "MBA15M3-MN-8", options: { Color: "Midnight", Memory: "8GB" }, prices: [{ amount: 4800000, currency_code: "mnt" }] },
        { title: "Silver / 16GB", sku: "MBA15M3-SL-16", options: { Color: "Silver", Memory: "16GB" }, prices: [{ amount: 5400000, currency_code: "mnt" }] },
      ],
    },
    {
      title: "MacBook Pro 16 M3 Max",
      category_name: "Macbook Pro",
      description: "Хамгийн хүчирхэг MacBook. M3 Max чип, 40 цөмт GPU.",
      handle: "macbook-pro-16-m3-max",
      weight: 2140,
      images: [{ url: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp16-spacegray-select-202310?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1697311054290" }],
      options: [
        { title: "Color", values: ["Space Black", "Silver"] },
        { title: "Memory", values: ["36GB", "48GB", "128GB"] },
      ],
      variants: [
        { title: "Space Black / 36GB", sku: "MBP16M3X-SB-36", options: { Color: "Space Black", Memory: "36GB" }, prices: [{ amount: 12000000, currency_code: "mnt" }] },
        { title: "Silver / 48GB", sku: "MBP16M3X-SL-48", options: { Color: "Silver", Memory: "48GB" }, prices: [{ amount: 14000000, currency_code: "mnt" }] },
      ],
    },

    // ========== iPad Products ==========
    {
      title: "iPad mini (7th Gen)",
      category_name: "iPad Mini",
      description: "A17 Pro чип, 8.3 инч дэлгэц. Apple Pencil Pro дэмждэг.",
      handle: "ipad-mini-7",
      weight: 293,
      images: [{ url: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipad-mini-select-wifi-purple-202109?wid=940&hei=1112&fmt=png-alpha&.v=1629840743000" }],
      options: [
        { title: "Color", values: ["Space Gray", "Pink", "Purple", "Starlight"] },
        { title: "Storage", values: ["64GB", "256GB"] },
      ],
      variants: [
        { title: "Purple / 64GB", sku: "IPMINI7-PR-64", options: { Color: "Purple", Storage: "64GB" }, prices: [{ amount: 1800000, currency_code: "mnt" }] },
        { title: "Starlight / 256GB", sku: "IPMINI7-SL-256", options: { Color: "Starlight", Storage: "256GB" }, prices: [{ amount: 2200000, currency_code: "mnt" }] },
      ],
    },
    {
      title: "iPad (10th Gen)",
      category_name: "iPad",
      description: "A14 Bionic чип, 10.9 инч дэлгэц. Шинэ загвар.",
      handle: "ipad-10",
      weight: 477,
      images: [{ url: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipad-10th-gen-finish-select-202212-blue-wifi?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1670856173977" }],
      options: [
        { title: "Color", values: ["Blue", "Pink", "Yellow", "Silver"] },
        { title: "Storage", values: ["64GB", "256GB"] },
      ],
      variants: [
        { title: "Blue / 64GB", sku: "IPAD10-BL-64", options: { Color: "Blue", Storage: "64GB" }, prices: [{ amount: 1500000, currency_code: "mnt" }] },
        { title: "Yellow / 256GB", sku: "IPAD10-YL-256", options: { Color: "Yellow", Storage: "256GB" }, prices: [{ amount: 1900000, currency_code: "mnt" }] },
      ],
    },
    {
      title: "iPad Pro 11-inch (M4)",
      category_name: "iPad Pro",
      description: "M4 чип, Ultra Retina XDR дэлгэц. Хамгийн нимгэн Apple төхөөрөмж.",
      handle: "ipad-pro-11-m4",
      weight: 444,
      images: [{ url: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipad-pro-model-select-gallery-1-202405?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1713935642054" }],
      options: [
        { title: "Color", values: ["Space Black", "Silver"] },
        { title: "Storage", values: ["256GB", "512GB", "1TB", "2TB"] },
      ],
      variants: [
        { title: "Space Black / 256GB", sku: "IPP11M4-SB-256", options: { Color: "Space Black", Storage: "256GB" }, prices: [{ amount: 3500000, currency_code: "mnt" }] },
        { title: "Silver / 512GB", sku: "IPP11M4-SL-512", options: { Color: "Silver", Storage: "512GB" }, prices: [{ amount: 4100000, currency_code: "mnt" }] },
        { title: "Space Black / 1TB", sku: "IPP11M4-SB-1TB", options: { Color: "Space Black", Storage: "1TB" }, prices: [{ amount: 5200000, currency_code: "mnt" }] },
      ],
    },

    // ========== Airpods Products ==========
    {
      title: "AirPods 4",
      category_name: "Airpods 4",
      description: "Шинэ загвар, H2 чип. Personalized Spatial Audio.",
      handle: "airpods-4",
      weight: 40,
      images: [{ url: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/airpods-4-hero-select-202409?wid=976&hei=916&fmt=jpeg&qlt=90&.v=1725503077025" }],
      options: [{ title: "Model", values: ["Standard", "Active Noise Cancellation"] }],
      variants: [
        { title: "Standard", sku: "AP4-STD", options: { Model: "Standard" }, prices: [{ amount: 450000, currency_code: "mnt" }] },
        { title: "Active Noise Cancellation", sku: "AP4-ANC", options: { Model: "Active Noise Cancellation" }, prices: [{ amount: 600000, currency_code: "mnt" }] },
      ],
    },
    {
      title: "AirPods Max",
      category_name: "Airpods",
      description: "Over-ear headphones. H1 чип, Active Noise Cancellation.",
      handle: "airpods-max",
      weight: 384,
      images: [{ url: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/airpods-max-hero-select-202409-midnight?wid=976&hei=916&fmt=jpeg&qlt=90&.v=1724927451041" }],
      options: [{ title: "Color", values: ["Midnight", "Starlight", "Blue", "Purple", "Orange"] }],
      variants: [
        { title: "Midnight", sku: "APM-MN", options: { Color: "Midnight" }, prices: [{ amount: 1800000, currency_code: "mnt" }] },
        { title: "Blue", sku: "APM-BL", options: { Color: "Blue" }, prices: [{ amount: 1800000, currency_code: "mnt" }] },
        { title: "Orange", sku: "APM-OR", options: { Color: "Orange" }, prices: [{ amount: 1800000, currency_code: "mnt" }] },
      ],
    },

    // ========== Apple Watch Products ==========
    {
      title: "Apple Watch Ultra 2",
      category_name: "Apple Watch",
      description: "Хамгийн бат бөх Apple Watch. Titanium, 100m ус нэвтэрдэггүй.",
      handle: "apple-watch-ultra-2",
      weight: 61,
      images: [{ url: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/watch-ultra-2-702702-702702-702702-702702?wid=1200&hei=630&fmt=jpeg&qlt=95&.v=1694220413534" }],
      options: [
        { title: "Band", values: ["Alpine Loop", "Trail Loop", "Ocean Band"] },
        { title: "Band Color", values: ["Orange", "Blue", "Green", "Black"] },
      ],
      variants: [
        { title: "Alpine Loop / Orange", sku: "AWU2-AL-OR", options: { Band: "Alpine Loop", "Band Color": "Orange" }, prices: [{ amount: 2800000, currency_code: "mnt" }] },
        { title: "Trail Loop / Blue", sku: "AWU2-TL-BL", options: { Band: "Trail Loop", "Band Color": "Blue" }, prices: [{ amount: 2800000, currency_code: "mnt" }] },
        { title: "Ocean Band / Black", sku: "AWU2-OB-BK", options: { Band: "Ocean Band", "Band Color": "Black" }, prices: [{ amount: 2800000, currency_code: "mnt" }] },
      ],
    },
    {
      title: "Apple Watch Series 10",
      category_name: "Apple Watch",
      description: "Хамгийн нимгэн Apple Watch. S10 чип, том дэлгэц.",
      handle: "apple-watch-s10",
      weight: 30,
      images: [{ url: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/watch-s10-702702-702702-702702-702702?wid=1200&hei=630&fmt=jpeg&qlt=95&.v=1724186679508" }],
      options: [
        { title: "Size", values: ["42mm", "46mm"] },
        { title: "Material", values: ["Aluminum", "Titanium"] },
      ],
      variants: [
        { title: "42mm / Aluminum", sku: "AWS10-42-AL", options: { Size: "42mm", Material: "Aluminum" }, prices: [{ amount: 1400000, currency_code: "mnt" }] },
        { title: "46mm / Aluminum", sku: "AWS10-46-AL", options: { Size: "46mm", Material: "Aluminum" }, prices: [{ amount: 1500000, currency_code: "mnt" }] },
        { title: "46mm / Titanium", sku: "AWS10-46-TI", options: { Size: "46mm", Material: "Titanium" }, prices: [{ amount: 2200000, currency_code: "mnt" }] },
      ],
    },
    {
      title: "Apple Watch SE (2nd Gen)",
      category_name: "Apple Watch",
      description: "Хамгийн хямд Apple Watch. Бүх үндсэн боломжууд.",
      handle: "apple-watch-se-2",
      weight: 26,
      images: [{ url: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/watch-se-702702-702702-702702-702702?wid=1200&hei=630&fmt=jpeg&qlt=95&.v=1661373873667" }],
      options: [
        { title: "Size", values: ["40mm", "44mm"] },
        { title: "Color", values: ["Midnight", "Starlight", "Silver"] },
      ],
      variants: [
        { title: "40mm / Midnight", sku: "AWSE2-40-MN", options: { Size: "40mm", Color: "Midnight" }, prices: [{ amount: 850000, currency_code: "mnt" }] },
        { title: "44mm / Starlight", sku: "AWSE2-44-SL", options: { Size: "44mm", Color: "Starlight" }, prices: [{ amount: 950000, currency_code: "mnt" }] },
      ],
    },

    // ========== iMac Products ==========
    {
      title: "iMac 24-inch M3",
      category_name: "Mac",
      description: "M3 чип, 4.5K Retina дэлгэц. 7 өнгө.",
      handle: "imac-24-m3",
      weight: 4430,
      images: [{ url: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/imac-24-orange-selection-hero-202310?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1697298665596" }],
      options: [
        { title: "Color", values: ["Blue", "Green", "Pink", "Silver", "Yellow", "Orange", "Purple"] },
        { title: "GPU", values: ["8-core", "10-core"] },
      ],
      variants: [
        { title: "Blue / 8-core", sku: "IMAC24M3-BL-8", options: { Color: "Blue", GPU: "8-core" }, prices: [{ amount: 4600000, currency_code: "mnt" }] },
        { title: "Orange / 10-core", sku: "IMAC24M3-OR-10", options: { Color: "Orange", GPU: "10-core" }, prices: [{ amount: 5300000, currency_code: "mnt" }] },
        { title: "Purple / 10-core", sku: "IMAC24M3-PR-10", options: { Color: "Purple", GPU: "10-core" }, prices: [{ amount: 5300000, currency_code: "mnt" }] },
      ],
    },
    {
      title: "Mac Studio M2 Ultra",
      category_name: "Mac",
      description: "Хамгийн хүчирхэг Mac desktop. M2 Ultra чип.",
      handle: "mac-studio-m2-ultra",
      weight: 3600,
      images: [{ url: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mac-studio-select-202306?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1684260470461" }],
      options: [
        { title: "Chip", values: ["M2 Max", "M2 Ultra"] },
        { title: "Memory", values: ["32GB", "64GB", "128GB", "192GB"] },
      ],
      variants: [
        { title: "M2 Max / 32GB", sku: "MSTUDIO-M2X-32", options: { Chip: "M2 Max", Memory: "32GB" }, prices: [{ amount: 6500000, currency_code: "mnt" }] },
        { title: "M2 Ultra / 64GB", sku: "MSTUDIO-M2U-64", options: { Chip: "M2 Ultra", Memory: "64GB" }, prices: [{ amount: 13000000, currency_code: "mnt" }] },
        { title: "M2 Ultra / 192GB", sku: "MSTUDIO-M2U-192", options: { Chip: "M2 Ultra", Memory: "192GB" }, prices: [{ amount: 23000000, currency_code: "mnt" }] },
      ],
    },

    // ========== Accessories Products ==========
    {
      title: "Magic Keyboard with Touch ID",
      category_name: "Accessories",
      description: "Touch ID sensor, wireless, rechargeable.",
      handle: "magic-keyboard-touch-id",
      weight: 239,
      images: [{ url: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MMMR3?wid=1144&hei=1144&fmt=jpeg&qlt=90&.v=1683147633405" }],
      options: [
        { title: "Type", values: ["Standard", "with Numeric Keypad"] },
        { title: "Color", values: ["White", "Black"] },
      ],
      variants: [
        { title: "Standard / White", sku: "MK-TID-STD-W", options: { Type: "Standard", Color: "White" }, prices: [{ amount: 500000, currency_code: "mnt" }] },
        { title: "Standard / Black", sku: "MK-TID-STD-B", options: { Type: "Standard", Color: "Black" }, prices: [{ amount: 550000, currency_code: "mnt" }] },
        { title: "with Numeric Keypad / White", sku: "MK-TID-NUM-W", options: { Type: "with Numeric Keypad", Color: "White" }, prices: [{ amount: 600000, currency_code: "mnt" }] },
      ],
    },
    {
      title: "Magic Trackpad",
      category_name: "Accessories",
      description: "Force Touch, Multi-Touch gestures, wireless.",
      handle: "magic-trackpad",
      weight: 230,
      images: [{ url: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MMMP3?wid=1144&hei=1144&fmt=jpeg&qlt=90&.v=1645138309648" }],
      options: [{ title: "Color", values: ["White", "Black"] }],
      variants: [
        { title: "White", sku: "MT-WHT", options: { Color: "White" }, prices: [{ amount: 400000, currency_code: "mnt" }] },
        { title: "Black", sku: "MT-BLK", options: { Color: "Black" }, prices: [{ amount: 450000, currency_code: "mnt" }] },
      ],
    },
    {
      title: "Apple Pencil Pro",
      category_name: "Accessories",
      description: "Squeeze gesture, barrel roll, haptic feedback.",
      handle: "apple-pencil-pro",
      weight: 21,
      images: [{ url: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MX2D3?wid=1144&hei=1144&fmt=jpeg&qlt=90&.v=1713841707335" }],
      options: [{ title: "Model", values: ["Apple Pencil Pro"] }],
      variants: [
        { title: "Apple Pencil Pro", sku: "AP-PRO", options: { Model: "Apple Pencil Pro" }, prices: [{ amount: 450000, currency_code: "mnt" }] },
      ],
    },
    {
      title: "MagSafe Charger",
      category_name: "Accessories",
      description: "15W wireless charging for iPhone.",
      handle: "magsafe-charger",
      weight: 56,
      images: [{ url: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MHXH3?wid=1144&hei=1144&fmt=jpeg&qlt=90&.v=1602542036000" }],
      options: [{ title: "Cable Length", values: ["1m", "2m"] }],
      variants: [
        { title: "1m", sku: "MAGSAFE-1M", options: { "Cable Length": "1m" }, prices: [{ amount: 150000, currency_code: "mnt" }] },
        { title: "2m", sku: "MAGSAFE-2M", options: { "Cable Length": "2m" }, prices: [{ amount: 180000, currency_code: "mnt" }] },
      ],
    },
    {
      title: "AirTag",
      category_name: "Accessories",
      description: "Precision Finding, Find My network.",
      handle: "airtag",
      weight: 11,
      images: [{ url: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/airtag-single-select-202104?wid=940&hei=1112&fmt=png-alpha&.v=1617761671000" }],
      options: [{ title: "Pack", values: ["1 Pack", "4 Pack"] }],
      variants: [
        { title: "1 Pack", sku: "AIRTAG-1", options: { Pack: "1 Pack" }, prices: [{ amount: 100000, currency_code: "mnt" }] },
        { title: "4 Pack", sku: "AIRTAG-4", options: { Pack: "4 Pack" }, prices: [{ amount: 350000, currency_code: "mnt" }] },
      ],
    },

    // ========== Drones Products ==========
    {
      title: "DJI Mavic 3 Pro",
      category_name: "DJI",
      description: "Triple-camera system. Hasselblad камер.",
      handle: "dji-mavic-3-pro",
      weight: 958,
      images: [{ url: "https://dji-official-aps.djicdn.com/cms/uploads/0a6e0a600a600a600a600a600a600a60.jpg" }],
      options: [{ title: "Bundle", values: ["Standard", "Fly More Combo", "Cine Premium Combo"] }],
      variants: [
        { title: "Standard", sku: "DJIM3P-STD", options: { Bundle: "Standard" }, prices: [{ amount: 7500000, currency_code: "mnt" }] },
        { title: "Fly More Combo", sku: "DJIM3P-FMC", options: { Bundle: "Fly More Combo" }, prices: [{ amount: 9500000, currency_code: "mnt" }] },
        { title: "Cine Premium Combo", sku: "DJIM3P-CPC", options: { Bundle: "Cine Premium Combo" }, prices: [{ amount: 14000000, currency_code: "mnt" }] },
      ],
    },
    {
      title: "DJI Air 3",
      category_name: "DJI",
      description: "Dual primary cameras. 48MP photos.",
      handle: "dji-air-3",
      weight: 720,
      images: [{ url: "https://dji-official-aps.djicdn.com/cms/uploads/6a6e6a606a606a606a606a606a606a60.jpg" }],
      options: [{ title: "Bundle", values: ["Standard", "Fly More Combo"] }],
      variants: [
        { title: "Standard", sku: "DJIA3-STD", options: { Bundle: "Standard" }, prices: [{ amount: 4500000, currency_code: "mnt" }] },
        { title: "Fly More Combo", sku: "DJIA3-FMC", options: { Bundle: "Fly More Combo" }, prices: [{ amount: 5800000, currency_code: "mnt" }] },
      ],
    },
    {
      title: "DJI Avata 2",
      category_name: "DJI",
      description: "FPV drone. Immersive flight experience.",
      handle: "dji-avata-2",
      weight: 377,
      images: [{ url: "https://dji-official-aps.djicdn.com/cms/uploads/8a8e8a608a608a608a608a608a608a60.jpg" }],
      options: [{ title: "Bundle", values: ["Fly More Combo (Single Battery)", "Fly More Combo (Three Batteries)"] }],
      variants: [
        { title: "Single Battery", sku: "DJIA2-1B", options: { Bundle: "Fly More Combo (Single Battery)" }, prices: [{ amount: 3500000, currency_code: "mnt" }] },
        { title: "Three Batteries", sku: "DJIA2-3B", options: { Bundle: "Fly More Combo (Three Batteries)" }, prices: [{ amount: 4500000, currency_code: "mnt" }] },
      ],
    },

    // ========== Smart Glasses Products ==========
    {
      title: "Meta Quest 3",
      category_name: "Ray Ban Meta",
      description: "Mixed reality headset. Snapdragon XR2 Gen 2.",
      handle: "meta-quest-3",
      weight: 515,
      images: [{ url: "https://about.fb.com/wp-content/uploads/2023/09/Meta-Quest-3-Hero.jpg" }],
      options: [{ title: "Storage", values: ["128GB", "512GB"] }],
      variants: [
        { title: "128GB", sku: "MQ3-128", options: { Storage: "128GB" }, prices: [{ amount: 1700000, currency_code: "mnt" }] },
        { title: "512GB", sku: "MQ3-512", options: { Storage: "512GB" }, prices: [{ amount: 2200000, currency_code: "mnt" }] },
      ],
    },
    {
      title: "Ray-Ban Meta Headliner",
      category_name: "Ray Ban Meta",
      description: "Smart glasses with Meta AI. 12MP camera.",
      handle: "ray-ban-meta-headliner",
      weight: 49,
      images: [{ url: "https://media.ray-ban.com/2023/Meta/Headliner/RW4009_601_71_1.png" }],
      options: [
        { title: "Frame", values: ["Shiny Black", "Matte Black", "Havana"] },
        { title: "Lens", values: ["Clear", "G-15 Green", "Gradient Brown"] },
      ],
      variants: [
        { title: "Shiny Black / Clear", sku: "RBMH-SB-CL", options: { Frame: "Shiny Black", Lens: "Clear" }, prices: [{ amount: 1100000, currency_code: "mnt" }] },
        { title: "Havana / Gradient Brown", sku: "RBMH-HV-GB", options: { Frame: "Havana", Lens: "Gradient Brown" }, prices: [{ amount: 1200000, currency_code: "mnt" }] },
      ],
    },

    // ========== Toys Products ==========
    {
      title: "Pop Mart Dimoo World",
      category_name: "Popmart",
      description: "Dimoo World Series Blind Box.",
      handle: "pop-mart-dimoo-world",
      weight: 80,
      images: [{ url: "https://popmart.com/cdn/shop/files/Dimoo_World_Series_1.jpg" }],
      options: [{ title: "Type", values: ["Blind Box", "Whole Set"] }],
      variants: [
        { title: "Blind Box", sku: "PM-DW-BB", options: { Type: "Blind Box" }, prices: [{ amount: 35000, currency_code: "mnt" }] },
        { title: "Whole Set", sku: "PM-DW-SET", options: { Type: "Whole Set" }, prices: [{ amount: 420000, currency_code: "mnt" }] },
      ],
    },
    {
      title: "Pop Mart Molly Mega Space",
      category_name: "Popmart",
      description: "MEGA COLLECTION 1000% Molly.",
      handle: "pop-mart-molly-mega",
      weight: 5000,
      images: [{ url: "https://popmart.com/cdn/shop/files/MEGA_Molly_Space_1.jpg" }],
      options: [{ title: "Size", values: ["400%", "1000%"] }],
      variants: [
        { title: "400%", sku: "PM-MM-400", options: { Size: "400%" }, prices: [{ amount: 850000, currency_code: "mnt" }] },
        { title: "1000%", sku: "PM-MM-1000", options: { Size: "1000%" }, prices: [{ amount: 3500000, currency_code: "mnt" }] },
      ],
    },
    {
      title: "LEGO Technic Ferrari Daytona SP3",
      category_name: "Playstation",
      description: "3,778 pieces. 1:8 scale Ferrari.",
      handle: "lego-ferrari-daytona",
      weight: 4500,
      images: [{ url: "https://www.lego.com/cdn/cs/set/assets/blt4c3d1a3e8c1cc9c8/42143.png" }],
      options: [{ title: "Model", values: ["42143"] }],
      variants: [
        { title: "42143", sku: "LEGO-42143", options: { Model: "42143" }, prices: [{ amount: 1400000, currency_code: "mnt" }] },
      ],
    },
    {
      title: "LEGO Icons Optimus Prime",
      category_name: "Playstation",
      description: "1,508 pieces. Transforms!",
      handle: "lego-optimus-prime",
      weight: 2100,
      images: [{ url: "https://www.lego.com/cdn/cs/set/assets/bltb8e7af89de2ab41e/10302.png" }],
      options: [{ title: "Model", values: ["10302"] }],
      variants: [
        { title: "10302", sku: "LEGO-10302", options: { Model: "10302" }, prices: [{ amount: 650000, currency_code: "mnt" }] },
      ],
    },
  ];

  // Check existing products
  const existingProducts = await productModuleService.listProducts({
    handle: categoryProducts.map((p) => p.handle),
  });
  const existingHandles = new Set(existingProducts.map((p) => p.handle));

  const productsToCreate = categoryProducts.filter(
    (p) => !existingHandles.has(p.handle) && categoryMap.has(p.category_name)
  );

  logger.info(`Found ${existingHandles.size} existing products, creating ${productsToCreate.length} new products...`);

  if (productsToCreate.length > 0) {
    const formattedProducts = productsToCreate.map((product) => ({
      title: product.title,
      category_ids: [categoryMap.get(product.category_name)!],
      description: product.description,
      handle: product.handle,
      weight: product.weight,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfileId,
      images: product.images,
      options: product.options,
      variants: product.variants,
      sales_channels: [{ id: salesChannelId }],
    }));

    await createProductsWorkflow(container).run({
      input: {
        products: formattedProducts,
      },
    });

    logger.info(`Created ${productsToCreate.length} products successfully.`);
  }

  // Create inventory levels for new items
  logger.info("Creating inventory levels...");

  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id"],
  });

  const existingLevels = await inventoryModuleService.listInventoryLevels({
    location_id: stockLocationId,
    inventory_item_id: inventoryItems.map((i) => i.id),
  });

  const existingLevelMap = new Set(existingLevels.map((l) => l.inventory_item_id));

  const inventoryLevels: CreateInventoryLevelInput[] = [];
  for (const inventoryItem of inventoryItems) {
    if (existingLevelMap.has(inventoryItem.id)) {
      continue;
    }

    inventoryLevels.push({
      location_id: stockLocationId,
      stocked_quantity: 1000000,
      inventory_item_id: inventoryItem.id,
    });
  }

  if (inventoryLevels.length > 0) {
    await createInventoryLevelsWorkflow(container).run({
      input: {
        inventory_levels: inventoryLevels,
      },
    });
    logger.info(`Created ${inventoryLevels.length} inventory levels.`);
  }

  logger.info("Category products seeding completed!");

  // Print summary by category
  const allProducts = await productModuleService.listProducts(
    {},
    { take: 1000, relations: ["categories"] }
  );

  logger.info("\n=== Products per Category ===");
  for (const cat of categories) {
    const count = allProducts.filter((p) =>
      p.categories?.some((c) => c.id === cat.id)
    ).length;
    logger.info(`${cat.name}: ${count} products`);
  }
}
