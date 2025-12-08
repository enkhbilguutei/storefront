import { Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LoginForm } from "./LoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Нэвтрэх",
  description: "Миний бүртгэлд нэвтрэх",
  robots: "noindex, follow",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <Suspense fallback={<div className="w-full max-w-md animate-pulse" />}>
          <LoginForm />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
