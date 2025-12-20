"use client"

import Link from "next/link"
import { CloudinaryImage } from "../Cloudinary"

interface Banner {
  id: string
  image_url: string
  mobile_image_url: string | null
  link: string
  alt_text: string | null
  grid_size: string // "3x3" | "1x1" | "2x3"
  sort_order: number
}

interface BentoGridProps {
  banners: Banner[]
}

/**
 * Fixed 5-banner Walmart-style layout
 * Position 1: 3×3 large left (col-span-3 row-span-3)
 * Positions 2-4: 1×1 small middle (col-span-1 row-span-1)
 * Position 5: 2×3 tall right (col-span-2 row-span-3)
 */
export function BentoGrid({ banners }: BentoGridProps) {
  if (!banners || banners.length === 0) {
    return (
      <section className="w-full py-8 md:py-12">
        <div className="container">
          <div className="p-6 bg-yellow-50 border-2 border-yellow-200 rounded-lg text-center">
            <p className="text-yellow-800 font-medium">
              ⚠️ Бенто grid баннер олдсонгүй
            </p>
            <p className="text-yellow-700 text-sm mt-1">
              Admin панелд "Бенто Grid (5 баннер)" төрлийн 5 баннер үүсгэнэ үү
            </p>
          </div>
        </div>
      </section>
    )
  }

  // Sort by sort_order and limit to exactly 5 banners
  const sortedBanners = [...banners].sort((a, b) => a.sort_order - b.sort_order).slice(0, 5)
  
  // Group by grid_size to assign positions
  const largeLeft = sortedBanners.find(b => b.grid_size === "3x3")
  const smallMiddle = sortedBanners.filter(b => b.grid_size === "1x1").slice(0, 3)
  const tallRight = sortedBanners.find(b => b.grid_size === "2x3")

  // If we don't have the required banners, show helpful message
  if (!largeLeft || smallMiddle.length < 3 || !tallRight) {
    return (
      <section className="w-full py-8 md:py-12">
        <div className="container">
          <div className="p-6 bg-red-50 border-2 border-red-200 rounded-lg">
            <p className="text-red-800 font-medium mb-3">
              ❌ 5 баннер бүрэн биш ({sortedBanners.length} олдсон)
            </p>
            <div className="text-red-700 text-sm space-y-1">
              <p>• {largeLeft ? '✅' : '❌'} Том зүүн (3×3): {largeLeft ? '1 байна' : '0 - шаардлагатай!'}</p>
              <p>• {smallMiddle.length === 3 ? '✅' : '❌'} Жижиг дунд (1×1): {smallMiddle.length}/3</p>
              <p>• {tallRight ? '✅' : '❌'} Өндөр баруун (2×3): {tallRight ? '1 байна' : '0 - шаардлагатай!'}</p>
            </div>
            <p className="text-red-600 text-xs mt-3">
              Admin → Banners → "Бенто Grid (5 баннер)" төрлийн баннер үүсгэнэ үү
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="w-full py-8 md:py-12">
      <div className="container max-w-7xl mx-auto px-4">
        {/* Desktop: 6-column × 3-row grid | Mobile: Stack vertically */}
        <div className="flex flex-col gap-3 md:grid md:grid-cols-6 md:gap-4" style={{ gridAutoRows: '200px' }}>
          
          {/* Position 1: Large left banner (3×3) */}
          <Link
            href={largeLeft.link}
            className="md:col-span-3 md:row-span-3 group relative overflow-hidden rounded-xl bg-neutral-100
              transition-all duration-300 hover:scale-[1.02] hover:shadow-xl w-full aspect-[16/9] md:aspect-auto md:h-full"
          >
            <div className="relative w-full h-full">
              <div className="hidden md:block absolute inset-0">
                <CloudinaryImage
                  src={largeLeft.image_url}
                  alt={largeLeft.alt_text || "Промо"}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="block md:hidden absolute inset-0">
                <CloudinaryImage
                  src={largeLeft.mobile_image_url || largeLeft.image_url}
                  alt={largeLeft.alt_text || "Промо"}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
            </div>
          </Link>

          {/* Position 2: Small middle top (1×1) */}
          <Link
            href={smallMiddle[0].link}
            className="md:col-span-1 md:row-span-1 group relative overflow-hidden rounded-xl bg-neutral-100
              transition-all duration-300 hover:scale-[1.02] hover:shadow-xl w-full aspect-[16/9] md:aspect-auto md:h-full"
          >
            <div className="relative w-full h-full">
              <div className="hidden md:block absolute inset-0">
                <CloudinaryImage
                  src={smallMiddle[0].image_url}
                  alt={smallMiddle[0].alt_text || "Промо"}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="block md:hidden absolute inset-0">
                <CloudinaryImage
                  src={smallMiddle[0].mobile_image_url || smallMiddle[0].image_url}
                  alt={smallMiddle[0].alt_text || "Промо"}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
            </div>
          </Link>

          {/* Position 5: Tall right banner (2×3) - spans all 3 rows */}
          <Link
            href={tallRight.link}
            className="md:col-span-2 md:row-span-3 group relative overflow-hidden rounded-xl bg-neutral-100
              transition-all duration-300 hover:scale-[1.02] hover:shadow-xl w-full aspect-[16/9] md:aspect-auto md:h-full"
          >
            <div className="relative w-full h-full">
              <div className="hidden md:block absolute inset-0">
                <CloudinaryImage
                  src={tallRight.image_url}
                  alt={tallRight.alt_text || "Промо"}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="block md:hidden absolute inset-0">
                <CloudinaryImage
                  src={tallRight.mobile_image_url || tallRight.image_url}
                  alt={tallRight.alt_text || "Промо"}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
            </div>
          </Link>

          {/* Position 3: Small middle center (1×1) */}
          <Link
            href={smallMiddle[1].link}
            className="md:col-span-1 md:row-span-1 group relative overflow-hidden rounded-xl bg-neutral-100
              transition-all duration-300 hover:scale-[1.02] hover:shadow-xl w-full aspect-[16/9] md:aspect-auto md:h-full"
          >
            <div className="relative w-full h-full">
              <div className="hidden md:block absolute inset-0">
                <CloudinaryImage
                  src={smallMiddle[1].image_url}
                  alt={smallMiddle[1].alt_text || "Промо"}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="block md:hidden absolute inset-0">
                <CloudinaryImage
                  src={smallMiddle[1].mobile_image_url || smallMiddle[1].image_url}
                  alt={smallMiddle[1].alt_text || "Промо"}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
            </div>
          </Link>

          {/* Position 4: Small middle bottom (1×1) */}
          <Link
            href={smallMiddle[2].link}
            className="md:col-span-1 md:row-span-1 group relative overflow-hidden rounded-xl bg-neutral-100
              transition-all duration-300 hover:scale-[1.02] hover:shadow-xl w-full aspect-[16/9] md:aspect-auto md:h-full"
          >
            <div className="relative w-full h-full">
              <div className="hidden md:block absolute inset-0">
                <CloudinaryImage
                  src={smallMiddle[2].image_url}
                  alt={smallMiddle[2].alt_text || "Промо"}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="block md:hidden absolute inset-0">
                <CloudinaryImage
                  src={smallMiddle[2].mobile_image_url || smallMiddle[2].image_url}
                  alt={smallMiddle[2].alt_text || "Промо"}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
            </div>
          </Link>

        </div>
      </div>
    </section>
  )
}
