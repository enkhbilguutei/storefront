import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import type QPayService from "../../../../modules/qpay/service"
import { QPAY_MODULE } from "../../../../modules/qpay"
import type { QPayCallbackPayload } from "../../../../modules/qpay/types"
import { validateBody, qpayCallbackSchema, formatValidationErrors } from "../../../validations"

/**
 * POST /store/qpay/callback
 * 
 * QPay payment callback endpoint
 * This is called by QPay when a payment is completed
 * 
 * IMPORTANT: Don't use this for polling! Use callback URLs only as per QPay guidelines.
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const qpayService = req.scope.resolve<QPayService>(QPAY_MODULE)
    
    if (!qpayService.isConfigured()) {
      res.status(503).json({ error: "QPay not configured" })
      return
    }

    // Get order_id from query params (we append it to callback_url)
    const orderId = req.query.order_id as string
    
    // Get payment info from body (sent by QPay)
    const { payment_id, qpay_payment_id } = req.body as QPayCallbackPayload

    console.log("[QPay Callback] Received:", {
      order_id: orderId,
      payment_id,
      qpay_payment_id,
    })

    // Get payment status from QPay
    const paymentStatus = await qpayService.getPaymentStatus(payment_id)
    const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)

    console.log("[QPay Callback] Payment status:", {
      status: paymentStatus.payment_status,
      amount: paymentStatus.payment_amount,
    })

    // Handle based on payment status
    if (paymentStatus.payment_status === "PAID") {
      // Payment successful!
      // TODO: Update order payment status in Medusa
      // This would typically:
      // 1. Find the order by orderId
      // 2. Mark payment as captured
      // 3. Update order status
      
      logger.info(`[QPay Callback] Payment PAID for order ${orderId}`)
      
      // For now, just log and return success
      // In production, implement order status update
      res.json({
        success: true,
        message: "Payment recorded",
        order_id: orderId,
        payment_status: paymentStatus.payment_status,
      })
      return
    }

    if (paymentStatus.payment_status === "PARTIAL") {
      logger.info(`[QPay Callback] Partial payment for order ${orderId}`)
      res.json({
        success: true,
        message: "Partial payment recorded",
        order_id: orderId,
        payment_status: paymentStatus.payment_status,
      })
      return
    }

    if (paymentStatus.payment_status === "FAILED") {
      console.log(`[QPay Callback] Payment FAILED for order ${orderId}`)
      res.json({
        success: false,
        message: "Payment failed",
        order_id: orderId,
        payment_status: paymentStatus.payment_status,
      })
      return
    }

    // Other statuses (NEW, REFUNDED)
    res.json({
      success: true,
      message: "Status recorded",
      order_id: orderId,
      payment_status: paymentStatus.payment_status,
    })
  } catch (error) {
    console.error("[QPay Callback] Error:", error)
    // Always return 200 to QPay to avoid retries
    res.json({
      success: false,
      error: error instanceof Error ? error.message : "Callback processing failed",
    })
  }
}

/**
 * GET /store/qpay/callback
 * 
 * Used for redirect after payment (user returns to this URL)
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const orderId = req.query.order_id as string
  
  // Redirect user to the confirmation page
  const frontendUrl = process.env.STORE_CORS?.split(",")[0] || "http://localhost:3000"
  res.redirect(`${frontendUrl}/checkout/confirmation?order_id=${orderId}&payment_method=qpay`)
}
