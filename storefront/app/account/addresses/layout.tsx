import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Хаягууд",
  description: "Миний хүргэлтийн хаягууд",
  robots: "noindex, follow",
};

export default function AddressesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
