import { CloudinaryImage } from "@/components/Cloudinary"
import Link from "next/link"
import { getDJIBanners } from "@/lib/data/banners"
import { djiBentoItems as staticItems } from "@/lib/config/images"

interface DJIBannerItem {
  id: string
  image: string
  title: string
  description: string | null
  link: string
  darkText: boolean
  size: "large" | "small"
}

/**
 * DJI bento grid section with dynamic data from CMS
 * Falls back to static data if no banners are found
 * Uses 4:3 aspect ratio with object-cover for auto-cropping
 */
export async function DJIBento() {
  const banners = await getDJIBanners()
  
  // Fallback to static data if no banners from CMS
  const items: DJIBannerItem[] = banners.length > 0 
    ? banners.map((b, index) => ({
        id: b.id,
        image: b.image_url,
        title: b.title || "DJI",
        description: b.description,
        link: b.link,
        darkText: b.dark_text,
        // Use placement to determine size, or metadata, or index
        size: b.placement === "dji_large" 
          ? "large" 
          : b.placement === "dji_small" 
            ? "small"
            : ((b.metadata as Record<string, unknown>)?.size as "large" | "small") || (index === 0 ? "large" : "small"),
      }))
    : staticItems.map((item, index) => ({
        id: String(item.id),
        image: item.image,
        title: item.title,
        description: item.description,
        link: item.link,
        darkText: index === 1, // Only the second item has light background
        size: index === 0 ? "large" as const : "small" as const,
      }))

  // Ensure we have at least 3 items for the bento layout
  if (items.length < 3) {
    return null
  }

  // Separate large and small items
  const largeItems = items.filter(item => item.size === "large")
  const smallItems = items.filter(item => item.size === "small")
  
  // Use first large item, or fall back to first item
  const largeItem = largeItems[0] || items[0]
  // Use small items, or remaining items after large
  const displaySmallItems = smallItems.length > 0 
    ? smallItems 
    : items.filter(item => item.id !== largeItem.id)

  return (
    <section className="py-3 container mx-auto px-4">
      {/* Bento Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Large item - spans 2 columns on all screens, 2 rows on lg */}
        <Link
          href={largeItem.link}
          className="relative rounded-3xl overflow-hidden group col-span-2 row-span-2 bg-[#1d1d1f]"
        >
          {/* 4:3 aspect ratio container */}
          <div className="aspect-4/3 w-full">
            <CloudinaryImage
              src={largeItem.image}
              alt={largeItem.title}
              width={1200}
              height={900}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-start pt-10 md:pt-14 text-center">
            {largeItem.title && (
              <h3 className={`text-3xl md:text-5xl font-display font-semibold mb-1 ${largeItem.darkText ? 'text-foreground' : 'text-white'}`}>
                {largeItem.title}
              </h3>
            )}
            {largeItem.description && (
              <p className={`text-sm md:text-base mb-4 ${largeItem.darkText ? 'text-foreground/70' : 'text-white/80'}`}>
                {largeItem.description}
              </p>
            )}
            <span className={`text-lg font-normal hover:underline transition-colors ${largeItem.darkText ? 'text-blue-600' : 'text-blue-400'}`}>
              Худалдаж авах &gt;
            </span>
          </div>
        </Link>

        {/* Small items */}
        {displaySmallItems.slice(0, 2).map((item) => (
          <Link
            key={item.id}
            href={item.link}
            className={`relative rounded-3xl overflow-hidden group ${item.darkText ? 'bg-white' : 'bg-[#1d1d1f]'}`}
          >
            {/* 4:3 aspect ratio container */}
            <div className="aspect-4/3 w-full">
              <CloudinaryImage
                src={item.image}
                alt={item.title}
                width={800}
                height={600}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-start pt-5 md:pt-6 text-center">
              {item.title && (
                <h3 className={`text-lg md:text-xl font-display font-semibold mb-0.5 ${item.darkText ? 'text-foreground' : 'text-white'}`}>
                  {item.title}
                </h3>
              )}
              {item.description && (
                <p className={`text-xs md:text-sm mb-2 hidden sm:block ${item.darkText ? 'text-foreground/60' : 'text-white/70'}`}>
                  {item.description}
                </p>
              )}
              <span className={`text-sm font-normal hover:underline transition-colors ${item.darkText ? 'text-blue-600' : 'text-blue-400'}`}>
                Үзэх &gt;
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
