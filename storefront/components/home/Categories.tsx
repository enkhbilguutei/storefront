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
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex overflow-x-auto pb-8 gap-10 md:gap-16 no-scrollbar snap-x justify-start md:justify-center">
          {categories.map((category) => {
            const imageUrl = getCategoryImage(category.handle);
            return (
              <Link
                key={category.id}
                href={`/categories/${category.handle}`}
                className="flex flex-col items-center min-w-24 group snap-start"
              >
                <div className="w-20 h-20 md:w-28 md:h-28 mb-4 flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                  <Image
                    src={imageUrl}
                    alt={category.name}
                    width={112}
                    height={112}
                    className="w-full h-full object-contain"
                  />
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
