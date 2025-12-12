import Link from "next/link"
import type { Metadata } from "next"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { getCollections } from "@/lib/data/collections"

export const metadata: Metadata = {
  title: "Цуглуулгууд",
  description: "Цуглуулгаар нь бүтээгдэхүүнүүдийг хурдан олоорой.",
}

export default async function CollectionsPage() {
  const collections = await getCollections()

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1">
        <div className="border-b border-gray-100">
          <div className="container mx-auto px-4 py-8 md:py-12">
            <h1 className="text-[28px] md:text-[40px] font-semibold text-[#1d1d1f] tracking-tight">
              Цуглуулгууд
            </h1>
            <p className="text-[#86868b] text-[15px] md:text-[17px] mt-1">
              {collections.length} цуглуулга
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 md:py-12">
          {collections.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {collections.map((collection) => (
                <Link
                  key={collection.id}
                  href={`/collections/${collection.handle}`}
                  className="group flex items-center justify-between rounded-xl border border-gray-200 bg-white px-5 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900 group-hover:text-gray-900">
                      {collection.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Цуглуулга үзэх</p>
                  </div>
                  <span className="text-sm text-gray-400 group-hover:text-gray-600">→</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <p className="text-[#86868b] text-[17px]">Цуглуулга олдсонгүй.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
