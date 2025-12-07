import { ExecArgs } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";

export default async function resetStore({ container }: ExecArgs) {
  const logger = container.resolve("logger");
  const orderService = container.resolve(Modules.ORDER);
  const customerService = container.resolve(Modules.CUSTOMER);
  const cartService = container.resolve(Modules.CART);
  const authService = container.resolve(Modules.AUTH);

  logger.info("Starting store reset...");

  // 1. Delete Orders
  logger.info("Deleting orders...");
  const orders = await orderService.listOrders({});
  if (orders.length > 0) {
    await orderService.deleteOrders(orders.map((o) => o.id));
    logger.info(`Deleted ${orders.length} orders.`);
  } else {
    logger.info("No orders found.");
  }

  // 2. Delete Carts
  logger.info("Deleting carts...");
  const carts = await cartService.listCarts({});
  if (carts.length > 0) {
    await cartService.deleteCarts(carts.map((c) => c.id));
    logger.info(`Deleted ${carts.length} carts.`);
  } else {
    logger.info("No carts found.");
  }

  // 3. Delete Customers
  logger.info("Deleting customers...");
  const customers = await customerService.listCustomers({});
  if (customers.length > 0) {
    await customerService.deleteCustomers(customers.map((c) => c.id));
    logger.info(`Deleted ${customers.length} customers.`);
  } else {
    logger.info("No customers found.");
  }

  // 4. Delete Auth Identities (only those with customer_id in metadata or emailpass provider that are not admin)
  // Be careful not to delete admin users. Admin users are usually in Modules.USER.
  // We can check app_metadata for customer_id.
  logger.info("Deleting customer auth identities...");
  const identities = await authService.listAuthIdentities({});
  const customerIdentities = identities.filter(
    (identity) => identity.app_metadata?.customer_id
  );

  if (customerIdentities.length > 0) {
    await authService.deleteAuthIdentities(customerIdentities.map((i) => i.id));
    logger.info(`Deleted ${customerIdentities.length} customer auth identities.`);
  } else {
    logger.info("No customer auth identities found.");
  }

  logger.info("Store reset complete.");
}
