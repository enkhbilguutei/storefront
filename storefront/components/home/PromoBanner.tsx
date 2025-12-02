import { CloudinaryImage } from "@/components/Cloudinary";
import Link from "next/link";
import { promoImages } from "@/lib/config/images";

export function PromoBanner() {
  return (
    <section className="py-3 container mx-auto px-4">
      <div className="relative w-full h-[400px] md:h-[500px] rounded-3xl overflow-hidden bg-[#1d1d1f]">
        <CloudinaryImage
          src={promoImages.mainBanner}
          alt="Alimhan Store Promo"
          width={1200}
          height={500}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-start pt-12 md:pt-16 text-white text-center px-6">
          <h2 className="text-4xl md:text-6xl font-display font-semibold mb-2">Ирээдүйг мэдэр</h2>
          <p className="text-base md:text-lg mb-4 max-w-xl text-white/80">
            Алимхан дэлгүүрээс хамгийн сүүлийн үеийн технологи, дагалдах хэрэгслийг сонирхоорой.
          </p>
          <Link
            href="/products"
            className="text-lg font-normal text-blue-400 hover:underline transition-colors"
          >
            Дэлгүүр хэсэх &gt;
          </Link>
        </div>
      </div>
    </section>
  );
}
