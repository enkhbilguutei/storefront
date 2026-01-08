import { model } from "@medusajs/framework/utils"

/**
 * Banner placement types for different sections of the storefront
 * Each type has a specific aspect ratio for consistent display
 */
export const BannerPlacement = {
  HERO: "hero",              // 16:6 - Main homepage carousel (wide)
  BENTO: "bento",            // 16:5 desktop, 3:4 mobile - Single wide banner (legacy)
  BENTO_GRID: "bento_grid",  // Multi-tile bento grid layout
  PRODUCT_GRID: "product_grid", // 4:5 - Product grid section banners (vertical)
} as const

export type BannerPlacementType = typeof BannerPlacement[keyof typeof BannerPlacement]

/**
 * Grid size options for bento_grid placement
 * Fixed 5-banner Walmart-style layout:
 * Position 1: 3×3 large left square
 * Position 2-4: 1×1 small middle tiles
 * Position 5: 2×3 tall right banner
 */
export const GridSize = {
  LARGE_LEFT: "3x3",      // Position 1: Large left square (3 cols × 3 rows)
  SMALL_MIDDLE: "1x1",    // Positions 2-4: Small middle tiles (1 col × 1 row)
  TALL_RIGHT: "2x3",      // Position 5: Tall right banner (2 cols × 3 rows)
} as const

export type GridSizeType = typeof GridSize[keyof typeof GridSize]

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
  gridSizes?: Record<string, { aspectRatio: string; recommended: { width: number; height: number }; label: string }>
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
  bento_grid: {
    label: "Бенто Grid (5 баннер)",
    aspectRatio: "varies", // Dynamic based on position
    recommended: { width: 800, height: 800 },
    mobileRecommended: { width: 600, height: 600 },
    description: "5 баннерт бенто grid: 1 том зүүн (3×3), 3 жижиг дунд (1×1), 1 өндөр баруун (2×3)",
    gridSizes: {
      "3x3": { aspectRatio: "1/1", recommended: { width: 900, height: 900 }, label: "Том зүүн (3×3)" },
      "1x1": { aspectRatio: "1/1", recommended: { width: 300, height: 300 }, label: "Жижиг дунд (1×1)" },
      "2x3": { aspectRatio: "2/3", recommended: { width: 600, height: 900 }, label: "Өндөр баруун (2×3)" },
    },
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
  placement: model.text(), // hero, bento, bento_grid, product_grid
  section: model.text().nullable(), // For product_grid: apple, gaming, ipad, etc.
  grid_size: model.text().default("3x3"), // For bento_grid: 3x3 (pos1), 1x1 (pos2-4), 2x3 (pos5)
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
