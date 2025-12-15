import { model } from "@medusajs/framework/utils"

/**
 * Banner placement types for different sections of the storefront
 * Each type has a specific aspect ratio for consistent display
 */
export const BannerPlacement = {
  HERO: "hero",              // 16:6 - Main homepage carousel (wide)
  BENTO: "bento",            // 16:5 desktop, 3:4 mobile - Bento grid banners
  PRODUCT_GRID: "product_grid", // 4:5 - Product grid section banners (vertical)
} as const

export type BannerPlacementType = typeof BannerPlacement[keyof typeof BannerPlacement]

/**
 * Banner configuration with aspect ratios and recommended sizes
 * Frontend uses object-cover to auto-crop images to these ratios
 */
export const BannerConfig: Record<BannerPlacementType, {
  label: string
  aspectRatio: string
  recommended: { width: number; height: number }
  mobileRecommended: { width: number; height: number }
  description: string
}> = {
  hero: {
    label: "Үндсэн слайд",
    aspectRatio: "16/6",
    recommended: { width: 2200, height: 825 },
    mobileRecommended: { width: 1080, height: 1080 },
    description: "Нүүр хуудасны том слайд (Desktop: 16:6, Mobile: 1:1 дөрвөлжин)",
  },
  bento: {
    label: "Бенто баннер",
    aspectRatio: "16/5",
    recommended: { width: 1600, height: 500 },
    mobileRecommended: { width: 800, height: 1067 },
    description: "Бенто grid баннер (Desktop: 16:5, Mobile: 3:4)",
  },
  product_grid: {
    label: "Бүтээгдэхүүний grid баннер",
    aspectRatio: "4/5",
    recommended: { width: 800, height: 1000 },
    mobileRecommended: { width: 800, height: 1067 },
    description: "Бүтээгдэхүүний хэсэгт харагдах босоо баннер (Desktop: 4:5, Mobile: 3:4)",
  },
}

const Banner = model.define("banner", {
  id: model.id().primaryKey(),
  
  // Content
  title: model.text().nullable(),
  subtitle: model.text().nullable(),
  description: model.text().nullable(),
  image_url: model.text(),
  mobile_image_url: model.text().nullable(),
  link: model.text(),
  alt_text: model.text().nullable(),
  
  // Display settings
  placement: model.text(), // hero, bento, product_grid
  section: model.text().nullable(), // For product_grid: apple, gaming, ipad, etc.
  sort_order: model.number().default(0),
  is_active: model.boolean().default(true),
  dark_text: model.boolean().default(false),
  
  // Scheduling (optional)
  starts_at: model.dateTime().nullable(),
  ends_at: model.dateTime().nullable(),
  
  // Metadata for extensibility
  metadata: model.json().nullable(),
})

export default Banner
