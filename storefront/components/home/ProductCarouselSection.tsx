// @ts-nocheck
"use client";

import { ProductCard } from "@/components/products/ProductCard";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, Mousewheel } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

interface Product {
  id: string;
  title: string;
  handle: string;
  thumbnail?: string;
  tradeInEligible?: boolean;
  price?: {
    amount: number;
    currencyCode: string;
  };
  originalPrice?: {
    amount: number;
    currencyCode: string;
  };
  badge?: "Best Seller" | "Recommended" | "New Arrival" | "Trending" | "Featured" | null;
  soldCount?: number;
  inventoryQuantity?: number | null;
  manageInventory?: boolean | null;
  allowBackorder?: boolean | null;
}

interface BannerProps {
  desktopImage: string;
  mobileImage: string;
  link: string;
}

interface ProductCarouselSectionProps {
  title: string;
  subtitle?: string;
  products: Product[];
  tabs?: string[];
  viewAllLink?: string;
  banner?: BannerProps;
}

export function ProductCarouselSection({ title, subtitle, products, tabs, viewAllLink, banner }: ProductCarouselSectionProps) {
  const [activeTab, setActiveTab] = useState(tabs?.[0] || "");
  
  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">{title}</h2>
            {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
          </div>
          {viewAllLink && (
            <a href={viewAllLink} className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1">
              Бүгдийг үзэх <ChevronRight className="h-4 w-4" />
            </a>
          )}
        </div>

        {/* Category Tabs */}
        {tabs && tabs.length > 0 && (
          <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide pb-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        )}

        {/* Products Carousel with Optional Banner */}
        {banner ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
            {/* Banner on Left - Desktop */}
            <Link href={banner.link} className="hidden lg:block lg:col-span-4 group">
              <div className="relative overflow-hidden rounded-2xl h-full min-h-[400px] bg-gray-100 sticky top-4">
                <Image
                  src={banner.desktopImage}
                  alt="Banner"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="33vw"
                />
              </div>
            </Link>

            {/* Products Carousel on Right */}
            <div className="lg:col-span-8">
              {/* Mobile Banner - Above products */}
              <Link href={banner.link} className="lg:hidden block group mb-6">
                <div className="relative overflow-hidden rounded-2xl aspect-[3/4] bg-gray-100">
                  <Image
                    src={banner.mobileImage}
                    alt="Banner"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="100vw"
                  />
                </div>
              </Link>
              
              <div className="relative">
                <Swiper
                  modules={[Pagination, Autoplay, Mousewheel]}
                  spaceBetween={16}
                  slidesPerView={2}
                  simulateTouch={false}
                  allowTouchMove={true}
                  touchStartPreventDefault={false}
                  mousewheel={{
                    forceToAxis: true,
                    sensitivity: 1,
                    releaseOnEdges: true,
                  }}
                  pagination={{
                    clickable: true,
                    type: 'progressbar',
                  }}
                  autoplay={{
                    delay: 5000,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                  }}
                  breakpoints={{
                    768: {
                      slidesPerView: 2,
                      spaceBetween: 24,
                    },
                    1024: {
                      slidesPerView: 3,
                      spaceBetween: 24,
                    },
                  }}
                  className="product-carousel"
                >
                  {products.map((product) => (
                    <SwiperSlide key={product.id}>
                      <ProductCard {...product} />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative">
            <Swiper
              modules={[Pagination, Autoplay, Mousewheel]}
              spaceBetween={16}
              slidesPerView={2}
              simulateTouch={false}
              allowTouchMove={true}
              touchStartPreventDefault={false}
              mousewheel={{
                forceToAxis: true,
                sensitivity: 1,
                releaseOnEdges: true,
              }}
              pagination={{
                clickable: true,
                type: 'progressbar',
              }}
              autoplay={{
                delay: 5000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              breakpoints={{
                768: {
                  slidesPerView: 3,
                  spaceBetween: 24,
                },
                1024: {
                  slidesPerView: 4,
                  spaceBetween: 24,
                },
              }}
              className="product-carousel"
            >
              {products.map((product) => (
                <SwiperSlide key={product.id}>
                  <ProductCard {...product} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}
      </div>

      <style jsx global>{`
        .product-carousel {
          padding-bottom: 28px;
        }

        .product-carousel .swiper-pagination-progressbar {
          height: 3px !important;
          background: #e5e7eb !important;
          border-radius: 2px !important;
          bottom: 0 !important;
          top: auto !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
          width: 120px !important;
        }

        .product-carousel .swiper-pagination-progressbar-fill {
          background: #2563eb !important;
          border-radius: 2px !important;
        }
      `}</style>
    </section>
  );
}
