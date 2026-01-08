import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { ProductCard } from "@/components/products/ProductCard"
import { ProductFiltersSidebar } from "@/components/products/ProductFiltersSidebar"
import { getCollectionByHandle } from "@/lib/data/collections"
import { getCategories } from "@/lib/data/categories"
import { getDefaultRegion } from "@/lib/data/regions"
import { medusa } from "@/lib/medusa"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>
}): Promise<Metadata> {
  const { handle } = await params
  const collection = await getCollectionByHandle(handle)

  if (!collection) {
    return {
      title: "Цуглуулга олдсонгүй",
    }
  }

  return {
    title: collection.title,
    description: `${collection.title} цуглуулгын бүтээгдэхүүнүүд`,
  }
}

// Calculated price from promotions/price lists
interface CalculatedPrice {
  calculated_amount: number
  original_amount: number
  currency_code: string
}

interface VariantWithPrices {
  id: string
  prices?: { amount: number; currency_code: string }[]
  calculated_price?: CalculatedPrice
  inventory_quantity?: number | null
  manage_inventory?: boolean | null
  allow_backorder?: boolean | null
}

interface ProductWithPrices {
  id: string
  title: string
  handle: string
  thumbnail: string | null
  metadata?: Record<string, unknown> | null
  variants?: VariantWithPrices[] | null
}

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { handle } = await params
  const query = await searchParams
  const collection = await getCollectionByHandle(handle)

  if (!collection) {
    notFound()
  }

  const region = await getDefaultRegion()
  const allCategories = await getCategories()

  const queryObj = {
    limit: 100,
    fields:
      "id,title,handle,thumbnail,metadata,variants.id,variants.prices.amount,variants.prices.currency_code,+variants.calculated_price,+variants.inventory_quantity,+variants.manage_inventory,+variants.allow_backorder",
    collection_id: [collection.id],
    ...(region?.id ? { region_id: region.id } : {}),
  } as unknown as Parameters<typeof medusa.store.product.list>[0]

  let products: ProductWithPrices[] = []
  try {
    const response = await medusa.store.product.list(queryObj)
    products = (response.products as unknown as ProductWithPrices[]) ?? []
  } catch (error) {
    console.error("Failed to fetch collection products:", error)
  }

  // Sort products based on query params
  const sortedProducts = [...products]
  const sortOrder = query.sort as string || query.order as string
  
  if (sortOrder === 'price_asc') {
    sortedProducts.sort((a, b) => {
      const priceA = a.variants?.[0]?.calculated_price?.calculated_amount ?? a.variants?.[0]?.prices?.[0]?.amount ?? 0
      const priceB = b.variants?.[0]?.calculated_price?.calculated_amount ?? b.variants?.[0]?.prices?.[0]?.amount ?? 0
      return priceA - priceB
    })
  } else if (sortOrder === 'price_desc') {
    sortedProducts.sort((a, b) => {
      const priceA = a.variants?.[0]?.calculated_price?.calculated_amount ?? a.variants?.[0]?.prices?.[0]?.amount ?? 0
      const priceB = b.variants?.[0]?.calculated_price?.calculated_amount ?? b.variants?.[0]?.prices?.[0]?.amount ?? 0
      return priceB - priceA
    })
  } else if (sortOrder === 'name_asc') {
    sortedProducts.sort((a, b) => a.title.localeCompare(b.title, 'mn'))
  } else if (sortOrder === 'name_desc') {
    sortedProducts.sort((a, b) => b.title.localeCompare(a.title, 'mn'))
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1">
        <div className="border-b border-gray-100">
          <div className="container mx-auto px-4 py-8 md:py-12">
            <h1 className="text-[28px] md:text-[40px] font-semibold text-[#1d1d1f] tracking-tight">
              {collection.title}
            </h1>
            <p className="text-[#86868b] text-[15px] md:text-[17px] mt-1">
              {sortedProducts.length} бүтээгдэхүүн
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="flex gap-8">
            {/* Left Sidebar - Filters (Hidden on mobile) */}
            <aside className="hidden lg:block w-64 shrink-0">
              <ProductFiltersSidebar 
                categories={allCategories}
                pageType="collection"
              />
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Mobile Filter Sidebar */}
              <div className="lg:hidden mb-6">
                <ProductFiltersSidebar 
                  categories={allCategories}
                  pageType="collection"
                />
              </div>

              {sortedProducts.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {sortedProducts.map((product) => {
                const firstVariant = product.variants?.[0]
                const calculatedPrice = firstVariant?.calculated_price
                const firstPrice = firstVariant?.prices?.[0]

                const displayPrice = calculatedPrice?.calculated_amount ?? firstPrice?.amount
                const originalPrice = calculatedPrice?.original_amount
                const currencyCode = calculatedPrice?.currency_code ?? firstPrice?.currency_code ?? "MNT"
                const isOnSale =
                  !!calculatedPrice && calculatedPrice.calculated_amount < calculatedPrice.original_amount

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
                  />
                )
              })}
            </div>
          ) : (
            <div className="py-20 text-center">
              <p className="text-[#86868b] text-[17px]">Бүтээгдэхүүн олдсонгүй.</p>
            </div>
          )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
