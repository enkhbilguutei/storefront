import Link from "next/link";
import { CloudinaryImage } from "@/components/cloudinary";

interface ProductCardProps {
  id: string;
  title: string;
  handle: string;
  thumbnail?: string;
  price?: {
    amount: number;
    currencyCode: string;
  };
}

export function ProductCard({ title, handle, thumbnail, price }: ProductCardProps) {
  const formatPrice = (amount: number, currencyCode: string) => {
    return new Intl.NumberFormat("mn-MN", {
      style: "currency",
      currency: currencyCode,
    }).format(amount);
  };

  return (
    <Link href={`/products/${handle}`} className="group">
      <div className="aspect-square overflow-hidden rounded-lg bg-gray-100 mb-4">
        {thumbnail ? (
          <CloudinaryImage
            src={thumbnail}
            alt={title}
            width={400}
            height={400}
            className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-gray-400">
            Зураг байхгүй
          </div>
        )}
      </div>
      <h3 className="text-sm font-medium text-gray-900 group-hover:text-gray-600 transition-colors">
        {title}
      </h3>
      {price && (
        <p className="mt-1 text-sm text-gray-500">
          {formatPrice(price.amount, price.currencyCode)}
        </p>
      )}
    </Link>
  );
}
