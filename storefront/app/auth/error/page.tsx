"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { Suspense } from "react";

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const errorMessages: Record<string, { title: string; description: string }> = {
    Configuration: {
      title: "Тохиргооны алдаа",
      description: "Серверийн тохиргоонд алдаа гарлаа. Админтай холбогдоно уу.",
    },
    AccessDenied: {
      title: "Хандах эрхгүй",
      description: "Энэ хуудсанд хандах эрх байхгүй байна.",
    },
    Verification: {
      title: "Баталгаажуулалт амжилтгүй",
      description: "Баталгаажуулах холбоос хүчингүй эсвэл хугацаа дууссан байна.",
    },
    OAuthSignin: {
      title: "OAuth нэвтрэлтийн алдаа",
      description: "Google-ээр нэвтрэхэд алдаа гарлаа. Дахин оролдоно уу.",
    },
    OAuthCallback: {
      title: "OAuth callback алдаа",
      description: "Google-ээс хариу авахад алдаа гарлаа.",
    },
    OAuthCreateAccount: {
      title: "Бүртгэл үүсгэхэд алдаа",
      description: "Google бүртгэл холбоход алдаа гарлаа.",
    },
    EmailCreateAccount: {
      title: "Бүртгэл үүсгэхэд алдаа",
      description: "Имэйлээр бүртгэл үүсгэхэд алдаа гарлаа.",
    },
    Callback: {
      title: "Callback алдаа",
      description: "Нэвтрэлтийн callback-д алдаа гарлаа.",
    },
    CredentialsSignin: {
      title: "Нэвтрэлт амжилтгүй",
      description: "Имэйл эсвэл нууц үг буруу байна.",
    },
    SessionRequired: {
      title: "Нэвтрэх шаардлагатай",
      description: "Энэ хуудсыг үзэхийн тулд нэвтрэх шаардлагатай.",
    },
    Default: {
      title: "Алдаа гарлаа",
      description: "Нэвтрэхэд алдаа гарлаа. Дахин оролдоно уу.",
    },
  };

  const { title, description } = errorMessages[error || "Default"] || errorMessages.Default;

  return (
    <div className="min-h-screen bg-gray-50/50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-sm p-8 text-center">
          {/* Error Icon */}
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-10 w-10 text-red-500" />
          </div>

          {/* Error Message */}
          <h1 className="text-2xl font-bold text-foreground mb-2">{title}</h1>
          <p className="text-secondary mb-8">{description}</p>

          {/* Debug info for development */}
          {process.env.NODE_ENV === "development" && error && (
            <div className="mb-6 p-3 bg-gray-100 rounded-xl">
              <p className="text-xs text-secondary font-mono">
                Error code: {error}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <Link
              href="/auth/login"
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-foreground text-background rounded-xl font-medium hover:bg-foreground/90 transition-all"
            >
              <RefreshCw className="h-5 w-5" />
              Дахин оролдох
            </Link>
            <Link
              href="/"
              className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 text-foreground rounded-xl font-medium hover:bg-gray-50 transition-all"
            >
              <ArrowLeft className="h-5 w-5" />
              Нүүр хуудас руу
            </Link>
          </div>
        </div>

        {/* Help Text */}
        <p className="text-center text-sm text-secondary mt-6">
          Асуудал үргэлжилбэл{" "}
          <Link href="/about" className="text-accent hover:underline">
            бидэнтэй холбогдоно
          </Link>{" "}
          уу.
        </p>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="animate-pulse text-secondary">Ачааллаж байна...</div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}
