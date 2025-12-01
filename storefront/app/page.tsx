import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gray-900 text-white">
          <div className="container mx-auto px-4 py-24 md:py-32">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                Алимхан дэлгүүрт тавтай морил
              </h1>
              <p className="text-lg md:text-xl text-gray-300 mb-8">
                Манай сонгомол чанартай бүтээгдэхүүнүүдийг нээгээрэй. Чанар болон загвар бүх бүтээгдэхүүнд.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center px-6 py-3 bg-white text-gray-900 font-medium rounded-md hover:bg-gray-100 transition-colors"
                >
                  Худалдан авах
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  href="/collections"
                  className="inline-flex items-center justify-center px-6 py-3 border border-white text-white font-medium rounded-md hover:bg-white/10 transition-colors"
                >
                  Цуглуулга үзэх
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Categories */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
              Ангиллаар худалдан авах
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[{ name: "Шинэ бүтээгдэхүүн", slug: "new-arrivals" }, { name: "Хамгийн их борлуулалттай", slug: "best-sellers" }, { name: "Хямдрал", slug: "sale" }].map((category) => (
                <Link
                  key={category.slug}
                  href={`/collections/${category.slug}`}
                  className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-gray-100"
                >
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl md:text-2xl font-semibold text-white">
                      {category.name}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="space-y-4">
                <div className="w-12 h-12 mx-auto bg-black text-white rounded-full flex items-center justify-center">
                  🚚
                </div>
                <h3 className="font-semibold">Үнэгүй хүргэлт</h3>
                <p className="text-sm text-gray-600">100,000₮-с дээш захиалгад</p>
              </div>
              <div className="space-y-4">
                <div className="w-12 h-12 mx-auto bg-black text-white rounded-full flex items-center justify-center">
                  ↩️
                </div>
                <h3 className="font-semibold">Хялбар буцаалт</h3>
                <p className="text-sm text-gray-600">30 хоногийн буцаалтын бодлого</p>
              </div>
              <div className="space-y-4">
                <div className="w-12 h-12 mx-auto bg-black text-white rounded-full flex items-center justify-center">
                  🔒
                </div>
                <h3 className="font-semibold">Аюулгүй төлбөр</h3>
                <p className="text-sm text-gray-600">100% найдвартай төлбөр</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
