/**
 * QPay V2 API Types
 * Based on QPay sandbox documentation
 */

export interface QPayConfig {
  clientId: string;
  clientSecret: string;
  invoiceCode: string;
  callbackUrl: string;
  isSandbox?: boolean;
}

export interface QPayAuthResponse {
  token_type: string;
  refresh_expires_in: number;
  refresh_token: string;
  access_token: string;
  expires_in: number;
  scope: string;
  not_before_policy: number;
  session_state: string;
}

export interface QPayInvoiceCreateRequest {
  invoice_code: string;
  sender_invoice_no: string;
  invoice_receiver_code: string;
  invoice_description: string;
  amount: number;
  callback_url: string;
  sender_branch_code?: string;
  sender_staff_code?: string;
  note?: string;
  allow_partial?: boolean;
  allow_exceed?: boolean;
  invoice_receiver_data?: {
    register?: string;
    name?: string;
    email?: string;
    phone?: string;
  };
  lines?: Array<{
    line_description: string;
    line_quantity: number;
    line_unit_price: number;
    tax_product_code?: string;
    note?: string;
    discount?: {
      description: string;
      amount: number;
    };
    surcharge?: {
      description: string;
      amount: number;
    };
  }>;
}

export interface QPayInvoiceUrl {
  name: string;
  description: string;
  logo: string;
  link: string;
}

export interface QPayInvoice {
  invoice_id: string;
  qr_text: string;
  qr_image: string;
  qPay_shortUrl: string;
  urls: QPayInvoiceUrl[];
}

export type QPayPaymentStatusType = 
  | "NEW"        // Invoice created
  | "FAILED"     // Payment failed
  | "PAID"       // Payment successful
  | "PARTIAL"    // Partially paid
  | "REFUNDED";  // Payment refunded

export interface QPayCardTransaction {
  card_merchant_code: string;
  card_terminal_code: string;
  card_number: string;
  card_type: string;
  is_cross_border: boolean;
  transaction_amount: string;
  transaction_currency: string;
  transaction_date: string;
  transaction_status: string;
  settlement_status: string;
  settlement_status_date: string;
}

export interface QPayP2PTransaction {
  transaction_bank_code: string;
  account_bank_code: string;
  account_bank_name: string;
  account_number: string;
  status: string;
  amount: string;
  currency: string;
  settlement_status: string;
}

export interface QPayPaymentStatus {
  payment_id: string;
  payment_status: QPayPaymentStatusType;
  payment_fee: string;
  payment_amount: string;
  payment_currency: string;
  payment_date: string;
  payment_wallet: string;
  object_type: string;
  object_id: string;
  next_payment_date: string | null;
  next_payment_datetime: string | null;
  transaction_type: "P2P" | "CARD";
  card_transactions: QPayCardTransaction[];
  p2p_transactions: QPayP2PTransaction[];
}

export interface QPayCallbackPayload {
  payment_id: string;
  qpay_payment_id: string;
}
