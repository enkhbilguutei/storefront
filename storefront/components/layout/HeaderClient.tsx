"use client";

import Link from "next/link";
import { Search, Menu, X, ChevronDown, ChevronRight, ShoppingCart, User, Package, LogOut, Smartphone, Laptop, Plane, Gamepad2, Glasses, Crown } from "lucide-react";
import { useUIStore, useUserStore, useCartStore } from "@/lib/store";
import { useState, useEffect, useRef } from "react";
import { Category } from "@/lib/data/categories";
import type { Collection } from "@/lib/data/collections";
import { SearchModal } from "@/components/search/SearchModal";
import { signOut } from "next-auth/react";

interface HeaderClientProps {
  categories: Category[];
  collections: Collection[];
}

export function HeaderClient({ categories, collections }: HeaderClientProps) {
  const { isMobileMenuOpen, openMobileMenu, closeMobileMenu, openSearch } = useUIStore();
  const { user, isAuthenticated } = useUserStore();
  const { items } = useCartStore();
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [isCollectionsMenuOpen, setIsCollectionsMenuOpen] = useState(false);
  const megaMenuRef = useRef<HTMLDivElement>(null);
  const megaMenuTriggerRef = useRef<HTMLButtonElement>(null);
  const collectionsMenuRef = useRef<HTMLDivElement>(null);
  const collectionsMenuTriggerRef = useRef<HTMLButtonElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const collectionsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const cartItemCount = items?.length || 0;

  // Category icon mapping
  const getCategoryIcon = (handle: string) => {
    const iconMap: Record<string, any> = {
      'apple': Smartphone,
      'dji': Plane,
      'gaming': Gamepad2,
      'eyewear': Glasses,
      'collectibles': Crown,
    };
    return iconMap[handle.toLowerCase()] || Package;
  };

  // Close mega menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        megaMenuRef.current && 
        !megaMenuRef.current.contains(event.target as Node) &&
        megaMenuTriggerRef.current &&
        !megaMenuTriggerRef.current.contains(event.target as Node)
      ) {
        setIsMegaMenuOpen(false);
        setActiveCategory(null);
      }

      if (
        collectionsMenuRef.current &&
        !collectionsMenuRef.current.contains(event.target as Node) &&
        collectionsMenuTriggerRef.current &&
        !collectionsMenuTriggerRef.current.contains(event.target as Node)
      ) {
        setIsCollectionsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMegaMenuEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsMegaMenuOpen(true);
    if (!activeCategory && categories.length > 0) {
      setActiveCategory(categories[0]);
    }
  };

  const handleMegaMenuLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsMegaMenuOpen(false);
      setActiveCategory(null);
    }, 150);
  };

  const handleCollectionsMenuEnter = () => {
    if (collectionsTimeoutRef.current) {
      clearTimeout(collectionsTimeoutRef.current);
    }
    setIsCollectionsMenuOpen(true);
  };

  const handleCollectionsMenuLeave = () => {
    collectionsTimeoutRef.current = setTimeout(() => {
      setIsCollectionsMenuOpen(false);
    }, 150);
  };

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

              {/* Desktop: Categories Megamenu + Search Bar */}
              <div className="hidden lg:flex flex-1 max-w-3xl mx-8 gap-3 items-center">
                {/* Categories Mega Menu Trigger */}
                {categories.length > 0 && (
                  <button
                    ref={megaMenuTriggerRef}
                    onMouseEnter={handleMegaMenuEnter}
                    onMouseLeave={handleMegaMenuLeave}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all whitespace-nowrap bg-linear-to-br from-purple-500 via-pink-500 to-blue-500 text-white hover:opacity-90"
                  >
                    <Menu className="h-4 w-4" />
                    <span className="text-sm font-medium">Ангилал</span>
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isMegaMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                )}

                {/* Search Bar */}
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Утас, ТВ, гэрийн техник хайх..."
                    onClick={openSearch}
                    className="w-full px-4 py-2.5 pl-11 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm cursor-pointer"
                    readOnly
                  />
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Right Actions */}
              <div className="flex items-center gap-2 lg:gap-4">
                {/* Mobile Search */}
                <button 
                  onClick={openSearch}
                  className="lg:hidden p-2.5 hover:bg-gray-100 rounded-lg transition-colors active:scale-95"
                  aria-label="Хайх"
                >
                  <Search className="h-5.5 w-5.5 text-gray-700" />
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
                <Link href="/cart" className="relative p-2.5 hover:bg-gray-100 rounded-lg transition-colors active:scale-95">
                  <ShoppingCart className="h-5.5 w-5.5 lg:h-6 lg:w-6 text-gray-700" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-sm">
                      {cartItemCount}
                    </span>
                  )}
                </Link>

                {/* Mobile Menu Toggle */}
                <button 
                  onClick={isMobileMenuOpen ? closeMobileMenu : openMobileMenu}
                  className="lg:hidden p-2.5 hover:bg-gray-100 rounded-lg transition-colors active:scale-95"
                  aria-label="Цэс"
                >
                  {isMobileMenuOpen ? <X className="h-5.5 w-5.5" /> : <Menu className="h-5.5 w-5.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Subheader: Collections */}
        <div className="hidden lg:block bg-white border-b border-gray-100">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-12">
              <div className="flex items-center gap-6">
                <div
                  className="relative"
                  onMouseEnter={handleCollectionsMenuEnter}
                  onMouseLeave={handleCollectionsMenuLeave}
                >
                  <button
                    ref={collectionsMenuTriggerRef}
                    className="inline-flex items-center gap-2 px-2 py-1.5 rounded-md text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors"
                    aria-haspopup="menu"
                    aria-expanded={isCollectionsMenuOpen}
                  >
                    Цуглуулга
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${
                        isCollectionsMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isCollectionsMenuOpen && collections.length > 0 && (
                    <div
                      ref={collectionsMenuRef}
                      className="absolute left-0 top-full mt-2 w-[640px] bg-white border border-gray-200 rounded-xl shadow-xl p-5"
                      role="menu"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Цуглуулгууд
                          </p>
                          <p className="text-sm text-gray-700 mt-1">
                            Та дуртай бүтээгдэхүүнээ цуглуулгаар нь шүүж үзээрэй.
                          </p>
                        </div>
                        <Link
                          href="/collections"
                          onClick={() => setIsCollectionsMenuOpen(false)}
                          className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                        >
                          Бүгдийг үзэх
                        </Link>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {collections.map((collection) => (
                          <Link
                            key={collection.id}
                            href={`/collections/${collection.handle}`}
                            onClick={() => setIsCollectionsMenuOpen(false)}
                            className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                            role="menuitem"
                          >
                            <span className="text-sm font-medium text-gray-900">
                              {collection.title}
                            </span>
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Link href="/products" className="text-sm font-medium text-gray-700 hover:text-gray-900">
                  Бүтээгдэхүүн
                </Link>
              </div>

              <div className="text-xs text-gray-500">
                {collections.length > 0 ? `${collections.length} цуглуулга` : ""}
              </div>
            </div>
          </div>
        </div>

        {/* Mega Menu Dropdown */}
        {isMegaMenuOpen && categories.length > 0 && (
          <div 
            ref={megaMenuRef}
            onMouseEnter={handleMegaMenuEnter}
            onMouseLeave={handleMegaMenuLeave}
            className="absolute left-0 right-0 top-full z-50 bg-white border-t border-gray-100 shadow-2xl"
          >
            <div className="container mx-auto px-4">
              <div className="flex py-8">
                {/* Category List */}
                <div className="w-72 border-r border-gray-100 pr-8">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-3">Ангилал</h3>
                  <ul className="space-y-1">
                    {categories.map((category) => {
                      const CategoryIcon = getCategoryIcon(category.handle);
                      return (
                        <li key={category.id}>
                          <button
                            onMouseEnter={() => setActiveCategory(category)}
                            onClick={() => {
                              setIsMegaMenuOpen(false);
                              window.location.href = `/categories/${category.handle}`;
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all ${
                              activeCategory?.id === category.id 
                                ? 'bg-blue-50 text-blue-700' 
                                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                          >
                            <CategoryIcon className={`h-5 w-5 ${
                              activeCategory?.id === category.id ? 'text-blue-600' : 'text-gray-500'
                            }`} />
                            <span className="text-sm font-medium flex-1">{category.name}</span>
                            <ChevronRight className="h-4 w-4 opacity-40" />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* Category Details with Subcategories */}
                {activeCategory && (
                  <div className="flex-1 pl-8">
                    <div className="mb-6">
                      <div className="flex items-center gap-3 mb-2">
                        {(() => {
                          const CategoryIcon = getCategoryIcon(activeCategory.handle);
                          return <CategoryIcon className="h-7 w-7 text-gray-900" />;
                        })()}
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{activeCategory.name}</h3>
                          {activeCategory.description && (
                            <p className="text-sm text-gray-600 mt-0.5">{activeCategory.description}</p>
                          )}
                        </div>
                      </div>
                      <Link
                        href={`/categories/${activeCategory.handle}`}
                        onClick={() => setIsMegaMenuOpen(false)}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors mt-2"
                      >
                        Бүх {activeCategory.name} үзэх
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>

                    {/* Subcategories Grid */}
                    {activeCategory.category_children && activeCategory.category_children.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Дэд ангилал</h4>
                        <div className="grid grid-cols-2 gap-3">
                          {activeCategory.category_children.map((subcat) => (
                            <Link
                              key={subcat.id}
                              href={`/categories/${subcat.handle}`}
                              onClick={() => setIsMegaMenuOpen(false)}
                              className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                            >
                              <Package className="h-4 w-4 text-gray-500 group-hover:text-gray-700" />
                              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{subcat.name}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Menu */}
      <div 
        className={`fixed inset-0 z-60 lg:hidden transition-all duration-300 ${
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
          className={`absolute top-0 left-0 bottom-0 w-[85vw] max-w-sm bg-white shadow-2xl transition-transform duration-300 ease-out overflow-y-auto ${
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
                  <div className="w-12 h-12 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center font-semibold text-lg">
                    {user.firstName?.[0] || user.email[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{user.firstName || "Хэрэглэгч"}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <Link href="/account" onClick={closeMobileMenu} className="block px-3 py-2 text-sm text-gray-700 hover:bg-white rounded-md">
                    Профайл
                  </Link>
                  <Link href="/account/orders" onClick={closeMobileMenu} className="block px-3 py-2 text-sm text-gray-700 hover:bg-white rounded-md">
                    Захиалгууд
                  </Link>
                  <button 
                    onClick={() => {
                      closeMobileMenu();
                      signOut({ callbackUrl: "/" });
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                  >
                    Гарах
                  </button>
                </div>
              </div>
            ) : (
              <Link href="/auth/login" onClick={closeMobileMenu} className="block mb-6 p-4 bg-blue-600 text-white rounded-lg text-center font-medium hover:bg-blue-700 transition-colors">
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
                <Link href="/stores" onClick={closeMobileMenu} className="block px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                  Дэлгүүр хайх
                </Link>
                <Link href="/help" onClick={closeMobileMenu} className="block px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
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
