import { Minus, Plus } from "lucide-react";

interface QuantitySelectorProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}

export function QuantitySelector({
  quantity,
  onIncrement,
  onDecrement,
  min = 1,
  max,
  disabled = false,
}: QuantitySelectorProps) {
  const canDecrement = quantity > min && !disabled;
  const canIncrement = (max === undefined || quantity < max) && !disabled;

  return (
    <div className="inline-flex items-center rounded-full border-2 border-[#8D99AF]/20 bg-white hover:border-[#2B2D42]/30 transition-colors">
      <button
        type="button"
        onClick={onDecrement}
        disabled={!canDecrement}
        className="p-3 text-[#2B2D42] hover:bg-[#EDF2F4] disabled:opacity-40 disabled:cursor-not-allowed rounded-l-full transition-colors"
        aria-label="Хасах"
      >
        <Minus className="w-4 h-4" />
      </button>
      <span className="min-w-[3rem] text-center text-base font-bold text-[#2B2D42]">
        {quantity}
      </span>
      <button
        type="button"
        onClick={onIncrement}
        disabled={!canIncrement}
        className="p-3 text-[#2B2D42] hover:bg-[#EDF2F4] disabled:opacity-40 disabled:cursor-not-allowed rounded-r-full transition-colors"
        aria-label="Нэмэх"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}
