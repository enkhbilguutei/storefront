import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ProductCard } from "@/components/products/product-card";
import { medusa } from "@/lib/medusa";

async function getProducts() {
  try {
    const { products } = await medusa.store.product.list({
      limit: 20,
    });
    return products;
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Бүх бүтээгдэхүүн</h1>
            <p className="text-gray-600 mt-2">
              Манай бүх бүтээгдэхүүний цуглуулгыг нээгээрэй
            </p>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product: any) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  title={product.title}
                  handle={product.handle}
                  thumbnail={product.thumbnail}
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
            <div className="text-center py-12">
              <p className="text-gray-500">
                Бүтээгдэхүүн олдсонгүй. Medusa backend ажиллаж байгаа эсэхийг шалгана уу.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
