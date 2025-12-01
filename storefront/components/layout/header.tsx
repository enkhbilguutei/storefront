import Link from "next/link";
import { ShoppingCart, User, Search, Menu } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold">Alimhan</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/products" className="text-sm font-medium hover:text-gray-600 transition-colors">
            Бүтээгдэхүүн
          </Link>
          <Link href="/collections" className="text-sm font-medium hover:text-gray-600 transition-colors">
            Цуглуулга
          </Link>
          <Link href="/about" className="text-sm font-medium hover:text-gray-600 transition-colors">
            Бидний тухай
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Search className="h-5 w-5" />
          </button>
          <Link href="/account" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <User className="h-5 w-5" />
          </Link>
          <Link href="/cart" className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
            <ShoppingCart className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-black text-white text-xs flex items-center justify-center">
              0
            </span>
          </Link>
          <button className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
