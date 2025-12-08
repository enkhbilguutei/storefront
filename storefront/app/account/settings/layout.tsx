import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Тохиргоо",
  description: "Бүртгэлийн тохиргоо",
  robots: "noindex, follow",
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
