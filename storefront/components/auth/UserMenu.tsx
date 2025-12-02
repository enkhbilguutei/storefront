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
      <div className="hidden sm:flex text-foreground/80 hover:text-foreground hover:bg-foreground/5 transition-all p-2.5 rounded-full w-12 h-12 items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  // Show login button if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <Link 
        href="/auth/login" 
        className="hidden sm:flex text-foreground/80 hover:text-foreground hover:bg-foreground/5 transition-all p-2.5 rounded-full w-12 h-12 items-center justify-center"
      >
        <User className="h-6 w-6" strokeWidth={1.5} />
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
    <div className="relative hidden sm:block" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 p-1.5 pr-3 rounded-full transition-all ${
          isOpen 
            ? "bg-foreground/10" 
            : "hover:bg-foreground/5"
        }`}
      >
        {/* Avatar */}
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img 
            src={user.image} 
            alt={user.name || user.email}
            className="w-9 h-9 rounded-full object-cover"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-linear-to-br from-foreground to-foreground/70 text-white flex items-center justify-center text-sm font-medium">
            {initials}
          </div>
        )}
        <ChevronDown className={`h-4 w-4 text-foreground/60 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
          {/* User Info */}
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-3">
              {user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={user.image} 
                  alt={user.name || user.email}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-linear-to-br from-foreground to-foreground/70 text-white flex items-center justify-center text-lg font-medium">
                  {initials}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">
                  {user.firstName && user.lastName 
                    ? `${user.firstName} ${user.lastName}`
                    : user.name || "Хэрэглэгч"}
                </p>
                <p className="text-sm text-secondary truncate">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-2">
            <Link
              href="/account"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 text-foreground/80 hover:text-foreground hover:bg-gray-50 rounded-xl transition-all"
            >
              <UserCircle className="h-5 w-5" strokeWidth={1.5} />
              <span className="text-sm font-medium">Профайл</span>
            </Link>
            <Link
              href="/account/orders"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 text-foreground/80 hover:text-foreground hover:bg-gray-50 rounded-xl transition-all"
            >
              <Package className="h-5 w-5" strokeWidth={1.5} />
              <span className="text-sm font-medium">Захиалгууд</span>
            </Link>
            <Link
              href="/account/addresses"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 text-foreground/80 hover:text-foreground hover:bg-gray-50 rounded-xl transition-all"
            >
              <MapPin className="h-5 w-5" strokeWidth={1.5} />
              <span className="text-sm font-medium">Хаягууд</span>
            </Link>
            <Link
              href="/account/wishlist"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 text-foreground/80 hover:text-foreground hover:bg-gray-50 rounded-xl transition-all"
            >
              <Heart className="h-5 w-5" strokeWidth={1.5} />
              <span className="text-sm font-medium">Хүслийн жагсаалт</span>
            </Link>
            <Link
              href="/account/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 text-foreground/80 hover:text-foreground hover:bg-gray-50 rounded-xl transition-all"
            >
              <Settings className="h-5 w-5" strokeWidth={1.5} />
              <span className="text-sm font-medium">Тохиргоо</span>
            </Link>
          </div>

          {/* Sign Out */}
          <div className="p-2 border-t border-gray-100">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all"
            >
              <LogOut className="h-5 w-5" strokeWidth={1.5} />
              <span className="text-sm font-medium">Гарах</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
