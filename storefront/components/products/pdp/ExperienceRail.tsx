import { Sparkles, Truck, BadgeCheck, CreditCard } from "lucide-react";
import { IconCard } from "@/components/ui/IconCard";

export function ExperienceRail() {
  const experiences = [
    {
      icon: Sparkles,
      title: "Шинэ ирэлт",
      description: "Хязгаарлагдмал тоотой багц, шуурхай хүргэлт",
      iconColor: "#0b6cd4",
      iconBgColor: "rgba(11, 108, 212, 0.1)",
    },
    {
      icon: Truck,
      title: "Экспресс хүргэлт",
      description: "Хот дотор 3 цаг, аймагт 24-48 цаг",
      iconColor: "#0071e3",
      iconBgColor: "rgba(0, 113, 227, 0.1)",
    },
    {
      icon: BadgeCheck,
      title: "100% оригинал",
      description: "Албан ёсны эх үүсвэр, баталгаат сервис",
      iconColor: "#0f9b6d",
      iconBgColor: "rgba(16, 185, 129, 0.1)",
    },
    {
      icon: CreditCard,
      title: "0₮ урьдчилгаа зөвлөгөө",
      description: "Лизинг, трейд-ин, хослолын зөвлөмжийг шууд ав",
      iconColor: "#ea580c",
      iconBgColor: "rgba(249, 115, 22, 0.1)",
    },
  ];

  return (
    <div className="py-8 bg-gradient-to-r from-[#fbfbfc] via-white to-[#fbfcff]">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {experiences.map((exp, index) => (
          <IconCard
            key={index}
            icon={exp.icon}
            title={exp.title}
            description={exp.description}
            iconColor={exp.iconColor}
            iconBgColor={exp.iconBgColor}
          />
        ))}
      </div>
    </div>
  );
}
