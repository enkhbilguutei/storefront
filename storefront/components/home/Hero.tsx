"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import Link from "next/link";
import { CloudinaryImage } from "@/components/Cloudinary";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const slides = [
  {
    id: 1,
    title: "MacBook Pro M4",
    subtitle: "Гайхалтай хүч. Гайхамшигт загвар.",
    image: "https://res.cloudinary.com/do1xiqlxi/image/upload/v1764596586/s_hs7sa7.jpg",
    link: "/products/macbook-pro-m4",
    darkText: false,
  },
  {
    id: 2,
    title: "iMac M4",
    subtitle: "Хүч чадлаар дүүрэн.",
    image: "https://res.cloudinary.com/do1xiqlxi/image/upload/v1764596586/imac_ugg6cz.jpg",
    link: "/products/imac-m4",
    darkText: true,
  },
  {
    id: 3,
    title: "Mac Mini",
    subtitle: "Илүү хүчирхэг. Илүү хурдан.",
    image: "https://res.cloudinary.com/do1xiqlxi/image/upload/v1764596585/2_s875jd.jpg",
    link: "/products/mac-mini",
    darkText: true,
  },
  {
    id: 4,
    title: "Powerbeats Pro 2",
    subtitle: "Хөдөлгөөнд зориулагдсан.",
    image: "https://res.cloudinary.com/do1xiqlxi/image/upload/v1764596584/1_txr8ku.jpg",
    link: "/products/powerbeats-pro-2",
    darkText: false,
  },
  {
    id: 5,
    title: "Transparent Tech",
    subtitle: "Дууг мэдэр.",
    image: "https://res.cloudinary.com/do1xiqlxi/image/upload/v1764596585/airpods3_dsghc4.jpg",
    link: "/products/transparent-tech",
    darkText: true,
  },
];

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
        {slides.map((slide) => (
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
