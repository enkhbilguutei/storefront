"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RefreshCcw } from "lucide-react";
import * as Sentry from "@sentry/nextjs";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to Sentry
    Sentry.captureException(error);
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-6">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Алдаа гарлаа
        </h1>
        
        <p className="text-gray-600 mb-8">
          Уучлаарай, хуудас ачаалахад алдаа гарлаа. Та дахин оролдож үзнэ үү.
        </p>

        {error.digest && (
          <p className="text-sm text-gray-500 mb-6 font-mono">
            Алдааны код: {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#0071e3] text-white rounded-lg hover:bg-[#0077ed] transition-colors font-medium"
          >
            <RefreshCcw className="w-4 h-4" />
            Дахин оролдох
          </button>
          
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            <Home className="w-4 h-4" />
            Нүүр хуудас
          </Link>
        </div>
      </div>
    </div>
  );
}
