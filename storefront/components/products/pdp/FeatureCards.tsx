import { Truck, RotateCcw, Shield, Award } from "lucide-react";

export function FeatureCards() {
  const features = [
    {
      icon: Truck,
      title: "Үнэгүй хүргэлт",
      description: "УБ дотор 3 цаг, аймагт 24-48 цаг",
      iconColor: "#2B2D42",
      bgColor: "bg-[#EDF2F4]",
    },
    {
      icon: RotateCcw,
      title: "14 хоног буцаалт",
      description: "Сав баглаа бүрэн бол үнэгүй",
      iconColor: "#EF233C",
      bgColor: "bg-[#EF233C]/5",
    },
    {
      icon: Shield,
      title: "1 жил баталгаа",
      description: "Албан ёсны сервис",
      iconColor: "#8D99AF",
      bgColor: "bg-[#8D99AF]/5",
    },
    {
      icon: Award,
      title: "100% оригинал",
      description: "Эх үүсвэрээс шууд",
      iconColor: "#D90429",
      bgColor: "bg-[#D90429]/5",
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
      {features.map((feature, index) => {
        const Icon = feature.icon;
        return (
          <div key={index} className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-[#8D99AF]" />
            <p className="text-xs text-[#2B2D42]">{feature.title}</p>
          </div>
        );
      })}
    </div>
  );
}
