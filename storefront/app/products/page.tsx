import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductFiltersSidebar } from "@/components/products/ProductFiltersSidebar";
import { medusa } from "@/lib/medusa";
import { getCategories } from "@/lib/data/categories";
import { getCollections } from "@/lib/data/collections";
import { getDefaultRegion } from "@/lib/data/regions";
import { extractFilterOptions } from "@/lib/utils/filterUtils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Бүх бүтээгдэхүүн",
  description: "Технологийн сүүлийн үеийн бүтээгдэхүүнүүдийг баталгаат хугацаатай хэрэглэгчдэд нийлүүлж байна. Утас, дрон, камер, дугуй болон бусад бүтээгдэхүүнүүд.",
  openGraph: {
    title: "Бүх бүтээгдэхүүн",
    description: "Технологийн сүүлийн үеийн бүтээгдэхүүнүүдийг баталгаат хугацаатай хэрэглэгчдэд нийлүүлж байна.",
    url: "https://alimhan.mn/products",
    siteName: "Алимхан Дэлгүүр",
    locale: "mn_MN",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Бүх бүтээгдэхүүн",
    description: "Технологийн сүүлийн үеийн бүтээгдэхүүнүүдийг баталгаат хугацаатай хэрэглэгчдэд нийлүүлж байна.",
  },
  alternates: {
    canonical: "https://alimhan.mn/products",
  },
};

interface ProductQuery {
  limit: number;
  fields: string;
  category_id?: string[];
  region_id?: string;
}

// Calculated price from promotions/price lists
interface CalculatedPrice {
  id?: string;
  calculated_amount: number;
  original_amount: number;
  currency_code: string;
  is_calculated_price_price_list?: boolean;
  is_calculated_price_tax_inclusive?: boolean;
}

// Extended variant type that includes prices and calculated prices
interface VariantWithPrices {
  id: string;
  title: string | null;
  options?: { option_id: string; value: string }[];
  prices?: { amount: number; currency_code: string }[];
  calculated_price?: CalculatedPrice;
  inventory_quantity?: number;
  manage_inventory?: boolean;
  allow_backorder?: boolean;
}

// Extended types for product data with prices
interface ProductWithPrices {
  id: string;
  title: string;
  handle: string;
  thumbnail: string | null;
  metadata?: Record<string, unknown> | null;
  collection?: {
    id: string;
    title: string;
    handle: string;
  } | null;
  options?: {
    id: string;
    title: string;
    values?: { id: string; value: string }[];
  }[] | null;
  variants?: VariantWithPrices[] | null;
}

