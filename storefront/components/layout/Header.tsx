import { getCategories } from "@/lib/data/categories";
import { getCollections } from "@/lib/data/collections";
import { HeaderClient } from "./HeaderClient";

interface HeaderProps {
  isHomePage?: boolean;
}

// Server component wrapper
export async function Header({ isHomePage = false }: HeaderProps = {}) {
  const categories = await getCategories();
  const collections = await getCollections();
  return <HeaderClient categories={categories} collections={collections} isHomePage={isHomePage} />;
}

// Re-export for direct usage
export { HeaderClient } from "./HeaderClient";

