import Link from "next/link";
import { 
  Laptop, 
  Smartphone, 
  Tablet, 
  Watch, 
  Headphones, 
  Radio, 
  Tv, 
  Speaker, 
  CaseUpper,
  Package,
  LucideIcon,
} from "lucide-react";
import { getCategories, Category } from "@/lib/data/categories";

// Map category handles to icons
const iconMap: Record<string, LucideIcon> = {
  "mac": Laptop,
  "iphone": Smartphone,
  "ipad": Tablet,
  "apple-watch": Watch,
  "watch": Watch,
  "airpods": Headphones,
  "airtag": Radio,
  "apple-tv": Tv,
  "homepod": Speaker,
  "accessories": CaseUpper,
  "дагалдах-хэрэгсэл": CaseUpper,
};

function getCategoryIcon(handle: string): LucideIcon {
  // Check for exact match
  if (iconMap[handle]) return iconMap[handle];
  
  // Check for partial match
  for (const [key, icon] of Object.entries(iconMap)) {
    if (handle.includes(key) || key.includes(handle)) {
      return icon;
    }
  }
  
  return Package;
}

export async function Categories() {
  const categories = await getCategories();

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex overflow-x-auto pb-8 gap-8 md:gap-12 no-scrollbar snap-x justify-start md:justify-center">
          {categories.map((category) => {
            const IconComponent = getCategoryIcon(category.handle);
            return (
              <Link
                key={category.id}
                href={`/categories/${category.handle}`}
                className="flex flex-col items-center min-w-20 group snap-start"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 mb-4 flex items-center justify-center text-secondary transition-all duration-300 group-hover:text-foreground group-hover:scale-110">
                  <IconComponent strokeWidth={1} className="w-10 h-10 md:w-12 md:h-12" />
                </div>
                <span className="text-sm font-medium text-secondary group-hover:text-foreground transition-colors text-center">
                  {category.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
