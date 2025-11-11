"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getUserFriendlyMessage, logError } from "@/lib/errorUtils";

interface ErrorDisplayProps {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  message?: string;
  showReset?: boolean;
  showHome?: boolean;
  customActions?: React.ReactNode;
}

export default function ErrorDisplay({
  error,
  reset,
  title,
  message,
  showReset = true,
  showHome = true,
  customActions,
}: ErrorDisplayProps) {
  const router = useRouter();

  // Log error to console and error tracking
  useEffect(() => {
    logError(error, "ErrorBoundary");
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center pt-24 pb-12 bg-white px-4">
      <div className="container-max mx-auto max-w-2xl text-center">
        {/* Error Visual */}
        <div className="mb-8">
          <div className="text-6xl md:text-8xl mb-4">⚠️</div>
          <div className="w-24 h-1 bg-black mx-auto mb-6"></div>
        </div>

        {/* Message */}
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-black mb-4">
            {title || "Đã xảy ra lỗi"}
          </h1>
          <p className="text-lg text-gray-600 font-body leading-relaxed max-w-md mx-auto mb-4">
            {message || 
              "Xin lỗi, đã xảy ra lỗi không mong muốn. Vui lòng thử lại hoặc quay lại trang chủ."}
          </p>
          {process.env.NODE_ENV === "development" && (
            <details className="mt-4 text-left max-w-md mx-auto">
              <summary className="cursor-pointer text-sm text-gray-500 font-body mb-2">
                Chi tiết lỗi (chỉ hiển thị trong môi trường phát triển)
              </summary>
              <pre className="bg-gray-100 p-4 rounded text-xs text-gray-800 font-mono overflow-auto max-h-48">
                {error.message}
                {error.stack && `\n\n${error.stack}`}
                {error.digest && `\n\nDigest: ${error.digest}`}
              </pre>
            </details>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {showReset && (
              <button
                onClick={reset}
                className="inline-block px-8 py-3 bg-black text-white rounded-full text-sm font-medium font-body hover:bg-gray-800 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
              >
                Thử lại
              </button>
            )}
            {showHome && (
              <Link
                href="/"
                className="inline-block px-8 py-3 border-2 border-black text-black rounded-full text-sm font-medium font-body hover:bg-black hover:text-white transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
              >
                Về trang chủ
              </Link>
            )}
          </div>

          {customActions}

          {/* Back Button */}
          <div className="mt-8">
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-black text-sm font-body underline-offset-4 hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 rounded"
            >
              ← Quay lại trang trước
            </button>
          </div>
        </div>

        {/* Decorative Element */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <p className="text-xs text-gray-500 font-body">
            Tarot by Alex — Trải nghiệm xem bài Tarot chuyên nghiệp & tinh tế
          </p>
        </div>
      </div>
    </main>
  );
}

