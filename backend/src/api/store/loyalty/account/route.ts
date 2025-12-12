import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { LOYALTY_MODULE } from "../../../../modules/loyalty";
import type LoyaltyModuleService from "../../../../modules/loyalty/service";

/**
 * GET /store/loyalty/account
 * 
 * Get the authenticated customer's loyalty account
 * Requires authentication
 * 
 * Response: { account: LoyaltyAccount, tierInfo: TierInfo }
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
    
    // Get or create account
    const account = await loyaltyService.getOrCreateAccount(customerId);
    
    // Get tier info
    const tierInfo = loyaltyService.getTierInfo(account);
    
    res.json({ 
      account,
      tierInfo,
    });
  } catch (error) {
    console.error("[Loyalty] Failed to fetch loyalty account:", error);
    res.status(500).json({ 
      message: "Failed to fetch loyalty account",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
