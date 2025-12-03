import { CloudinaryImage } from "@/components/Cloudinary"
import Link from "next/link"
import { getPromoBanners } from "@/lib/data/banners"
import { promoImages } from "@/lib/config/images"

/**
 * Promotional banner section with dynamic data from CMS
 * Falls back to static data if no banners are found
 * Uses 3:1 aspect ratio with object-cover for auto-cropping
 */
export async function PromoBanner() {
  const banners = await getPromoBanners()
  
  // Use first active promo banner or fallback to static
  const banner = banners[0] || {
    title: "Ирээдүйг мэдэр",
    subtitle: "Алимхан дэлгүүрээс хамгийн сүүлийн үеийн технологи, дагалдах хэрэгслийг сонирхоорой.",
    image_url: promoImages.mainBanner,
    link: "/products",
    dark_text: false,
    alt_text: null,
  }

  return (
    <section className="py-3 container mx-auto px-4">
      <div className="relative w-full rounded-3xl overflow-hidden bg-[#1d1d1f]">
        {/* 3:1 aspect ratio container */}
        <div className="aspect-3/1 w-full">
          <CloudinaryImage
            src={banner.image_url}
            alt={banner.alt_text || banner.title || "Promo banner"}
            width={2400}
            height={800}
            className="w-full h-full object-cover"
          />
        </div>
        <div className={`absolute inset-0 flex flex-col items-center justify-start pt-12 md:pt-16 text-center px-6 ${banner.dark_text ? 'text-foreground' : 'text-white'}`}>
          {banner.title && (
            <h2 className="text-4xl md:text-6xl font-display font-semibold mb-2">
              {banner.title}
            </h2>
          )}
          {banner.subtitle && (
            <p className={`text-base md:text-lg mb-4 max-w-xl ${banner.dark_text ? 'text-foreground/70' : 'text-white/80'}`}>
              {banner.subtitle}
            </p>
          )}
          <Link
            href={banner.link}
            className={`text-lg font-normal hover:underline transition-colors ${banner.dark_text ? 'text-blue-600' : 'text-blue-400'}`}
          >
            Дэлгүүр хэсэх &gt;
          </Link>
        </div>
      </div>
    </section>
  )
}
