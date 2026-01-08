"use client";

import { Component, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class CheckoutErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("Checkout Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
            <svg
              className="w-20 h-20 text-red-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Захиалга үүсгэхэд алдаа гарлаа
            </h2>
            <p className="text-gray-600 mb-6 max-w-md">
              Таны захиалга боловсруулахад алдаа гарлаа. Та хуудсыг дахин ачааллаад дахин оролдоно уу.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => window.location.href = "/cart"}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Сагс руу буцах
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Дахин оролдох
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
