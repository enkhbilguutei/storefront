/**
 * Centralized Image Configuration
 * All Cloudinary image URLs used in the storefront
 * 
 * Organization:
 * - categoryIcons: Category navigation icons
 */

// =============================================================================
// CATEGORY ICONS (for navigation)
// =============================================================================
export const categoryImages: Record<string, string> = {
  // Apple Products
  "mac": "https://res.cloudinary.com/do1xiqlxi/image/upload/v1764699602/store-card-13-mac-nav-202510_ysal57.png",
  "iphone": "https://res.cloudinary.com/do1xiqlxi/image/upload/v1764699602/store-card-13-iphone-nav-202509_svydgg.png",
  "ipad": "https://res.cloudinary.com/do1xiqlxi/image/upload/v1764699602/store-card-13-ipad-nav-202405_shkstt.png",
  "apple-watch": "https://res.cloudinary.com/do1xiqlxi/image/upload/v1764699602/store-card-13-watch-nav-202509_GEO_IN_iredbr.png",
  "watch": "https://res.cloudinary.com/do1xiqlxi/image/upload/v1764699602/store-card-13-watch-nav-202509_GEO_IN_iredbr.png",
  "airpods": "https://res.cloudinary.com/do1xiqlxi/image/upload/v1764699601/store-card-13-airpods-nav-202509_bihzut.png",
  "airtag": "https://res.cloudinary.com/do1xiqlxi/image/upload/v1764699601/store-card-13-airtags-nav-202108_t4sj8i.png",
  "apple-tv": "https://res.cloudinary.com/do1xiqlxi/image/upload/v1764699601/store-card-13-appletv-nav-202210_w6n2yn.png",
  "homepod": "https://res.cloudinary.com/do1xiqlxi/image/upload/v1764699602/store-card-13-homepod-nav-202301_voolxd.png",
  
  // Accessories
  "accessories": "https://res.cloudinary.com/do1xiqlxi/image/upload/v1764699601/store-card-13-accessories-nav-202509_eip4rx.png",
  "дагалдах-хэрэгсэл": "https://res.cloudinary.com/do1xiqlxi/image/upload/v1764699601/store-card-13-accessories-nav-202509_eip4rx.png",
  
  // Partner Brands
  "ray-ban": "https://res.cloudinary.com/do1xiqlxi/image/upload/v1764699600/rayban-meta_owjhu1.png",
  "rayban": "https://res.cloudinary.com/do1xiqlxi/image/upload/v1764699600/rayban-meta_owjhu1.png",
  "ray-ban-meta": "https://res.cloudinary.com/do1xiqlxi/image/upload/v1764699600/rayban-meta_owjhu1.png",
  "dji": "https://res.cloudinary.com/do1xiqlxi/image/upload/v1764699599/dji_brqw22.jpg",
  "playstation": "https://res.cloudinary.com/do1xiqlxi/image/upload/v1764699600/PlayStation_logo.svg_zj5umb.png",
  "nintendo": "https://res.cloudinary.com/do1xiqlxi/image/upload/v1764699599/nintendo-logo-png_seeklogo-99661_igyjp3.png",
  "popmart": "https://res.cloudinary.com/do1xiqlxi/image/upload/v1764700038/pop-mart-app-icon_tekqgj.webp",
};

export const defaultCategoryImage = "https://res.cloudinary.com/do1xiqlxi/image/upload/v1764699601/store-card-13-accessories-nav-202509_eip4rx.png";

// Keywords to image mapping for fuzzy matching
const keywordMappings: Array<{ keywords: string[]; imageKey: keyof typeof categoryImages }> = [
  { keywords: ["iphone"], imageKey: "iphone" },
  { keywords: ["mac", "macbook", "imac"], imageKey: "mac" },
  { keywords: ["ipad"], imageKey: "ipad" },
  { keywords: ["watch"], imageKey: "watch" },
  { keywords: ["airpods", "airpod"], imageKey: "airpods" },
  { keywords: ["airtag"], imageKey: "airtag" },
  { keywords: ["tv", "apple-tv"], imageKey: "apple-tv" },
  { keywords: ["homepod"], imageKey: "homepod" },
  { keywords: ["accessor", "дагалдах"], imageKey: "accessories" },
  { keywords: ["ray", "ban", "meta"], imageKey: "ray-ban" },
  { keywords: ["dji", "drone"], imageKey: "dji" },
  { keywords: ["playstation", "ps5", "ps4"], imageKey: "playstation" },
  { keywords: ["nintendo", "switch"], imageKey: "nintendo" },
  { keywords: ["popmart", "pop-mart"], imageKey: "popmart" },
];

/**
 * Get the image URL for a category based on its handle
 * Supports exact matches and fuzzy keyword matching
 */
export function getCategoryImage(handle: string): string {
  const lowerHandle = handle.toLowerCase();
  
  // Check for exact match first
  if (categoryImages[lowerHandle]) {
    return categoryImages[lowerHandle];
  }
  
  // Check for keyword matches
  for (const { keywords, imageKey } of keywordMappings) {
    if (keywords.some(keyword => lowerHandle.includes(keyword))) {
      return categoryImages[imageKey];
    }
  }
  
  return defaultCategoryImage;
}
