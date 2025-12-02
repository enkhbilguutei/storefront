import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { RegisterForm } from "./RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <RegisterForm />
      </main>

      <Footer />
    </div>
  );
}
