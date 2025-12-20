"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CloudinaryImage } from "@/components/Cloudinary";
import { TRADE_IN_BADGE_TEXT } from "@/lib/tradein";

interface ProductImage {
  id: string;
  url: string;
}

interface ProductImageGalleryProps {
  productTitle: string;
  thumbnail: string;
  allImages: ProductImage[];
  isTradeInEligible: boolean;
  selectedColor?: string;
}

export function ProductImageGallery({
  productTitle,
  thumbnail,
  allImages,
  isTradeInEligible,
  selectedColor,
}: ProductImageGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-4 lg:sticky lg:top-24 h-fit" key={`gallery-${selectedColor || 'default'}`}>
      {/* Main Image */}
      <div className="aspect-square relative bg-gray-50 rounded-2xl overflow-hidden group flex items-center justify-center">
        {isTradeInEligible && (
          <div className="absolute top-4 left-4 z-10 bg-black text-white px-3 py-1 rounded-full text-xs font-medium">
            {TRADE_IN_BADGE_TEXT}
          </div>
        )}
        <CloudinaryImage
          key={`main-${selectedColor || 'default'}-${selectedImageIndex}`}
          src={allImages[selectedImageIndex]?.url || thumbnail}
          alt={productTitle}
          width={1000}
          height={1000}
          className="w-full h-full object-contain p-8 md:p-12"
          priority
        />
        
        {/* Image Navigation Arrows */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Өмнөх зураг"
            >
              <ChevronLeft className="w-5 h-5 text-[#2B2D42]" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Дараагийн зураг"
            >
              <ChevronRight className="w-5 h-5 text-[#2B2D42]" />
            </button>
          </>
        )}

        {/* Image Counter */}
        {allImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full">
            {selectedImageIndex + 1} / {allImages.length}
          </div>
        )}
      </div>
      
      {/* Thumbnail Grid */}
      {allImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {allImages.map((image, index) => (
            <button
              key={`${image.id}-${index}`}
              onClick={() => setSelectedImageIndex(index)}
              className={`shrink-0 w-20 h-20 relative bg-[#f5f5f7] rounded-xl overflow-hidden transition-all duration-200 flex items-center justify-center ${
                selectedImageIndex === index 
                  ? "ring-2 ring-[#0071e3] ring-offset-2" 
                  : "hover:ring-2 hover:ring-gray-300 hover:ring-offset-1"
              }`}
            >
              <CloudinaryImage
                src={image.url}
                alt={productTitle}
                width={160}
                height={160}
                className="w-full h-full object-contain p-2"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
