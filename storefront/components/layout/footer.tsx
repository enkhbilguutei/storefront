import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="text-xl font-bold">
              Алимхан
            </Link>
            <p className="text-sm text-gray-600">
              Чанартай бүтээгдэхүүний найдвартай онлайн дэлгүүр.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold">Түргэн холбоос</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/products" className="hover:text-gray-900 transition-colors">
                  Бүтээгдэхүүн
                </Link>
              </li>
              <li>
                <Link href="/collections" className="hover:text-gray-900 transition-colors">
                  Цуглуулга
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-gray-900 transition-colors">
                  Бидний тухай
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="font-semibold">Хэрэглэгчийн үйлчилгээ</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/contact" className="hover:text-gray-900 transition-colors">
                  Холбоо барих
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-gray-900 transition-colors">
                  Хүргэлтийн мэдээлэл
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-gray-900 transition-colors">
                  Буцаалт & Солилт
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-gray-900 transition-colors">
                  Түгээмэл асуулт
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="font-semibold">Холбоотой байх</h3>
            <p className="text-sm text-gray-600">
              Шинэ мэдээ болон онцгой санал авахын тулд бүртгүүлээрэй.
            </p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Таны имэйл"
                className="flex-1 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-black text-white text-sm rounded-md hover:bg-gray-800 transition-colors"
              >
                Бүртгүүлэх
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center text-sm text-gray-600">
          <p>&copy; {new Date().getFullYear()} Алимхан. Бүх эрх хуулиар хамгаалагдсан.</p>
        </div>
      </div>
    </footer>
  );
}
