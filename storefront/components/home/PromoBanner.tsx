import { CloudinaryImage } from "@/components/Cloudinary";
import Link from "next/link";

export function PromoBanner() {
  return (
    <section className="py-12 container mx-auto px-4">
      <div className="relative w-full h-[300px] md:h-[400px] rounded-2xl overflow-hidden">
        <CloudinaryImage
          src="https://res.cloudinary.com/do1xiqlxi/image/upload/v1764596586/alimhan-cover_zslzt8.jpg"
          alt="Alimhan Store Promo"
          width={1200}
          height={400}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-6">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 drop-shadow-lg">Ирээдүйг мэдэр</h2>
          <p className="text-lg md:text-xl mb-8 max-w-2xl drop-shadow-lg">
            Алимхан дэлгүүрээс хамгийн сүүлийн үеийн технологи, дагалдах хэрэгслийг сонирхоорой.
          </p>
          <Link
            href="/products"
            className="px-8 py-3 bg-white text-black rounded-full font-medium hover:bg-gray-100 transition-colors shadow-lg"
          >
            Дэлгүүр хэсэх
          </Link>
        </div>
      </div>
    </section>
  );
}
