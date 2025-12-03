import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AccountLayoutClient } from "./AccountLayoutClient";

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
