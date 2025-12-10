import { getHeroBanners } from "@/lib/data/banners"
import { HeroCarousel } from "./HeroCarousel"

/**
 * Hero section with dynamic banners from CMS
 */
export async function Hero() {
  const banners = await getHeroBanners()

  return (
    <section className="w-full bg-white">
      <HeroCarousel banners={banners} />
    </section>
  )
}
