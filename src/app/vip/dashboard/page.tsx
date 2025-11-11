"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useVIP } from "@/hooks/useVIP";
import { supabase } from "@/lib/supabaseClient";
import Breadcrumb from "@/components/Breadcrumb";
import { checkIsAdmin } from "@/lib/adminUtils";
import LoadingSpinner from "@/components/LoadingSpinner";
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

export default function VIPDashboardPage() {
  const { user, isVip, loading } = useVIP();
  const router = useRouter();
  const [todayCard, setTodayCard] = useState<DailyCard | null>(null);
  const [cardLoading, setCardLoading] = useState(true);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }
    // Redirect admin users to admin dashboard
    if (!loading && user && checkIsAdmin(user)) {
      router.push("/dashboard");
      return;
    }
  }, [user, loading, router]);

  // Fetch today's card for VIP users
  useEffect(() => {
    if (!user || !isVip || loading) return;

    const fetchTodayCard = async () => {
      try {
        setCardLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          return;
        }

        const response = await fetch("/api/vip/today-card", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setTodayCard(data.card);
        }
      } catch (err) {
        console.error("Error fetching today's card:", err);
      } finally {
        setCardLoading(false);
      }
    };

    fetchTodayCard();
  }, [user, isVip, loading]);

  if (loading) {
    return <LoadingSpinner fullScreen text="Đang tải..." />;
  }

  // Show access denied for non-VIP users (admin will be redirected in useEffect)
  if (!loading && user && !isVip) {
    // If admin, will redirect in useEffect, so return null
    if (checkIsAdmin(user)) {
      return null;
    }
    // Non-VIP, non-admin users see access denied message
    return (
      <main className="min-h-screen px-4 pt-24 pb-12 bg-white">
        <div className="container-max mx-auto">
          <Breadcrumb items={[{ label: "VIP Dashboard" }]} />
          <div className="max-w-2xl mx-auto text-center py-12">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 mb-6">
              <h2 className="text-2xl font-heading font-bold text-black mb-4">
                Yêu cầu quyền VIP
              </h2>
              <p className="text-gray-700 font-body mb-6">
                Bạn cần có quyền VIP để truy cập các tính năng này. Vui lòng liên hệ quản trị viên để được cấp quyền VIP.
              </p>
              <Link
                href="/"
                className="inline-block px-6 py-3 bg-black text-white rounded-md font-medium font-body hover:bg-gray-800 transition-all"
              >
                Về trang chủ
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!isVip) {
    return null; // Will redirect in useEffect
  }

  return (
    <main className="min-h-screen px-4 pt-24 pb-12 bg-white">
      <div className="container-max mx-auto">
        <Breadcrumb items={[{ label: "VIP Dashboard" }]} />
        
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold text-black mb-2">
            VIP Dashboard
          </h1>
          <p className="text-gray-600 font-body">
            Chào mừng đến với khu vực VIP của Tarot by Alex
          </p>
        </div>

        {/* Today's Card Preview */}
        {cardLoading ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 mb-8 text-center">
            <div className="inline-block animate-spin h-8 w-8 border-4 border-black border-t-transparent rounded-full mb-4"></div>
            <p className="text-gray-600 font-body">Đang tải bài Tarot hôm nay...</p>
          </div>
        ) : todayCard && todayCard.id ? (
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-6 mb-8 shadow-lg">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              {todayCard.card_image_url ? (
                <div className="flex-shrink-0">
                  <div 
                    className="relative w-48 h-72 md:w-56 md:h-80 rounded-lg overflow-hidden shadow-md cursor-pointer hover:shadow-xl transition-all hover:scale-105 bg-gray-100"
                    onClick={() => setIsImageModalOpen(true)}
                    title="Nhấp để xem hình ảnh lớn"
                  >
                    <Image
                      src={todayCard.card_image_url}
                      alt={todayCard.card_name}
                      fill
                      className="object-contain p-2"
                      sizes="(max-width: 768px) 192px, 224px"
                      priority
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center font-body">
                    Nhấp để phóng to
                  </p>
                </div>
              ) : (
                <div className="relative w-48 h-72 md:w-56 md:h-80 flex-shrink-0 rounded-lg bg-gray-200 flex items-center justify-center shadow-md">
                  <span className="text-gray-400 text-6xl">🃏</span>
                </div>
              )}
              <div className="flex-1">
                <div className="mb-4">
                  <h2 className="text-2xl md:text-3xl font-heading font-bold text-black mb-2">
                    {todayCard.card_name}
                  </h2>
                  <p className="text-gray-600 font-body text-sm">
                    Bài Tarot của ngày {new Date().toLocaleDateString("vi-VN", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="mb-4">
                  <h3 className="text-lg font-heading font-semibold text-black mb-2">
                    Thông Điệp Cho Bạn
                  </h3>
                  <p className="text-gray-700 font-body leading-relaxed line-clamp-3">
                    {todayCard.card_meaning}
                  </p>
                </div>
                <Link
                  href="/vip/today-card"
                  className="inline-block px-6 py-3 bg-black text-white rounded-md font-medium font-body hover:bg-gray-800 transition-all"
                >
                  Đọc ý nghĩa đầy đủ →
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="text-4xl">🃏</div>
              <div className="flex-1">
                <h3 className="text-lg font-heading font-semibold text-black mb-2">
                  Chưa có bài Tarot cho hôm nay
                </h3>
                <p className="text-gray-600 font-body text-sm">
                  Bài Tarot cho ngày hôm nay sẽ được cập nhật sớm. Vui lòng quay lại sau!
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/vip/today-card"
            className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-all hover:border-black"
          >
            <div className="text-4xl mb-4">🃏</div>
            <h3 className="text-xl font-heading font-bold text-black mb-2">
              Bài Tarot Hôm Nay
            </h3>
            <p className="text-gray-600 font-body text-sm mb-4">
              Khám phá thông điệp từ vũ trụ cho ngày hôm nay
            </p>
            <span className="text-black font-body text-sm font-medium">
              Xem ngay →
            </span>
          </Link>

          <Link
            href="/vip/magazines"
            className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-all hover:border-black"
          >
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-xl font-heading font-bold text-black mb-2">
              Tạp Chí Tarot
            </h3>
            <p className="text-gray-600 font-body text-sm mb-4">
              Đọc các bài viết chuyên sâu về Tarot và tâm linh
            </p>
            <span className="text-black font-body text-sm font-medium">
              Khám phá →
            </span>
          </Link>

          <Link
            href="/vip/lessons"
            className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-all hover:border-black"
          >
            <div className="text-4xl mb-4">🎓</div>
            <h3 className="text-xl font-heading font-bold text-black mb-2">
              Khóa Học Tarot
            </h3>
            <p className="text-gray-600 font-body text-sm mb-4">
              Học cách đọc bài Tarot và phát triển trực giác
            </p>
            <span className="text-black font-body text-sm font-medium">
              Bắt đầu học →
            </span>
          </Link>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
          <h2 className="text-2xl font-heading font-bold text-black mb-4">
            Thông tin VIP
          </h2>
          <div className="space-y-4 font-body">
            <div>
              <p className="text-sm text-gray-600 mb-1">Email</p>
              <p className="text-black">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Trạng thái VIP</p>
              <p className="text-green-600 font-semibold">✓ Đang hoạt động</p>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {todayCard?.card_image_url && (
        <ImageModal
          imageUrl={todayCard.card_image_url}
          alt={todayCard.card_name}
          isOpen={isImageModalOpen}
          onClose={() => setIsImageModalOpen(false)}
        />
      )}
    </main>
  );
}

