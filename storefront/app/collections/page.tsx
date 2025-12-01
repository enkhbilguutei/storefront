import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getCategories } from "@/lib/data/categories";
import Link from "next/link";
import { ChevronRight, Package } from "lucide-react";

export default async function CollectionsPage() {
  const categories = await getCategories();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-linear-to-br from-violet-50 via-purple-50 to-fuchsia-50 overflow-hidden relative">
          <div className="absolute inset-0">
            <div className="absolute top-10 right-10 w-64 h-64 bg-linear-to-r from-violet-200/30 to-purple-200/30 rounded-full blur-3xl" />
            <div className="absolute bottom-10 left-10 w-80 h-80 bg-linear-to-r from-fuchsia-200/30 to-pink-200/30 rounded-full blur-3xl" />
          </div>
          
          <div className="container mx-auto px-4 py-16 relative">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-secondary mb-8">
              <Link href="/" className="hover:text-foreground transition-colors">
                Нүүр
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground font-medium">Ангилалууд</span>
            </nav>

            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Бүтээгдэхүүний ангилал
            </h1>
            <p className="text-lg text-secondary max-w-2xl">
              Манай бүх ангилалуудаас хүссэн бүтээгдэхүүнээ хайж олоорой. 
              Хүүхдийн хувцаснаас эхлээд тоглоом, хэрэгсэл хүртэл бүгдийг нэг дор.
            </p>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            {categories.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/categories/${category.handle}`}
                    className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-gray-200"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-violet-100 to-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Package className="h-7 w-7 text-violet-600" strokeWidth={1.5} />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-xl font-bold text-foreground group-hover:text-violet-600 transition-colors">
                          {category.name}
                        </h2>
                        {category.parent_category && (
                          <p className="text-sm text-secondary">
                            {category.parent_category.name} дотор
                          </p>
                        )}
                      </div>
                      <ChevronRight className="h-5 w-5 text-secondary group-hover:text-violet-600 group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                    
                    <p className="text-secondary">
                      {category.description || `${category.name} ангилалын бүх бүтээгдэхүүнүүд`}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                <Package className="h-16 w-16 text-secondary mx-auto mb-4" strokeWidth={1} />
                <h2 className="text-xl font-bold text-foreground mb-2">
                  Ангилал байхгүй
                </h2>
                <p className="text-secondary mb-6">
                  Одоогоор бүтээгдэхүүний ангилал бүртгэгдээгүй байна.
                </p>
                <Link 
                  href="/products"
                  className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 rounded-full font-medium hover:bg-foreground/90 transition-colors"
                >
                  Бүх бүтээгдэхүүн үзэх
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-white border-t border-gray-100">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Хайж буй зүйлээ олохгүй байна уу?
            </h2>
            <p className="text-secondary mb-8 max-w-lg mx-auto">
              Бүх бүтээгдэхүүнээс хайлт хийж үзээрэй эсвэл бидэнтэй холбогдоорой.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/products"
                className="inline-flex items-center justify-center gap-2 bg-foreground text-background px-8 py-3 rounded-full font-medium hover:bg-foreground/90 transition-colors"
              >
                Бүх бүтээгдэхүүн
                <ChevronRight className="h-4 w-4" />
              </Link>
              <Link 
                href="/about"
                className="inline-flex items-center justify-center gap-2 bg-white text-foreground border border-gray-200 px-8 py-3 rounded-full font-medium hover:bg-gray-50 transition-colors"
              >
                Холбоо барих
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
