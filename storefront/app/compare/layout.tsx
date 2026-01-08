import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Бүтээгдэхүүн харьцуулах | Алимхан Дэлгүүр",
  description: "Сонирхсон бүтээгдэхүүнүүдээ харьцуулж, хамгийн тохиромжтой сонголтоо хийгээрэй.",
  openGraph: {
    title: "Бүтээгдэхүүн харьцуулах | Алимхан Дэлгүүр",
    description: "Сонирхсон бүтээгдэхүүнүүдээ харьцуулж, хамгийн тохиромжтой сонголтоо хийгээрэй.",
    type: "website",
  },
};

export default function CompareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
