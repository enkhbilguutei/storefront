import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { LOYALTY_MODULE } from "../../../../modules/loyalty";
import type LoyaltyModuleService from "../../../../modules/loyalty/service";

/**
 * GET /store/loyalty/transactions
 * 
 * Get the authenticated customer's loyalty transaction history
 * Requires authentication
 * 
 * Query params:
 *   - skip: Number of records to skip (pagination)
 *   - take: Number of records to take (default: 50)
 * 
 * Response: { transactions: LoyaltyTransaction[] }
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    // Get customer ID from auth context
    const customerId = (req as any).auth_context?.actor_id;
    if (!customerId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const loyaltyService = req.scope.resolve<LoyaltyModuleService>(LOYALTY_MODULE);
    
    // Parse query params
    const skip = req.query.skip ? parseInt(req.query.skip as string) : 0;
    const take = req.query.take ? parseInt(req.query.take as string) : 50;
    
    // Get transactions
    const transactions = await loyaltyService.getAccountTransactions(
      customerId,
      { skip, take }
    );
    
    res.json({ transactions });
  } catch (error) {
    console.error("Failed to fetch loyalty transactions:", error);
    res.status(500).json({ 
      message: "Failed to fetch loyalty transactions",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
