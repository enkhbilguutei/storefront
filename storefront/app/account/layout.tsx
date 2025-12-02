"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUserStore } from "@/lib/store";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { 
  UserCircle, Package, MapPin, Heart, 
  Settings, ChevronRight
} from "lucide-react";

const accountLinks = [
  { href: "/account", label: "Профайл", icon: UserCircle },
  { href: "/account/orders", label: "Захиалгууд", icon: Package },
  { href: "/account/addresses", label: "Хаягууд", icon: MapPin },
  { href: "/account/wishlist", label: "Хүслийн жагсаалт", icon: Heart },
  { href: "/account/settings", label: "Тохиргоо", icon: Settings },
];

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useUserStore();

  const initials = user?.firstName && user?.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`
    : user?.name
      ? user.name.split(" ").map(n => n[0]).join("").slice(0, 2)
      : user?.email?.[0].toUpperCase() || "У";

  const displayName = user?.firstName && user?.lastName 
    ? `${user.firstName} ${user.lastName}`
    : user?.name || "Хэрэглэгч";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="flex-1 bg-gray-50/50">
      <div className="container mx-auto px-4 py-8">
        {/* Mobile Header */}
        <div className="lg:hidden mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-4">
              {user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={user.image} 
                  alt={displayName}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-linear-to-br from-foreground to-foreground/70 text-white flex items-center justify-center text-xl font-medium">
                  {initials}
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold text-foreground">{displayName}</h1>
                <p className="text-sm text-secondary">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-72 shrink-0">
            {/* Desktop User Info */}
            <div className="hidden lg:block bg-white rounded-2xl p-6 shadow-sm mb-6">
              <div className="flex flex-col items-center text-center">
                {user?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={user.image} 
                    alt={displayName}
                    className="w-20 h-20 rounded-full object-cover mb-4"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-linear-to-br from-foreground to-foreground/70 text-white flex items-center justify-center text-2xl font-medium mb-4">
                    {initials}
                  </div>
                )}
                <h1 className="text-xl font-bold text-foreground">{displayName}</h1>
                <p className="text-sm text-secondary">{user?.email}</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <ul>
                {accountLinks.map((link) => {
                  const isActive = pathname === link.href;
                  const Icon = link.icon;
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className={`flex items-center justify-between px-4 py-3.5 border-b border-gray-100 last:border-b-0 transition-all ${
                          isActive 
                            ? "bg-foreground/5 text-foreground font-medium" 
                            : "text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5" strokeWidth={1.5} />
                          <span>{link.label}</span>
                        </div>
                        <ChevronRight className={`h-4 w-4 ${isActive ? "text-foreground" : "text-gray-400"}`} />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
      </div>
      <Footer />
    </div>
  );
}
