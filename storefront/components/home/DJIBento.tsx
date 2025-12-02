import { CloudinaryImage } from "@/components/Cloudinary";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { djiBentoItems } from "@/lib/config/images";

export function DJIBento() {
  return (
    <section className="py-12 container mx-auto px-4">
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">DJI бүтээгдэхүүн</h2>
        <p className="text-secondary mt-2">Бүтээлч ажлын хамгийн шилдэг багаж хэрэгсэл</p>
      </div>
      
      {/* Bento Grid - works on both mobile and desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* Large item - spans 2 columns on all screens, 2 rows on lg */}
        <Link
          href={djiBentoItems[0].link}
          className="relative rounded-2xl overflow-hidden group col-span-2 row-span-2 h-[340px] md:h-[400px] lg:h-auto"
        >
          <CloudinaryImage
            src={djiBentoItems[0].image}
            alt={djiBentoItems[0].title}
            width={800}
            height={600}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8">
            <h3 className="text-white text-xl md:text-3xl font-bold mb-1 md:mb-2 drop-shadow-lg">
              {djiBentoItems[0].title}
            </h3>
            <p className="text-white/90 text-xs md:text-base mb-3 md:mb-4 drop-shadow-lg">
              {djiBentoItems[0].description}
            </p>
            <span className="inline-flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 bg-white text-black rounded-full font-medium text-xs md:text-sm group-hover:bg-gray-100 transition-colors shadow-lg">
              Худалдаж авах
              <ArrowRight className="w-3 h-3 md:w-4 md:h-4 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </Link>

        {/* Small item 1 */}
        <Link
          href={djiBentoItems[1].link}
          className="relative rounded-2xl overflow-hidden group h-[165px] md:h-[200px] lg:h-[280px]"
        >
          <CloudinaryImage
            src={djiBentoItems[1].image}
            alt={djiBentoItems[1].title}
            width={400}
            height={300}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute bottom-0 left-0 right-0 p-3 md:p-5">
            <h3 className="text-white text-sm md:text-lg font-bold mb-0.5 md:mb-1 drop-shadow-lg">
              {djiBentoItems[1].title}
            </h3>
            <p className="text-white/90 text-[10px] md:text-xs mb-2 md:mb-3 drop-shadow-lg hidden sm:block">
              {djiBentoItems[1].description}
            </p>
            <span className="inline-flex items-center gap-1 md:gap-1.5 px-3 md:px-4 py-1.5 md:py-2 bg-white text-black rounded-full font-medium text-[10px] md:text-xs group-hover:bg-gray-100 transition-colors shadow-lg">
              Үзэх
              <ArrowRight className="w-2.5 h-2.5 md:w-3 md:h-3 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </Link>

        {/* Small item 2 */}
        <Link
          href={djiBentoItems[2].link}
          className="relative rounded-2xl overflow-hidden group h-[165px] md:h-[200px] lg:h-[280px]"
        >
          <CloudinaryImage
            src={djiBentoItems[2].image}
            alt={djiBentoItems[2].title}
            width={400}
            height={300}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute bottom-0 left-0 right-0 p-3 md:p-5">
            <h3 className="text-white text-sm md:text-lg font-bold mb-0.5 md:mb-1 drop-shadow-lg">
              {djiBentoItems[2].title}
            </h3>
            <p className="text-white/90 text-[10px] md:text-xs mb-2 md:mb-3 drop-shadow-lg hidden sm:block">
              {djiBentoItems[2].description}
            </p>
            <span className="inline-flex items-center gap-1 md:gap-1.5 px-3 md:px-4 py-1.5 md:py-2 bg-white text-black rounded-full font-medium text-[10px] md:text-xs group-hover:bg-gray-100 transition-colors shadow-lg">
              Үзэх
              <ArrowRight className="w-2.5 h-2.5 md:w-3 md:h-3 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
}
