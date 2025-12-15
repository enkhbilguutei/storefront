import { ProductGridSection } from "./ProductGridSection";
import { getCategories, getProductsByCategory } from "@/lib/data/categories";
import { getFeaturedProducts } from "@/lib/data/products";
import { getProductGridBanner } from "@/lib/data/banners";

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
  
  // Fetch CMS banners for each section
  const [appleBanner, gamingBanner, ipadBanner, airpodsBanner, accessoriesBanner] = await Promise.all([
    getProductGridBanner("apple"),
    getProductGridBanner("gaming"),
    getProductGridBanner("ipad"),
    getProductGridBanner("airpods"),
    getProductGridBanner("accessories"),
  ]);
  
  // Helper to convert Banner to BannerProps
  const toBannerProps = (banner: Awaited<ReturnType<typeof getProductGridBanner>>) => {
    if (!banner) return undefined;
    return {
      desktopImage: banner.image_url,
      mobileImage: banner.mobile_image_url || banner.image_url,
      link: banner.link,
    };
  };
  
  return (
    <>
      {/* Apple Products Section */}
      {appleProducts.length > 0 && (
        <ProductGridSection
          title="Best of Apple"
          subtitle="iPhone, MacBook, iPad, AirPods болон бусад"
          products={appleProducts}
          viewAllLink="/categories/i-phone"
          banner={toBannerProps(appleBanner)}
        />
      )}

      {/* Gaming Section */}
      {gamingProducts.length > 0 && (
        <ProductGridSection
          title="Gaming & Entertainment"
          subtitle="PlayStation, Nintendo Switch болон дагалдах хэрэгсэл"
          products={gamingProducts}
          viewAllLink="/categories/gaming"
          banner={toBannerProps(gamingBanner)}
        />
      )}

      {/* iPad Collection */}
      {ipadProducts.length > 0 && (
        <ProductGridSection
          title="iPad Collection"
          subtitle="iPad Pro, iPad Air, iPad Mini - бүх загварууд"
          products={ipadProducts}
          viewAllLink="/categories/i-pad"
          banner={toBannerProps(ipadBanner)}
        />
      )}

      {/* AirPods & Apple Watch */}
      {(airpodsProducts.length > 0 || appleWatchProducts.length > 0) && (
        <ProductGridSection
          title="AirPods & Apple Watch"
          subtitle="Таны амьдралыг хялбарчлах ухаалаг бүтээгдэхүүн"
          products={[...airpodsProducts, ...appleWatchProducts].slice(0, 6)}
          viewAllLink="/categories/air-pods"
          banner={toBannerProps(airpodsBanner)}
        />
      )}

      {/* Accessories */}
      {accessoriesProducts.length > 0 && (
        <ProductGridSection
          title="Accessories"
          subtitle="AirTag, Apple Pencil, Magic Mouse, HomePod болон бусад"
          products={accessoriesProducts}
          viewAllLink="/categories/accessories"
          banner={toBannerProps(accessoriesBanner)}
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
