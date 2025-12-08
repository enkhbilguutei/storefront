import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import EmailNotificationService from "../modules/email-notifications/service";
import { EMAIL_NOTIFICATION_MODULE } from "../modules/email-notifications";

export default async function emailNotificationSubscriber({
  event: { data, name },
  container,
}: SubscriberArgs<any>) {
  const emailService: EmailNotificationService = container.resolve(EMAIL_NOTIFICATION_MODULE);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  if (name === "order.created" || name === "order.placed") {
    console.log(`[EmailSubscriber] Processing ${name} for ID: ${data.id}`);
    const { data: orders } = await query.graph({
      entity: "order",
      fields: [
        "*", 
        "items.*", 
        "items.variant.product.thumbnail",
        "items.variant.product.title",
        "shipping_address.*", 
        "email", 
        "display_id", 
        "total", 
        "currency_code"
      ],
      filters: {
        id: data.id,
      },
    });

    if (orders.length > 0) {
      const order = orders[0];
      console.log(`[EmailSubscriber] Found order ${order.display_id}. Email: ${order.email}`);
      await emailService.sendOrderPlaced(order);
    } else {
      console.warn(`[EmailSubscriber] Order not found for ID: ${data.id}`);
    }
  } else if (name === "fulfillment.created") {
    // We need to find the order associated with this fulfillment
    // In Medusa v2, we can try to query the order via the fulfillment link if it exists in the graph
    // Or we can query the fulfillment and see if it has order_id
    
    const { data: fulfillments } = await query.graph({
      entity: "fulfillment",
      fields: ["*", "items.*"],
      filters: {
        id: data.id,
      },
    });

    if (fulfillments.length > 0) {
      const fulfillment = fulfillments[0];
      // Assuming fulfillment has order_id or we can find the order
      // If fulfillment is linked to order, we might be able to query order by fulfillment id
      // But for now, let's try to see if we can get the order_id from fulfillment object
      // Note: In v2, links are stored in a separate table.
      
      // We can try to query order that has this fulfillment
      const { data: orders } = await query.graph({
        entity: "order",
        fields: [
          "*", 
          "items.*", 
          "items.variant.product.thumbnail",
          "items.variant.product.title",
          "shipping_address.*", 
          "email", 
          "display_id"
        ],
        filters: {
            fulfillments: {
                id: data.id
            }
        },
      });
      
      if (orders.length > 0) {
          await emailService.sendOrderShipped(orders[0], fulfillment);
      }
    }
  }
}

export const config: SubscriberConfig = {
  event: ["order.created", "order.placed", "fulfillment.created"],
};
