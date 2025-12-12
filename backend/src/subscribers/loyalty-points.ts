import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils";

/**
 * Subscriber that awards loyalty points when an order is completed
 * Points calculation: Base 1₮ = 1 point, with tier multipliers
 * - Bronze: 1x (1₮ = 1 point)
 * - Silver: 1x (1₮ = 1 point)
 * - Gold: 1.5x (1₮ = 1.5 points)
 */
export default async function loyaltyPointsHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const loyaltyService = container.resolve("loyalty");
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  try {
    // Fetch order with customer relation
    const { data: orders } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "display_id",
        "total",
        "customer_id",
        "email",
      ],
      filters: {
        id: data.id,
      },
    });

    const order = orders?.[0];
    if (!order) {
      logger.warn(`Order ${data.id} not found for loyalty points`);
      return;
    }

    // Only award points for orders with customer_id
    if (!order.customer_id) {
      logger.info(`Order ${order.display_id} has no customer_id, skipping loyalty points`);
      return;
    }

    // Get or create loyalty account to check current tier
    const account = await loyaltyService.getOrCreateAccount(order.customer_id);
    
    // Calculate points based on order total and tier
    const points = loyaltyService.calculatePointsForAmount(order.total, account.tier as any);
    
    if (points <= 0) {
      logger.info(`Order ${order.display_id} total ${order.total} results in 0 points, skipping`);
      return;
    }

    // Award points
    const result = await loyaltyService.awardPoints(
      order.customer_id,
      points,
      {
        reason: "purchase",
        order_id: order.id,
        metadata: {
          order_display_id: order.display_id,
          order_total: order.total,
        },
      }
    );

    logger.info(
      `Awarded ${points} loyalty points to customer ${order.customer_id} for order ${order.display_id}. ` +
      `New balance: ${result.account.points_balance}. Tier upgraded: ${result.tierUpgraded}`
    );

    // TODO: If tier upgraded, send tier upgrade email notification
    if (result.tierUpgraded) {
      logger.info(
        `Customer ${order.customer_id} upgraded to tier ${result.account.tier}!`
      );
      // Future: Emit event for tier upgrade email
      // container.resolve("eventBus").emit("loyalty.tier_upgraded", {
      //   customer_id: order.customer_id,
      //   new_tier: result.account.tier,
      // });
    }
  } catch (error) {
    logger.error(`Error awarding loyalty points for order ${data.id}: ${error}`);
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
};
