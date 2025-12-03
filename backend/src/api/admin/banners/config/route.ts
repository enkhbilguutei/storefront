import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BannerConfig, BannerPlacement } from "../../../../modules/banner"

/**
 * GET /admin/banners/config
 * 
 * Returns banner configuration including placement types,
 * aspect ratios, and recommended sizes.
 */
export async function GET(
  _req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  res.json({
    placements: BannerPlacement,
    config: BannerConfig,
  })
}
