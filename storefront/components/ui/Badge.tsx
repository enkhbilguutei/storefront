import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

type BadgeVariant = "success" | "error" | "warning" | "info" | "discount" | "primary";

interface BadgeProps {
  variant: BadgeVariant;
  children: ReactNode;
  icon?: LucideIcon;
  showDot?: boolean;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: "text-[#2B2D42] bg-[#8D99AF]/10 border border-[#8D99AF]/20",
  error: "text-[#D90429] bg-[#EF233C]/10 border border-[#EF233C]/20",
  warning: "text-[#EF233C] bg-[#EF233C]/10 border border-[#EF233C]/20",
  info: "text-[#2B2D42] bg-[#EDF2F4] border border-[#8D99AF]/20",
  discount: "bg-[#D90429] text-white border-none shadow-sm",
  primary: "bg-[#2B2D42] text-white border-none",
};

const dotStyles: Record<BadgeVariant, string> = {
  success: "bg-[#8D99AF]",
  error: "bg-[#D90429]",
  warning: "bg-[#EF233C]",
  info: "bg-[#2B2D42]",
  discount: "bg-white",
  primary: "bg-[#EDF2F4]",
};

export function Badge({ variant, children, icon: Icon, showDot, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] sm:text-[12px] font-semibold ${variantStyles[variant]} ${className}`}
    >
      {showDot && <span className={`w-2 h-2 rounded-full ${dotStyles[variant]}`} />}
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </span>
  );
}
