import type {
  QPayConfig,
  QPayAuthResponse,
  QPayInvoiceCreateRequest,
  QPayInvoice,
  QPayPaymentStatus,
} from "./types"

// QPay API endpoints
const SANDBOX_BASE_URL = "https://merchant-sandbox.qpay.mn"
const PRODUCTION_BASE_URL = "https://merchant.qpay.mn"

type ModuleOptions = QPayConfig

type InjectedDependencies = Record<string, unknown>

export default class QPayService {
  private config_: QPayConfig
  private accessToken_: string | null = null
  private tokenExpiry_: number = 0
  private baseUrl_: string

  constructor(_: InjectedDependencies, options?: ModuleOptions) {
    this.config_ = {
      clientId: options?.clientId || process.env.QPAY_CLIENT_ID || "",
      clientSecret: options?.clientSecret || process.env.QPAY_CLIENT_SECRET || "",
      invoiceCode: options?.invoiceCode || process.env.QPAY_INVOICE_CODE || "",
      callbackUrl: options?.callbackUrl || process.env.QPAY_CALLBACK_URL || "",
      isSandbox: options?.isSandbox ?? (process.env.QPAY_SANDBOX !== "false"),
    }
    
    this.baseUrl_ = this.config_.isSandbox ? SANDBOX_BASE_URL : PRODUCTION_BASE_URL
  }

  /**
   * Check if QPay is properly configured
   */
  isConfigured(): boolean {
    return !!(
      this.config_.clientId &&
      this.config_.clientSecret &&
      this.config_.invoiceCode
    )
  }

  /**
   * Get configuration status for debugging
   */
  getConfigStatus(): { configured: boolean; isSandbox: boolean; hasCallbackUrl: boolean } {
    return {
      configured: this.isConfigured(),
      isSandbox: this.config_.isSandbox ?? true,
      hasCallbackUrl: !!this.config_.callbackUrl,
    }
  }

  /**
   * Authenticate with QPay API and get access token
   */
  private async authenticate(): Promise<string> {
    // Return cached token if still valid (with 60s buffer)
    if (this.accessToken_ && Date.now() < this.tokenExpiry_ - 60000) {
      return this.accessToken_
    }

    const credentials = Buffer.from(
      `${this.config_.clientId}:${this.config_.clientSecret}`
    ).toString("base64")

    const response = await fetch(`${this.baseUrl_}/v2/auth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${credentials}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`QPay authentication failed: ${response.status} - ${errorText}`)
    }

    const data: QPayAuthResponse = await response.json()
    
    this.accessToken_ = data.access_token
    // Set expiry time (expires_in is in seconds)
    this.tokenExpiry_ = Date.now() + data.expires_in * 1000
    
    return this.accessToken_
  }

  /**
   * Make authenticated request to QPay API
   */
  private async request<T>(
    endpoint: string,
    method: "GET" | "POST" | "DELETE" = "GET",
    body?: Record<string, unknown>
  ): Promise<T> {
    const token = await this.authenticate()
    
    const options: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }

    if (body) {
      options.body = JSON.stringify(body)
    }

    const response = await fetch(`${this.baseUrl_}${endpoint}`, options)

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`QPay API error: ${response.status} - ${errorText}`)
    }

    return response.json()
  }

  /**
   * Create a new QPay invoice
   */
  async createInvoice(params: {
    orderId: string
    amount: number
    description: string
    customerInfo?: {
      register?: string
      name?: string
      email?: string
      phone?: string
    }
    lineItems?: Array<{
      description: string
      quantity: number
      unitPrice: number
    }>
  }): Promise<QPayInvoice> {
    const request: QPayInvoiceCreateRequest = {
      invoice_code: this.config_.invoiceCode,
      sender_invoice_no: params.orderId,
      invoice_receiver_code: "terminal",
      invoice_description: params.description,
      amount: params.amount,
      callback_url: `${this.config_.callbackUrl}?order_id=${params.orderId}`,
    }

    // Add customer info if provided
    if (params.customerInfo) {
      request.invoice_receiver_data = {
        register: params.customerInfo.register,
        name: params.customerInfo.name,
        email: params.customerInfo.email,
        phone: params.customerInfo.phone,
      }
    }

    // Add line items if provided
    if (params.lineItems?.length) {
      request.lines = params.lineItems.map((item) => ({
        line_description: item.description,
        line_quantity: item.quantity,
        line_unit_price: item.unitPrice,
      }))
    }

    return this.request<QPayInvoice>("/v2/invoice", "POST", request as unknown as Record<string, unknown>)
  }

  /**
   * Get payment status by payment ID
   */
  async getPaymentStatus(paymentId: string): Promise<QPayPaymentStatus> {
    return this.request<QPayPaymentStatus>(`/v2/payment/${paymentId}`)
  }

  /**
   * Check invoice payment status
   * Note: QPay recommends using callback URL instead of polling
   */
  async checkInvoice(invoiceId: string): Promise<QPayPaymentStatus> {
    return this.request<QPayPaymentStatus>(`/v2/payment/check`, "POST", {
      object_type: "INVOICE",
      object_id: invoiceId,
    })
  }

  /**
   * Cancel/delete an invoice
   */
  async cancelInvoice(invoiceId: string): Promise<void> {
    await this.request(`/v2/invoice/${invoiceId}`, "DELETE")
  }

  /**
   * Verify callback signature (for webhook security)
   * In production, you should verify the callback is from QPay
   */
  verifyCallback(paymentId: string, qpayPaymentId: string): boolean {
    // In sandbox mode, we trust all callbacks
    // In production, implement proper signature verification
    return !!(paymentId && qpayPaymentId)
  }
}
