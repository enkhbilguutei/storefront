import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Input, Button, Label, Badge } from "@medusajs/ui"
import { DetailWidgetProps, AdminProduct } from "@medusajs/framework/types"
import { useState, useEffect } from "react"

interface PriceData {
  variantId: string
  variantTitle: string
  price: number
  salePrice: number | null
}

const SimplePricingWidget = ({ data }: DetailWidgetProps<AdminProduct>) => {
  const [prices, setPrices] = useState<PriceData[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    // Initialize prices from product variants
    if (data.variants) {
      const initialPrices: PriceData[] = data.variants.map((variant: any) => {
        const price = variant.prices?.[0]?.amount || 0
        return {
          variantId: variant.id,
          variantTitle: variant.title || "Default",
          price: price,
          salePrice: null, // Will be loaded from price list
        }
      })
      setPrices(initialPrices)
    }
  }, [data])

  const handlePriceChange = (variantId: string, field: "price" | "salePrice", value: string) => {
    setPrices(prev => prev.map(p => 
      p.variantId === variantId 
        ? { ...p, [field]: value === "" ? (field === "salePrice" ? null : 0) : Number(value) }
        : p
    ))
  }

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("mn-MN").format(amount)
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h2">💰 Үнийн мэдээлэл</Heading>
          <Text className="text-ui-fg-subtle mt-1">
            Бүтээгдэхүүний үнэ болон хямдралтай үнэ
          </Text>
        </div>
      </div>
      
      <div className="px-6 py-4">
        {message && (
          <div className="mb-4 p-3 bg-ui-bg-subtle rounded-lg">
            <Text className="text-ui-fg-base">{message}</Text>
          </div>
        )}
        
        <div className="space-y-4">
          {prices.map((item) => (
            <div key={item.variantId} className="flex items-center gap-4 p-4 bg-ui-bg-subtle rounded-lg">
              <div className="flex-1">
                <Text className="font-medium">{item.variantTitle}</Text>
              </div>
              
              <div className="flex items-center gap-2">
                <Label className="text-sm">Үнэ:</Label>
                <div className="flex items-center gap-1">
                  <Text className="text-ui-fg-subtle">₮</Text>
                  <Text className="font-mono font-medium">{formatPrice(item.price)}</Text>
                </div>
              </div>

              {item.salePrice !== null && item.salePrice < item.price && (
                <Badge color="red">
                  -{Math.round(((item.price - item.salePrice) / item.price) * 100)}%
                </Badge>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-ui-bg-base border border-ui-border-base rounded-lg">
          <Text className="text-sm text-ui-fg-subtle">
            💡 <strong>Хямдрал тохируулах:</strong> Settings → Pricing → Price Lists руу очиж "Sale" төрлийн Price List үүсгэнэ үү.
            Тэгвэл storefront дээр автоматаар хуучин үнэ зурж хасагдаж, шинэ үнэ харагдана.
          </Text>
        </div>
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.before",
})

export default SimplePricingWidget
