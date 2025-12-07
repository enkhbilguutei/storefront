import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import type QPayService from "../../../../../modules/qpay/service"
import { QPAY_MODULE } from "../../../../../modules/qpay"

/**
 * GET /store/qpay/check-payment/:payment_id
 * 
 * Check the status of a QPay payment
 * Note: QPay recommends using callbacks instead of polling
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const qpayService = req.scope.resolve<QPayService>(QPAY_MODULE)
    
    if (!qpayService.isConfigured()) {
      res.status(503).json({
        error: "QPay is not configured",
        code: "QPAY_NOT_CONFIGURED",
      })
      return
    }

    const { payment_id } = req.params as { payment_id: string }

    if (!payment_id) {
      res.status(400).json({
        error: "payment_id is required",
        code: "INVALID_REQUEST",
      })
      return
    }

    const status = await qpayService.getPaymentStatus(payment_id)

    res.json({
      success: true,
      payment: {
        payment_id: status.payment_id,
        status: status.payment_status,
        amount: parseFloat(status.payment_amount),
        fee: parseFloat(status.payment_fee),
        currency: status.payment_currency,
        date: status.payment_date,
        transaction_type: status.transaction_type,
      },
    })
  } catch (error) {
    console.error("[QPay] Error checking payment:", error)
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to check payment status",
      code: "QPAY_ERROR",
    })
  }
}
