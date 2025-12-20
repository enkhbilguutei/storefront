import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface IconCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  iconColor?: string;
  iconBgColor?: string;
  variant?: "default" | "elevated";
  children?: ReactNode;
}

export function IconCard({
  icon: Icon,
  title,
  description,
  iconColor = "#0b6cd4",
  iconBgColor = "rgba(11, 108, 212, 0.1)",
  variant = "default",
  children,
}: IconCardProps) {
  const containerClass =
    variant === "elevated"
      ? "relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_20px_60px_-48px_rgba(0,0,0,0.6)]"
      : "flex items-start gap-3 rounded-2xl border border-white bg-white/70 backdrop-blur shadow-[0_15px_45px_-32px_rgba(0,0,0,0.45)] p-4";

  if (variant === "elevated") {
    return (
      <div className={containerClass}>
        <div
          className="absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-50"
          style={{ backgroundColor: iconBgColor }}
        />
        <div className="relative flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: iconBgColor, color: iconColor }}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1d1d1f]">{title}</p>
            <p className="text-xs text-[#6b7280]">{description}</p>
          </div>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <span
        className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-xl"
        style={{ backgroundColor: iconBgColor, color: iconColor }}
      >
        <Icon className="w-5 h-5" />
      </span>
      <div>
        <p className="text-sm font-semibold text-[#1d1d1f]">{title}</p>
        <p className="text-xs text-[#6b7280]">{description}</p>
        {children}
      </div>
    </div>
  );
}
