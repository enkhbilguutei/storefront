"use client";

import Link from "next/link";
import { User, Search, Menu, X, ChevronDown, ChevronRight, Package } from "lucide-react";
import { CartButton } from "./CartButton";
import { useUIStore } from "@/lib/store";
import { useState, useEffect, useRef } from "react";
import { Category } from "@/lib/data/categories";
import { SearchModal } from "@/components/search/SearchModal";

interface HeaderClientProps {
  categories: Category[];
}

export function HeaderClient({ categories }: HeaderClientProps) {
  const { isMobileMenuOpen, openMobileMenu, closeMobileMenu, openSearch } = useUIStore();
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const megaMenuRef = useRef<HTMLDivElement>(null);
  const megaMenuTriggerRef = useRef<HTMLButtonElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

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

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-md border-b border-gray-200/50 supports-backdrop-filter:bg-background/80">
        {/* Top bar - optional promotional banner */}
        <div className="bg-foreground text-background text-center py-2 text-xs">
          <p>🎉 Шинэ бүтээгдэхүүн! iPhone 16 Pro худалдаанд гарлаа. <Link href="/categories/iphone" className="underline hover:no-underline font-medium">Дэлгэрэнгүй →</Link></p>
        </div>
        
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Mobile menu button */}
          <button 
            onClick={isMobileMenuOpen ? closeMobileMenu : openMobileMenu}
            className="lg:hidden text-foreground/80 hover:text-foreground hover:bg-foreground/5 transition-all p-2.5 rounded-full w-12 h-12 flex items-center justify-center -ml-2"
            aria-label={isMobileMenuOpen ? "Цэсийг хаах" : "Цэсийг нээх"}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" strokeWidth={1.5} /> : <Menu className="h-6 w-6" strokeWidth={1.5} />}
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl sm:text-xl font-display font-bold tracking-tight">
              alimhan
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            <Link 
              href="/products" 
              className="px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-foreground/5 rounded-full transition-all"
            >
              Бүтээгдэхүүн
            </Link>
            
            {/* Categories Mega Menu Trigger */}
            {categories.length > 0 && (
              <div className="relative">
                <button 
                  ref={megaMenuTriggerRef}
                  onMouseEnter={handleMegaMenuEnter}
                  onMouseLeave={handleMegaMenuLeave}
                  className={`px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-foreground/5 rounded-full transition-all flex items-center gap-1 ${isMegaMenuOpen ? 'bg-foreground/5 text-foreground' : ''}`}
                >
                  Ангилал
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${isMegaMenuOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>
            )}
            
            <Link 
              href="/collections" 
              className="px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-foreground/5 rounded-full transition-all"
            >
              Цуглуулга
            </Link>
            <Link 
              href="/about" 
              className="px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-foreground/5 rounded-full transition-all"
            >
              Бидний тухай
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-1">
            <button 
              onClick={openSearch}
              className="text-foreground/80 hover:text-foreground hover:bg-foreground/5 transition-all p-2.5 rounded-full w-12 h-12 flex items-center justify-center"
              aria-label="Хайх"
            >
              <Search className="h-6 w-6" strokeWidth={1.5} />
            </button>
            <Link href="/auth/login" className="hidden sm:flex text-foreground/80 hover:text-foreground hover:bg-foreground/5 transition-all p-2.5 rounded-full w-12 h-12 items-center justify-center">
              <User className="h-6 w-6" strokeWidth={1.5} />
            </Link>
            <CartButton />
          </div>
        </div>

        {/* Mega Menu Dropdown */}
        {isMegaMenuOpen && categories.length > 0 && (
          <div 
            ref={megaMenuRef}
            onMouseEnter={handleMegaMenuEnter}
            onMouseLeave={handleMegaMenuLeave}
            className="absolute left-0 right-0 top-full bg-white border-t border-gray-100 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <div className="container mx-auto px-4">
              <div className="flex py-8">
                {/* Category List */}
                <div className="w-64 border-r border-gray-100 pr-8">
                  <h3 className="text-xs font-semibold text-secondary uppercase tracking-wider mb-4">Ангилал</h3>
                  <ul className="space-y-1">
                    {categories.map((category) => (
                      <li key={category.id}>
                        <button
                          onMouseEnter={() => setActiveCategory(category)}
                          onClick={() => {
                            setIsMegaMenuOpen(false);
                            window.location.href = `/categories/${category.handle}`;
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                            activeCategory?.id === category.id 
                              ? 'bg-foreground/5 text-foreground' 
                              : 'text-foreground/70 hover:bg-foreground/5 hover:text-foreground'
                          }`}
                        >
                          <Package className="h-5 w-5" strokeWidth={1.5} />
                          <span className="text-sm font-medium">{category.name}</span>
                          <ChevronRight className="h-4 w-4 ml-auto opacity-50" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Category Details */}
                {activeCategory && (
                  <div className="flex-1 pl-8">
                    <div className="flex items-center gap-3 mb-4">
                      <Package className="h-8 w-8 text-foreground" strokeWidth={1.5} />
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">{activeCategory.name}</h3>
                        <p className="text-sm text-secondary">{activeCategory.description || `${activeCategory.name} бүтээгдэхүүнүүд`}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-6 mt-6">
                      {/* Subcategories from Medusa */}
                      {activeCategory.category_children && activeCategory.category_children.length > 0 ? (
                        <div className="col-span-2">
                          <h4 className="text-xs font-semibold text-secondary uppercase tracking-wider mb-3">Дэд ангилал</h4>
                          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                            {activeCategory.category_children.map((child) => (
                              <Link
                                key={child.id}
                                href={`/categories/${child.handle}`}
                                onClick={() => setIsMegaMenuOpen(false)}
                                className="text-sm text-foreground/70 hover:text-accent transition-colors py-1"
                              >
                                {child.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <>
                          <div>
                            <h4 className="text-xs font-semibold text-secondary uppercase tracking-wider mb-3">Холбоосууд</h4>
                            <ul className="space-y-2">
                              <li>
                                <Link 
                                  href={`/categories/${activeCategory.handle}`}
                                  onClick={() => setIsMegaMenuOpen(false)}
                                  className="text-sm text-foreground/70 hover:text-accent transition-colors"
                                >
                                  Бүгдийг үзэх
                                </Link>
                              </li>
                              <li>
                                <Link 
                                  href={`/categories/${activeCategory.handle}?sort=newest`}
                                  onClick={() => setIsMegaMenuOpen(false)}
                                  className="text-sm text-foreground/70 hover:text-accent transition-colors"
                                >
                                  Шинэ бүтээгдэхүүн
                                </Link>
                              </li>
                              <li>
                                <Link 
                                  href={`/categories/${activeCategory.handle}?sort=price_asc`}
                                  onClick={() => setIsMegaMenuOpen(false)}
                                  className="text-sm text-foreground/70 hover:text-accent transition-colors"
                                >
                                  Үнээр (бага → их)
                                </Link>
                              </li>
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="text-xs font-semibold text-secondary uppercase tracking-wider mb-3">Түгээмэл</h4>
                            <ul className="space-y-2">
                              <li>
                                <Link 
                                  href={`/categories/${activeCategory.handle}?sort=popular`}
                                  onClick={() => setIsMegaMenuOpen(false)}
                                  className="text-sm text-foreground/70 hover:text-accent transition-colors"
                                >
                                  Эрэлттэй бүтээгдэхүүн
                                </Link>
                              </li>
                              <li>
                                <Link 
                                  href={`/products`}
                                  onClick={() => setIsMegaMenuOpen(false)}
                                  className="text-sm text-foreground/70 hover:text-accent transition-colors"
                                >
                                  Бүх бүтээгдэхүүн
                                </Link>
                              </li>
                            </ul>
                          </div>
                        </>
                      )}

                      <div className="bg-linear-to-br from-foreground/5 to-foreground/10 rounded-2xl p-6">
                        <p className="text-xs font-semibold text-secondary uppercase tracking-wider mb-2">Онцлох</p>
                        <p className="text-sm font-medium text-foreground mb-3">{activeCategory.name} бүтээгдэхүүнүүдтэй танилцана уу</p>
                        <Link 
                          href={`/categories/${activeCategory.handle}`}
                          onClick={() => setIsMegaMenuOpen(false)}
                          className="inline-flex items-center text-sm font-medium text-accent hover:underline"
                        >
                          Бүгдийг үзэх
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Navigation Menu */}
      <div 
        className={`fixed inset-0 z-40 lg:hidden transition-all duration-300 ${
          isMobileMenuOpen ? 'visible' : 'invisible'
        }`}
      >
        {/* Backdrop */}
        <div 
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
            isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={closeMobileMenu}
        />
        
        {/* Menu Panel */}
        <div 
          className={`absolute top-0 left-0 bottom-0 w-full max-w-sm bg-white shadow-2xl transition-transform duration-300 ease-out overflow-y-auto ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Mobile Menu Header */}
          <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-100 px-5 py-5 flex items-center justify-center relative z-10">
            <Link href="/" onClick={closeMobileMenu} className="flex items-center">
              <span className="text-2xl font-display font-bold tracking-tight">
                alimhan
              </span>
            </Link>
            <button 
              onClick={closeMobileMenu}
              className="absolute right-3 p-2.5 text-foreground/70 hover:text-foreground hover:bg-foreground/5 rounded-full transition-all"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Mobile Menu Content */}
          <div className="px-5 py-6">
            {/* Search Bar */}
            <div className="mb-6">
              <button 
                onClick={() => {
                  closeMobileMenu();
                  openSearch();
                }}
                className="relative w-full"
              >
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary" />
                <div className="w-full pl-12 pr-4 py-3.5 bg-foreground/5 rounded-2xl text-base text-left text-secondary">
                  Хайх...
                </div>
              </button>
            </div>

            {/* Main Navigation Links */}
            <nav className="space-y-1 mb-6">
              <Link 
                href="/products" 
                onClick={closeMobileMenu}
                className="flex items-center px-4 py-4 text-lg font-semibold text-foreground hover:bg-foreground/5 rounded-2xl transition-all active:scale-[0.98]"
              >
                Бүтээгдэхүүн
              </Link>
              <Link 
                href="/collections" 
                onClick={closeMobileMenu}
                className="flex items-center px-4 py-4 text-lg font-semibold text-foreground hover:bg-foreground/5 rounded-2xl transition-all active:scale-[0.98]"
              >
                Цуглуулга
              </Link>
              <Link 
                href="/about" 
                onClick={closeMobileMenu}
                className="flex items-center px-4 py-4 text-lg font-semibold text-foreground hover:bg-foreground/5 rounded-2xl transition-all active:scale-[0.98]"
              >
                Бидний тухай
              </Link>
            </nav>

            {/* Categories */}
            {categories.length > 0 && (
              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-xs font-semibold text-secondary uppercase tracking-wider px-4 mb-4">Ангилал</h3>
                <div className="space-y-1">
                  {categories.map((category) => (
                    <div key={category.id}>
                      <Link
                        href={`/categories/${category.handle}`}
                        onClick={closeMobileMenu}
                        className="w-full flex items-center justify-between px-4 py-3.5 text-foreground hover:bg-foreground/5 rounded-2xl transition-all active:scale-[0.98]"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-foreground/5 text-foreground/70">
                            <Package className="h-5 w-5" strokeWidth={1.5} />
                          </div>
                          <span className="text-base font-medium">{category.name}</span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-secondary" />
                      </Link>
                      {/* Subcategories */}
                      {category.category_children && category.category_children.length > 0 && (
                        <div className="ml-14 mt-1 mb-2 space-y-1">
                          {category.category_children.map((child) => (
                            <Link
                              key={child.id}
                              href={`/categories/${child.handle}`}
                              onClick={closeMobileMenu}
                              className="block px-4 py-2 text-sm text-foreground/70 hover:text-foreground hover:bg-foreground/5 rounded-xl transition-all"
                            >
                              {child.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Account Section */}
            <div className="border-t border-gray-100 pt-6 mt-6">
              <Link 
                href="/auth/login" 
                onClick={closeMobileMenu}
                className="flex items-center gap-4 px-4 py-3.5 text-foreground hover:bg-foreground/5 rounded-2xl transition-all active:scale-[0.98]"
              >
                <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center">
                  <User className="h-5 w-5 text-foreground/70" />
                </div>
                <div>
                  <span className="text-base font-semibold block">Нэвтрэх</span>
                  <span className="text-xs text-secondary">Бүртгэлтэй хэрэглэгч</span>
                </div>
              </Link>
            </div>

            {/* Bottom CTA */}
            <div className="mt-8 p-4">
              <div className="bg-linear-to-br from-foreground to-foreground/90 rounded-2xl p-5 text-center">
                <p className="text-background/80 text-sm mb-2">Шинэ хэрэглэгч үү?</p>
                <Link 
                  href="/auth/register" 
                  onClick={closeMobileMenu}
                  className="inline-block text-background font-semibold text-base hover:underline"
                >
                  Бүртгүүлэх →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Modal */}
      <SearchModal />
    </>
  );
}
