import ProductAnalyticsModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const PRODUCT_ANALYTICS_MODULE = "product_analytics"

export default Module(PRODUCT_ANALYTICS_MODULE, {
  service: ProductAnalyticsModuleService,
})
