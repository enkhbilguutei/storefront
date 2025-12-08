import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Захиалгууд",
  description: "Миний захиалгуудын түүх",
  robots: "noindex, follow",
};

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
