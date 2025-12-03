"use client";

import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useUserStore } from "@/lib/store";
import { 
  User, ChevronDown, Package, MapPin, Heart, 
  Settings, LogOut, UserCircle, Loader2
} from "lucide-react";

export function UserMenu() {
  const { user, isAuthenticated, isLoading } = useUserStore();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close menu on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut({ callbackUrl: "/" });
  };

  // Show loading state while checking session
  if (isLoading) {
    return (
      <div className="hidden lg:flex text-foreground/60 p-2 rounded-full w-10 h-10 items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin" strokeWidth={1.5} />
      </div>
    );
  }

  // Show login button if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <Link 
        href="/auth/login" 
        className="hidden lg:flex text-foreground/80 hover:text-foreground transition-colors p-2 rounded-full w-10 h-10 items-center justify-center"
        aria-label="Нэвтрэх"
      >
        <User className="h-5 w-5" strokeWidth={1.5} />
      </Link>
    );
  }

  // Get user initials for avatar
  const initials = user.firstName && user.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`
    : user.name
      ? user.name.split(" ").map(n => n[0]).join("").slice(0, 2)
      : user.email[0].toUpperCase();

  return (
    <div className="relative hidden lg:block" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1 p-1 rounded-full transition-all ${
          isOpen 
            ? "bg-foreground/10" 
            : "hover:bg-foreground/5"
        }`}
        aria-label="Хэрэглэгчийн цэс"
      >
        {/* Avatar */}
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img 
            src={user.image} 
            alt={user.name || user.email}
            className="w-7 h-7 rounded-full object-cover"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-xs font-medium">
            {initials}
          </div>
        )}
        <ChevronDown className={`h-3 w-3 text-foreground/50 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white/95 backdrop-blur-xl rounded-xl shadow-lg border border-gray-200/50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              {user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={user.image} 
                  alt={user.name || user.email}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-sm font-medium">
                  {initials}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {user.firstName && user.lastName 
                    ? `${user.firstName} ${user.lastName}`
                    : user.name || "Хэрэглэгч"}
                </p>
                <p className="text-xs text-secondary truncate">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <Link
              href="/account"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-foreground/80 hover:text-foreground hover:bg-gray-50 transition-colors"
            >
              <UserCircle className="h-4 w-4" strokeWidth={1.5} />
              <span>Профайл</span>
            </Link>
            <Link
              href="/account/orders"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-foreground/80 hover:text-foreground hover:bg-gray-50 transition-colors"
            >
              <Package className="h-4 w-4" strokeWidth={1.5} />
              <span>Захиалгууд</span>
            </Link>
            <Link
              href="/account/addresses"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-foreground/80 hover:text-foreground hover:bg-gray-50 transition-colors"
            >
              <MapPin className="h-4 w-4" strokeWidth={1.5} />
              <span>Хаягууд</span>
            </Link>
            <Link
              href="/account/wishlist"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-foreground/80 hover:text-foreground hover:bg-gray-50 transition-colors"
            >
              <Heart className="h-4 w-4" strokeWidth={1.5} />
              <span>Хүслийн жагсаалт</span>
            </Link>
            <Link
              href="/account/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-foreground/80 hover:text-foreground hover:bg-gray-50 transition-colors"
            >
              <Settings className="h-4 w-4" strokeWidth={1.5} />
              <span>Тохиргоо</span>
            </Link>
          </div>

          {/* Sign Out */}
          <div className="py-1 border-t border-gray-100">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-4 w-4" strokeWidth={1.5} />
              <span>Гарах</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
