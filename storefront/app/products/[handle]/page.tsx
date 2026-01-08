import { medusa } from "@/lib/medusa";
import { ProductDetails } from "@/components/products/ProductDetails";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { notFound } from "next/navigation";
import { getDefaultRegion } from "@/lib/data/regions";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProduct(handle);

  if (!product) {
    return {
      title: "Бүтээгдэхүүн олдсонгүй",
    };
  }

  const firstVariant = product.variants?.[0] as unknown as { prices?: Array<{ amount?: number }> } | undefined;
  const price = product.variants?.[0]?.calculated_price?.calculated_amount || firstVariant?.prices?.[0]?.amount;
  const formattedPrice = price ? new Intl.NumberFormat("mn-MN", { style: "currency", currency: "MNT" }).format(price / 100) : "";
  
  const description = product.description 
    ? `${product.description.substring(0, 155)}...` 
    : `${product.title} - ${formattedPrice}. Алимхан дэлгүүрээс онлайнаар захиалаарай.`;

  const imageUrl = product.thumbnail || product.images?.[0]?.url || "/images/placeholder.jpg";
  const url = `https://alimhan.mn/products/${handle}`;

  return {
    title: product.title,
    description,
    openGraph: {
      title: product.title,
      description,
      url,
      siteName: "Алимхан Дэлгүүр",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: product.title,
        },
      ],
      locale: "mn_MN",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: url,
    },
  };
}

async function getProduct(handle: string) {
  try {
    // Get default region for calculated prices (promotions)
    const region = await getDefaultRegion();
    
    const query: {
      handle: string;
      limit: number;
      fields: string;
      region_id?: string;
    } = {
      handle,
      limit: 1,
      fields:
        "+variants.thumbnail,+variants.images.*,+variants.inventory_quantity,+variants.manage_inventory,+variants.allow_backorder,+variants.calculated_price,id,title,handle,description,thumbnail,images.*,metadata,categories.id,categories.handle,categories.name,options.*,options.values.*,variants.id,variants.title,variants.options.*,variants.prices.amount,variants.prices.currency_code",
    };
    
    // Add region_id to get calculated prices with promotions
    if (region?.id) {
      query.region_id = region.id;
    }
    
    const { products } = await medusa.store.product.list(query);
    
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

  // Generate JSON-LD structured data for SEO
  const firstVariant = product.variants?.[0] as unknown as { prices?: Array<{ amount?: number }> } | undefined;
  const price = product.variants?.[0]?.calculated_price?.calculated_amount || firstVariant?.prices?.[0]?.amount;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description || product.title,
    image: product.thumbnail || product.images?.[0]?.url,
    brand: {
      "@type": "Brand",
      name: "Алимхан Дэлгүүр",
    },
    offers: {
      "@type": "Offer",
      url: `https://alimhan.mn/products/${handle}`,
      priceCurrency: "MNT",
      price: price ? (price / 100).toString() : "0",
      availability: (product.variants?.[0]?.inventory_quantity ?? 0) > 0 
        ? "https://schema.org/InStock" 
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Алимхан Дэлгүүр",
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        
        <main className="flex-1 pt-16">
          <div className="container mx-auto px-4 py-12 md:py-20">
            <ProductDetails product={product} />
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
