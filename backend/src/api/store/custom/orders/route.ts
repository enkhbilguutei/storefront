import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { AuthenticatedMedusaRequest } from "../../../../types/api";

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const authContext = (req as AuthenticatedMedusaRequest).auth_context;
    
    if (!authContext?.actor_id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    console.log(`[Orders] Fetching orders for customer: ${authContext.actor_id}`);

    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

    const { data: orders, metadata } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "display_id",
        "status",
        "created_at",
        "total",
        "currency_code",
        "metadata",
        "items.*",
        "items.variant.product.title",
        "items.variant.product.thumbnail",
        "fulfillments.*",
        "payment_collections.*"
      ],
      filters: {
        customer_id: authContext.actor_id
      },
      pagination: {
        take: parseInt(req.query.limit as string) || 10,
        skip: parseInt(req.query.offset as string) || 0,
        order: { created_at: "DESC" }
      }
    });
    
    console.log(`[Orders] Found ${orders.length} orders`);

    const mappedOrders = orders.map((order: any) => {
        // Calculate total from items if 0
        let calculatedTotal = order.total || 0;
        const items = order.items || [];
        
        if (calculatedTotal === 0 && items.length > 0) {
           items.forEach((item: any) => {
             const itemPrice = item.unit_price || item.subtotal || 0;
             const quantity = item.quantity || 1;
             calculatedTotal += itemPrice * quantity;
           });
        }
        
        const mappedItems = items.map((item: any) => {
          return {
            ...item,
            thumbnail: item.thumbnail || item.variant?.product?.thumbnail,
            product_title: item.product_title || item.variant?.product?.title || item.title,
          };
        });
        
        // Extract payment method from order metadata
        let paymentMethod = null;
        if (order.metadata?.payment_method) {
          paymentMethod = order.metadata.payment_method;
        }

        // Derive Payment Status
        let paymentStatus = "awaiting_payment";
        const paymentCollections = order.payment_collections || [];
        if (paymentCollections.length > 0) {
          const pc = paymentCollections[paymentCollections.length - 1];
          paymentStatus = pc.status;
        }

        // Derive Fulfillment Status
        let fulfillmentStatus = "not_fulfilled";
        const fulfillments = order.fulfillments || [];
        if (fulfillments.length > 0) {
          const isDelivered = fulfillments.some((f: any) => !!f.delivered_at);
          const isShipped = fulfillments.some((f: any) => !!f.shipped_at);
          const isCanceled = fulfillments.every((f: any) => f.canceled_at);
          
          if (isCanceled) {
              fulfillmentStatus = "canceled";
          } else if (isDelivered) {
              fulfillmentStatus = "delivered";
          } else if (isShipped) {
              fulfillmentStatus = "shipped";
          } else {
              fulfillmentStatus = "fulfilled"; // Created/Packed but not shipped
          }
        } else if (order.status === "canceled") {
          fulfillmentStatus = "canceled";
        }
        
        return {
          ...order,
          items: mappedItems,
          total: calculatedTotal,
          payment_method: paymentMethod,
          payment_status: paymentStatus,
          fulfillment_status: fulfillmentStatus
        };
    });

    return res.json({ 
      orders: mappedOrders, 
      count: metadata?.count || orders.length,
      offset: metadata?.skip || 0,
      limit: metadata?.take || 10
    });
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return res.status(500).json({ 
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" 
        ? (error instanceof Error ? error.message : "Unknown error")
        : "Failed to fetch orders"
    });
  }
}
