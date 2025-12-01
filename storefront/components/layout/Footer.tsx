"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 md:border-none last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-4 md:py-0 text-left font-medium text-foreground md:cursor-default group"
      >
        {title}
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform duration-300 md:hidden ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`grid transition-all duration-300 ease-in-out md:block ${
          isOpen ? "grid-rows-[1fr] opacity-100 mb-4" : "grid-rows-[0fr] opacity-0 md:opacity-100"
        }`}
      >
        <div className="overflow-hidden">
          <div className="pt-2 md:pt-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="bg-background border-t border-gray-200">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand - Always visible */}
          <div className="space-y-6 pb-8 md:pb-0 border-b border-gray-200 md:border-none">
            <Link href="/" className="text-2xl font-bold tracking-tight">
              Алимхан
            </Link>
            <p className="text-sm text-secondary leading-relaxed max-w-xs">
              Чанартай бүтээгдэхүүний найдвартай онлайн дэлгүүр. Бид танд хамгийн сайн үйлчилгээг үзүүлэхийг зорьдог.
            </p>
          </div>

          {/* Quick Links */}
          <FooterColumn title="Түргэн холбоос">
            <ul className="space-y-4 text-sm text-secondary">
              <li>
                <Link href="/products" className="hover:text-foreground transition-colors">
                  Бүтээгдэхүүн
                </Link>
              </li>
              <li>
                <Link href="/collections" className="hover:text-foreground transition-colors">
                  Цуглуулга
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-foreground transition-colors">
                  Бидний тухай
                </Link>
              </li>
            </ul>
          </FooterColumn>

          {/* Customer Service */}
          <FooterColumn title="Хэрэглэгчийн үйлчилгээ">
            <ul className="space-y-4 text-sm text-secondary">
              <li>
                <Link href="/contact" className="hover:text-foreground transition-colors">
                  Холбоо барих
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-foreground transition-colors">
                  Хүргэлтийн мэдээлэл
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-foreground transition-colors">
                  Буцаалт & Солилт
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-foreground transition-colors">
                  Түгээмэл асуулт
                </Link>
              </li>
            </ul>
          </FooterColumn>

          {/* Newsletter */}
          <FooterColumn title="Холбоотой байх">
            <div className="space-y-4">
              <p className="text-sm text-secondary">
                Шинэ мэдээ болон онцгой санал авахын тулд бүртгүүлээрэй.
              </p>
              <form className="flex flex-col gap-3">
                <input
                  type="email"
                  placeholder="Таны имэйл"
                  className="w-full px-4 py-2.5 bg-transparent border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
                />
                <button
                  type="submit"
                  className="w-full px-4 py-2.5 bg-foreground text-background text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
                >
                  Бүртгүүлэх
                </button>
              </form>
            </div>
          </FooterColumn>
        </div>

        <div className="mt-12 md:mt-16 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-secondary">
          <p>&copy; {new Date().getFullYear()} Алимхан. Бүх эрх хуулиар хамгаалагдсан.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Нууцлалын бодлого</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Үйлчилгээний нөхцөл</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
