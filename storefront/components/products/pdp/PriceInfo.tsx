import { Sparkles, Clock3, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface PriceInfoProps {
  currentPrice: string;
  originalPrice?: string;
  discountPercentage?: number;
  isOnSale: boolean;
  isTradeInEligible: boolean;
}

export function PriceInfo({
  currentPrice,
  originalPrice,
  discountPercentage,
  isOnSale,
  isTradeInEligible,
}: PriceInfoProps) {
  return (
    <div className="py-4">
      <div className="flex flex-col gap-3">
        <div className="flex items-baseline gap-3">
          <p className="text-4xl md:text-5xl font-bold text-[#2B2D42]">
            {currentPrice}
          </p>
          {isOnSale && originalPrice && (
            <p className="text-lg text-[#8D99AF] line-through">{originalPrice}</p>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          {isOnSale && discountPercentage && (
            <Badge variant="discount" icon={Sparkles}>
              -{discountPercentage}%
            </Badge>
          )}
          {isTradeInEligible && (
            <Badge variant="primary" icon={CreditCard}>
              Trade-in
            </Badge>
          )}
        </div>
        
        <p className="text-sm text-[#8D99AF]">
          Татвар багтсан
        </p>
      </div>
    </div>
  );
}
