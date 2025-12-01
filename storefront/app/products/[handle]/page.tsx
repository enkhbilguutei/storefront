import { medusa } from "@/lib/medusa";
import { ProductDetails } from "@/components/products/ProductDetails";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { notFound } from "next/navigation";

async function getProduct(handle: string) {
  try {
    const { products } = await medusa.store.product.list({
      handle,
      limit: 1,
      fields: "id,title,handle,description,thumbnail,images,options,variants.id,variants.title,variants.options,variants.prices.amount,variants.prices.currency_code",
    });
    
    if (!products || products.length === 0) {
      return null;
    }

    return products[0];
  } catch (error) {
    console.error("Failed to fetch product:", error);
    return null;
  }
}

export default async function ProductPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const product = await getProduct(handle);

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12 md:py-20">
          <ProductDetails product={product} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
