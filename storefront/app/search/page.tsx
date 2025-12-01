import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SearchResults } from "./SearchResults";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q || "";

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1">
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

          <SearchResults initialQuery={query} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
