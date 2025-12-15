import { CreateInventoryLevelInput, ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createApiKeysWorkflow,
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStoresStep,
  updateStoresWorkflow,
} from "@medusajs/core-flows";
import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";

const updateStoreCurrencies = createWorkflow(
  "update-store-currencies",
  (input: {
    supported_currencies: { currency_code: string; is_default?: boolean }[];
    store_id: string;
  }) => {
    const normalizedInput = transform({ input }, (data) => {
      return {
        selector: { id: data.input.store_id },
        update: {
          supported_currencies: data.input.supported_currencies.map(
            (currency) => {
              return {
                currency_code: currency.currency_code,
                is_default: currency.is_default ?? false,
              };
            }
          ),
        },
      };
    });

    const stores = updateStoresStep(normalizedInput);

    return new WorkflowResponse(stores);
  }
);

export default async function seedDemoData({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);
  const storeModuleService = container.resolve(Modules.STORE);
  const regionModuleService = container.resolve(Modules.REGION);
  const taxModuleService = container.resolve(Modules.TAX);
  const stockLocationModuleService = container.resolve(Modules.STOCK_LOCATION);
  const productModuleService = container.resolve(Modules.PRODUCT);
  const inventoryModuleService = container.resolve(Modules.INVENTORY);

  const countries = ["mn"];

  logger.info("Seeding store data...");
  const [store] = await storeModuleService.listStores();
  let defaultSalesChannel = await salesChannelModuleService.listSalesChannels({
    name: "Default Sales Channel",
  });

  if (!defaultSalesChannel.length) {
    // create the default sales channel
    const { result: salesChannelResult } = await createSalesChannelsWorkflow(
      container
    ).run({
      input: {
        salesChannelsData: [
          {
            name: "Default Sales Channel",
          },
        ],
      },
    });
    defaultSalesChannel = salesChannelResult;
  }

  await updateStoreCurrencies(container).run({
    input: {
      store_id: store.id,
      supported_currencies: [
        {
          currency_code: "mnt",
          is_default: true,
        },
      ],
    },
  });

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        default_sales_channel_id: defaultSalesChannel[0].id,
      },
    },
  });
  logger.info("Seeding region data...");
  const existingRegions = await regionModuleService.listRegions(
    {},
    { relations: ["countries"] }
  );
  let region = existingRegions.find((r) =>
    r.countries?.some((c) => countries.includes(c.iso_2))
  );

  if (!region) {
    const { result: regionResult } = await createRegionsWorkflow(container).run({
      input: {
        regions: [
          {
            name: "Монгол",
            currency_code: "mnt",
            countries,
            payment_providers: ["pp_system_default"],
          },
        ],
      },
    });
    region = regionResult[0];
  }
  logger.info("Finished seeding regions.");

  logger.info("Seeding stock location data...");
  const existingStockLocations = await stockLocationModuleService.listStockLocations(
    { name: "Улаанбаатар агуулах" }
  );
  let stockLocation = existingStockLocations[0];

  if (!stockLocation) {
    const { result: stockLocationResult } = await createStockLocationsWorkflow(
      container
    ).run({
      input: {
        locations: [
          {
            name: "Улаанбаатар агуулах",
            address: {
              city: "Улаанбаатар",
              country_code: "MN",
              address_1: "",
            },
          },
        ],
      },
    });
    stockLocation = stockLocationResult[0];
  }

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        default_location_id: stockLocation.id,
      },
    },
  });

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_provider_id: "manual_manual",
    },
  });

  logger.info("Seeding fulfillment data...");
  const shippingProfiles = await fulfillmentModuleService.listShippingProfiles({
    type: "default",
  });
  let shippingProfile = shippingProfiles.length ? shippingProfiles[0] : null;

  if (!shippingProfile) {
    const { result: shippingProfileResult } =
      await createShippingProfilesWorkflow(container).run({
        input: {
          data: [
            {
              name: "Default Shipping Profile",
              type: "default",
            },
          ],
        },
      });
    shippingProfile = shippingProfileResult[0];
  }

  const allFulfillmentSets = await fulfillmentModuleService.listFulfillmentSets(
    { name: "Монгол хүргэлт" },
    { relations: ["service_zones"] }
  );
  let fulfillmentSet: any = allFulfillmentSets[0];

  if (!fulfillmentSet) {
    fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
      name: "Монгол хүргэлт",
      type: "shipping",
      service_zones: [
        {
          name: "Монгол",
          geo_zones: [
            {
              country_code: "mn",
              type: "country",
            },
          ],
        },
      ],
    });
  }

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_set_id: fulfillmentSet.id,
    },
  });

  // Check for existing shipping options to avoid duplicates
  const existingShippingOptions = await fulfillmentModuleService.listShippingOptions({});
  const existingOptionNames = new Set(existingShippingOptions.map((o: any) => o.name));
  
  // Only create shipping options if they don't exist
  const shippingOptionsToCreate: any[] = [];
  
  if (!existingOptionNames.has("Энгийн хүргэлт")) {
    shippingOptionsToCreate.push({
      name: "Энгийн хүргэлт",
      price_type: "flat",
      provider_id: "manual_manual",
      service_zone_id: fulfillmentSet.service_zones[0].id,
      shipping_profile_id: shippingProfile.id,
      type: {
        label: "Энгийн",
        description: "2-3 хоногт хүргэнэ.",
        code: "standard",
      },
      prices: [
        {
          currency_code: "mnt",
          amount: 5000,
        },
        {
          region_id: region.id,
          amount: 5000,
        },
      ],
      rules: [
        {
          attribute: "enabled_in_store",
          value: "true",
          operator: "eq",
        },
        {
          attribute: "is_return",
          value: "false",
          operator: "eq",
        },
      ],
    });
  }
  
  if (!existingOptionNames.has("Шуурхай хүргэлт")) {
    shippingOptionsToCreate.push({
      name: "Шуурхай хүргэлт",
      price_type: "flat",
      provider_id: "manual_manual",
      service_zone_id: fulfillmentSet.service_zones[0].id,
      shipping_profile_id: shippingProfile.id,
      type: {
        label: "Шуурхай",
        description: "24 цагийн дотор хүргэнэ.",
        code: "express",
      },
      prices: [
        {
          currency_code: "mnt",
          amount: 10000,
        },
        {
          region_id: region.id,
          amount: 10000,
        },
      ],
      rules: [
        {
          attribute: "enabled_in_store",
          value: "true",
          operator: "eq",
        },
        {
          attribute: "is_return",
          value: "false",
          operator: "eq",
        },
      ],
    });
  }
  
  if (!existingOptionNames.has("Дэлгүүрээс авах")) {
    shippingOptionsToCreate.push({
      name: "Дэлгүүрээс авах",
      price_type: "flat",
      provider_id: "manual_manual",
      service_zone_id: fulfillmentSet.service_zones[0].id,
      shipping_profile_id: shippingProfile.id,
      type: {
        label: "Дэлгүүрээс авах",
        description: "Peace Tower дэлгүүрээс авах.",
        code: "pickup",
      },
      prices: [
        {
          currency_code: "mnt",
          amount: 0,
        },
        {
          region_id: region.id,
          amount: 0,
        },
      ],
      rules: [
        {
          attribute: "enabled_in_store",
          value: "true",
          operator: "eq",
        },
        {
          attribute: "is_return",
          value: "false",
          operator: "eq",
        },
      ],
    });
  }
  
  if (shippingOptionsToCreate.length > 0) {
    await createShippingOptionsWorkflow(container).run({
      input: shippingOptionsToCreate,
    });
    logger.info(`Created ${shippingOptionsToCreate.length} shipping options`);
  } else {
    logger.info("Shipping options already exist, skipping creation");
  }
  logger.info("Finished seeding fulfillment data.");

  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: {
      id: stockLocation.id,
      add: [defaultSalesChannel[0].id],
    },
  });
  logger.info("Finished seeding stock location data.");

  logger.info("Seeding publishable API key data...");
  const { result: publishableApiKeyResult } = await createApiKeysWorkflow(
    container
  ).run({
    input: {
      api_keys: [
        {
          title: "Webshop",
          type: "publishable",
          created_by: "",
        },
      ],
    },
  });
  const publishableApiKey = publishableApiKeyResult[0];

  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: {
      id: publishableApiKey.id,
      add: [defaultSalesChannel[0].id],
    },
  });
  logger.info("Finished seeding publishable API key data.");

  logger.info("Seeding product data...");

  const categoryNames = [
    "iPhone",
    "Macbook",
    "iPad",
    "Airpods",
    "iMac",
    "Apple Watch",
    "Accessories",
    "Drones",
    "Smart Glasses",
    "Toys",
  ];

  const existingCategories = await productModuleService.listProductCategories(
    {},
    { take: 1000, select: ["id", "name", "handle"] }
  );
  
  const existingCategoryNames = new Set(existingCategories.map((c) => c.name?.toLowerCase() || ""));
  const categoriesToCreate = categoryNames.filter(
    (c) => !existingCategoryNames.has(c.toLowerCase())
  );

  let categoryResult = existingCategories;

  if (categoriesToCreate.length > 0) {
    const { result: newCategories } = await createProductCategoriesWorkflow(
      container
    ).run({
      input: {
        product_categories: categoriesToCreate.map((name) => ({
          name,
          is_active: true,
        })),
      },
    });
    categoryResult = [...categoryResult, ...newCategories];
  }

  const products = [
    {
      title: "iPhone 15 Pro",
      category_ids: [categoryResult.find((cat) => cat.name === "iPhone")!.id],
      description:
        "The first iPhone to feature an aerospace-grade titanium design.",
      handle: "iphone-15-pro",
      weight: 187,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      images: [
        {
          url: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-1inch-naturaltitanium?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1692846363993",
        },
      ],
      options: [
        {
          title: "Color",
          values: [
            "Natural Titanium",
            "Blue Titanium",
            "Black Titanium",
            "White Titanium",
          ],
        },
        { title: "Storage", values: ["128GB", "256GB", "512GB", "1TB"] },
      ],
      variants: [
        {
          title: "Natural Titanium / 128GB",
          sku: "IP15P-NAT-128",
          options: { Color: "Natural Titanium", Storage: "128GB" },
          prices: [{ amount: 3500000, currency_code: "mnt" }],
        },
        {
          title: "Natural Titanium / 256GB",
          sku: "IP15P-NAT-256",
          options: { Color: "Natural Titanium", Storage: "256GB" },
          prices: [{ amount: 3900000, currency_code: "mnt" }],
        },
        {
          title: "Blue Titanium / 128GB",
          sku: "IP15P-BLU-128",
          options: { Color: "Blue Titanium", Storage: "128GB" },
          prices: [{ amount: 3500000, currency_code: "mnt" }],
        },
      ],
      sales_channels: [{ id: defaultSalesChannel[0].id }],
    },
    {
      title: "MacBook Pro 14",
      category_ids: [categoryResult.find((cat) => cat.name === "Macbook")!.id],
      description: "Mind-blowing. Head-turning. With M3, M3 Pro, or M3 Max.",
      handle: "macbook-pro-14",
      weight: 1550,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      images: [
        {
          url: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp14-spacegray-select-202310?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1697311054290",
        },
      ],
      options: [
        { title: "Color", values: ["Space Gray", "Silver"] },
        { title: "Storage", values: ["512GB", "1TB"] },
      ],
      variants: [
        {
          title: "Space Gray / 512GB",
          sku: "MBP14-SG-512",
          options: { Color: "Space Gray", Storage: "512GB" },
          prices: [{ amount: 5500000, currency_code: "mnt" }],
        },
        {
          title: "Silver / 1TB",
          sku: "MBP14-SL-1TB",
          options: { Color: "Silver", Storage: "1TB" },
          prices: [{ amount: 6500000, currency_code: "mnt" }],
        },
      ],
      sales_channels: [{ id: defaultSalesChannel[0].id }],
    },
    {
      title: "iPad Air",
      category_ids: [categoryResult.find((cat) => cat.name === "iPad")!.id],
      description: "Serious performance in a thin and light design.",
      handle: "ipad-air",
      weight: 461,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      images: [
        {
          url: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipad-air-storage-select-202207-blue-wifi?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1654902977555",
        },
      ],
      options: [
        { title: "Color", values: ["Blue", "Purple", "Space Gray"] },
        { title: "Storage", values: ["64GB", "256GB"] },
      ],
      variants: [
        {
          title: "Blue / 64GB",
          sku: "IPADAIR-BLU-64",
          options: { Color: "Blue", Storage: "64GB" },
          prices: [{ amount: 2000000, currency_code: "mnt" }],
        },
        {
          title: "Purple / 256GB",
          sku: "IPADAIR-PUR-256",
          options: { Color: "Purple", Storage: "256GB" },
          prices: [{ amount: 2500000, currency_code: "mnt" }],
        },
      ],
      sales_channels: [{ id: defaultSalesChannel[0].id }],
    },
    {
      title: "AirPods Pro (2nd Gen)",
      category_ids: [categoryResult.find((cat) => cat.name === "Airpods")!.id],
      description:
        "Adaptive Audio. Active Noise Cancellation. Transparency mode.",
      handle: "airpods-pro-2",
      weight: 50,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      images: [
        {
          url: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MTJV3?wid=1144&hei=1144&fmt=jpeg&qlt=90&.v=1694014871985",
        },
      ],
      options: [{ title: "Color", values: ["White"] }],
      variants: [
        {
          title: "White",
          sku: "APP2-WHT",
          options: { Color: "White" },
          prices: [{ amount: 800000, currency_code: "mnt" }],
        },
      ],
      sales_channels: [{ id: defaultSalesChannel[0].id }],
    },
    {
      title: "Apple Watch Series 9",
      category_ids: [
        categoryResult.find((cat) => cat.name === "Apple Watch")!.id,
      ],
      description: "Smarter. Brighter. Mightier.",
      handle: "apple-watch-s9",
      weight: 32,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      images: [
        {
          url: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/watch-s9-aluminum-midnight-nc-sport-band-midnight-se-cell-202309?wid=1200&hei=630&fmt=jpeg&qlt=95&.v=1693550496566",
        },
      ],
      options: [
        { title: "Color", values: ["Midnight", "Starlight"] },
        { title: "Size", values: ["41mm", "45mm"] },
      ],
      variants: [
        {
          title: "Midnight / 41mm",
          sku: "AWS9-MID-41",
          options: { Color: "Midnight", Size: "41mm" },
          prices: [{ amount: 1500000, currency_code: "mnt" }],
        },
        {
          title: "Starlight / 45mm",
          sku: "AWS9-STA-45",
          options: { Color: "Starlight", Size: "45mm" },
          prices: [{ amount: 1600000, currency_code: "mnt" }],
        },
      ],
      sales_channels: [{ id: defaultSalesChannel[0].id }],
    },
    {
      title: "DJI Mini 4 Pro",
      category_ids: [categoryResult.find((cat) => cat.name === "Drones")!.id],
      description: "Mini to the Max. 4K/60fps HDR True Vertical Shooting.",
      handle: "dji-mini-4-pro",
      weight: 249,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      images: [
        {
          url: "https://dji-official-aps.djicdn.com/cms/uploads/0a6e0a600a600a600a600a600a600a60.jpg",
        },
      ],
      options: [{ title: "Bundle", values: ["Standard", "Fly More Combo"] }],
      variants: [
        {
          title: "Standard",
          sku: "DJI-M4P-STD",
          options: { Bundle: "Standard" },
          prices: [{ amount: 2800000, currency_code: "mnt" }],
        },
        {
          title: "Fly More Combo",
          sku: "DJI-M4P-FMC",
          options: { Bundle: "Fly More Combo" },
          prices: [{ amount: 3500000, currency_code: "mnt" }],
        },
      ],
      sales_channels: [{ id: defaultSalesChannel[0].id }],
    },
    {
      title: "Ray-Ban Meta Wayfarer",
      category_ids: [
        categoryResult.find((cat) => cat.name === "Smart Glasses")!.id,
      ],
      description: "The next generation of smart glasses.",
      handle: "ray-ban-meta",
      weight: 50,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      images: [
        {
          url: "https://media.ray-ban.com/2023/Meta/Wayfarer/RW4006_601_71_1.png",
        },
      ],
      options: [
        { title: "Color", values: ["Shiny Black", "Matte Black"] },
        { title: "Lens", values: ["G-15 Green", "Transitions"] },
      ],
      variants: [
        {
          title: "Shiny Black / G-15 Green",
          sku: "RBM-SB-G15",
          options: { Color: "Shiny Black", Lens: "G-15 Green" },
          prices: [{ amount: 1200000, currency_code: "mnt" }],
        },
        {
          title: "Matte Black / Transitions",
          sku: "RBM-MB-TR",
          options: { Color: "Matte Black", Lens: "Transitions" },
          prices: [{ amount: 1400000, currency_code: "mnt" }],
        },
      ],
      sales_channels: [{ id: defaultSalesChannel[0].id }],
    },
    {
      title: "Pop Mart Skullpanda",
      category_ids: [categoryResult.find((cat) => cat.name === "Toys")!.id],
      description: "The Ink Plum Blossom Series.",
      handle: "pop-mart-skullpanda",
      weight: 100,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      images: [
        {
          url: "https://popmart.com/cdn/shop/files/Skullpanda_The_Ink_Plum_Blossom_Series_1.jpg",
        },
      ],
      options: [{ title: "Style", values: ["Blind Box", "Whole Set"] }],
      variants: [
        {
          title: "Blind Box",
          sku: "PM-SP-BB",
          options: { Style: "Blind Box" },
          prices: [{ amount: 45000, currency_code: "mnt" }],
        },
        {
          title: "Whole Set",
          sku: "PM-SP-SET",
          options: { Style: "Whole Set" },
          prices: [{ amount: 540000, currency_code: "mnt" }],
        },
      ],
      sales_channels: [{ id: defaultSalesChannel[0].id }],
    },
    {
      title: "iMac 24-inch",
      category_ids: [categoryResult.find((cat) => cat.name === "iMac")!.id],
      description: "Packed with more juice. And more juice.",
      handle: "imac-24",
      weight: 4480,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      images: [
        {
          url: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/imac-24-blue-selection-hero-202310?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1697303846093",
        },
      ],
      options: [
        { title: "Color", values: ["Blue", "Green", "Pink", "Silver"] },
        { title: "Chip", values: ["M3 8-core GPU", "M3 10-core GPU"] },
      ],
      variants: [
        {
          title: "Blue / M3 8-core GPU",
          sku: "IMAC24-BLU-8C",
          options: { Color: "Blue", Chip: "M3 8-core GPU" },
          prices: [{ amount: 5000000, currency_code: "mnt" }],
        },
        {
          title: "Green / M3 10-core GPU",
          sku: "IMAC24-GRN-10C",
          options: { Color: "Green", Chip: "M3 10-core GPU" },
          prices: [{ amount: 5800000, currency_code: "mnt" }],
        },
      ],
      sales_channels: [{ id: defaultSalesChannel[0].id }],
    },
    {
      title: "iPad Pro 13-inch (M4)",
      category_ids: [categoryResult.find((cat) => cat.name === "iPad")!.id],
      description: "The ultimate iPad experience with the new M4 chip.",
      handle: "ipad-pro-13-m4",
      weight: 579,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      images: [
        {
          url: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipad-pro-model-select-gallery-2-202405?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1713935742567",
        },
      ],
      options: [
        { title: "Color", values: ["Space Black", "Silver"] },
        { title: "Storage", values: ["256GB", "512GB", "1TB"] },
      ],
      variants: [
        {
          title: "Space Black / 256GB",
          sku: "IPP13-SB-256",
          options: { Color: "Space Black", Storage: "256GB" },
          prices: [{ amount: 4500000, currency_code: "mnt" }],
        },
        {
          title: "Silver / 1TB",
          sku: "IPP13-SL-1TB",
          options: { Color: "Silver", Storage: "1TB" },
          prices: [{ amount: 6500000, currency_code: "mnt" }],
        },
      ],
      sales_channels: [{ id: defaultSalesChannel[0].id }],
    },
    {
      title: "Apple Pencil (2nd Gen)",
      category_ids: [categoryResult.find((cat) => cat.name === "Accessories")!.id],
      description: "Pixel-perfect precision and industry-leading low latency.",
      handle: "apple-pencil-2",
      weight: 20,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      images: [
        {
          url: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MU8F2?wid=1144&hei=1144&fmt=jpeg&qlt=95&.v=1540596407165",
        },
      ],
      options: [{ title: "Color", values: ["White"] }],
      variants: [
        {
          title: "White",
          sku: "AP-PENCIL-2",
          options: { Color: "White" },
          prices: [{ amount: 450000, currency_code: "mnt" }],
        },
      ],
      sales_channels: [{ id: defaultSalesChannel[0].id }],
    },
    {
      title: "Magic Mouse",
      category_ids: [categoryResult.find((cat) => cat.name === "Accessories")!.id],
      description: "Wireless and rechargeable, with an optimized foot design.",
      handle: "magic-mouse",
      weight: 99,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      images: [
        {
          url: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MMMQ3?wid=1144&hei=1144&fmt=jpeg&qlt=95&.v=1645138486301",
        },
      ],
      options: [{ title: "Color", values: ["White", "Black"] }],
      variants: [
        {
          title: "White",
          sku: "MM-WHT",
          options: { Color: "White" },
          prices: [{ amount: 300000, currency_code: "mnt" }],
        },
        {
          title: "Black",
          sku: "MM-BLK",
          options: { Color: "Black" },
          prices: [{ amount: 350000, currency_code: "mnt" }],
        },
      ],
      sales_channels: [{ id: defaultSalesChannel[0].id }],
    },
  ];

  const existingProducts = await productModuleService.listProducts({
    handle: products.map((p) => p.handle),
  });
  const existingHandles = existingProducts.map((p) => p.handle);
  const productsToCreate = products.filter(
    (p) => !existingHandles.includes(p.handle)
  );

  if (productsToCreate.length > 0) {
    await createProductsWorkflow(container).run({
      input: {
        products: productsToCreate,
      },
    });
  }
  logger.info("Finished seeding product data.");

  logger.info("Seeding inventory levels.");

  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id"],
  });

  const existingLevels = await inventoryModuleService.listInventoryLevels({
    location_id: stockLocation.id,
    inventory_item_id: inventoryItems.map((i) => i.id),
  });

  const existingLevelMap = new Set(existingLevels.map((l) => l.inventory_item_id));

  const inventoryLevels: CreateInventoryLevelInput[] = [];
  for (const inventoryItem of inventoryItems) {
    if (existingLevelMap.has(inventoryItem.id)) {
      continue;
    }

    const inventoryLevel = {
      location_id: stockLocation.id,
      stocked_quantity: 1000000,
      inventory_item_id: inventoryItem.id,
    };
    inventoryLevels.push(inventoryLevel);
  }

  if (inventoryLevels.length > 0) {
    await createInventoryLevelsWorkflow(container).run({
      input: {
        inventory_levels: inventoryLevels,
      },
    });
  }

  logger.info("Finished seeding inventory levels data.");
}
