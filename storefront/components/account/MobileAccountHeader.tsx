"use client"

import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, ShoppingCart } from "lucide-react"
import { accountLinks } from "@/lib/config/account"
import { useCartStore } from "@/lib/store"

export function MobileAccountHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const { items } = useCartStore()

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0)

  const getTitle = () => {
    if (pathname === "/account") return "Профайл"
    
    // Check exact matches first
    const exactMatch = accountLinks.find(link => link.href === pathname)
    if (exactMatch) return exactMatch.label

    // Check for sub-pages
    if (pathname?.startsWith("/account/orders/")) return "Захиалгын дэлгэрэнгүй"
    if (pathname?.startsWith("/account/addresses/")) return "Хаягийн дэлгэрэнгүй"
    
    return "Миний бүртгэл"
  }

  const handleBack = () => {
    // If we are deep in a section (e.g. order details), go back to the list
    if (pathname?.startsWith("/account/orders/")) {
      router.push("/account/orders")
      return
    }
    if (pathname?.startsWith("/account/addresses/")) {
      router.push("/account/addresses")
      return
    }
    // If on main account page, go home
    if (pathname === "/account") {
      router.push("/")
      return
    }
    // Otherwise go to main account page
    router.push("/account")
  }

  return (
    <div className="lg:hidden sticky top-0 z-40 bg-white border-b px-4 h-14 grid grid-cols-[40px_1fr_40px] items-center">
      <div className="flex items-center">
        <button onClick={handleBack} className="-ml-2 p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
      </div>
      <h1 className="font-semibold text-lg text-center truncate">
        {getTitle()}
      </h1>
      <div className="flex justify-end">
        <Link href="/cart" className="p-2 hover:bg-gray-100 rounded-full transition-colors active:scale-95 relative">
          <ShoppingCart className="w-6 h-6" />
          {cartCount > 0 && (
            <span className="absolute top-0.5 right-0 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-sm">
              {cartCount}
            </span>
          )}
        </Link>
      </div>
    </div>
  )
}
