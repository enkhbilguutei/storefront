import { model } from "@medusajs/framework/utils"

/**
 * Banner placement types for different sections of the storefront
 * Each type has a specific aspect ratio for consistent display
 */
export const BannerPlacement = {
  HERO: "hero",              // 16:6 - Main homepage carousel (wide)
  IPHONE: "iphone",          // 16:10 - iPhone product banners (2-column grid)
  DJI_LARGE: "dji_large",    // 4:3 - DJI bento large card (spans 2 cols)
  DJI_SMALL: "dji_small",    // 4:3 - DJI bento small cards
  PROMO: "promo",            // 3:1 - Long promotional banner
  MOBILE_HERO: "mobile_hero", // 9:16 - Mobile-optimized hero
  SQUARE: "square",          // 1:1 - Square tile banners
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
  description: string
}> = {
  hero: {
    label: "Үндсэн слайд",
    aspectRatio: "16/6",
    recommended: { width: 2200, height: 825 },
    description: "Нүүр хуудасны том слайд",
  },
  iphone: {
    label: "iPhone баннер",
    aspectRatio: "1/1",
    recommended: { width: 2000, height: 2000 },
    description: "2 баганат iPhone баннер",
  },
  dji_large: {
    label: "DJI том карт",
    aspectRatio: "4/3",
    recommended: { width: 1200, height: 900 },
    description: "DJI бенто том зураг (2 багана)",
  },
  dji_small: {
    label: "DJI жижиг карт",
    aspectRatio: "4/3",
    recommended: { width: 800, height: 600 },
    description: "DJI бенто жижиг зураг",
  },
  promo: {
    label: "Промо баннер",
    aspectRatio: "3/1",
    recommended: { width: 2400, height: 800 },
    description: "Урт промо баннер",
  },
  mobile_hero: {
    label: "Мобайл слайд",
    aspectRatio: "9/16",
    recommended: { width: 1080, height: 1920 },
    description: "Гар утасны босоо слайд",
  },
  square: {
    label: "Дөрвөлжин",
    aspectRatio: "1/1",
    recommended: { width: 1200, height: 1200 },
    description: "Дөрвөлжин баннер",
  },
}

const Banner = model.define("banner", {
  id: model.id().primaryKey(),
  
  // Content
  title: model.text().nullable(),
  subtitle: model.text().nullable(),
  description: model.text().nullable(),
  image_url: model.text(),
  link: model.text(),
  alt_text: model.text().nullable(),
  
  // Display settings
  placement: model.text(), // hero, iphone, dji, promo
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
