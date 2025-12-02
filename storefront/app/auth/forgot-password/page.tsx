"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Loader2, Check } from "lucide-react";
import { z } from "zod";

const emailSchema = z.object({
  email: z.string().email("Зөв имэйл хаяг оруулна уу"),
});

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const validatedData = emailSchema.parse({ email });
      
      // Send password reset request to Medusa
      await fetch(
        `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/customers/password-token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: validatedData.email,
          }),
        }
      );

      // Even if the email doesn't exist, we show success to prevent email enumeration
      setSuccess(true);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.issues[0].message);
      } else {
        // Still show success to prevent email enumeration
        setSuccess(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-sm p-8 text-center">
            {/* Success Icon */}
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <Check className="h-10 w-10 text-green-500" />
            </div>

            <h1 className="text-2xl font-bold text-foreground mb-2">
              Имэйл илгээгдлээ
            </h1>
            <p className="text-secondary mb-8">
              Хэрэв <strong>{email}</strong> хаягтай бүртгэл байвал нууц үг шинэчлэх
              холбоос илгээгдсэн байна. Имэйлээ шалгана уу.
            </p>

            <div className="space-y-3">
              <Link
                href="/auth/login"
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-foreground text-background rounded-xl font-medium hover:bg-foreground/90 transition-all"
              >
                Нэвтрэх хуудас руу
              </Link>
              <button
                onClick={() => {
                  setSuccess(false);
                  setEmail("");
                }}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 text-foreground rounded-xl font-medium hover:bg-gray-50 transition-all"
              >
                Өөр имэйл оруулах
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Link */}
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 text-secondary hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Нэвтрэх хуудас руу
        </Link>

        <div className="bg-white rounded-3xl shadow-sm p-8">
          {/* Icon */}
          <div className="w-16 h-16 rounded-full bg-foreground/5 flex items-center justify-center mx-auto mb-6">
            <Mail className="h-8 w-8 text-foreground" />
          </div>

          <h1 className="text-2xl font-bold text-foreground text-center mb-2">
            Нууц үг сэргээх
          </h1>
          <p className="text-secondary text-center mb-8">
            Бүртгэлтэй имэйл хаягаа оруулна уу. Нууц үг шинэчлэх холбоос илгээнэ.
          </p>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground/70 mb-2">
                Имэйл хаяг
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/40 transition-all"
                placeholder="name@example.com"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-foreground text-background rounded-xl font-medium hover:bg-foreground/90 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Илгээж байна...
                </>
              ) : (
                <>
                  <Mail className="h-5 w-5" />
                  Холбоос илгээх
                </>
              )}
            </button>
          </form>
        </div>

        {/* Help Text */}
        <p className="text-center text-sm text-secondary mt-6">
          Асуудал гарвал{" "}
          <Link href="/about" className="text-accent hover:underline">
            бидэнтэй холбогдоно
          </Link>{" "}
          уу.
        </p>
      </div>
    </div>
  );
}
