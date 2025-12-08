import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartContent } from "@/components/cart/CartContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Сагс",
  description: "Таны сагсан дахь бүтээгдэхүүнүүд",
  robots: "noindex, follow",
};

export default function CartPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <CartContent />
      <Footer />
    </div>
  );
}
