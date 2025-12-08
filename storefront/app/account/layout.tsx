import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AccountLayoutClient } from "./AccountLayoutClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Миний бүртгэл",
  description: "Хэрэглэгчийн бүртгэл, захиалга, хаяг болон тохиргоо удирдах",
  robots: "noindex, follow",
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <AccountLayoutClient>
        {children}
      </AccountLayoutClient>
      <Footer />
    </div>
  );
}