async function getProducts(searchParams: { [key: string]: string | string[] | undefined }): Promise<ProductWithPrices[]> {
  const categoryId = searchParams.category_id as string;
  const order = searchParams.order as string;
  const priceMinParsed = searchParams.price_min ? parseInt(searchParams.price_min as string) : NaN;
  const priceMaxParsed = searchParams.price_max ? parseInt(searchParams.price_max as string) : NaN;
  const priceMin = !isNaN(priceMinParsed) && priceMinParsed > 0 ? priceMinParsed : null;
  const priceMax = !isNaN(priceMaxParsed) && priceMaxParsed > 0 ? priceMaxParsed : null;

  // Get default region for calculated prices (promotions)
  const region = await getDefaultRegion();

  const query: ProductQuery = {
    limit: 100, // Fetch more to allow client-side price filtering
    fields: "id,title,handle,thumbnail,metadata,options.*,options.values.*,variants.id,variants.title,variants.options.*,variants.prices.amount,variants.prices.currency_code,+variants.calculated_price,+variants.inventory_quantity,+variants.manage_inventory,+variants.allow_backorder",
  };

  // Add region_id to get calculated prices with promotions
  if (region?.id) {
    query.region_id = region.id;
  }

  if (categoryId) {
    query.category_id = [categoryId];
  }

  try {
    const { products } = await medusa.store.product.list(query);
    
    // Cast to our extended type that includes prices
    let typedProducts = products as unknown as ProductWithPrices[];
    
    // Price filtering - use calculated_price if available, otherwise fall back to prices
    if (priceMin !== null || priceMax !== null) {
      typedProducts = typedProducts.filter(product => {
        const variant = product.variants?.[0];
        const price = variant?.calculated_price?.calculated_amount ?? variant?.prices?.[0]?.amount ?? 0;
        if (priceMin !== null && price < priceMin) return false;
        if (priceMax !== null && price > priceMax) return false;
        return true;
      });
    }
    
    // In-memory sort for price if needed (for small catalog)
    if (order === 'price_asc') {
      typedProducts.sort((a, b) => {
        const variantA = a.variants?.[0];
        const variantB = b.variants?.[0];
        const priceA = variantA?.calculated_price?.calculated_amount ?? variantA?.prices?.[0]?.amount ?? 0;
        const priceB = variantB?.calculated_price?.calculated_amount ?? variantB?.prices?.[0]?.amount ?? 0;
        return priceA - priceB;
      });
    } else if (order === 'price_desc') {
      typedProducts.sort((a, b) => {
        const variantA = a.variants?.[0];
        const variantB = b.variants?.[0];
        const priceA = variantA?.calculated_price?.calculated_amount ?? variantA?.prices?.[0]?.amount ?? 0;
        const priceB = variantB?.calculated_price?.calculated_amount ?? variantB?.prices?.[0]?.amount ?? 0;
        return priceB - priceA;
      });
    }

    return typedProducts;
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const products = await getProducts(params);
  const categories = await getCategories();
  const collections = await getCollections();
  
  // Extract dynamic filter options from products
  const filterOptions = extractFilterOptions(products as unknown as Parameters<typeof extractFilterOptions>[0]);

  const activeCategory = params.category_id 
    ? categories.find(c => c.id === params.category_id)?.name 
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-1">
        {/* Minimal Hero */}
        <div className="border-b border-gray-100">
          <div className="container mx-auto px-4 py-8 md:py-12">
            <h1 className="text-[28px] md:text-[40px] font-semibold text-[#1d1d1f] tracking-tight">
              {activeCategory || "Бүх бүтээгдэхүүн"}
            </h1>
            <p className="text-[#86868b] text-[15px] md:text-[17px] mt-1">
              {products.length} бүтээгдэхүүн
            </p>
          </div>
        </div>

        {/* Content with Sidebar */}
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="flex gap-8">
            {/* Left Sidebar - Filters (Hidden on mobile) */}
            <aside className="hidden lg:block w-64 shrink-0">
              <ProductFiltersSidebar 
                categories={categories}
                collections={collections}
                tags={filterOptions.tags}
                availableOptions={filterOptions.availableOptions}
                priceRange={filterOptions.priceRange}
                pageType="products"
              />
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Mobile Filter Sidebar */}
              <div className="lg:hidden mb-6">
                <ProductFiltersSidebar 
                  categories={categories}
                  collections={collections}
                  tags={filterOptions.tags}
                  availableOptions={filterOptions.availableOptions}
                  priceRange={filterOptions.priceRange}
                  pageType="products"
                />
              </div>

              {/* Product Grid */}
              {products.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {products.map((product) => {
                const firstVariant = product.variants?.[0];
                const calculatedPrice = firstVariant?.calculated_price;
                const firstPrice = firstVariant?.prices?.[0];
                
                // Use calculated price if available (includes promotions)
                const displayPrice = calculatedPrice?.calculated_amount ?? firstPrice?.amount;
                const originalPrice = calculatedPrice?.original_amount;
                const currencyCode = calculatedPrice?.currency_code ?? firstPrice?.currency_code ?? "MNT";
                const isOnSale = calculatedPrice && calculatedPrice.calculated_amount < calculatedPrice.original_amount;
                
                return (
                  <ProductCard
                    key={product.id}
                    id={firstVariant?.id ?? product.id}
                    productId={product.id}
                    title={product.title}
                    handle={product.handle}
                    thumbnail={product.thumbnail ?? undefined}
                    tradeInEligible={Boolean(product.metadata?.trade_in_eligible)}
                    price={
                      displayPrice
                        ? {
                            amount: displayPrice,
                            currencyCode: currencyCode,
                          }
                        : undefined
                    }
                    originalPrice={
                      isOnSale && originalPrice
                        ? {
                            amount: originalPrice,
                            currencyCode: currencyCode,
                          }
                        : undefined
                    }
                    inventoryQuantity={firstVariant?.inventory_quantity ?? null}
                    manageInventory={firstVariant?.manage_inventory ?? null}
                    allowBackorder={firstVariant?.allow_backorder ?? null}
                    collection={product.collection ?? null}
                  />
                );
              })}
            </div>
          ) : (
            <div className="py-20 text-center">
              <p className="text-[#86868b] text-[17px]">
                Бүтээгдэхүүн олдсонгүй.
              </p>
            </div>
          )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
