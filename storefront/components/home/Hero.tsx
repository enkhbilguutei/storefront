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
    <section className="w-full bg-background pt-4 pb-8">
      <Swiper
        spaceBetween={20}
        centeredSlides={true}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
        }}
        navigation={false}
        modules={[Autoplay, Pagination]}
        className="w-full max-w-[98%] md:max-w-[95%] h-[500px] md:h-[600px] rounded-2xl overflow-hidden shadow-sm"
      >
        {heroSlides.map((slide) => (
          <SwiperSlide key={slide.id} className="relative bg-gray-100">
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
            <div className={`absolute inset-0 flex flex-col items-center justify-end pb-16 md:pb-24 text-center z-10 ${slide.darkText ? 'text-foreground' : 'text-white'}`}>
              <h2 className="text-4xl md:text-6xl font-semibold tracking-tight mb-3 drop-shadow-sm">
                {slide.title}
              </h2>
              <p className="text-xl md:text-2xl font-medium mb-8 opacity-90 drop-shadow-sm">
                {slide.subtitle}
              </p>
              <div className="flex gap-4">
                <Link
                  href={slide.link}
                  className={`px-8 py-2.5 rounded-full font-medium text-sm transition-all ${
                    slide.darkText 
                      ? 'bg-foreground text-background hover:opacity-90' 
                      : 'bg-white text-black hover:bg-gray-100'
                  }`}
                >
                  Дэлгэрэнгүй
                </Link>
                <Link
                  href={`${slide.link}/buy`}
                  className={`px-8 py-2.5 rounded-full font-medium text-sm transition-all border ${
                    slide.darkText
                      ? 'border-foreground text-foreground hover:bg-foreground/5'
                      : 'border-white text-white hover:bg-white/10'
                  }`}
                >
                  Худалдаж авах
                </Link>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
