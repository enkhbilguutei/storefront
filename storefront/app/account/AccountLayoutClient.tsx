"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUserStore } from "@/lib/store";
import { 
  User, Package, MapPin, Heart, Settings, LogOut, Trophy
} from "lucide-react";
import { signOut } from "next-auth/react";

const accountLinks = [
  { href: "/account", label: "Профайл", icon: User },
  { href: "/account/orders", label: "Захиалгууд", icon: Package },
  { href: "/account/loyalty", label: "Урамшуулал", icon: Trophy },
  { href: "/account/addresses", label: "Хаягууд", icon: MapPin },
  { href: "/account/wishlist", label: "Хүслийн жагсаалт", icon: Heart },
  { href: "/account/settings", label: "Тохиргоо", icon: Settings },
];

export function AccountLayoutClient({
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
    ? `${user.lastName} ${user.firstName}`
    : user?.name || "Хэрэглэгч";

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <div className="flex-1 bg-gray-50/50">
      <div className="container mx-auto px-4 py-6 lg:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 shrink-0">
            {/* User Info */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
              <div className="flex items-center gap-3">
                {user?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={user.image} 
                    alt={displayName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-foreground text-background flex items-center justify-center text-sm font-medium">
                    {initials}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h1 className="text-sm font-semibold text-foreground truncate">{displayName}</h1>
                  <p className="text-xs text-secondary truncate">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <ul>
                {accountLinks.map((link) => {
                  const isActive = pathname === link.href || 
                    (link.href !== "/account" && pathname?.startsWith(link.href));
                  const Icon = link.icon;
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className={`flex items-center gap-3 px-4 py-3 text-sm border-b border-gray-50 last:border-b-0 transition-colors ${
                          isActive 
                            ? "bg-gray-50 text-foreground font-medium" 
                            : "text-secondary hover:bg-gray-50 hover:text-foreground"
                        }`}
                      >
                        <Icon className="h-4 w-4" strokeWidth={1.5} />
                        <span>{link.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <div className="border-t border-gray-100">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-secondary hover:bg-gray-50 hover:text-red-600 transition-colors w-full"
                >
                  <LogOut className="h-4 w-4" strokeWidth={1.5} />
                  <span>Гарах</span>
                </button>
              </div>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
