import { Module } from "@medusajs/framework/utils"
import TradeInService from "./service"

export const TRADE_IN_MODULE = "trade_in"

export default Module(TRADE_IN_MODULE, {
  service: TradeInService,
})
