import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductFilters } from "@/components/products/ProductFilters";
import { medusa } from "@/lib/medusa";
import { getCategories } from "@/lib/data/categories";

interface ProductQuery {
  limit: number;
  fields: string;
  category_id?: string[];
}

// Extended variant type that includes prices
interface VariantWithPrices {
  id: string;
  title: string | null;
  options?: { option_id: string; value: string }[];
  prices?: { amount: number; currency_code: string }[];
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
  const priceMin = searchParams.price_min ? parseInt(searchParams.price_min as string) : null;
  const priceMax = searchParams.price_max ? parseInt(searchParams.price_max as string) : null;

  const query: ProductQuery = {
    limit: 100, // Fetch more to allow client-side price filtering
    fields: "id,title,handle,thumbnail,options.*,options.values.*,variants.id,variants.title,variants.options.*,variants.prices.amount,variants.prices.currency_code,+variants.inventory_quantity,+variants.manage_inventory,+variants.allow_backorder",
  };

  if (categoryId) {
    query.category_id = [categoryId];
  }

  try {
    const { products } = await medusa.store.product.list(query);
    
    // Cast to our extended type that includes prices
    let typedProducts = products as unknown as ProductWithPrices[];
    
    // Price filtering (client-side since Medusa doesn't support price range filtering directly)
    if (priceMin !== null || priceMax !== null) {
      typedProducts = typedProducts.filter(product => {
        const price = product.variants?.[0]?.prices?.[0]?.amount || 0;
        if (priceMin !== null && price < priceMin) return false;
        if (priceMax !== null && price > priceMax) return false;
        return true;
      });
    }
    
    // In-memory sort for price if needed (for small catalog)
    if (order === 'price_asc') {
      typedProducts.sort((a, b) => {
        const priceA = a.variants?.[0]?.prices?.[0]?.amount || 0;
        const priceB = b.variants?.[0]?.prices?.[0]?.amount || 0;
        return priceA - priceB;
      });
    } else if (order === 'price_desc') {
      typedProducts.sort((a, b) => {
        const priceA = a.variants?.[0]?.prices?.[0]?.amount || 0;
        const priceB = b.variants?.[0]?.prices?.[0]?.amount || 0;
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

        {/* Filters Bar - Horizontal, minimal */}
        <div className="border-b border-gray-100 sticky top-[88px] bg-white/95 backdrop-blur-md z-30">
          <div className="container mx-auto px-4">
            <ProductFilters categories={categories} />
          </div>
        </div>

        {/* Product Grid */}
        <div className="container mx-auto px-4 py-8 md:py-12">
          {products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((product) => {
                const firstVariant = product.variants?.[0];
                const firstPrice = firstVariant?.prices?.[0];
                
                return (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    title={product.title}
                    handle={product.handle}
                    thumbnail={product.thumbnail ?? undefined}
                    options={product.options?.map(opt => ({
                      id: opt.id,
                      title: opt.title,
                      values: opt.values?.map(v => v.value) ?? []
                    }))}
                    variants={product.variants?.map(v => ({
                      id: v.id,
                      title: v.title ?? "Default",
                      options: v.options,
                      inventory_quantity: v.inventory_quantity,
                      manage_inventory: v.manage_inventory,
                      allow_backorder: v.allow_backorder
                    }))}
                    price={
                      firstPrice
                        ? {
                            amount: firstPrice.amount,
                            currencyCode: firstPrice.currency_code,
                          }
                        : undefined
                    }
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
      </main>

      <Footer />
    </div>
  );
}
