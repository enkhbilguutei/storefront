import Link from "next/link";
import Image from "next/image";
import { getCategories } from "@/lib/data/categories";
import { getCategoryImage } from "@/lib/config/images";

export async function Categories() {
  const categories = await getCategories();

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="py-8 bg-[#f5f5f7]">
      <div className="container mx-auto px-4">
        <div className="flex overflow-x-auto pb-4 gap-6 md:gap-8 no-scrollbar snap-x justify-start md:justify-center">
          {categories.map((category) => {
            const imageUrl = getCategoryImage(category.handle);
            return (
              <Link
                key={category.id}
                href={`/categories/${category.handle}`}
                className="flex flex-col items-center min-w-20 group snap-start"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 mb-2 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                  <Image
                    src={imageUrl}
                    alt={category.name}
                    width={80}
                    height={80}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-xs font-medium text-foreground/70 group-hover:text-foreground transition-colors text-center">
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
