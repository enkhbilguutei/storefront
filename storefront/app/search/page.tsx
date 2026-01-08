import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import type { Metadata } from "next";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const params = await searchParams;
  const query = params.q || "";

  if (query) {
    return {
      title: `"${query}" хайлтын илэрц`,
      description: `${query} хайлтын илэрцүүд. Алимхан дэлгүүрээс хүссэн бүтээгдэхүүнээ олоорой.`,
      robots: "noindex, follow",
    };
  }

  return {
    title: "Хайлт",
    description: "Алимхан дэлгүүрийн бүтээгдэхүүнүүдээс хайлт хийх",
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q || "";

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 pt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {query ? `"${query}" хайлтын илэрц` : "Хайлт"}
            </h1>
            <p className="text-gray-600 mt-2">
              {query 
                ? "Таны хайлтын илэрцүүд доор харагдаж байна" 
                : "Бүтээгдэхүүн хайхын тулд дээрх хайлтын талбарыг ашиглана уу"}
            </p>
          </div>

          
        </div>
      </main>

      <Footer />
    </div>
  );
}
