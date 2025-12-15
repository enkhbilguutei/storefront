import { MedusaService } from "@medusajs/framework/utils"
import TradeInRequest from "./models/trade-in-request"
import TradeInOffer from "./models/trade-in-offer"
import TradeInDeviceMap from "./models/trade-in-device-map"

class TradeInService extends MedusaService({
  TradeInRequest,
  TradeInOffer,
  TradeInDeviceMap,
}) {}

export default TradeInService
