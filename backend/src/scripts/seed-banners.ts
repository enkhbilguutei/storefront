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
  
  console.log("🎨 Seeding banners...")
  
  // Check if banners already exist
  const existingBanners = await bannerService.listBanners({})
  if (existingBanners.length > 0) {
    console.log(`⚠️  ${existingBanners.length} banners already exist. Skipping seed.`)
    console.log("   To re-seed, delete existing banners first.")
    return
  }
  
  // Hero Slides
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
  
  // iPhone Banners
  const iphoneBanners = [
    {
      title: "iPhone 17 Pro",
      alt_text: "iPhone 17 Pro",
      image_url: "https://res.cloudinary.com/do1xiqlxi/image/upload/v1764616599/banner1_dsbxka.jpg",
      link: "/products/iphone-17-pro",
      placement: "iphone",
      sort_order: 1,
      is_active: true,
    },
    {
      title: "iPhone 17 Pro Max",
      alt_text: "iPhone 17 Pro Max",
      image_url: "https://res.cloudinary.com/do1xiqlxi/image/upload/v1764616599/banner2_zbryc4.jpg",
      link: "/products/iphone-17-pro-max",
      placement: "iphone",
      sort_order: 2,
      is_active: true,
    },
  ]
  
  // DJI Bento Items
  const djiBanners = [
    {
      title: "DJI Mic 3",
      description: "Мэргэжлийн түвшний wireless микрофон",
      image_url: "https://res.cloudinary.com/do1xiqlxi/image/upload/v1764617055/dji_mic3_yloyeh.jpg",
      link: "/products/dji-mic-3",
      dark_text: false,
      placement: "dji",
      sort_order: 1, // Large item (first position)
      is_active: true,
      metadata: { size: "large" },
    },
    {
      title: "DJI Drone",
      description: "Агаараас бичлэг хийх шинэ боломж",
      image_url: "https://res.cloudinary.com/do1xiqlxi/image/upload/v1764617055/dji_ofypbr.jpg",
      link: "/products/dji-drone",
      dark_text: true,
      placement: "dji",
      sort_order: 2, // Small item 1
      is_active: true,
      metadata: { size: "small" },
    },
    {
      title: "DJI Osmo Pocket 3",
      description: "Компакт gimbal камер",
      image_url: "https://res.cloudinary.com/do1xiqlxi/image/upload/v1764617055/osmo_pocket3_ttg6ow.jpg",
      link: "/products/dji-osmo-pocket-3",
      dark_text: false,
      placement: "dji",
      sort_order: 3, // Small item 2
      is_active: true,
      metadata: { size: "small" },
    },
  ]
  
  // Promo Banner
  const promoBanners = [
    {
      title: "Ирээдүйг мэдэр",
      subtitle: "Алимхан дэлгүүрээс хамгийн сүүлийн үеийн технологи, дагалдах хэрэгслийг сонирхоорой.",
      image_url: "https://res.cloudinary.com/do1xiqlxi/image/upload/v1764596586/alimhan-cover_zslzt8.jpg",
      link: "/products",
      dark_text: false,
      placement: "promo",
      sort_order: 1,
      is_active: true,
    },
  ]
  
  // Create all banners
  const allBanners = [
    ...heroSlides,
    ...iphoneBanners,
    ...djiBanners,
    ...promoBanners,
  ]
  
  for (const banner of allBanners) {
    await bannerService.createBanners(banner)
  }
  
  console.log(`✅ Created ${allBanners.length} banners:`)
  console.log(`   - ${heroSlides.length} hero slides`)
  console.log(`   - ${iphoneBanners.length} iPhone banners`)
  console.log(`   - ${djiBanners.length} DJI bento items`)
  console.log(`   - ${promoBanners.length} promo banners`)
}
