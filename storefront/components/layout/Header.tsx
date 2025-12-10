import { getCategories } from "@/lib/data/categories";
import { HeaderClient } from "./HeaderClient";

// Server component wrapper
export async function Header() {
  const categories = await getCategories();
  return <HeaderClient categories={categories} />;
}

// Re-export for direct usage
export { HeaderClient } from "./HeaderClient";

