import { defineRouteConfig } from "@medusajs/admin-sdk"
import { CurrencyDollar } from "@medusajs/icons"
import { Container, Heading, Text, Table, Input, Button, Badge } from "@medusajs/ui"
import { useEffect, useState } from "react"

interface Variant {
  id: string
  title: string
  sku: string | null
  product: {
    id: string
    title: string
    thumbnail: string | null
  }
  prices: {
    id: string
    amount: number
    currency_code: string
  }[]
}

const SimplePricingPage = () => {
  const [variants, setVariants] = useState<Variant[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const [editingVariant, setEditingVariant] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch products with variants and their prices
      const productsRes = await fetch("/admin/products?fields=id,title,thumbnail,*variants,*variants.prices&limit=100", {
        credentials: "include",
      })
      
      if (!productsRes.ok) {
        throw new Error(`Failed to fetch products: ${productsRes.status}`)
      }
      
      const productsData = await productsRes.json()
      
      // Flatten variants with product info
      const allVariants: Variant[] = []
      for (const product of productsData.products || []) {
        for (const variant of product.variants || []) {
          allVariants.push({
            id: variant.id,
            title: variant.title,
            sku: variant.sku,
            prices: variant.prices || [],
            product: {
              id: product.id,
              title: product.title,
              thumbnail: product.thumbnail,
            },
          })
        }
      }
      setVariants(allVariants)
    } catch (error) {
      console.error("Error fetching data:", error)
      setMessage({ 
        type: "error", 
        text: error instanceof Error ? error.message : "Өгөгдөл татахад алдаа гарлаа" 
      })
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("mn-MN").format(amount)
  }

  const getBasePrice = (variant: Variant) => {
    const mntPrice = variant.prices?.find(p => p.currency_code === "mnt")
    return mntPrice?.amount || 0
  }

  const getPriceId = (variant: Variant) => {
    const mntPrice = variant.prices?.find(p => p.currency_code === "mnt")
    return mntPrice?.id
  }

  const startEditing = (variantId: string, currentPrice: number) => {
    setEditingVariant(variantId)
    setEditValue(currentPrice.toString())
  }

  const cancelEditing = () => {
    setEditingVariant(null)
    setEditValue("")
  }

  const savePrice = async (variant: Variant) => {
    const newPrice = Number(editValue)
    
    if (isNaN(newPrice) || newPrice < 0) {
      setMessage({ type: "error", text: "Зөв үнэ оруулна уу" })
      return
    }

    const priceId = getPriceId(variant)
    if (!priceId) {
      setMessage({ type: "error", text: "Үнэ олдсонгүй" })
      return
    }
    
    setSaving(prev => ({ ...prev, [variant.id]: true }))
    try {
      // Update the price directly using the pricing module endpoint
      const updateRes = await fetch(`/admin/prices/${priceId}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: newPrice,
        }),
      })
      
      if (!updateRes.ok) {
        const errorData = await updateRes.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to update price")
      }

      // Update local state
      setVariants(prev => prev.map(v => {
        if (v.id === variant.id) {
          return {
            ...v,
            prices: v.prices.map(p => 
              p.id === priceId ? { ...p, amount: newPrice } : p
            ),
          }
        }
        return v
      }))
      
      setMessage({ type: "success", text: "Үнэ амжилттай шинэчлэгдлээ!" })
      setEditingVariant(null)
      setEditValue("")
    } catch (error) {
      console.error("Error saving price:", error)
      setMessage({ 
        type: "error", 
        text: error instanceof Error ? error.message : "Хадгалахад алдаа гарлаа" 
      })
    } finally {
      setSaving(prev => ({ ...prev, [variant.id]: false }))
    }
  }

  if (loading) {
    return (
      <Container className="divide-y p-0">
        <div className="flex items-center justify-center px-6 py-12">
          <Text>Уншиж байна...</Text>
        </div>
      </Container>
    )
  }

  return (
      <Container className="divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <Heading level="h1">💰 Үнэ тохируулах</Heading>
            <Text className="text-ui-fg-subtle mt-1">
              Бүтээгдэхүүний үнийг хялбархан тохируулаарай
            </Text>
          </div>
          <Button variant="secondary" onClick={() => { setMessage(null); fetchData(); }}>
            Шинэчлэх
          </Button>
        </div>

        <div className="px-6 py-4">
          {message && (
            <div className={`mb-4 p-4 rounded-lg border ${message.type === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"}`}>
              <Text className="text-sm">{message.text}</Text>
            </div>
          )}

          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Бүтээгдэхүүн</Table.HeaderCell>
                <Table.HeaderCell>Хувилбар</Table.HeaderCell>
                <Table.HeaderCell>SKU</Table.HeaderCell>
                <Table.HeaderCell className="text-right">Үнэ (₮)</Table.HeaderCell>
                <Table.HeaderCell></Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {variants.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan={5} className="text-center py-8">
                    <Text className="text-ui-fg-subtle">Бүтээгдэхүүн олдсонгүй</Text>
                  </Table.Cell>
                </Table.Row>
              ) : (
                variants.map((variant) => {
                  const currentPrice = getBasePrice(variant)
                  const isEditing = editingVariant === variant.id
                  const isSaving = saving[variant.id] || false

                  return (
                    <Table.Row key={variant.id}>
                      <Table.Cell>
                        <div className="flex items-center gap-3">
                          {variant.product.thumbnail && (
                            <img 
                              src={variant.product.thumbnail} 
                              alt="" 
                              className="w-10 h-10 rounded object-cover"
                            />
                          )}
                          <Text className="font-medium">{variant.product.title}</Text>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <Text className="text-ui-fg-subtle">{variant.title || "Default"}</Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Text className="text-ui-fg-subtle font-mono text-xs">
                          {variant.sku || "-"}
                        </Text>
                      </Table.Cell>
                      <Table.Cell className="text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-2">
                            <Input
                              type="number"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              placeholder="Үнэ"
                              className="w-40 text-right"
                              autoFocus
                              min="0"
                              step="1000"
                            />
                          </div>
                        ) : (
                          <Text className="font-mono font-semibold">
                            {formatPrice(currentPrice)}
                          </Text>
                        )}
                      </Table.Cell>
                      <Table.Cell className="text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              variant="secondary" 
                              size="small"
                              onClick={cancelEditing}
                              disabled={isSaving}
                            >
                              Болих
                            </Button>
                            <Button 
                              variant="primary" 
                              size="small"
                              onClick={() => savePrice(variant)}
                              disabled={isSaving}
                            >
                              {isSaving ? "..." : "Хадгалах"}
                            </Button>
                          </div>
                        ) : (
                          <Button 
                            variant="secondary" 
                            size="small"
                            onClick={() => startEditing(variant.id, currentPrice)}
                          >
                            Засах
                          </Button>
                        )}
                      </Table.Cell>
                    </Table.Row>
                  )
                })
              )}
            </Table.Body>
          </Table>
        </div>
      </Container>
  )
}

export const config = defineRouteConfig({
  label: "Үнэ тохируулах",
  icon: CurrencyDollar,
})

export default SimplePricingPage
