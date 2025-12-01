import type { Metadata } from "next";
import { Inter, Roboto_Mono, Playfair_Display } from "next/font/google";
import { Providers } from "@/components/Providers";
import { CartNotification } from "@/components/cart/CartNotification";
import { CartInitializer } from "@/components/cart/CartInitializer";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Алимхан Дэлгүүр",
  description: "Технологийн сүүлийн үеийн бүтээгдэхүүнүүдийг баталгаат хугацаатай хэрэглэгчдэд нийлүүлж байна",
  icons: {
    icon: "/icon.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="mn">
      <body
        className={`${inter.variable} ${robotoMono.variable} ${playfair.variable} antialiased`}
      >
        <Providers>
          <CartInitializer />
          {children}
          <CartNotification />
        </Providers>
      </body>
    </html>
  );
}
