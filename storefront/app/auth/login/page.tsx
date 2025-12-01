import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold">Тавтай морил</h1>
            <p className="text-gray-600 mt-2">Бүртгэлдээ нэвтрэх</p>
          </div>

          <form className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Имэйл
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="tanii@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Нууц үг
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
                <span className="ml-2 text-sm text-gray-600">Намайг сана</span>
              </label>
              <a href="/auth/forgot-password" className="text-sm text-gray-600 hover:text-gray-900">
                Нууц үгээ мартсан?
              </a>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-black text-white font-medium rounded-md hover:bg-gray-800 transition-colors"
            >
              Нэвтрэх
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Бүртгэл байхгүй юу?{" "}
            <a href="/auth/register" className="font-medium text-black hover:underline">
              Бүртгүүлэх
            </a>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
