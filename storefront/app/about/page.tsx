import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ChevronRight, Heart, Shield, Truck, Users, Leaf, Award } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Бидний тухай",
  description: "Алимхан дэлгүүр нь хүүхдүүдэд зориулсан чанартай, аюулгүй бүтээгдэхүүнүүдийг санал болгодог итгэмжлэгдсэн дэлгүүр юм. Бид хайр, халамжаар сонгосон бүтээгдэхүүнүүдийг хүргэнэ.",
  openGraph: {
    title: "Бидний тухай",
    description: "Алимхан дэлгүүр нь хүүхдүүдэд зориулсан чанартай, аюулгүй бүтээгдэхүүнүүдийг санал болгодог итгэмжлэгдсэн дэлгүүр юм.",
    url: "https://alimhan.mn/about",
    siteName: "Алимхан Дэлгүүр",
    locale: "mn_MN",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Бидний тухай",
    description: "Алимхан дэлгүүр нь хүүхдүүдэд зориулсан чанартай, аюулгүй бүтээгдэхүүнүүдийг санал болгодог итгэмжлэгдсэн дэлгүүр юм.",
  },
  alternates: {
    canonical: "https://alimhan.mn/about",
  },
};

export default function AboutPage() {
  const values = [
    {
      icon: Heart,
      title: "Хайр, халамж",
      description: "Бид хүүхдүүддээ зориулсан бүтээгдэхүүн бүрийг хайр, халамжаар сонгодог."
    },
    {
      icon: Shield,
      title: "Аюулгүй байдал",
      description: "Хүүхдийн эрүүл мэнд, аюулгүй байдлыг хамгийн түрүүнд тавьдаг."
    },
    {
      icon: Leaf,
      title: "Байгальд ээлтэй",
      description: "Байгаль орчинд хоргүй, эко бүтээгдэхүүнүүдийг сонгон санал болгодог."
    },
    {
      icon: Award,
      title: "Чанарын баталгаа",
      description: "Зөвхөн итгэмжлэгдсэн брэндүүдийн чанартай бүтээгдэхүүнүүдийг борлуулдаг."
    },
    {
      icon: Truck,
      title: "Түргэн хүргэлт",
      description: "Улаанбаатар хотод 24-48 цагийн дотор хүргэлт хийдэг."
    },
    {
      icon: Users,
      title: "Хэрэглэгчийн үйлчилгээ",
      description: "Найрсаг, мэргэжлийн үйлчилгээгээр хэрэглэгчдэдээ тусалдаг."
    }
  ];

  const stats = [
    { number: "5,000+", label: "Сэтгэл хангалуун хэрэглэгч" },
    { number: "500+", label: "Бүтээгдэхүүний төрөл" },
    { number: "50+", label: "Итгэмжлэгдсэн брэнд" },
    { number: "3+", label: "Жилийн туршлага" }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-linear-to-br from-amber-50 via-orange-50 to-rose-50 overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-20 left-20 w-64 h-64 bg-linear-to-r from-yellow-200/30 to-orange-200/30 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-20 w-80 h-80 bg-linear-to-r from-rose-200/30 to-pink-200/30 rounded-full blur-3xl" />
          </div>
          
          <div className="container mx-auto px-4 py-20 relative">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-secondary mb-8">
              <Link href="/" className="hover:text-foreground transition-colors">
                Нүүр
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground font-medium">Бидний тухай</span>
            </nav>

            <div className="max-w-3xl">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                <span className="font-display">Alimhan</span>
                <br />
                <span className="text-secondary font-normal text-3xl sm:text-4xl">
                  Хүүхдийн бүтээгдэхүүний дэлгүүр
                </span>
              </h1>
              <p className="text-lg text-secondary leading-relaxed">
                Бид Монголын хүүхдүүд болон эцэг эхчүүдэд зориулан чанартай, аюулгүй, 
                байгальд ээлтэй бүтээгдэхүүнүүдийг санал болгодог. Манай зорилго бол 
                таны хүүхдийн өсөлт, хөгжилд дэмжлэг үзүүлэх хамгийн сайн бүтээгдэхүүнүүдийг 
                нэг дор цуглуулж, хялбар, найдвартай худалдан авах боломжийг олгох юм.
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white border-y border-gray-100">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
                    {stat.number}
                  </div>
                  <div className="text-secondary text-sm sm:text-base">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Манай эрхэм зорилго
              </h2>
              <p className="text-secondary text-lg leading-relaxed">
                Монголын хүүхдүүдэд дэлхийн өндөр чанартай, аюулгүй бүтээгдэхүүнүүдийг 
                хүртээмжтэй үнээр санал болгож, эцэг эхчүүдийн найдвартай түнш байх.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {values.map((value, index) => (
                <div 
                  key={index}
                  className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  <div className="w-14 h-14 rounded-xl bg-amber-100 flex items-center justify-center mb-6">
                    <value.icon className="h-7 w-7 text-amber-600" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">
                    {value.title}
                  </h3>
                  <p className="text-secondary leading-relaxed">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  Манай түүх
                </h2>
              </div>
              
              <div className="prose prose-lg max-w-none text-secondary">
                <p>
                  <span className="font-display text-foreground text-xl">Alimhan</span> нь 2021 онд 
                  нэг хүүхдийн эцэг эхийн санаачлагаар байгуулагдсан. Бид өөрсдийн хүүхдэд зориулан 
                  чанартай бүтээгдэхүүн хайж олоход тулгарсан бэрхшээлүүдээс суралцаж, Монголын 
                  бүх эцэг эхчүүдэд туслах зорилготой энэ платформыг бүтээсэн.
                </p>
                <p>
                  Эхний өдрүүдээс эхлэн бид зөвхөн чанарын өндөр шаардлага хангасан, олон улсын 
                  аюулгүй байдлын стандартад нийцсэн бүтээгдэхүүнүүдийг сонгох зарчмыг баримталж 
                  ирсэн. Өнөөдөр бид дэлхийн 50 гаруй брэндийн 500+ төрлийн бүтээгдэхүүнийг санал 
                  болгож байна.
                </p>
                <p>
                  Манай баг бол өөрсдөө эцэг эхчүүд бөгөөд хүүхдийн хэрэгцээг гүнзгий ойлгодог, 
                  таны итгэлийг хүлээсэн хамт олон юм. Бид таны гэр бүлд үйлчлэхдээ үргэлж 
                  баяртай байдаг.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20 bg-linear-to-br from-gray-50 to-gray-100">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Холбоо барих
              </h2>
              <p className="text-secondary mb-8">
                Танд асуулт байна уу? Бидэнтэй холбогдоорой.
              </p>
              
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <div className="space-y-4 text-left">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center shrink-0">
                      <svg className="h-5 w-5 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Имэйл</p>
                      <a href="mailto:hello@alimhan.mn" className="text-secondary hover:text-foreground transition-colors">
                        hello@alimhan.mn
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center shrink-0">
                      <svg className="h-5 w-5 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Утас</p>
                      <a href="tel:+97699001234" className="text-secondary hover:text-foreground transition-colors">
                        +976 9900 1234
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center shrink-0">
                      <svg className="h-5 w-5 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Хаяг</p>
                      <p className="text-secondary">
                        Улаанбаатар хот, Сүхбаатар дүүрэг
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 pt-8 border-t border-gray-100">
                  <Link 
                    href="/products"
                    className="inline-flex items-center justify-center gap-2 bg-foreground text-background px-8 py-3 rounded-full font-medium hover:bg-foreground/90 transition-colors w-full sm:w-auto"
                  >
                    Бүтээгдэхүүн үзэх
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
