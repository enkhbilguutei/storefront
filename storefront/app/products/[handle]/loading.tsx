import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
  );
}

export default function ProductLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="max-w-7xl mx-auto">
            {/* Breadcrumbs Skeleton */}
            <nav className="flex items-center gap-2 mb-8 md:mb-12">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 xl:gap-24">
              {/* Image Gallery Skeleton */}
              <div className="space-y-4">
                {/* Main Image */}
                <Skeleton className="aspect-square rounded-3xl" />
                
                {/* Thumbnail Grid */}
                <div className="flex gap-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="w-20 h-20 rounded-xl shrink-0" />
                  ))}
                </div>
              </div>

              {/* Product Info Skeleton */}
              <div className="flex flex-col">
                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="w-4 h-4 rounded" />
                    ))}
                  </div>
                  <Skeleton className="h-4 w-20" />
                </div>

                {/* Title */}
                <Skeleton className="h-10 w-3/4 mb-4" />
                
                {/* Price */}
                <Skeleton className="h-8 w-32 mb-6" />

                {/* Divider */}
                <div className="h-px bg-gray-100 mb-6" />

                {/* Options */}
                <div className="space-y-6 mb-8">
                  {/* Color Option */}
                  <div>
                    <div className="flex justify-between mb-3">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                    <div className="flex gap-3">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="w-16 h-16 rounded-xl" />
                      ))}
                    </div>
                  </div>

                  {/* Storage Option */}
                  <div>
                    <div className="flex justify-between mb-3">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-10 w-20 rounded-full" />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Quantity */}
                <div className="mb-8">
                  <Skeleton className="h-4 w-20 mb-3" />
                  <Skeleton className="h-12 w-36 rounded-full" />
                </div>

                {/* Actions */}
                <div className="flex gap-3 mb-8">
                  <Skeleton className="flex-1 h-14 rounded-full" />
                  <Skeleton className="w-14 h-14 rounded-full" />
                  <Skeleton className="w-14 h-14 rounded-full" />
                </div>

                {/* Features */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 rounded-2xl" />
                  ))}
                </div>

                {/* Description */}
                <div className="border-t border-gray-100 pt-8">
                  <Skeleton className="h-6 w-48 mb-4" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
