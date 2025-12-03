import { CloudinaryImage } from "@/components/Cloudinary"
import Link from "next/link"
import { getIPhoneBanners } from "@/lib/data/banners"
import { iphoneBanners as staticBanners } from "@/lib/config/images"

/**
 * iPhone banners section with dynamic data from CMS
 * Falls back to static data if no banners are found
 * Uses 1:1 aspect ratio with object-cover for auto-cropping
 */
export async function IPhoneBanners() {
  const banners = await getIPhoneBanners()
  
  // Fallback to static data if no banners from CMS
  const displayBanners = banners.length > 0 
    ? banners.map(b => ({
        id: b.id,
        image: b.image_url,
        alt: b.alt_text || b.title || "iPhone banner",
        link: b.link,
      }))
    : staticBanners.map(b => ({
        id: String(b.id),
        image: b.image,
        alt: b.alt,
        link: b.link,
      }))

  return (
    <section className="py-3 container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {displayBanners.map((banner) => (
          <Link
            key={banner.id}
            href={banner.link}
            className="relative rounded-3xl overflow-hidden block group bg-[#1d1d1f]"
          >
            {/* 1:1 aspect ratio container */}
            <div className="aspect-square w-full">
              <CloudinaryImage
                src={banner.image}
                alt={banner.alt}
                width={2000}
                height={2000}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-8">
              <span className="text-lg font-normal text-blue-400 hover:underline transition-colors">
                Худалдаж авах &gt;
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
