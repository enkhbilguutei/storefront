import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { ProductCard } from "@/components/products/ProductCard"
import { getCollectionByHandle } from "@/lib/data/collections"
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
}

interface ProductWithPrices {
  id: string
  title: string
  handle: string
  thumbnail: string | null
  variants?: VariantWithPrices[] | null
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ handle: string }>
}) {
  const { handle } = await params
  const collection = await getCollectionByHandle(handle)

  if (!collection) {
    notFound()
  }

  const region = await getDefaultRegion()

  const query = {
    limit: 100,
    fields:
      "id,title,handle,thumbnail,variants.id,variants.prices.amount,variants.prices.currency_code,+variants.calculated_price",
    collection_id: [collection.id],
    ...(region?.id ? { region_id: region.id } : {}),
  } as unknown as Parameters<typeof medusa.store.product.list>[0]

  let products: ProductWithPrices[] = []
  try {
    const response = await medusa.store.product.list(query)
    products = (response.products as unknown as ProductWithPrices[]) ?? []
  } catch (error) {
    console.error("Failed to fetch collection products:", error)
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
              {products.length} бүтээгдэхүүн
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 md:py-12">
          {products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((product) => {
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
                    title={product.title}
                    handle={product.handle}
                    thumbnail={product.thumbnail ?? undefined}
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
      </main>

      <Footer />
    </div>
  )
}
