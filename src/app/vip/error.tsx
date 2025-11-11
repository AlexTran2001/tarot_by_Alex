"use client";

import ErrorDisplay from "@/components/ErrorDisplay";
import Link from "next/link";

export default function VIPError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorDisplay
      error={error}
      reset={reset}
      title="Lỗi khu vực VIP"
      message="Xin lỗi, đã xảy ra lỗi khi tải nội dung VIP. Vui lòng thử lại hoặc quay lại trang chủ."
      showReset={true}
      showHome={true}
      customActions={
        <div className="pt-8 border-t border-gray-200">
          <Link
            href="/vip/dashboard"
            className="inline-block px-6 py-2 text-black border border-gray-300 rounded-md text-sm font-medium font-body hover:bg-gray-50 transition-all focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
          >
            Quay lại VIP Dashboard →
          </Link>
        </div>
      }
    />
  );
}

