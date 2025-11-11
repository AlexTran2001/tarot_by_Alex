"use client";

import ErrorDisplay from "@/components/ErrorDisplay";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="vi">
      <body className="font-body antialiased bg-white text-zinc-800">
        <ErrorDisplay
          error={error}
          reset={reset}
          title="Lỗi nghiêm trọng"
          message="Xin lỗi, đã xảy ra lỗi nghiêm trọng trong ứng dụng. Vui lòng tải lại trang hoặc liên hệ hỗ trợ nếu vấn đề vẫn tiếp tục."
          showReset={true}
          showHome={true}
        />
      </body>
    </html>
  );
}

