import { ProductGridSection } from "./ProductGridSection";
import { getCategories, getProductsByCategory } from "@/lib/data/categories";
import { getFeaturedProducts } from "@/lib/data/products";
import { TrustBadges } from "@/components/products/TrustBadges";

export async function HomeContent() {
  // Fetch real data from database
  const categories = await getCategories();
  const allProducts = await getFeaturedProducts(20);
  
  // Find specific categories
  const iphoneCategory = categories.find(c => c.handle === "i-phone");
  const ipadCategory = categories.find(c => c.handle === "i-pad");
  const macbookCategory = categories.find(c => c.handle === "mac-book");
  const airpodsCategory = categories.find(c => c.handle === "air-pods");
  const appleWatchCategory = categories.find(c => c.handle === "apple-watch");
  const gamingCategory = categories.find(c => c.handle === "gaming");
  const accessoriesCategory = categories.find(c => c.handle === "accessories");
  
  // Fetch products by category
  const iphoneProducts = iphoneCategory ? await getProductsByCategory(iphoneCategory.id) : [];
  const ipadProducts = ipadCategory ? await getProductsByCategory(ipadCategory.id) : [];
  const macbookProducts = macbookCategory ? await getProductsByCategory(macbookCategory.id) : [];
  const airpodsProducts = airpodsCategory ? await getProductsByCategory(airpodsCategory.id) : [];
  const appleWatchProducts = appleWatchCategory ? await getProductsByCategory(appleWatchCategory.id) : [];
  const gamingProducts = gamingCategory ? await getProductsByCategory(gamingCategory.id) : [];
  const accessoriesProducts = accessoriesCategory ? await getProductsByCategory(accessoriesCategory.id) : [];
  
  // Combine Apple products
  const appleProducts = [
    ...iphoneProducts.slice(0, 3),
    ...macbookProducts.slice(0, 2),
    ...ipadProducts.slice(0, 1),
  ];
  
  return (
    <>
      {/* Trust Badges Section */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            Яагаад биднээс худалдан авах хэрэгтэй вэ?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            100% жинхэнэ бүтээгдэхүүн, найдвартай үйлчилгээ, хурдан хүргэлт
          </p>
        </div>
        <TrustBadges variant="detailed" />
      </section>

      {/* Apple Products Section */}
      {appleProducts.length > 0 && (
        <ProductGridSection
          title="Best of Apple"
          subtitle="iPhone, MacBook, iPad, AirPods болон бусад"
          products={appleProducts}
          viewAllLink="/categories/i-phone"
        />
      )}

      {/* Gaming Section */}
      {gamingProducts.length > 0 && (
        <ProductGridSection
          title="Gaming & Entertainment"
          subtitle="PlayStation, Nintendo Switch болон дагалдах хэрэгсэл"
          products={gamingProducts}
          viewAllLink="/categories/gaming"
        />
      )}

      {/* iPad Collection */}
      {ipadProducts.length > 0 && (
        <ProductGridSection
          title="iPad Collection"
          subtitle="iPad Pro, iPad Air, iPad Mini - бүх загварууд"
          products={ipadProducts}
          viewAllLink="/categories/i-pad"
        />
      )}

      {/* AirPods & Apple Watch */}
      {(airpodsProducts.length > 0 || appleWatchProducts.length > 0) && (
        <ProductGridSection
          title="AirPods & Apple Watch"
          subtitle="Таны амьдралыг хялбарчлах ухаалаг бүтээгдэхүүн"
          products={[...airpodsProducts, ...appleWatchProducts].slice(0, 6)}
          viewAllLink="/categories/air-pods"
        />
      )}

      {/* Accessories */}
      {accessoriesProducts.length > 0 && (
        <ProductGridSection
          title="Accessories"
          subtitle="AirTag, Apple Pencil, Magic Mouse, HomePod болон бусад"
          products={accessoriesProducts}
          viewAllLink="/categories/accessories"
        />
      )}

      {/* All Products */}
      {allProducts.length > 0 && (
        <ProductGridSection
          title="Бүх бүтээгдэхүүн"
          subtitle="Манай дэлгүүрийн бүх санал"
          products={allProducts.slice(0, 12)}
          viewAllLink="/products"
        />
      )}
    </>
  );
}
