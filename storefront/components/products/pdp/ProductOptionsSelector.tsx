import { Check } from "lucide-react";
import { CloudinaryImage } from "@/components/Cloudinary";

interface OptionValue {
  id: string;
  value: string;
}

interface ProductOption {
  id: string;
  title: string;
  values?: OptionValue[];
}

interface ProductOptionsSelectorProps {
  options: ProductOption[];
  selectedOptions: Record<string, string>;
  onOptionSelect: (optionId: string, value: string) => void;
  getThumbnailForColorValue: (optionId: string, value: string) => string;
  isColorOption: (title: string) => boolean;
}

export function ProductOptionsSelector({
  options,
  selectedOptions,
  onOptionSelect,
  getThumbnailForColorValue,
  isColorOption,
}: ProductOptionsSelectorProps) {
  return (
    <div className="space-y-6 mb-8">
      {options.map((option) => (
        <div key={option.id}>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-[#1d1d1f]">{option.title}</label>
            {selectedOptions[option.id] && (
              <span className="text-sm text-[#86868b]">{selectedOptions[option.id]}</span>
            )}
          </div>

          {isColorOption(option.title) ? (
            // Color/Variant thumbnail selector
            <div className="flex flex-wrap gap-3">
              {option.values?.map((value) => {
                const isSelected = selectedOptions[option.id] === value.value;
                const thumbnailUrl = getThumbnailForColorValue(option.id, value.value);

                return (
                  <button
                    key={value.id}
                    onClick={() => onOptionSelect(option.id, value.value)}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden transition-all duration-200 bg-[#f5f5f7] flex items-center justify-center ${
                      isSelected
                        ? "ring-2 ring-offset-2 ring-[#0071e3]"
                        : "hover:ring-2 hover:ring-gray-300 hover:ring-offset-1"
                    }`}
                    title={value.value}
                  >
                    <CloudinaryImage
                      src={thumbnailUrl}
                      alt={value.value}
                      width={128}
                      height={128}
                      className="w-full h-full object-contain p-1"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-[#0071e3]/10 flex items-center justify-center">
                        <Check className="w-5 h-5 text-[#0071e3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            // Regular text option buttons
            <div className="flex flex-wrap gap-2">
              {option.values?.map((value) => (
                <button
                  key={value.id}
                  onClick={() => onOptionSelect(option.id, value.value)}
                  className={`py-2.5 px-5 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedOptions[option.id] === value.value
                      ? "bg-[#1d1d1f] text-white shadow-md"
                      : "bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e8e8ed]"
                  }`}
                >
                  {value.value}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
