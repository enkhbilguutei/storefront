import { MedusaService } from "@medusajs/framework/utils"
import Banner from "./models/banner"

class BannerModuleService extends MedusaService({
  Banner,
}) {
  /**
   * List banners with optional filtering by placement
   * Automatically filters by is_active and date range
   */
  async listActiveBanners(
    placement?: string,
    config?: { 
      skip?: number
      take?: number
      order?: Record<string, "ASC" | "DESC">
    }
  ) {
    const now = new Date()
    
    const filters: Record<string, unknown> = {
      is_active: true,
    }
    
    if (placement) {
      filters.placement = placement
    }
    
    const banners = await this.listBanners(filters, {
      ...config,
      order: config?.order || { sort_order: "ASC" },
    })
    
    // Filter by date range in memory (Medusa doesn't support complex date queries)
    return banners.filter((banner) => {
      const startsAt = banner.starts_at ? new Date(banner.starts_at) : null
      const endsAt = banner.ends_at ? new Date(banner.ends_at) : null
      
      if (startsAt && now < startsAt) return false
      if (endsAt && now > endsAt) return false
      
      return true
    })
  }
}

export default BannerModuleService
