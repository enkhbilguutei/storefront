import type { LucideIconName } from "@/lib/icons/mapping";

export const accountLinks: Array<{
  href: string;
  label: string;
  icon: LucideIconName;
}> = [
  { href: "/account", label: "Профайл", icon: "User" },
  { href: "/account/orders", label: "Захиалгууд", icon: "Package" },
  { href: "/account/addresses", label: "Хаягууд", icon: "MapPin" },
  { href: "/account/wishlist", label: "Хүслийн жагсаалт", icon: "Heart" },
  { href: "/account/settings", label: "Тохиргоо", icon: "Settings" },
];
