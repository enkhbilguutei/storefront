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
} from "@medusajs/medusa/core-flows";
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
  const region = regionResult[0];
  logger.info("Finished seeding regions.");

  logger.info("Seeding tax regions...");
  await createTaxRegionsWorkflow(container).run({
    input: countries.map((country_code) => ({
      country_code,
      provider_id: "tp_system",
    })),
  });
  logger.info("Finished seeding tax regions.");

  logger.info("Seeding stock location data...");
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
  const stockLocation = stockLocationResult[0];

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

  const fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
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

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_set_id: fulfillmentSet.id,
    },
  });

  await createShippingOptionsWorkflow(container).run({
    input: [
      {
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
      },
      {
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
      },
    ],
  });
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

  const { result: categoryResult } = await createProductCategoriesWorkflow(
    container
  ).run({
    input: {
      product_categories: [
        {
          name: "Цамц",
          is_active: true,
        },
        {
          name: "Хүрэм",
          is_active: true,
        },
        {
          name: "Өмд",
          is_active: true,
        },
        {
          name: "Бусад",
          is_active: true,
        },
      ],
    },
  });

  await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: "Цамц",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Цамц")!.id,
          ],
          description:
            "Өдөр тутмын хэрэглээнд тохиромжтой чанартай цамц. Уламжлалт дизайн, дээд зэргийн материал.",
          handle: "t-shirt",
          weight: 400,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-black-front.png",
            },
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-black-back.png",
            },
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-white-front.png",
            },
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-white-back.png",
            },
          ],
          options: [
            {
              title: "Хэмжээ",
              values: ["S", "M", "L", "XL"],
            },
            {
              title: "Өнгө",
              values: ["Хар", "Цагаан"],
            },
          ],
          variants: [
            {
              title: "S / Хар",
              sku: "SHIRT-S-BLACK",
              options: {
                "Хэмжээ": "S",
                "Өнгө": "Хар",
              },
              prices: [
                {
                  amount: 45000,
                  currency_code: "mnt",
                },
              ],
            },
            {
              title: "S / Цагаан",
              sku: "SHIRT-S-WHITE",
              options: {
                "Хэмжээ": "S",
                "Өнгө": "Цагаан",
              },
              prices: [
                {
                  amount: 45000,
                  currency_code: "mnt",
                },
              ],
            },
            {
              title: "M / Хар",
              sku: "SHIRT-M-BLACK",
              options: {
                "Хэмжээ": "M",
                "Өнгө": "Хар",
              },
              prices: [
                {
                  amount: 45000,
                  currency_code: "mnt",
                },
              ],
            },
            {
              title: "M / Цагаан",
              sku: "SHIRT-M-WHITE",
              options: {
                "Хэмжээ": "M",
                "Өнгө": "Цагаан",
              },
              prices: [
                {
                  amount: 45000,
                  currency_code: "mnt",
                },
              ],
            },
            {
              title: "L / Хар",
              sku: "SHIRT-L-BLACK",
              options: {
                "Хэмжээ": "L",
                "Өнгө": "Хар",
              },
              prices: [
                {
                  amount: 45000,
                  currency_code: "mnt",
                },
              ],
            },
            {
              title: "L / Цагаан",
              sku: "SHIRT-L-WHITE",
              options: {
                "Хэмжээ": "L",
                "Өнгө": "Цагаан",
              },
              prices: [
                {
                  amount: 45000,
                  currency_code: "mnt",
                },
              ],
            },
            {
              title: "XL / Хар",
              sku: "SHIRT-XL-BLACK",
              options: {
                "Хэмжээ": "XL",
                "Өнгө": "Хар",
              },
              prices: [
                {
                  amount: 45000,
                  currency_code: "mnt",
                },
              ],
            },
            {
              title: "XL / Цагаан",
              sku: "SHIRT-XL-WHITE",
              options: {
                "Хэмжээ": "XL",
                "Өнгө": "Цагаан",
              },
              prices: [
                {
                  amount: 45000,
                  currency_code: "mnt",
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
        {
          title: "Хүрэм",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Хүрэм")!.id,
          ],
          description:
            "Дулаахан, тав тухтай хүрэм. Өвлийн улиралд тохиромжтой.",
          handle: "sweatshirt",
          weight: 400,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-front.png",
            },
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-back.png",
            },
          ],
          options: [
            {
              title: "Хэмжээ",
              values: ["S", "M", "L", "XL"],
            },
          ],
          variants: [
            {
              title: "S",
              sku: "SWEATSHIRT-S",
              options: {
                "Хэмжээ": "S",
              },
              prices: [
                {
                  amount: 75000,
                  currency_code: "mnt",
                },
              ],
            },
            {
              title: "M",
              sku: "SWEATSHIRT-M",
              options: {
                "Хэмжээ": "M",
              },
              prices: [
                {
                  amount: 75000,
                  currency_code: "mnt",
                },
              ],
            },
            {
              title: "L",
              sku: "SWEATSHIRT-L",
              options: {
                "Хэмжээ": "L",
              },
              prices: [
                {
                  amount: 75000,
                  currency_code: "mnt",
                },
              ],
            },
            {
              title: "XL",
              sku: "SWEATSHIRT-XL",
              options: {
                "Хэмжээ": "XL",
              },
              prices: [
                {
                  amount: 75000,
                  currency_code: "mnt",
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
        {
          title: "Чөлөөт өмд",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Өмд")!.id,
          ],
          description:
            "Тав тухтай чөлөөт өмд. Гэрт болон гадаа хэрэглэхэд тохиромжтой.",
          handle: "sweatpants",
          weight: 400,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatpants-gray-front.png",
            },
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatpants-gray-back.png",
            },
          ],
          options: [
            {
              title: "Хэмжээ",
              values: ["S", "M", "L", "XL"],
            },
          ],
          variants: [
            {
              title: "S",
              sku: "SWEATPANTS-S",
              options: {
                "Хэмжээ": "S",
              },
              prices: [
                {
                  amount: 65000,
                  currency_code: "mnt",
                },
              ],
            },
            {
              title: "M",
              sku: "SWEATPANTS-M",
              options: {
                "Хэмжээ": "M",
              },
              prices: [
                {
                  amount: 65000,
                  currency_code: "mnt",
                },
              ],
            },
            {
              title: "L",
              sku: "SWEATPANTS-L",
              options: {
                "Хэмжээ": "L",
              },
              prices: [
                {
                  amount: 65000,
                  currency_code: "mnt",
                },
              ],
            },
            {
              title: "XL",
              sku: "SWEATPANTS-XL",
              options: {
                "Хэмжээ": "XL",
              },
              prices: [
                {
                  amount: 65000,
                  currency_code: "mnt",
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
        {
          title: "Богино өмд",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Бусад")!.id,
          ],
          description:
            "Зуны улиралд тохиромжтой богино өмд. Хөнгөн, тав тухтай.",
          handle: "shorts",
          weight: 400,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/shorts-vintage-front.png",
            },
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/shorts-vintage-back.png",
            },
          ],
          options: [
            {
              title: "Хэмжээ",
              values: ["S", "M", "L", "XL"],
            },
          ],
          variants: [
            {
              title: "S",
              sku: "SHORTS-S",
              options: {
                "Хэмжээ": "S",
              },
              prices: [
                {
                  amount: 35000,
                  currency_code: "mnt",
                },
              ],
            },
            {
              title: "M",
              sku: "SHORTS-M",
              options: {
                "Хэмжээ": "M",
              },
              prices: [
                {
                  amount: 35000,
                  currency_code: "mnt",
                },
              ],
            },
            {
              title: "L",
              sku: "SHORTS-L",
              options: {
                "Хэмжээ": "L",
              },
              prices: [
                {
                  amount: 35000,
                  currency_code: "mnt",
                },
              ],
            },
            {
              title: "XL",
              sku: "SHORTS-XL",
              options: {
                "Хэмжээ": "XL",
              },
              prices: [
                {
                  amount: 35000,
                  currency_code: "mnt",
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
      ],
    },
  });
  logger.info("Finished seeding product data.");

  logger.info("Seeding inventory levels.");

  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id"],
  });

  const inventoryLevels: CreateInventoryLevelInput[] = [];
  for (const inventoryItem of inventoryItems) {
    const inventoryLevel = {
      location_id: stockLocation.id,
      stocked_quantity: 1000000,
      inventory_item_id: inventoryItem.id,
    };
    inventoryLevels.push(inventoryLevel);
  }

  await createInventoryLevelsWorkflow(container).run({
    input: {
      inventory_levels: inventoryLevels,
    },
  });

  logger.info("Finished seeding inventory levels data.");
}
