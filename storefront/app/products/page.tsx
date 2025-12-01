import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductFilters } from "@/components/products/ProductFilters";
import { medusa } from "@/lib/medusa";

async function getProducts(searchParams: { [key: string]: string | string[] | undefined }) {
  const collectionId = searchParams.collection_id as string;
  const order = searchParams.order as string;

  const query: any = {
    limit: 20,
    fields: "id,title,handle,thumbnail,options,variants.id,variants.title,variants.options,variants.prices.amount,variants.prices.currency_code",
  };

  if (collectionId) {
    query.collection_id = [collectionId];
  }

  try {
    const { products } = await medusa.store.product.list(query);
    
    // In-memory sort for price if needed (for small catalog)
    if (order === 'price_asc') {
      products.sort((a: any, b: any) => {
        const priceA = a.variants?.[0]?.prices?.[0]?.amount || 0;
        const priceB = b.variants?.[0]?.prices?.[0]?.amount || 0;
        return priceA - priceB;
      });
    } else if (order === 'price_desc') {
      products.sort((a: any, b: any) => {
        const priceA = a.variants?.[0]?.prices?.[0]?.amount || 0;
        const priceB = b.variants?.[0]?.prices?.[0]?.amount || 0;
        return priceB - priceA;
      });
    }

    return products;
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
}

async function getCollections() {
  try {
    const { collections } = await medusa.store.collection.list();
    return collections;
  } catch (error) {
    console.error("Failed to fetch collections:", error);
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
  const collections = await getCollections();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Бүх бүтээгдэхүүн</h1>
            <p className="text-gray-600 mt-2">
              Манай бүх бүтээгдэхүүний цуглуулгыг нээгээрэй
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar Filters */}
            <aside className="w-full md:w-64 shrink-0">
              <div className="bg-white p-6 rounded-2xl shadow-sm sticky top-24">
                <ProductFilters collections={collections} />
              </div>
            </aside>

            {/* Product Grid */}
            <div className="flex-1">
              {products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product: any) => (
                    <ProductCard
                      key={product.id}
                      id={product.id}
                      title={product.title}
                      handle={product.handle}
                      thumbnail={product.thumbnail}
                      options={product.options}
                      variants={product.variants}
                      price={
                        product.variants?.[0]?.prices?.[0]
                          ? {
                              amount: product.variants[0].prices[0].amount,
                              currencyCode: product.variants[0].prices[0].currency_code,
                            }
                          : undefined
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                  <p className="text-gray-500 text-lg">
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
