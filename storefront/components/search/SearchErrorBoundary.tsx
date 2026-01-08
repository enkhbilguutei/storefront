"use client";

import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class SearchErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("Search Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <svg
              className="w-12 h-12 text-gray-400 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <h3 className="text-base font-medium text-gray-900 mb-1">
              Хайлт ачааллахад алдаа гарлаа
            </h3>
            <p className="text-sm text-gray-500 mb-3">
              Дахин оролдоно уу
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="text-sm px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Дахин оролдох
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
