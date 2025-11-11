"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useVIP } from "@/hooks/useVIP";
import { supabase } from "@/lib/supabaseClient";
import Breadcrumb from "@/components/Breadcrumb";
import LoadingSpinner from "@/components/LoadingSpinner";
import Image from "next/image";

interface Lesson {
  id: string;
  title: string;
  content: string;
  video_url: string | null;
  image_url: string | null;
  order_number: number;
  lesson_type: string;
  progress: {
    completed: boolean;
    progress_data: any;
  } | null;
  isCompleted: boolean;
}

export default function LessonsPage() {
  const { user, isVip, loading } = useVIP();
  const router = useRouter();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [lessonsLoading, setLessonsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>("");

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

    const fetchLessons = async () => {
      try {
        setLessonsLoading(true);
        setError(null);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setError("Phiên đăng nhập đã hết hạn");
          return;
        }

        const url = selectedType
          ? `/api/vip/lessons?type=${selectedType}`
          : "/api/vip/lessons";

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch lessons");
        }

        const data = await response.json();
        setLessons(data.lessons || []);
      } catch (err: any) {
        console.error("Error fetching lessons:", err);
        setError(err.message || "Đã xảy ra lỗi khi tải bài học");
      } finally {
        setLessonsLoading(false);
      }
    };

    fetchLessons();
  }, [user, isVip, selectedType]);

  if (loading || lessonsLoading) {
    return <LoadingSpinner fullScreen text="Đang tải bài học..." />;
  }

  if (!loading && user && !isVip) {
    return null; // Will redirect in useEffect
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
            { label: "Khóa Học Tarot" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold text-black mb-2">
            Khóa Học Tarot
          </h1>
          <p className="text-gray-600 font-body">
            Học cách đọc bài Tarot và phát triển trực giác của bạn
          </p>
        </div>

        <div className="mb-6">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent font-body"
          >
            <option value="">Tất cả bài học</option>
            <option value="beginner">Người mới bắt đầu</option>
            <option value="intermediate">Trung cấp</option>
            <option value="advanced">Nâng cao</option>
            <option value="general">Chung</option>
          </select>
        </div>

        {error ? (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-md text-sm font-body">
            {error}
          </div>
        ) : lessons.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-600 font-body">
              Chưa có bài học nào. Vui lòng quay lại sau.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {lessons.map((lesson) => (
              <Link
                key={lesson.id}
                href={`/vip/lessons/${lesson.id}`}
                className="block bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all hover:border-black"
              >
                <div className="md:flex">
                  {lesson.image_url && (
                    <div className="relative w-full md:w-64 h-48 md:h-auto">
                      <Image
                        src={lesson.image_url}
                        alt={lesson.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 256px"
                      />
                    </div>
                  )}
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-heading font-bold text-black">
                        {lesson.order_number}. {lesson.title}
                      </h3>
                      {lesson.isCompleted && (
                        <span className="ml-4 px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full font-body">
                          ✓ Hoàn thành
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 font-body mb-3">
                      {lesson.lesson_type === "beginner"
                        ? "Người mới bắt đầu"
                        : lesson.lesson_type === "intermediate"
                        ? "Trung cấp"
                        : lesson.lesson_type === "advanced"
                        ? "Nâng cao"
                        : "Chung"}
                    </p>
                    <p className="text-gray-700 font-body line-clamp-2">
                      {lesson.content.substring(0, 200)}...
                    </p>
                    <div className="mt-4 flex items-center gap-4">
                      {lesson.video_url && (
                        <span className="text-sm text-gray-600 font-body">
                          🎥 Có video
                        </span>
                      )}
                      <span className="text-sm text-black font-body font-medium">
                        Xem chi tiết →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

