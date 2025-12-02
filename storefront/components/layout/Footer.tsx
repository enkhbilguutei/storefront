"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-100 md:border-none last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-4 md:py-0 text-left text-xs font-semibold uppercase tracking-wider text-foreground/60 md:cursor-default group"
      >
        {title}
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform duration-300 md:hidden ${
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
          <div className="pt-2 md:pt-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="bg-[#f5f5f7]">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-8">
          {/* Brand - Always visible */}
          <div className="space-y-4 pb-8 md:pb-0 border-b border-gray-200/50 md:border-none md:col-span-2">
            <Link href="/" className="inline-block">
              <span className="text-2xl font-display font-bold tracking-tight text-foreground">
                alimhan
              </span>
            </Link>
            <p className="text-sm text-foreground/60 leading-relaxed max-w-xs">
              Чанартай бүтээгдэхүүний найдвартай онлайн дэлгүүр. Бид танд хамгийн сайн үйлчилгээг үзүүлэхийг зорьдог.
            </p>
            {/* Social icons placeholder */}
            <div className="flex items-center gap-3 pt-2">
              <div className="w-8 h-8 rounded-full bg-foreground/5 flex items-center justify-center text-foreground/40 hover:bg-foreground/10 hover:text-foreground/60 transition-all cursor-pointer">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </div>
              <div className="w-8 h-8 rounded-full bg-foreground/5 flex items-center justify-center text-foreground/40 hover:bg-foreground/10 hover:text-foreground/60 transition-all cursor-pointer">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </div>
              <div className="w-8 h-8 rounded-full bg-foreground/5 flex items-center justify-center text-foreground/40 hover:bg-foreground/10 hover:text-foreground/60 transition-all cursor-pointer">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <FooterColumn title="Дэлгүүр">
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/products" className="text-foreground/70 hover:text-foreground transition-colors">
                  Бүтээгдэхүүн
                </Link>
              </li>
              <li>
                <Link href="/collections" className="text-foreground/70 hover:text-foreground transition-colors">
                  Цуглуулга
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-foreground/70 hover:text-foreground transition-colors">
                  Бидний тухай
                </Link>
              </li>
            </ul>
          </FooterColumn>

          {/* Customer Service */}
          <FooterColumn title="Тусламж">
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/contact" className="text-foreground/70 hover:text-foreground transition-colors">
                  Холбоо барих
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-foreground/70 hover:text-foreground transition-colors">
                  Хүргэлт
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-foreground/70 hover:text-foreground transition-colors">
                  Буцаалт
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-foreground/70 hover:text-foreground transition-colors">
                  Түгээмэл асуулт
                </Link>
              </li>
            </ul>
          </FooterColumn>

          {/* Newsletter */}
          <FooterColumn title="Мэдээлэл авах">
            <div className="space-y-3">
              <p className="text-sm text-foreground/60">
                Шинэ мэдээ, онцгой саналуудыг авна уу.
              </p>
              <form className="flex flex-col gap-2">
                <input
                  type="email"
                  placeholder="Имэйл хаяг"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-foreground/10 focus:border-foreground/20 transition-all placeholder:text-foreground/40"
                />
                <button
                  type="submit"
                  className="w-full px-4 py-3 bg-foreground text-background text-sm font-medium rounded-xl hover:bg-foreground/90 transition-colors"
                >
                  Бүртгүүлэх
                </button>
              </form>
            </div>
          </FooterColumn>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 md:mt-16 pt-6 border-t border-gray-200/50 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-foreground/50">
          <p>© {new Date().getFullYear()} Алимхан. Бүх эрх хуулиар хамгаалагдсан.</p>
          <div className="flex items-center gap-1 text-foreground/40">
            <span>Хийсэн</span>
            <span className="text-red-400">♥</span>
            <span>Монголд</span>
          </div>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Нууцлал</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Нөхцөл</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
