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
    <section className="py-10 md:py-12 bg-[#f5f5f7]">
      <div className="container mx-auto px-4">
        <div className="flex overflow-x-auto pb-4 gap-6 md:gap-8 no-scrollbar snap-x justify-start md:justify-center">
          {categories.map((category) => {
            const imageUrl = getCategoryImage(category.handle);
            return (
              <Link
                key={category.id}
                href={`/categories/${category.handle}`}
                className="flex flex-col items-center min-w-28 md:min-w-36 group snap-start"
              >
                <div className="relative w-24 h-24 md:w-36 md:h-36 mb-3 flex items-center justify-center bg-transparent transition-transform duration-200 group-hover:-translate-y-0.5">
                  <Image
                    src={imageUrl}
                    alt={category.name}
                    width={144}
                    height={144}
                    className="w-[88%] h-[88%] object-contain"
                  />
                </div>
                <span className="text-sm md:text-base font-medium text-foreground/80 group-hover:text-foreground transition-colors text-center">
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
