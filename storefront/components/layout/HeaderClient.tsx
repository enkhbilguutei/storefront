"use client";

import Link from "next/link";
import { MapPin, HeadphonesIcon, Store, Search, Menu, X, ChevronDown, ShoppingCart, User, Package, LogOut } from "lucide-react";
import { useUIStore, useUserStore, useCartStore } from "@/lib/store";
import { useState, useEffect, useRef } from "react";
import { Category } from "@/lib/data/categories";
import { SearchModal } from "@/components/search/SearchModal";
import { signOut } from "next-auth/react";

interface HeaderClientProps {
  categories: Category[];
}

export function HeaderClient({ categories }: HeaderClientProps) {
  const { isMobileMenuOpen, openMobileMenu, closeMobileMenu, openSearch } = useUIStore();
  const { user, isAuthenticated } = useUserStore();
  const { items } = useCartStore();
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [selectedLocation] = useState("Улаанбаатар 110089");
  const categoriesRef = useRef<HTMLDivElement>(null);
  
  const cartItemCount = items?.length || 0;

  // Top categories for the mega menu
  const topCategories = categories.slice(0, 10);

  // Close categories dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (categoriesRef.current && !categoriesRef.current.contains(event.target as Node)) {
        setIsCategoriesOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      {/* Top bar - Promotional banner (non-sticky) */}
      <div className="bg-[#f5f5f7] text-[#1d1d1f] text-center py-2 text-xs">
        <p>Шинэ бүтээгдэхүүн! iPhone 16 Pro худалдаанд гарлаа. <Link href="/categories/iphone" className="text-blue-600 hover:underline ml-1">Дэлгэрэнгүй →</Link></p>
      </div>

      <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
        {/* Main Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16 lg:h-20">
              {/* Logo */}
              <Link href="/" className="flex items-center">
                <img src="/logo.png" alt="Alimhan" className="h-14 lg:h-16" />
              </Link>

              {/* Desktop Search Bar */}
              <div className="hidden lg:flex flex-1 max-w-2xl mx-8">
                <div className="relative w-full">
                  <input
                    type="text"
                    placeholder="Утас, ТВ, гэрийн техник хайх..."
                    onClick={openSearch}
                    className="w-full px-4 py-3 pl-12 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm cursor-pointer"
                    readOnly
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>

              {/* Right Actions */}
              <div className="flex items-center gap-3 lg:gap-4">
                {/* Mobile Search */}
                <button 
                  onClick={openSearch}
                  className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Хайх"
                >
                  <Search className="h-5 w-5 text-gray-700" />
                </button>

                {/* User Menu */}
                {isAuthenticated && user ? (
                  <div className="hidden lg:flex items-center gap-2 relative group">
                    <button className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <User className="h-5 w-5 text-gray-700" />
                      <div className="flex flex-col items-start">
                        <span className="text-[10px] text-gray-500">Сайн байна уу</span>
                        <span className="text-sm font-medium text-gray-900">{user.firstName || "Хэрэглэгч"}</span>
                      </div>
                    </button>
                    
                    {/* Dropdown */}
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <Link href="/account" className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700 first:rounded-t-lg">
                        <User className="h-4 w-4" />
                        Профайл
                      </Link>
                      <Link href="/account/orders" className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700">
                        <Package className="h-4 w-4" />
                        Захиалгууд
                      </Link>
                      <button 
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 text-sm text-red-600 last:rounded-b-lg"
                      >
                        <LogOut className="h-4 w-4" />
                        Гарах
                      </button>
                    </div>
                  </div>
                ) : (
                  <Link href="/auth/login" className="hidden lg:flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <User className="h-5 w-5 text-gray-700" />
                    <div className="flex flex-col items-start">
                      <span className="text-[10px] text-gray-500">Сайн байна уу</span>
                      <span className="text-sm font-medium text-gray-900">Нэвтрэх</span>
                    </div>
                  </Link>
                )}

                {/* Cart */}
                <Link href="/cart" className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ShoppingCart className="h-6 w-6 text-gray-700" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </Link>

                {/* Mobile Menu Toggle */}
                <button 
                  onClick={isMobileMenuOpen ? closeMobileMenu : openMobileMenu}
                  className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Цэс"
                >
                  {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Categories Navigation Bar */}
      <div className="hidden lg:block bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center h-12">
            <nav className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
              {topCategories.map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.handle}`}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-white rounded-md transition-all whitespace-nowrap"
                >
                  {category.name}
                </Link>
              ))}
              {categories.length > 10 && (
                <div className="relative" ref={categoriesRef}>
                  <button
                    onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                    className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-white rounded-md transition-all whitespace-nowrap"
                  >
                    Бусад
                    <ChevronDown className={`h-4 w-4 transition-transform ${isCategoriesOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isCategoriesOpen && (
                    <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 max-h-96 overflow-y-auto">
                      {categories.slice(10).map((category) => (
                        <Link
                          key={category.id}
                          href={`/categories/${category.handle}`}
                          onClick={() => setIsCategoriesOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          {category.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div 
        className={`fixed inset-0 z-40 lg:hidden transition-all duration-300 ${
          isMobileMenuOpen ? 'visible' : 'invisible'
        }`}
      >
        <div 
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
            isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={closeMobileMenu}
        />
        
        <div 
          className={`absolute top-0 left-0 bottom-0 w-full sm:max-w-sm bg-white shadow-2xl transition-transform duration-300 ease-out overflow-y-auto ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between z-10">
            <span className="text-xl font-bold">Цэс</span>
            <button onClick={closeMobileMenu} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-4">
            {/* User Section */}
            {isAuthenticated && user ? (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold">
                    {user.firstName?.[0] || user.email[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{user.firstName || "Хэрэглэгч"}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <Link href="/account" onClick={closeMobileMenu} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-white rounded-md">
                    <User className="h-4 w-4" />
                    Профайл
                  </Link>
                  <Link href="/account/orders" onClick={closeMobileMenu} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-white rounded-md">
                    <Package className="h-4 w-4" />
                    Захиалгууд
                  </Link>
                  <button 
                    onClick={() => {
                      closeMobileMenu();
                      signOut({ callbackUrl: "/" });
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                  >
                    <LogOut className="h-4 w-4" />
                    Гарах
                  </button>
                </div>
              </div>
            ) : (
              <Link href="/auth/login" onClick={closeMobileMenu} className="block mb-6 p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg text-center font-medium">
                Нэвтрэх / Бүртгүүлэх
              </Link>
            )}

            {/* Categories */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Ангилал</h3>
              <div className="space-y-1">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/categories/${category.handle}`}
                    onClick={closeMobileMenu}
                    className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Холбоосууд</h3>
              <div className="space-y-1">
                <Link href="/stores" onClick={closeMobileMenu} className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                  <Store className="h-4 w-4" />
                  Дэлгүүр хайх
                </Link>
                <Link href="/help" onClick={closeMobileMenu} className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                  <HeadphonesIcon className="h-4 w-4" />
                  Тусламж
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SearchModal />
    </>
  );
}
