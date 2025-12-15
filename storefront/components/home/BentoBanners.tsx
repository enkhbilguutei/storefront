import Link from "next/link";
import { CloudinaryImage } from "@/components/Cloudinary";
import type { Banner } from "@/lib/data/banners";

interface BentoBannersProps {
  banners: Banner[];
  className?: string;
}

export function BentoBanners({ banners, className = "" }: BentoBannersProps) {
  // If no banners, don't render anything
  if (!banners || banners.length === 0) {
    return null;
  }

  // Use the first active banner
  const banner = banners[0];

  return (
    <section className={`py-8 md:py-12 lg:py-16 bg-background ${className}`}>
      <div className="container mx-auto px-4">
        {/* Desktop: Single Wide Banner (16:5 aspect ratio) */}
        <Link href={banner.link} className="hidden md:block group">
          <div className="relative overflow-hidden rounded-2xl md:rounded-3xl aspect-16/5 bg-gray-100">
            <CloudinaryImage
              src={banner.image_url}
              alt={banner.alt_text || banner.title || "Banner"}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
        </Link>

        {/* Mobile: Vertical Banner (3:4 aspect ratio) */}
        <Link href={banner.link} className="md:hidden block group">
          <div className="relative overflow-hidden rounded-2xl aspect-3/4 bg-gray-100">
            <CloudinaryImage
              src={banner.mobile_image_url || banner.image_url}
              alt={banner.alt_text || banner.title || "Banner"}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
        </Link>
      </div>
    </section>
  );
}
