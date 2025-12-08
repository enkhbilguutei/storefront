import type {
  SubscriberConfig,
  SubscriberArgs,
} from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { ICustomerModuleService } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";

export default async function saveCheckoutAddressHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const customerModuleService: ICustomerModuleService = container.resolve(Modules.CUSTOMER);

  try {
    // Fetch the order with addresses using Query Graph (correct for v2 cross-module)
    const { data: orders } = await query.graph({
      entity: "order",
      fields: ["*", "shipping_address.*", "customer.*"],
      filters: {
        id: data.id,
      },
    });

    if (!orders.length) {
      logger.info(`[SaveAddress] Order ${data.id} not found`);
      return;
    }

    const order = orders[0];

    if (!order.customer_id || !order.shipping_address) {
      logger.info(`[SaveAddress] Order ${data.id} has no customer or shipping address, skipping`);
      return;
    }

    // Check if customer already has this address
    const customer = await customerModuleService.retrieveCustomer(order.customer_id, {
      relations: ["addresses"],
    });

    const shippingAddr = order.shipping_address;
    
    // Check if address already exists (basic matching)
    const addressExists = customer.addresses?.some((addr: any) => 
      addr.address_1 === shippingAddr.address_1 &&
      addr.city === shippingAddr.city &&
      addr.province === shippingAddr.province
    );

    if (addressExists) {
      logger.info(`[SaveAddress] Address already exists for customer ${order.customer_id}`);
      return;
    }

    // Create new address for customer
    await customerModuleService.createCustomerAddresses({
      customer_id: order.customer_id,
      first_name: shippingAddr.first_name,
      last_name: shippingAddr.last_name,
      address_1: shippingAddr.address_1,
      address_2: shippingAddr.address_2,
      city: shippingAddr.city,
      province: shippingAddr.province,
      country_code: shippingAddr.country_code || "mn",
      phone: shippingAddr.phone,
      company: shippingAddr.company,
      postal_code: shippingAddr.postal_code,
    });

    logger.info(`[SaveAddress] Saved checkout address for customer ${order.customer_id}`);
  } catch (error) {
    logger.error(`[SaveAddress] Failed to save checkout address: ${error.message}`);
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
};
