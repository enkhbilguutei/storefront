import { ExecArgs } from "@medusajs/framework/types"
import { BANNER_MODULE } from "../modules/banner"
import type BannerModuleService from "../modules/banner/service"

/**
 * Seed script to populate initial banner data from existing static images.
 * 
 * Run with: medusa exec ./src/scripts/seed-banners.ts
 */
export default async function seedBanners({ container }: ExecArgs) {
  const bannerService = container.resolve<BannerModuleService>(BANNER_MODULE)
  
  console.log("🎨 Seeding hero banners...")
  
  // Check if banners already exist
  const existingBanners = await bannerService.listBanners({})
  if (existingBanners.length > 0) {
    console.log(`⚠️  ${existingBanners.length} banners already exist. Skipping seed.`)
    console.log("   To re-seed, delete existing banners first.")
    return
  }
  
  // Hero carousel slides
  const heroSlides = [
    {
      title: "MacBook Pro M4",
      subtitle: "Гайхалтай хүч. Гайхамшигт загвар.",
      image_url: "https://res.cloudinary.com/do1xiqlxi/image/upload/v1764596586/s_hs7sa7.jpg",
      link: "/products/macbook-pro-m4",
      dark_text: false,
      placement: "hero",
      sort_order: 1,
      is_active: true,
    },
    {
      title: "iMac M4",
      subtitle: "Хүч чадлаар дүүрэн.",
      image_url: "https://res.cloudinary.com/do1xiqlxi/image/upload/v1764596586/imac_ugg6cz.jpg",
      link: "/products/imac-m4",
      dark_text: true,
      placement: "hero",
      sort_order: 2,
      is_active: true,
    },
    {
      title: "Mac Mini",
      subtitle: "Илүү хүчирхэг. Илүү хурдан.",
      image_url: "https://res.cloudinary.com/do1xiqlxi/image/upload/v1764596585/2_s875jd.jpg",
      link: "/products/mac-mini",
      dark_text: true,
      placement: "hero",
      sort_order: 3,
      is_active: true,
    },
    {
      title: "Powerbeats Pro 2",
      subtitle: "Хөдөлгөөнд зориулагдсан.",
      image_url: "https://res.cloudinary.com/do1xiqlxi/image/upload/v1764596584/1_txr8ku.jpg",
      link: "/products/powerbeats-pro-2",
      dark_text: false,
      placement: "hero",
      sort_order: 4,
      is_active: true,
    },
    {
      title: "Transparent Tech",
      subtitle: "Дууг мэдэр.",
      image_url: "https://res.cloudinary.com/do1xiqlxi/image/upload/v1764596585/airpods3_dsghc4.jpg",
      link: "/products/transparent-tech",
      dark_text: true,
      placement: "hero",
      sort_order: 5,
      is_active: true,
    },
  ]
  
  // Create hero banners
  for (const banner of heroSlides) {
    await bannerService.createBanners(banner)
  }
  
  console.log(`✅ Created ${heroSlides.length} hero carousel banners`)
}
