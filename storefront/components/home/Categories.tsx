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
        <div className="flex overflow-x-auto pb-4 gap-8 md:gap-12 no-scrollbar snap-x justify-start md:justify-center">
          {categories.map((category) => {
            const imageUrl = getCategoryImage(category.handle);
            return (
              <Link
                key={category.id}
                href={`/categories/${category.handle}`}
                className="flex flex-col items-center min-w-24 md:min-w-28 group snap-start"
              >
                <div className="relative w-20 h-20 md:w-28 md:h-28 mb-3 flex items-center justify-center rounded-2xl overflow-hidden bg-linear-to-br from-purple-400 via-pink-400 to-blue-400 p-0.5">
                  <div className="w-full h-full bg-white rounded-2xl flex items-center justify-center">
                    <Image
                      src={imageUrl}
                      alt={category.name}
                      width={112}
                      height={112}
                      className="w-[90%] h-[90%] object-contain"
                    />
                  </div>
                </div>
                <span className="text-xs md:text-sm font-medium text-foreground/80 group-hover:text-foreground transition-colors text-center">
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
