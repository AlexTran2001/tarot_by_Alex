"use client";

import ErrorDisplay from "@/components/ErrorDisplay";

export default function Error({
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
      title="Đã xảy ra lỗi"
      message="Xin lỗi, đã xảy ra lỗi không mong muốn. Vui lòng thử lại hoặc quay lại trang chủ."
      showReset={true}
      showHome={true}
    />
  );
}

