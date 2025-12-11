"use client"

import { Shield, Award, Truck, RefreshCw } from "lucide-react"

const trustBadges = [
  {
    icon: Shield,
    title: "100% Баталгаатай",
    description: "Жинхэнэ бүтээгдэхүүн",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    icon: Award,
    title: "Албан ёсны",
    description: "Эрх бүхий борлуулагч",
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    icon: Truck,
    title: "Үнэгүй хүргэлт",
    description: "УБ хотод",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    icon: RefreshCw,
    title: "14 хоног",
    description: "Буцаах эрх",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
]

interface TrustBadgesProps {
  variant?: "compact" | "detailed"
  className?: string
}

export function TrustBadges({ variant = "detailed", className = "" }: TrustBadgesProps) {
  if (variant === "compact") {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {trustBadges.map((badge, index) => (
          <div
            key={index}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${badge.bgColor} text-xs font-medium`}
          >
            <badge.icon className={`w-3.5 h-3.5 ${badge.color}`} />
            <span className={badge.color}>{badge.title}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
      {trustBadges.map((badge, index) => (
        <div
          key={index}
          className={`flex flex-col items-center text-center p-4 rounded-lg ${badge.bgColor} border border-gray-100`}
        >
          <div className={`w-12 h-12 rounded-full bg-white flex items-center justify-center mb-3`}>
            <badge.icon className={`w-6 h-6 ${badge.color}`} />
          </div>
          <h3 className={`font-semibold text-sm mb-1 ${badge.color}`}>
            {badge.title}
          </h3>
          <p className="text-xs text-gray-600">{badge.description}</p>
        </div>
      ))}
    </div>
  )
}
