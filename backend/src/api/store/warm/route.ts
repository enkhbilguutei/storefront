import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";

/**
 * A lightweight endpoint to warm up database connections
 * Call this on page load to reduce cold start latency during checkout
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    // Simple query to warm the database connection
    const fulfillmentService = req.scope.resolve(Modules.FULFILLMENT);
    
    // Just list shipping options - lightweight query
    const options = await fulfillmentService.listShippingOptions({});
    
    res.json({ 
      status: "warm",
      timestamp: Date.now(),
      optionCount: options.length 
    });
  } catch (error) {
    // Still return success - we just want to warm the connection
    res.json({ 
      status: "warm",
      timestamp: Date.now(),
      error: "warmup query failed" 
    });
  }
}
