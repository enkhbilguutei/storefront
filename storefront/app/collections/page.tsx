import { redirect } from "next/navigation";

// Collections page is no longer used - redirect to products
export default function CollectionsPage() {
  redirect("/products");
}
