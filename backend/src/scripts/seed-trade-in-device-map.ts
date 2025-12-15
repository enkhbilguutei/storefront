import fs from "node:fs"
import path from "node:path"
import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { TRADE_IN_MODULE } from "../modules/trade_in"

interface DeviceMapRow {
  tac_prefix: string
  brand?: string
  device_type?: string | null
  model_keyword: string
  priority?: number
  active?: boolean
  metadata?: Record<string, unknown>
}

const DEFAULT_DATASET: DeviceMapRow[] = [
  {
    tac_prefix: "35671081",
    brand: "apple",
    device_type: "iphone",
    model_keyword: "iphone 13 pro",
    priority: 20,
    metadata: { source: "sample" },
  },
  {
    tac_prefix: "35881501",
    brand: "apple",
    device_type: "iphone",
    model_keyword: "iphone 14 pro",
    priority: 18,
    metadata: { source: "sample" },
  },
  {
    tac_prefix: "35994461",
    brand: "apple",
    device_type: "iphone",
    model_keyword: "iphone 15 pro",
    priority: 18,
    metadata: { source: "sample" },
  },
]

function loadDataset(): DeviceMapRow[] {
  const dataPath = path.join(process.cwd(), "data", "trade-in-device-map.json")
  if (fs.existsSync(dataPath)) {
    const raw = fs.readFileSync(dataPath, "utf8")
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed as DeviceMapRow[]
  }
  return DEFAULT_DATASET
}

export default async function seedTradeInDeviceMap({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const tradeInService = container.resolve(TRADE_IN_MODULE)

  const rows = loadDataset()
  if (!rows.length) {
    logger.info("[TradeIn][SeedDeviceMap] No rows to seed")
    return
  }

  for (const row of rows) {
    const tac = (row.tac_prefix || "").trim()
    if (!tac) continue

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existing = await tradeInService.listTradeInDeviceMaps({ tac_prefix: tac }, { take: 1 }) as any[]
    if (existing?.[0]) {
      await tradeInService.updateTradeInDeviceMaps(existing[0].id, {
        tac_prefix: tac,
        brand: row.brand || "apple",
        device_type: row.device_type || null,
        model_keyword: row.model_keyword,
        priority: row.priority ?? 0,
        active: row.active ?? true,
        metadata: row.metadata,
      })
      logger.info(`[TradeIn][SeedDeviceMap] Updated mapping for TAC ${tac}`)
    } else {
      await tradeInService.createTradeInDeviceMaps({
        tac_prefix: tac,
        brand: row.brand || "apple",
        device_type: row.device_type || null,
        model_keyword: row.model_keyword,
        priority: row.priority ?? 0,
        active: row.active ?? true,
        metadata: row.metadata,
      })
      logger.info(`[TradeIn][SeedDeviceMap] Inserted mapping for TAC ${tac}`)
    }
  }

  logger.info("[TradeIn][SeedDeviceMap] Done")
}
