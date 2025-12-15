import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/products/ProductCard";
import { SortSelect } from "@/components/categories/SortSelect";
import { getCategoryByHandle, getProductsByCategory } from "@/lib/data/categories";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Package } from "lucide-react";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params;
  const category = await getCategoryByHandle(handle);

  if (!category) {
    return {
      title: "Ангилал олдсонгүй",
    };
  }

  const description = category.description || `${category.name} ангиллын бүтээгдэхүүнүүд. Алимхан дэлгүүрээс онлайнаар захиалаарай.`;
  const url = `https://alimhan.mn/categories/${handle}`;

  return {
    title: category.name,
    description,
    openGraph: {
      title: `${category.name} | Алимхан Дэлгүүр`,
      description,
      url,
      siteName: "Алимхан Дэлгүүр",
      locale: "mn_MN",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: category.name,
      description,
    },
    alternates: {
      canonical: url,
    },
  };
}

interface CategoryProduct {
  id: string;
  title: string;
  handle: string;
  thumbnail?: string;
  tradeInEligible?: boolean;
  price?: {
    amount: number;
    currencyCode: string;
  };
  originalPrice?: {
    amount: number;
    currencyCode: string;
  };
  inventoryQuantity?: number | null;
  manageInventory?: boolean | null;
  allowBackorder?: boolean | null;
}

export default async function CategoryPage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ handle: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { handle } = await params;
  const query = await searchParams;
  
  const category = await getCategoryByHandle(handle);
  
  if (!category) {
    notFound();
  }
  
  const products = (await getProductsByCategory(category.id)) as unknown as CategoryProduct[];
  
  // Sort products based on query params
  const sortedProducts = [...products];
  const sortOrder = query.sort as string;
  
  if (sortOrder === 'price_asc') {
    sortedProducts.sort((a, b) => (a.price?.amount ?? 0) - (b.price?.amount ?? 0));
  } else if (sortOrder === 'price_desc') {
    sortedProducts.sort((a, b) => (b.price?.amount ?? 0) - (a.price?.amount ?? 0));
  } else if (sortOrder === 'newest') {
    sortedProducts.reverse();
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-white border-b border-gray-100">
          <div className="container mx-auto px-4 py-12">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-secondary mb-6">
              <Link href="/" className="hover:text-foreground transition-colors">
                Нүүр
              </Link>
              <ChevronRight className="h-4 w-4" />
              <Link href="/products" className="hover:text-foreground transition-colors">
                Бүтээгдэхүүн
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground font-medium">{category.name}</span>
            </nav>
            
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-foreground/5 flex items-center justify-center">
                <Package className="h-8 w-8 text-foreground" strokeWidth={1.5} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">{category.name}</h1>
                <p className="text-secondary mt-1">
                  {category.description || `${category.name} бүтээгдэхүүнүүд`}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <p className="text-secondary">
              {sortedProducts.length} бүтээгдэхүүн олдлоо
            </p>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-secondary">Эрэмбэлэх:</span>
              <SortSelect currentSort={sortOrder} />
            </div>
          </div>

          {/* Product Grid */}
          {sortedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedProducts.map((product) => {
                return (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    productId={product.id}
                    title={product.title}
                    handle={product.handle}
                    thumbnail={product.thumbnail}
                    tradeInEligible={product.tradeInEligible}
                    price={product.price}
                    originalPrice={product.originalPrice}
                    collection={null}
                    inventoryQuantity={product.inventoryQuantity}
                    manageInventory={product.manageInventory}
                    allowBackorder={product.allowBackorder}
                  />
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
              <Package className="h-16 w-16 text-secondary mx-auto mb-4" strokeWidth={1} />
              <p className="text-foreground text-lg font-medium mb-2">
                Бүтээгдэхүүн олдсонгүй
              </p>
              <p className="text-secondary mb-6">
                Энэ ангилалд одоогоор бүтээгдэхүүн байхгүй байна.
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
      </main>

      <Footer />
    </div>
  );
}
