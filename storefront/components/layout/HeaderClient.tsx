"use client";

import Link from "next/link";
import { User, Search, Menu, X, ChevronDown, ChevronRight, Package, LogOut } from "lucide-react";
import { CartButton } from "./CartButton";
import { useUIStore, useUserStore } from "@/lib/store";
import { useState, useEffect, useRef } from "react";
import { Category } from "@/lib/data/categories";
import { SearchModal } from "@/components/search/SearchModal";
import { UserMenu } from "@/components/auth/UserMenu";
import { signOut } from "next-auth/react";

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
      <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200">
        {/* Top bar - Apple Intelligence gradient promotional banner */}
        <div className="bg-gradient-to-r from-[#60a5fa] via-[#a5f3fc] via-[#fef08a] to-[#fb923c] text-[#1d1d1f] text-center py-2.5 text-xs font-medium tracking-wide">
          <p className="drop-shadow-sm">Шинэ бүтээгдэхүүн! iPhone 16 Pro худалдаанд гарлаа. <Link href="/categories/iphone" className="underline hover:no-underline ml-1 font-semibold">Дэлгэрэнгүй →</Link></p>
        </div>
        
        <div className="container mx-auto flex h-12 items-center justify-between px-4">
          {/* Logo - always on left */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-display font-semibold tracking-tight">
              alimhan
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            <Link 
              href="/products" 
              className="px-3 py-1.5 text-sm font-medium text-foreground/80"
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
                  className="px-3 py-1.5 text-sm font-medium text-foreground/80 flex items-center gap-0.5"
                >
                  Ангилал
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${isMegaMenuOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>
            )}
            
            <Link 
              href="/collections" 
              className="px-3 py-1.5 text-sm font-medium text-foreground/80"
            >
              Цуглуулга
            </Link>
            <Link 
              href="/about" 
              className="px-3 py-1.5 text-sm font-medium text-foreground/80"
            >
              Бидний тухай
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Desktop Search Bar */}
            <button 
              onClick={openSearch}
              className="hidden lg:flex items-center gap-2.5 px-5 xl:px-6 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-all min-w-[140px] xl:min-w-[180px]"
              aria-label="Хайх"
            >
              <Search className="h-4 w-4 xl:h-5 xl:w-5 text-foreground/50" strokeWidth={1.5} />
              <span className="text-sm xl:text-base text-foreground/50">Search</span>
            </button>
            {/* Mobile Search Button */}
            <button 
              onClick={openSearch}
              className="lg:hidden text-foreground/80 p-2 rounded-full w-10 h-10 flex items-center justify-center"
              aria-label="Хайх"
            >
              <Search className="h-5 w-5" strokeWidth={1.5} />
            </button>
            <CartButton />
            <UserMenu />
            {/* Mobile menu button - on right side */}
            <button 
              onClick={isMobileMenuOpen ? closeMobileMenu : openMobileMenu}
              className="lg:hidden text-foreground/80 hover:text-foreground transition-all p-2 rounded-full w-10 h-10 flex items-center justify-center"
              aria-label={isMobileMenuOpen ? "Цэсийг хаах" : "Цэсийг нээх"}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" strokeWidth={1.5} /> : <Menu className="h-5 w-5" strokeWidth={1.5} />}
            </button>
          </div>
        </div>

        {/* Mega Menu Dropdown */}
        {isMegaMenuOpen && categories.length > 0 && (
          <div 
            ref={megaMenuRef}
            onMouseEnter={handleMegaMenuEnter}
            onMouseLeave={handleMegaMenuLeave}
            className="absolute left-0 right-0 top-full z-50 bg-white border-t border-gray-100 shadow-2xl animate-in fade-in slide-in-from-top-1 duration-150"
          >
            <div className="container mx-auto px-4">
              <div className="flex py-6">
                {/* Category List */}
                <div className="w-56 border-r border-gray-100 pr-6">
                  <h3 className="text-[10px] font-semibold text-foreground/40 uppercase tracking-wider mb-3">Ангилал</h3>
                  <ul className="space-y-0.5">
                    {categories.map((category) => (
                      <li key={category.id}>
                        <button
                          onMouseEnter={() => setActiveCategory(category)}
                          onClick={() => {
                            setIsMegaMenuOpen(false);
                            window.location.href = `/categories/${category.handle}`;
                          }}
                          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all ${
                            activeCategory?.id === category.id 
                              ? 'bg-foreground/5 text-foreground' 
                              : 'text-foreground/70 hover:bg-foreground/5 hover:text-foreground'
                          }`}
                        >
                          <Package className="h-4 w-4" strokeWidth={1.5} />
                          <span className="text-xs font-medium">{category.name}</span>
                          <ChevronRight className="h-3 w-3 ml-auto opacity-40" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Category Details */}
                {activeCategory && (
                  <div className="flex-1 pl-6">
                    <div className="flex items-center gap-2.5 mb-3">
                      <Package className="h-6 w-6 text-foreground" strokeWidth={1.5} />
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">{activeCategory.name}</h3>
                        <p className="text-xs text-foreground/50">{activeCategory.description || `${activeCategory.name} бүтээгдэхүүнүүд`}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      {/* Subcategories from Medusa */}
                      {activeCategory.category_children && activeCategory.category_children.length > 0 ? (
                        <div className="col-span-2">
                          <h4 className="text-[10px] font-semibold text-foreground/40 uppercase tracking-wider mb-2">Дэд ангилал</h4>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                            {activeCategory.category_children.map((child) => (
                              <Link
                                key={child.id}
                                href={`/categories/${child.handle}`}
                                onClick={() => setIsMegaMenuOpen(false)}
                                className="text-xs text-foreground/60 hover:text-foreground transition-colors py-0.5"
                              >
                                {child.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <>
                          <div>
                            <h4 className="text-[10px] font-semibold text-foreground/40 uppercase tracking-wider mb-2">Холбоосууд</h4>
                            <ul className="space-y-1.5">
                              <li>
                                <Link 
                                  href={`/categories/${activeCategory.handle}`}
                                  onClick={() => setIsMegaMenuOpen(false)}
                                  className="text-xs text-foreground/60 hover:text-foreground transition-colors"
                                >
                                  Бүгдийг үзэх
                                </Link>
                              </li>
                              <li>
                                <Link 
                                  href={`/categories/${activeCategory.handle}?sort=newest`}
                                  onClick={() => setIsMegaMenuOpen(false)}
                                  className="text-xs text-foreground/60 hover:text-foreground transition-colors"
                                >
                                  Шинэ бүтээгдэхүүн
                                </Link>
                              </li>
                              <li>
                                <Link 
                                  href={`/categories/${activeCategory.handle}?sort=price_asc`}
                                  onClick={() => setIsMegaMenuOpen(false)}
                                  className="text-xs text-foreground/60 hover:text-foreground transition-colors"
                                >
                                  Үнээр (бага → их)
                                </Link>
                              </li>
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="text-[10px] font-semibold text-foreground/40 uppercase tracking-wider mb-2">Түгээмэл</h4>
                            <ul className="space-y-1.5">
                              <li>
                                <Link 
                                  href={`/categories/${activeCategory.handle}?sort=popular`}
                                  onClick={() => setIsMegaMenuOpen(false)}
                                  className="text-xs text-foreground/60 hover:text-foreground transition-colors"
                                >
                                  Эрэлттэй бүтээгдэхүүн
                                </Link>
                              </li>
                              <li>
                                <Link 
                                  href={`/products`}
                                  onClick={() => setIsMegaMenuOpen(false)}
                                  className="text-xs text-foreground/60 hover:text-foreground transition-colors"
                                >
                                  Бүх бүтээгдэхүүн
                                </Link>
                              </li>
                            </ul>
                          </div>
                        </>
                      )}

                      <div className="bg-gradient-to-br from-foreground/[0.03] to-foreground/[0.06] rounded-2xl p-4">
                        <p className="text-[10px] font-semibold text-foreground/40 uppercase tracking-wider mb-1.5">Онцлох</p>
                        <p className="text-xs font-medium text-foreground mb-2">{activeCategory.name} бүтээгдэхүүнүүдтэй танилцана уу</p>
                        <Link 
                          href={`/categories/${activeCategory.handle}`}
                          onClick={() => setIsMegaMenuOpen(false)}
                          className="inline-flex items-center text-xs font-medium text-blue-600 hover:underline"
                        >
                          Бүгдийг үзэх
                          <ChevronRight className="h-3 w-3 ml-0.5" />
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
          className={`absolute top-0 left-0 bottom-0 w-full sm:max-w-sm bg-white shadow-2xl transition-transform duration-300 ease-out overflow-y-auto ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          style={{ paddingBottom: 'env(safe-area-inset-bottom)', paddingTop: 'env(safe-area-inset-top)' }}
        >
          {/* Mobile Menu Header */}
          <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 sm:px-5 py-4 sm:py-5 flex items-center justify-center z-10">
            <Link href="/" onClick={closeMobileMenu} className="flex items-center">
              <span className="text-xl sm:text-2xl font-display font-bold tracking-tight">
                alimhan
              </span>
            </Link>
            <button 
              onClick={closeMobileMenu}
              className="absolute right-2 sm:right-3 p-2 sm:p-2.5 text-foreground/70 hover:text-foreground hover:bg-foreground/5 rounded-full transition-all"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>

          {/* Mobile Menu Content */}
          <div className="px-4 sm:px-5 py-4 sm:py-6">
            {/* Search Bar */}
            <div className="mb-4 sm:mb-6">
              <button 
                onClick={() => {
                  closeMobileMenu();
                  openSearch();
                }}
                className="relative w-full"
              >
                <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-secondary" />
                <div className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-3.5 bg-foreground/5 rounded-xl sm:rounded-2xl text-sm sm:text-base text-left text-secondary">
                  Хайх...
                </div>
              </button>
            </div>

            {/* Main Navigation Links */}
            <nav className="space-y-0.5 sm:space-y-1 mb-4 sm:mb-6">
              <Link 
                href="/products" 
                onClick={closeMobileMenu}
                className="flex items-center px-3 sm:px-4 py-3 sm:py-4 text-base sm:text-lg font-semibold text-foreground hover:bg-foreground/5 rounded-xl sm:rounded-2xl transition-all active:scale-[0.98]"
              >
                Бүтээгдэхүүн
              </Link>
              <Link 
                href="/collections" 
                onClick={closeMobileMenu}
                className="flex items-center px-3 sm:px-4 py-3 sm:py-4 text-base sm:text-lg font-semibold text-foreground hover:bg-foreground/5 rounded-xl sm:rounded-2xl transition-all active:scale-[0.98]"
              >
                Цуглуулга
              </Link>
              <Link 
                href="/about" 
                onClick={closeMobileMenu}
                className="flex items-center px-3 sm:px-4 py-3 sm:py-4 text-base sm:text-lg font-semibold text-foreground hover:bg-foreground/5 rounded-xl sm:rounded-2xl transition-all active:scale-[0.98]"
              >
                Бидний тухай
              </Link>
            </nav>

            {/* Categories */}
            {categories.length > 0 && (
              <div className="border-t border-gray-100 pt-4 sm:pt-6">
                <h3 className="text-[10px] sm:text-xs font-semibold text-secondary uppercase tracking-wider px-3 sm:px-4 mb-3 sm:mb-4">Ангилал</h3>
                <div className="space-y-0.5 sm:space-y-1">
                  {categories.map((category) => (
                    <div key={category.id}>
                      <Link
                        href={`/categories/${category.handle}`}
                        onClick={closeMobileMenu}
                        className="w-full flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3.5 text-foreground hover:bg-foreground/5 rounded-xl sm:rounded-2xl transition-all active:scale-[0.98]"
                      >
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center bg-foreground/5 text-foreground/70">
                            <Package className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={1.5} />
                          </div>
                          <span className="text-sm sm:text-base font-medium">{category.name}</span>
                        </div>
                        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-secondary" />
                      </Link>
                      {/* Subcategories */}
                      {category.category_children && category.category_children.length > 0 && (
                        <div className="ml-11 sm:ml-14 mt-0.5 sm:mt-1 mb-1.5 sm:mb-2 space-y-0.5 sm:space-y-1">
                          {category.category_children.map((child) => (
                            <Link
                              key={child.id}
                              href={`/categories/${child.handle}`}
                              onClick={closeMobileMenu}
                              className="block px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-foreground/70 hover:text-foreground hover:bg-foreground/5 rounded-lg sm:rounded-xl transition-all"
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
            <MobileAccountSection closeMobileMenu={closeMobileMenu} />
          </div>
        </div>
      </div>

      {/* Search Modal */}
      <SearchModal />
    </>
  );
}

// Mobile account section component
function MobileAccountSection({ closeMobileMenu }: { closeMobileMenu: () => void }) {
  const { user, isAuthenticated } = useUserStore();
  
  if (isAuthenticated && user) {
    const initials = user.firstName && user.lastName
      ? `${user.firstName[0]}${user.lastName[0]}`
      : user.name
        ? user.name.split(" ").map(n => n[0]).join("").slice(0, 2)
        : user.email[0].toUpperCase();
    
    const displayName = user.firstName && user.lastName 
      ? `${user.firstName} ${user.lastName}`
      : user.name || "Хэрэглэгч";

    return (
      <>
        {/* User Info Section */}
        <div className="border-t border-gray-100 pt-6 mt-6">
          <div className="px-4 py-3 flex items-center gap-4">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                src={user.image} 
                alt={displayName}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-linear-to-br from-foreground to-foreground/70 text-white flex items-center justify-center text-lg font-medium">
                {initials}
              </div>
            )}
            <div>
              <p className="font-semibold text-foreground">{displayName}</p>
              <p className="text-sm text-secondary">{user.email}</p>
            </div>
          </div>
          
          <div className="mt-4 space-y-1">
            <Link 
              href="/account" 
              onClick={closeMobileMenu}
              className="flex items-center gap-4 px-4 py-3 text-foreground hover:bg-foreground/5 rounded-2xl transition-all"
            >
              <User className="h-5 w-5 text-foreground/70" />
              <span className="text-base font-medium">Профайл</span>
            </Link>
            <Link 
              href="/account/orders" 
              onClick={closeMobileMenu}
              className="flex items-center gap-4 px-4 py-3 text-foreground hover:bg-foreground/5 rounded-2xl transition-all"
            >
              <Package className="h-5 w-5 text-foreground/70" />
              <span className="text-base font-medium">Захиалгууд</span>
            </Link>
            <button 
              onClick={async () => {
                closeMobileMenu();
                await signOut({ callbackUrl: "/" });
              }}
              className="w-full flex items-center gap-4 px-4 py-3 text-red-600 hover:bg-red-50 rounded-2xl transition-all"
            >
              <LogOut className="h-5 w-5" />
              <span className="text-base font-medium">Гарах</span>
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Login Section */}
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
    </>
  );
}
