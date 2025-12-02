import { CloudinaryImage } from "@/components/Cloudinary";
import Link from "next/link";
import { iphoneBanners } from "@/lib/config/images";

export function IPhoneBanners() {
  return (
    <section className="py-3 container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {iphoneBanners.map((banner) => (
          <Link
            key={banner.id}
            href={banner.link}
            className="relative rounded-3xl overflow-hidden block group bg-black"
          >
            <CloudinaryImage
              src={banner.image}
              alt={banner.alt}
              width={800}
              height={500}
              className="w-full h-[400px] md:h-[500px] object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-8">
              <span className="text-lg font-normal text-blue-400 hover:underline transition-colors">
                Худалдаж авах &gt;
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
