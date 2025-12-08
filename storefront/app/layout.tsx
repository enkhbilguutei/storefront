import type { Metadata } from "next";
import { Inter, Roboto_Mono, Playfair_Display } from "next/font/google";
import { Providers } from "@/components/Providers";
import { CartNotification } from "@/components/cart/CartNotification";
import { WishlistNotification } from "@/components/layout/WishlistNotification";
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
  metadataBase: new URL("https://alimhan.mn"),
  title: {
    default: "Алимхан Дэлгүүр",
    template: "%s | Алимхан Дэлгүүр",
  },
  description: "Технологийн сүүлийн үеийн бүтээгдэхүүнүүдийг баталгаат хугацаатай хэрэглэгчдэд нийлүүлж байна",
  keywords: ["технологи", "утас", "дрон", "камер", "дугуй", "онлайн дэлгүүр", "Монгол"],
  authors: [{ name: "Алимхан Дэлгүүр" }],
  icons: {
    icon: "/icon.jpg",
  },
  openGraph: {
    type: "website",
    locale: "mn_MN",
    url: "https://alimhan.mn",
    siteName: "Алимхан Дэлгүүр",
    title: "Алимхан Дэлгүүр",
    description: "Технологийн сүүлийн үеийн бүтээгдэхүүнүүдийг баталгаат хугацаатай хэрэглэгчдэд нийлүүлж байна",
  },
  twitter: {
    card: "summary_large_image",
    title: "Алимхан Дэлгүүр",
    description: "Технологийн сүүлийн үеийн бүтээгдэхүүнүүдийг баталгаат хугацаатай хэрэглэгчдэд нийлүүлж байна",
  },
  verification: {
    google: "google-site-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Organization structured data for SEO
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Алимхан Дэлгүүр",
    url: "https://alimhan.mn",
    logo: "https://alimhan.mn/icon.jpg",
    description: "Технологийн сүүлийн үеийн бүтээгдэхүүнүүдийг баталгаат хугацаатай хэрэглэгчдэд нийлүүлж байна",
    address: {
      "@type": "PostalAddress",
      addressCountry: "MN",
      addressLocality: "Улаанбаатар",
    },
    sameAs: [
      // Add social media links when available
    ],
  };

  return (
    <html lang="mn">
      <body
        className={`${inter.variable} ${robotoMono.variable} ${playfair.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <Providers>
          <CartInitializer />
          {children}
          <CartNotification />
          <WishlistNotification />
        </Providers>
      </body>
    </html>
  );
}
