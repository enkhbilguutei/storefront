import { CloudinaryImage } from "@/components/Cloudinary";
import Link from "next/link";
import { djiBentoItems } from "@/lib/config/images";

export function DJIBento() {
  return (
    <section className="py-3 container mx-auto px-4">
      {/* Bento Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Large item - spans 2 columns on all screens, 2 rows on lg */}
        <Link
          href={djiBentoItems[0].link}
          className="relative rounded-3xl overflow-hidden group col-span-2 row-span-2 h-[400px] md:h-[500px] lg:h-auto bg-[#1d1d1f]"
        >
          <CloudinaryImage
            src={djiBentoItems[0].image}
            alt={djiBentoItems[0].title}
            width={800}
            height={600}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-start pt-10 md:pt-14 text-center">
            <h3 className="text-white text-3xl md:text-5xl font-display font-semibold mb-1">
              {djiBentoItems[0].title}
            </h3>
            <p className="text-white/80 text-sm md:text-base mb-4">
              {djiBentoItems[0].description}
            </p>
            <span className="text-lg font-normal text-blue-400 hover:underline transition-colors">
              Худалдаж авах &gt;
            </span>
          </div>
        </Link>

        {/* Small item 1 */}
        <Link
          href={djiBentoItems[1].link}
          className="relative rounded-3xl overflow-hidden group h-[200px] md:h-[245px] bg-white"
        >
          <CloudinaryImage
            src={djiBentoItems[1].image}
            alt={djiBentoItems[1].title}
            width={400}
            height={300}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-start pt-5 md:pt-6 text-center">
            <h3 className="text-foreground text-lg md:text-xl font-display font-semibold mb-0.5">
              {djiBentoItems[1].title}
            </h3>
            <p className="text-foreground/60 text-xs md:text-sm mb-2 hidden sm:block">
              {djiBentoItems[1].description}
            </p>
            <span className="text-sm font-normal text-blue-600 hover:underline transition-colors">
              Үзэх &gt;
            </span>
          </div>
        </Link>

        {/* Small item 2 */}
        <Link
          href={djiBentoItems[2].link}
          className="relative rounded-3xl overflow-hidden group h-[200px] md:h-[245px] bg-[#1d1d1f]"
        >
          <CloudinaryImage
            src={djiBentoItems[2].image}
            alt={djiBentoItems[2].title}
            width={400}
            height={300}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-start pt-5 md:pt-6 text-center">
            <h3 className="text-white text-lg md:text-xl font-display font-semibold mb-0.5">
              {djiBentoItems[2].title}
            </h3>
            <p className="text-white/70 text-xs md:text-sm mb-2 hidden sm:block">
              {djiBentoItems[2].description}
            </p>
            <span className="text-sm font-normal text-blue-400 hover:underline transition-colors">
              Үзэх &gt;
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
}
