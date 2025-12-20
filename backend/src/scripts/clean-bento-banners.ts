import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { BANNER_MODULE } from "../modules/banner/index"

/**
 * Clean up all bento_grid banners
 * Run: pnpm exec medusa exec ./src/scripts/clean-bento-banners.ts
 */
export default async function ({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const bannerService = container.resolve(BANNER_MODULE)

  logger.info("🧹 Cleaning up bento_grid banners...")

  try {
    // Get all bento_grid banners
    const banners = await bannerService.listBanners({
      placement: "bento_grid"
    })

    if (banners.length === 0) {
      logger.info("✅ No bento_grid banners to delete")
      return
    }

    // Delete all bento_grid banners
    const ids = banners.map(b => b.id)
    await bannerService.deleteBanners(ids)

    logger.info(`✅ Deleted ${banners.length} bento_grid banners`)
    logger.info("Now upload new banners using the Bento Grid (5) interface")
  } catch (error) {
    logger.error("❌ Failed to clean banners:", error)
    throw error
  }
}
