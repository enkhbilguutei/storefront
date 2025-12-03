import { getHeroBanners } from "@/lib/data/banners"
import { HeroCarousel } from "./HeroCarousel"
import { heroSlides } from "@/lib/config/images"

/**
 * Hero section with dynamic banners from CMS
 * Falls back to static data if no banners are found
 */
export async function Hero() {
  const banners = await getHeroBanners()
  
  // Fallback to static data if no banners from CMS
  const displayBanners = banners.length > 0 
    ? banners 
    : heroSlides.map((slide, index) => ({
        id: String(slide.id),
        title: slide.title,
        subtitle: slide.subtitle,
        description: null,
        image_url: slide.image,
        link: slide.link,
        alt_text: slide.title,
        placement: "hero" as const,
        sort_order: index + 1,
        is_active: true,
        dark_text: slide.darkText,
        starts_at: null,
        ends_at: null,
        metadata: null,
      }))

  return (
    <section className="w-full bg-white">
      <HeroCarousel banners={displayBanners} />
    </section>
  )
}
