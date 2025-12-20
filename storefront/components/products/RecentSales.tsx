"use client"

import { useEffect, useState } from "react"
import { TrendingUp } from "lucide-react"

interface RecentSalesProps {
  productId: string
}

export function RecentSales({ productId }: RecentSalesProps) {
  const [salesCount, setSalesCount] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
        const response = await fetch(
          `${backendUrl}/store/product-analytics/stats/${productId}`
        )

        if (response.ok) {
          const data = await response.json()
          setSalesCount(data.recent_sales_24h)
        }
      } catch (error) {
        console.error("Failed to fetch sales stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [productId])

  if (isLoading || !salesCount || salesCount === 0) {
    return null
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-[#8D99AF]/5 border border-[#8D99AF]/20 rounded-lg text-sm">
      <TrendingUp className="w-4 h-4 text-[#2B2D42]" />
      <span className="text-[#2B2D42]">
        24 цагт <span className="font-semibold">{salesCount}</span> зарагдсан
      </span>
    </div>
  )
}
