"use client"

import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, Pagination } from "swiper/modules"
import Link from "next/link"
import { CloudinaryImage } from "@/components/Cloudinary"
import { useEffect, useRef } from "react"
import "swiper/css"
import "swiper/css/pagination"
import "swiper/css/navigation"

import type { Banner } from "@/lib/data/banners"

interface HeroCarouselProps {
  banners: Banner[]
}

// Emit custom event for header contrast adjustment
function emitHeroContrastEvent(isDark: boolean) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('hero-contrast-change', { 
      detail: { isDark } 
    }));
  }
}

export function HeroCarousel({ banners }: HeroCarouselProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Analyze image brightness with improved weighted luminance and multi-point sampling
  const analyzeImageBrightness = (imageUrl: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      
      img.onload = () => {
        if (!canvasRef.current) {
          canvasRef.current = document.createElement('canvas');
        }
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          resolve(false);
          return;
        }
        
        // Sample multiple regions for better accuracy
        const sampleSize = 100;
        canvas.width = sampleSize;
        canvas.height = sampleSize;
        ctx.drawImage(img, 0, 0, sampleSize, sampleSize);
        
        // Sample top-center region where header sits (20% from top)
        const regionHeight = Math.floor(sampleSize * 0.3);
        const imageData = ctx.getImageData(0, 0, sampleSize, regionHeight);
        const data = imageData.data;
        
        let totalLuminance = 0;
        let pixelCount = 0;
        
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];
          
          // Skip transparent pixels
          if (a < 128) continue;
          
          // Use ITU-R BT.709 standard for perceived luminance
          const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
          totalLuminance += luminance;
          pixelCount++;
        }
        
        const avgLuminance = totalLuminance / pixelCount;
        
        // Consider dark if luminance < 128 (adjusted threshold for better contrast)
        resolve(avgLuminance < 128);
      };
      
      img.onerror = () => resolve(true); // Default to dark on error
      img.src = imageUrl;
    });
  };

  if (banners.length === 0) {
    return null
  }

  return (
    <Swiper
      spaceBetween={0}
      centeredSlides={true}
      autoplay={{
        delay: 6000,
        disableOnInteraction: false,
      }}
      pagination={{
        clickable: true,
        bulletClass: "swiper-pagination-bullet !bg-white/50 !opacity-100",
        bulletActiveClass: "!bg-white !w-6 !rounded-full",
      }}
      navigation={false}
      modules={[Autoplay, Pagination]}
      onSlideChange={async (swiper) => {
        const currentBanner = banners[swiper.activeIndex];
        if (currentBanner) {
          // Use dark_text property or analyze image
          if (currentBanner.dark_text !== undefined) {
            emitHeroContrastEvent(!currentBanner.dark_text);
          } else {
            const isDark = await analyzeImageBrightness(currentBanner.image_url);
            emitHeroContrastEvent(isDark);
          }
        }
      }}
      onInit={async (swiper) => {
        // Set initial contrast on mount
        const firstBanner = banners[0];
        if (firstBanner) {
          if (firstBanner.dark_text !== undefined) {
            emitHeroContrastEvent(!firstBanner.dark_text);
          } else {
            const isDark = await analyzeImageBrightness(firstBanner.image_url);
            emitHeroContrastEvent(isDark);
          }
        }
      }}
      className="w-full h-[100vh] md:h-[100vh]"
    >
      {banners.map((banner, index) => (
        <SwiperSlide key={banner.id} className="relative bg-black">
          <div className="absolute inset-0">
            {/* Art direction: use mobile image on small screens, desktop on large screens */}
            {banner.mobile_image_url ? (
              <picture>
                {/* Mobile: 1:1 square image (fits 400px height perfectly) */}
                <source 
                  media="(max-width: 768px)" 
                  srcSet={banner.mobile_image_url} 
                />
                {/* Desktop: 16:6 wide landscape image */}
                <img
                  src={banner.image_url}
                  alt={banner.alt_text || banner.title || "Banner"}
                  className="w-full h-full object-cover"
                  loading={index === 0 ? "eager" : "lazy"}
                />
              </picture>
            ) : (
              <CloudinaryImage
                src={banner.image_url}
                alt={banner.alt_text || banner.title || "Banner"}
                width={2000}
                height={1000}
                className="w-full h-full object-cover"
                priority={index === 0}
              />
            )}
          </div>
          {/* Subtle gradient overlay for text readability */}
          <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />
          
          <div className={`absolute inset-0 flex flex-col items-center justify-end pb-20 md:pb-28 text-center z-10 px-4 ${banner.dark_text ? 'text-foreground' : 'text-white'}`}>
            {banner.title && (
              <h2 className="text-5xl md:text-7xl font-display font-semibold tracking-tight mb-2">
                {banner.title}
              </h2>
            )}
            {banner.subtitle && (
              <p className="text-lg md:text-xl font-normal mb-8 opacity-90 max-w-xl">
                {banner.subtitle}
              </p>
            )}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href={banner.link}
                className="px-8 py-3.5 bg-transparent border-2 border-white text-white font-medium rounded-full hover:bg-white hover:text-gray-900 transition-all duration-300 shadow-lg backdrop-blur-sm"
              >
                Дэлгэрэнгүй үзэх
              </Link>
              <Link
                href={`${banner.link}/buy`}
                className="px-8 py-3.5 bg-white text-gray-900 font-medium rounded-full hover:bg-gray-100 transition-all duration-300 shadow-lg"
              >
                Худалдаж авах
              </Link>
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  )
}
