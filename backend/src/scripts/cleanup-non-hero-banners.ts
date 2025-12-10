import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { BANNER_MODULE } from "../modules/banner"
import type BannerModuleService from "../modules/banner/service"

/**
 * Remove all non-hero banners from the database
 * Keeps only banners with placement='hero'
 */
export default async function cleanupNonHeroBanners({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const bannerService = container.resolve<BannerModuleService>(BANNER_MODULE)

  try {
    logger.info("Starting cleanup of non-hero banners...")

    // Get all non-hero banners
    const { data: banners } = await query.graph({
      entity: "banner",
      fields: ["id", "title", "placement"],
      filters: {
        placement: {
          $nin: ["hero"], // Not in hero
        },
      },
    })

    if (banners.length === 0) {
      logger.info("No non-hero banners found. Database is already clean.")
      return
    }

    logger.info(`Found ${banners.length} non-hero banners to delete:`)
    banners.forEach((banner: any) => {
      logger.info(`  - ${banner.title || "Untitled"} (${banner.placement})`)
    })

    // Delete non-hero banners using the banner module service
    const bannerIds = banners.map((b: any) => b.id)
    await bannerService.deleteBanners(bannerIds)

    logger.info(`✓ Successfully deleted ${banners.length} non-hero banners`)
    logger.info("Cleanup complete! Only hero banners remain.")

    // Show remaining hero banners
    const { data: heroBanners } = await query.graph({
      entity: "banner",
      fields: ["id", "title", "placement", "sort_order"],
      filters: {
        placement: "hero",
      },
    })

    if (heroBanners.length > 0) {
      logger.info(`\nRemaining hero banners (${heroBanners.length}):`)
      heroBanners.forEach((banner: any) => {
        logger.info(`  - ${banner.title || "Untitled"} (order: ${banner.sort_order})`)
      })
    } else {
      logger.warn("\nNo hero banners found. Consider adding some via the admin dashboard.")
    }
  } catch (error) {
    logger.error("Failed to cleanup banners:", error)
    throw error
  }
}
