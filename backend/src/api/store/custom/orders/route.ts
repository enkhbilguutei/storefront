import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";
import { IOrderModuleService } from "@medusajs/framework/types";
import { AuthenticatedMedusaRequest } from "../../../../types/api";

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const authContext = (req as AuthenticatedMedusaRequest).auth_context;
  
  if (!authContext?.actor_id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const orderModuleService: IOrderModuleService = req.scope.resolve(Modules.ORDER);
  
  try {
    console.log("[Orders API] Fetching orders for customer:", authContext.actor_id);
    
    const [orders, count] = await orderModuleService.listAndCount({
      customer_id: authContext.actor_id
    }, {
      order: { created_at: "DESC" },
      take: parseInt(req.query.limit as string) || 10,
      skip: parseInt(req.query.offset as string) || 0,
      relations: ["items", "summary"]
    });
    
    console.log(`[Orders API] Found ${count} orders`);
    
    const mappedOrders = orders.map((order: any) => {
      console.log(`[Orders API] Processing order ${order.id}:`, {
        display_id: order.display_id,
        has_summary: !!order.summary,
        current_order_total: order.summary?.current_order_total,
        total: order.total,
        subtotal: order.subtotal,
        item_total: order.item_total,
        shipping_total: order.shipping_total,
        metadata: order.metadata,
      });
      
      // Order has total fields directly - use those
      const total = order.total ?? order.summary?.current_order_total ?? 0;
      
      console.log(`[Orders API] Calculated total for order #${order.display_id}: ${total}`);
      
      // Extract payment method from order metadata
      let paymentMethod = null;
      
      // Check order metadata
      if (order.metadata?.payment_method) {
        paymentMethod = order.metadata.payment_method;
      }
      
      // Map items - keep them simple for now
      const mappedItems = order.items || [];
      
      return {
        ...order,
        items: mappedItems,
        total,
        payment_method: paymentMethod
      };
    });
    
    return res.json({ 
      orders: mappedOrders, 
      count,
      offset: parseInt(req.query.offset as string) || 0,
      limit: parseInt(req.query.limit as string) || 10
    });
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return res.status(500).json({ 
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
