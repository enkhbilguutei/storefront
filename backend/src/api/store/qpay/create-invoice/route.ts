import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import type QPayService from "../../../../modules/qpay/service"
import { QPAY_MODULE } from "../../../../modules/qpay"
import { validateBody, createQPayInvoiceSchema, formatValidationErrors } from "../../../validations"

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

    const validation = validateBody(createQPayInvoiceSchema, req.body);
  
    if (!validation.success) {
      res.status(400).json({ 
        error: "Validation failed",
        errors: formatValidationErrors(validation.errors)
      });
      return
    }

    const { 
      order_id, 
      amount, 
      description,
      customer_email,
      customer_phone
    } = validation.data;
    
    const customer_name = (req.body as any).customer_name;
    const line_items = (req.body as any).line_items;

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
