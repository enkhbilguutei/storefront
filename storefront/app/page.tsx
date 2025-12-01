import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Categories } from "@/components/home/Categories";
import { Hero } from "@/components/home/Hero";
import { PromoBanner } from "@/components/home/PromoBanner";
import { IPhoneBanners } from "@/components/home/IPhoneBanners";
import { DJIBento } from "@/components/home/DJIBento";
import { Truck, RotateCcw, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        <Hero />

        <IPhoneBanners />

        <Categories />

        <DJIBento />

        <PromoBanner />

        {/* Features */}
        <section className="py-24 bg-background border-t border-gray-100">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
              <div className="flex flex-col items-center space-y-4 group">
                <div className="p-4 rounded-2xl bg-gray-50 text-foreground transition-colors group-hover:bg-gray-100">
                  <Truck className="w-6 h-6" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-base font-semibold mb-2">Үнэгүй хүргэлт</h3>
                  <p className="text-secondary text-sm max-w-xs mx-auto leading-relaxed">
                    100,000₮-с дээш үнийн дүнтэй захиалга бүрт үнэгүй хүргэлт. Монгол орон даяар хурдан, найдвартай хүргэлт.
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center space-y-4 group">
                <div className="p-4 rounded-2xl bg-gray-50 text-foreground transition-colors group-hover:bg-gray-100">
                  <RotateCcw className="w-6 h-6" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-base font-semibold mb-2">Хялбар буцаалт</h3>
                  <p className="text-secondary text-sm max-w-xs mx-auto leading-relaxed">
                    Сэтгэлд тань нийцэхгүй байна уу? 30 хоногийн дотор буцаах эсвэл солиулах боломжтой.
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center space-y-4 group">
                <div className="p-4 rounded-2xl bg-gray-50 text-foreground transition-colors group-hover:bg-gray-100">
                  <ShieldCheck className="w-6 h-6" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-base font-semibold mb-2">Найвартай төлбөр</h3>
                  <p className="text-secondary text-sm max-w-xs mx-auto leading-relaxed">
                    Таны гүйлгээ манай дэвшилтэт шифрлэлт болон төлбөрийн хамгаалалтаар 100% баталгаажсан.
                  </p>
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
