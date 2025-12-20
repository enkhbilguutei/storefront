import { ChevronRight } from "lucide-react";
import { ReactNode } from "react";

interface AccordionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
  showIndicator?: boolean;
}

export function Accordion({ title, isOpen, onToggle, children, showIndicator = true }: AccordionProps) {
  return (
    <div className="border-b border-gray-100">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between py-4 text-left hover:opacity-60 transition-opacity"
      >
        <span className="text-base font-semibold text-[#2B2D42]">
          {title}
        </span>
        <ChevronRight
          className={`w-5 h-5 text-[#8D99AF] transition-transform ${isOpen ? "rotate-90" : ""}`}
        />
      </button>
      {isOpen && (
        <div className="pb-4 text-sm text-[#8D99AF] leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
}
