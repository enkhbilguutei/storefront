import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartContent } from "@/components/cart/CartContent";

export default function CartPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <CartContent />
      <Footer />
    </div>
  );
}
