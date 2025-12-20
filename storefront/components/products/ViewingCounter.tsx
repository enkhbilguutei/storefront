"use client"

import { useEffect, useState } from "react"
import { Eye } from "lucide-react"

interface ViewingCounterProps {
  productId: string
}

export function ViewingCounter({ productId }: ViewingCounterProps) {
  const [viewers, setViewers] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Track view and get current viewers
    const trackView = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
        const response = await fetch(`${backendUrl}/store/product-analytics/view`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-session-id": getSessionId(),
          },
          body: JSON.stringify({ product_id: productId }),
        })

        if (response.ok) {
          const data = await response.json()
          setViewers(data.current_viewers)
        }
      } catch (error) {
        console.error("Failed to track view:", error)
      } finally {
        setIsLoading(false)
      }
    }

    trackView()

    // Update viewer count every 30 seconds
    const interval = setInterval(async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
        const response = await fetch(
          `${backendUrl}/store/product-analytics/stats/${productId}`
        )
        if (response.ok) {
          const data = await response.json()
          setViewers(data.current_viewers)
        }
      } catch (error) {
        console.error("Failed to fetch viewer count:", error)
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [productId])

  // Generate or get session ID
  function getSessionId(): string {
    let sessionId = localStorage.getItem("session_id")
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      localStorage.setItem("session_id", sessionId)
    }
    return sessionId
  }

  if (isLoading || !viewers || viewers < 2) {
    return null
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-[#EF233C]/5 border border-[#EF233C]/20 rounded-lg text-sm">
      <Eye className="w-4 h-4 text-[#D90429]" />
      <span className="text-[#2B2D42]">
        <span className="font-semibold">{viewers}</span> хүн үзэж байна
      </span>
    </div>
  )
}
