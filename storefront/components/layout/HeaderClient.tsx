"use client";

import Link from "next/link";
import Image from "next/image";
import { Search, ChevronDown, ShoppingCart, User, Package, LogOut, Smartphone, Plane, Gamepad2, Glasses, Crown, Menu, X, ChevronRight, type LucideIcon } from "lucide-react";
import { useUIStore, useUserStore, useCartStore } from "@/lib/store";
import { useState, useEffect, useRef } from "react";
import { Category } from "@/lib/data/categories";
import type { Collection } from "@/lib/data/collections";
import { SearchModal } from "@/components/search/SearchModal";
import { SearchErrorBoundary } from "@/components/search/SearchErrorBoundary";
import { signOut } from "next-auth/react";

interface HeaderClientProps {
  categories: Category[];
  collections: Collection[];
  isHomePage?: boolean;
}

export function HeaderClient({ categories, collections, isHomePage = false }: HeaderClientProps) {
  const { isMobileMenuOpen, openMobileMenu, closeMobileMenu, openSearch } = useUIStore();
  const { user, isAuthenticated } = useUserStore();
  const { items } = useCartStore();
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [heroBgIsDark, setHeroBgIsDark] = useState(true);
  const megaMenuRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);
  
  const cartItemCount = items?.length || 0;

  const getCategoryIcon = (handle: string) => {
    const iconMap: Record<string, LucideIcon> = {
      'apple': Smartphone,
      'dji': Plane,
      'gaming': Gamepad2,
      'eyewear': Glasses,
      'collectibles': Crown,
    };
    return iconMap[handle.toLowerCase()] || Package;
  };

  useEffect(() => {
    const handleContrastChange = (event: CustomEvent) => {
      setHeroBgIsDark(event.detail.isDark);
    };
    window.addEventListener('hero-contrast-change', handleContrastChange as EventListener);
    return () => window.removeEventListener('hero-contrast-change', handleContrastChange as EventListener);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      setIsScrolled(currentScrollY > 0);
      
      if (currentScrollY < 10) {
        setIsHeaderVisible(true);
      } else if (currentScrollY > lastScrollY.current && currentScrollY > 80) {
        setIsHeaderVisible(false);
      } else if (currentScrollY < lastScrollY.current) {
        setIsHeaderVisible(true);
      }
      
      lastScrollY.current = currentScrollY;
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (megaMenuRef.current && !megaMenuRef.current.contains(event.target as Node) && categoriesRef.current && !categoriesRef.current.contains(event.target as Node)) {
        setIsMegaMenuOpen(false);
        setActiveCategory(null);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCategoriesEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsMegaMenuOpen(true);
    if (!activeCategory && categories.length > 0) setActiveCategory(categories[0]);
  };

  const handleCategoriesLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsMegaMenuOpen(false);
      setActiveCategory(null);
    }, 150);
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
        isHomePage 
          ? isScrolled 
            ? 'bg-white' 
            : 'bg-gradient-to-b from-black/40 via-black/10 to-transparent'
          : 'bg-white'
      } ${isHeaderVisible ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center">
              <Image src="/logo.png" alt="Alimhan" width={180} height={60} className={`h-14 w-auto transition-all duration-500 ${isHomePage && !isScrolled ? 'drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]' : ''}`} priority />
            </Link>

            <nav className="hidden lg:flex items-center flex-1 ml-8">
              <div ref={categoriesRef} className="relative" onMouseEnter={handleCategoriesEnter} onMouseLeave={handleCategoriesLeave}>
                <button className={`flex items-center gap-1 px-4 py-2 text-sm font-semibold transition-all duration-300 ${isHomePage && !isScrolled ? 'text-white hover:text-gray-200 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]' : 'text-gray-900 hover:text-gray-700'}`}>
                  Ангилал
                  <ChevronDown className={`h-4 w-4 transition-transform ${isMegaMenuOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {collections.slice(0, 5).map((collection) => (
                <Link key={collection.id} href={`/collections/${collection.handle}`} className={`px-4 py-2 text-sm font-semibold transition-all duration-300 ${isHomePage && !isScrolled ? 'text-white hover:text-gray-200 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]' : 'text-gray-900 hover:text-gray-700'}`}>
                  {collection.title}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <button onClick={openSearch} className={`hidden lg:flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all duration-300 ${isHomePage && !isScrolled ? 'border-white/40 hover:border-white/60 text-white backdrop-blur-sm bg-white/10 hover:bg-white/20 drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]' : 'border-gray-300 hover:border-gray-400 text-gray-900 bg-white'}`}>
                <Search className="h-4 w-4" />
                <span className="text-sm font-medium">Хайх</span>
              </button>

              <button onClick={openSearch} className={`lg:hidden p-2.5 transition-all duration-300 rounded-full ${isHomePage && !isScrolled ? 'text-white hover:text-gray-200 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] hover:bg-white/10' : 'text-gray-900 hover:text-gray-700'}`}>
                <Search className="h-5 w-5" />
              </button>

              <Link href="/cart" className={`relative p-2.5 transition-all duration-300 rounded-full ${isHomePage && !isScrolled ? 'text-white hover:text-gray-200 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] hover:bg-white/10' : 'text-gray-900 hover:text-gray-700'}`}>
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg">{cartItemCount}</span>}
              </Link>

              <div className="hidden lg:block relative" ref={userMenuRef}>
                <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className={`p-2.5 transition-all duration-300 rounded-full ${isHomePage && !isScrolled ? 'text-white hover:text-gray-200 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] hover:bg-white/10' : 'text-gray-900 hover:text-gray-700'}`}>
                  <User className="h-5 w-5" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2">
                    {isAuthenticated && user ? (
                      <>
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">{user.firstName || user.name || "Хэрэглэгч"}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                        <Link href="/account" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setIsUserMenuOpen(false)}>
                          <User className="h-4 w-4" />Профайл
                        </Link>
                        <Link href="/account/orders" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setIsUserMenuOpen(false)}>
                          <Package className="h-4 w-4" />Захиалгууд
                        </Link>
                        <button onClick={() => { setIsUserMenuOpen(false); signOut({ callbackUrl: "/" }); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-gray-50">
                          <LogOut className="h-4 w-4" />Гарах
                        </button>
                      </>
                    ) : (
                      <>
                        <Link href="/auth/login" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setIsUserMenuOpen(false)}>Нэвтрэх</Link>
                        <Link href="/auth/register" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setIsUserMenuOpen(false)}>Бүртгүүлэх</Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              <button onClick={isMobileMenuOpen ? closeMobileMenu : openMobileMenu} className={`lg:hidden p-2.5 transition-all duration-300 rounded-full ${isHomePage && !isScrolled ? 'text-white hover:text-gray-200 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] hover:bg-white/10' : 'text-gray-900 hover:text-gray-700'}`}>
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {isMegaMenuOpen && categories.length > 0 && (
          <div ref={megaMenuRef} onMouseEnter={handleCategoriesEnter} onMouseLeave={handleCategoriesLeave} className="absolute left-0 right-0 top-full bg-white shadow-2xl border-t border-gray-100">
            <div className="container mx-auto px-4">
              <div className="flex py-8 gap-8">
                <div className="w-64">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Бүх ангилал</h3>
                  <ul className="space-y-1">
                    {categories.map((category) => {
                      const CategoryIcon = getCategoryIcon(category.handle);
                      return (
                        <li key={category.id}>
                          <button onMouseEnter={() => setActiveCategory(category)} onClick={() => window.location.href = `/categories/${category.handle}`} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${activeCategory?.id === category.id ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'}`}>
                            <CategoryIcon className="h-5 w-5" />
                            <span className="text-sm font-medium">{category.name}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {activeCategory && (
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{activeCategory.name}</h3>
                    {activeCategory.description && <p className="text-sm text-gray-600 mb-6 max-w-2xl">{activeCategory.description}</p>}
                    <Link href={`/categories/${activeCategory.handle}`} onClick={() => setIsMegaMenuOpen(false)} className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700">
                      Бүгдийг үзэх
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <div className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className={`fixed inset-0 bg-white overflow-y-auto transition-transform duration-300 ease-out ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="px-6 py-6">
              {/* Close button */}
              <div className="flex justify-end mb-6">
                <button onClick={closeMobileMenu} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="h-6 w-6 text-gray-900" />
                </button>
              </div>
              {/* Search Bar */}
              <button 
                onClick={() => { closeMobileMenu(); openSearch(); }} 
                className="w-full flex items-center gap-3 px-4 py-3 mb-6 border-2 border-dashed border-gray-300 rounded-full hover:border-gray-400 transition-colors"
              >
                <Search className="h-5 w-5 text-gray-600" />
                <span className="text-gray-600">Хайх</span>
              </button>

              {/* Shop by Category Section */}
              <div className="mb-8">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-1">АНГИЛАЛААР ХАЙХ</h3>
                <ul className="space-y-0">
                  {categories.map((category, index) => (
                    <li key={category.id}>
                      <Link 
                        href={`/categories/${category.handle}`} 
                        className="flex items-center justify-between py-4 px-1 border-b border-gray-200 hover:bg-gray-50 transition-colors" 
                        onClick={closeMobileMenu}
                      >
                        <span className="text-xl font-bold text-gray-900">{category.name}</span>
                        <ChevronRight className="h-6 w-6 text-gray-400" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Collections Section */}
              {collections.length > 0 && (
                <div className="mb-8 pb-8 border-b border-gray-200">
                  <ul className="space-y-0">
                    {collections.map((collection) => (
                      <li key={collection.id}>
                        <Link 
                          href={`/collections/${collection.handle}`} 
                          className="flex items-center justify-between py-4 px-1 hover:bg-gray-50 transition-colors" 
                          onClick={closeMobileMenu}
                        >
                          <span className="text-lg font-semibold text-gray-900">{collection.title}</span>
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Auth / Account Section */}
              <div className="mb-8 pb-8 border-b border-gray-200">
                {isAuthenticated && user ? (
                  <ul className="space-y-0">
                    <li>
                      <Link 
                        href="/account" 
                        className="flex items-center justify-between py-4 px-1 hover:bg-gray-50 transition-colors" 
                        onClick={closeMobileMenu}
                      >
                        <span className="text-lg font-semibold text-gray-900">Профайл</span>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </Link>
                    </li>
                    <li>
                      <Link 
                        href="/account/orders" 
                        className="flex items-center justify-between py-4 px-1 hover:bg-gray-50 transition-colors" 
                        onClick={closeMobileMenu}
                      >
                        <span className="text-lg font-semibold text-gray-900">Захиалгууд</span>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </Link>
                    </li>
                    <li>
                      <button 
                        onClick={() => { closeMobileMenu(); signOut({ callbackUrl: "/" }); }} 
                        className="w-full flex items-center justify-between py-4 px-1 hover:bg-gray-50 transition-colors text-left"
                      >
                        <span className="text-lg font-semibold text-red-600">Гарах</span>
                      </button>
                    </li>
                  </ul>
                ) : (
                  <>
                    <Link 
                      href="/auth/login" 
                      className="block text-lg font-bold text-gray-900 py-3 px-1" 
                      onClick={closeMobileMenu}
                    >
                      Нэвтрэх / Бүртгүүлэх
                    </Link>
                  </>
                )}
              </div>

              {/* Cart Section */}
              <div>
                <Link 
                  href="/cart" 
                  className="flex items-center justify-between py-4 px-1 hover:bg-gray-50 transition-colors" 
                  onClick={closeMobileMenu}
                >
                  <span className="text-lg font-semibold text-gray-900">Сагс</span>
                  <div className="flex items-center gap-2">
                    {cartItemCount > 0 && (
                      <span className="bg-blue-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {cartItemCount}
                      </span>
                    )}
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>

      <SearchErrorBoundary>
        <SearchModal />
      </SearchErrorBoundary>
    </>
  );
}
