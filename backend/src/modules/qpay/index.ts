import QPayService from "./service"
import { Module } from "@medusajs/framework/utils"

export const QPAY_MODULE = "qpay"

export default Module(QPAY_MODULE, {
  service: QPayService,
})

export { QPayService }
export type { QPayInvoice, QPayPaymentStatus, QPayConfig } from "./types"
