import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import type QPayService from "../../../modules/qpay/service"
import { QPAY_MODULE } from "../../../modules/qpay"

/**
 * GET /store/qpay
 * 
 * Check QPay configuration status
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const qpayService = req.scope.resolve<QPayService>(QPAY_MODULE)
    const status = qpayService.getConfigStatus()

    res.json({
      available: status.configured,
      sandbox_mode: status.isSandbox,
    })
  } catch (error) {
    // If module is not loaded, QPay is not available
    res.json({
      available: false,
      sandbox_mode: true,
    })
  }
}
