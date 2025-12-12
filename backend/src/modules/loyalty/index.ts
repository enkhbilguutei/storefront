import LoyaltyModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const LOYALTY_MODULE = "loyalty"

export default Module(LOYALTY_MODULE, {
  service: LoyaltyModuleService,
})

export { LoyaltyTiers, TierConfig, TransactionType, type LoyaltyTierType } from "./models/loyalty"
