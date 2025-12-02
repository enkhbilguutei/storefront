import { CloudinaryImage } from "@/components/Cloudinary";
import Link from "next/link";
import { iphoneBanners } from "@/lib/config/images";

export function IPhoneBanners() {
  return (
    <section className="py-8 container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {iphoneBanners.map((banner) => (
          <Link
            key={banner.id}
            href={banner.link}
            className="relative rounded-2xl overflow-hidden block group"
          >
            <CloudinaryImage
              src={banner.image}
              alt={banner.alt}
              width={800}
              height={400}
              className="w-full h-[320px] md:h-[280px] object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2">
              <span className="px-6 py-2.5 bg-white text-black rounded-full font-medium text-sm hover:bg-gray-100 transition-colors shadow-lg">
                Худалдаж авах
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
