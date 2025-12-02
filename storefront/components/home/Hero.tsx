"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import Link from "next/link";
import { CloudinaryImage } from "@/components/Cloudinary";
import { heroSlides } from "@/lib/config/images";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

export function Hero() {
  return (
    <section className="w-full bg-white">
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
        className="w-full h-[580px] md:h-[680px]"
      >
        {heroSlides.map((slide) => (
          <SwiperSlide key={slide.id} className="relative bg-black">
            <div className="absolute inset-0">
              <CloudinaryImage
                src={slide.image}
                alt={slide.title}
                width={2000}
                height={1000}
                className="w-full h-full object-cover"
                priority={slide.id === 1}
              />
            </div>
            {/* Subtle gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            
            <div className={`absolute inset-0 flex flex-col items-center justify-end pb-20 md:pb-28 text-center z-10 px-4 ${slide.darkText ? 'text-foreground' : 'text-white'}`}>
              <h2 className="text-5xl md:text-7xl font-display font-semibold tracking-tight mb-2">
                {slide.title}
              </h2>
              <p className="text-lg md:text-xl font-normal mb-6 opacity-90 max-w-xl">
                {slide.subtitle}
              </p>
              <div className="flex items-center gap-6">
                <Link
                  href={slide.link}
                  className="text-lg font-normal text-blue-400 hover:underline transition-all"
                >
                  Дэлгэрэнгүй &gt;
                </Link>
                <Link
                  href={`${slide.link}/buy`}
                  className="text-lg font-normal text-blue-400 hover:underline transition-all"
                >
                  Худалдаж авах &gt;
                </Link>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
