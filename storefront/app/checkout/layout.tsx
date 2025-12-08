import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Төлбөр тооцоо",
  description: "Захиалгаа баталгаажуулж, төлбөр тооцоо хийх",
  robots: "noindex, follow",
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
