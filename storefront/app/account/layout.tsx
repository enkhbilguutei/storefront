import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileAccountHeader } from "@/components/account/MobileAccountHeader";
import { AccountLayoutClient } from "./AccountLayoutClient";
import { AccountErrorBoundary } from "@/components/account/AccountErrorBoundary";
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
      <div className="hidden lg:block">
        <Header />
      </div>
      <MobileAccountHeader />
      <div className="lg:pt-16">
        <AccountErrorBoundary>
          <AccountLayoutClient>
            {children}
          </AccountLayoutClient>
        </AccountErrorBoundary>
      </div>
      <Footer />
    </div>
  );
}
