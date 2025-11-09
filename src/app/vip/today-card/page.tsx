"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useVIP } from "@/hooks/useVIP";
import { supabase } from "@/lib/supabaseClient";
import Breadcrumb from "@/components/Breadcrumb";
import Image from "next/image";
import ImageModal from "@/components/ImageModal";

interface DailyCard {
  id: string;
  card_name: string;
  card_image_url: string | null;
  card_meaning: string;
  card_description: string;
  card_date: string;
}

export default function TodayCardPage() {
  const { user, isVip, loading } = useVIP();
  const router = useRouter();
  const [card, setCard] = useState<DailyCard | null>(null);
  const [cardLoading, setCardLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }
    if (!loading && user && !isVip) {
      router.push("/dashboard");
      return;
    }
  }, [user, isVip, loading, router]);

  useEffect(() => {
    if (!user || !isVip) return;

    const fetchTodayCard = async () => {
      try {
        setCardLoading(true);
        setError(null);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setError("Phiên đăng nhập đã hết hạn");
          return;
        }

        const response = await fetch("/api/vip/today-card", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Failed to fetch today's card:", {
            status: response.status,
            statusText: response.statusText,
            error: errorData,
          });
          throw new Error(errorData.error || errorData.details || "Failed to fetch today's card");
        }

        const data = await response.json();
        setCard(data.card);
      } catch (err: any) {
        console.error("Error fetching today's card:", err);
        setError(err.message || "Đã xảy ra lỗi khi tải bài Tarot");
      } finally {
        setCardLoading(false);
      }
    };

    fetchTodayCard();
  }, [user, isVip]);

  if (loading || cardLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center pt-24">
        <div className="text-center">
          <svg
            className="animate-spin h-8 w-8 text-black mx-auto mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-gray-600 font-body">Đang tải bài Tarot...</p>
        </div>
      </main>
    );
  }

  if (!isVip) {
    return null;
  }

  return (
    <main className="min-h-screen px-4 pt-24 pb-12 bg-white">
      <div className="container-max mx-auto">
        <Breadcrumb
          items={[
            { label: "VIP Dashboard", href: "/vip/dashboard" },
            { label: "Bài Tarot Hôm Nay" },
          ]}
        />

        <div className="max-w-3xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-heading font-bold text-black mb-2">
              Bài Tarot Hôm Nay
            </h1>
            <p className="text-gray-600 font-body">
              {new Date().toLocaleDateString("vi-VN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          {error ? (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-md text-sm font-body">
              {error}
            </div>
          ) : card ? (
            <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-heading font-bold text-black mb-4">
                  {card.card_name}
                </h2>
                {card.card_image_url && (
                  <div className="relative w-full max-w-md mx-auto mb-6">
                    <div
                      className="relative w-full aspect-[2/3] cursor-pointer rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all hover:scale-105 bg-gray-100"
                      onClick={() => setIsImageModalOpen(true)}
                      title="Nhấp để xem hình ảnh lớn"
                    >
                      <Image
                        src={card.card_image_url}
                        alt={card.card_name}
                        fill
                        className="object-contain p-4"
                        sizes="(max-width: 768px) 100vw, 448px"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-center font-body">
                      Nhấp vào hình ảnh để xem kích thước lớn
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-heading font-semibold text-black mb-3">
                    Thông Điệp Cho Bạn
                  </h3>
                  <p className="text-gray-700 font-body leading-relaxed">
                    {card.card_meaning}
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-heading font-semibold text-black mb-3">
                    Ý Nghĩa
                  </h3>
                  <p className="text-gray-700 font-body leading-relaxed">
                    {card.card_description}
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500 font-body text-center">
                  Bài Tarot này được tạo riêng cho ngày hôm nay. Quay lại vào ngày mai để xem bài mới!
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-600 font-body">
                Chưa có bài Tarot cho hôm nay. Vui lòng quay lại sau.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {card?.card_image_url && (
        <ImageModal
          imageUrl={card.card_image_url}
          alt={card.card_name}
          isOpen={isImageModalOpen}
          onClose={() => setIsImageModalOpen(false)}
        />
      )}
    </main>
  );
}

