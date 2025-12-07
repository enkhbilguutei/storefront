import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import type QPayService from "../../../../modules/qpay/service"
import { QPAY_MODULE } from "../../../../modules/qpay"

/**
 * POST /store/qpay/create-invoice
 * 
 * Creates a QPay invoice for an order
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const qpayService = req.scope.resolve<QPayService>(QPAY_MODULE)
    
    // Check if QPay is configured
    if (!qpayService.isConfigured()) {
      res.status(503).json({
        error: "QPay is not configured. Please contact support.",
        code: "QPAY_NOT_CONFIGURED",
      })
      return
    }

    const { 
      order_id, 
      amount, 
      description,
      customer_name,
      customer_email,
      customer_phone,
      line_items 
    } = req.body as {
      order_id: string
      amount: number
      description?: string
      customer_name?: string
      customer_email?: string
      customer_phone?: string
      line_items?: Array<{
        description: string
        quantity: number
        unit_price: number
      }>
    }

    if (!order_id || !amount) {
      res.status(400).json({
        error: "order_id and amount are required",
        code: "INVALID_REQUEST",
      })
      return
    }

    const invoice = await qpayService.createInvoice({
      orderId: order_id,
      amount,
      description: description || `Захиалга #${order_id}`,
      customerInfo: {
        name: customer_name,
        email: customer_email,
        phone: customer_phone,
      },
      lineItems: line_items?.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unit_price,
      })),
    })

    res.json({
      success: true,
      invoice: {
        invoice_id: invoice.invoice_id,
        qr_text: invoice.qr_text,
        qr_image: invoice.qr_image,
        short_url: invoice.qPay_shortUrl,
        urls: invoice.urls,
      },
    })
  } catch (error) {
    console.error("[QPay] Error creating invoice:", error)
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to create QPay invoice",
      code: "QPAY_ERROR",
    })
  }
}
