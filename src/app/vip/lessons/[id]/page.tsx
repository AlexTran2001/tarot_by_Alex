"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useVIP } from "@/hooks/useVIP";
import { supabase } from "@/lib/supabaseClient";
import Breadcrumb from "@/components/Breadcrumb";
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

export default function LessonDetailPage() {
  const { user, isVip, loading } = useVIP();
  const router = useRouter();
  const params = useParams();
  const lessonId = params?.id as string;
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [lessonLoading, setLessonLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

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
    if (!user || !isVip || !lessonId) return;

    const fetchLesson = async () => {
      try {
        setLessonLoading(true);
        setError(null);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setError("Phiên đăng nhập đã hết hạn");
          return;
        }

        const response = await fetch(`/api/vip/lessons/${lessonId}`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch lesson");
        }

        const data = await response.json();
        
        if (!data.lesson) {
          throw new Error("Không tìm thấy bài học");
        }

        setLesson(data.lesson);
        setCompleted(data.lesson.isCompleted || false);
      } catch (err: any) {
        console.error("Error fetching lesson:", err);
        setError(err.message || "Đã xảy ra lỗi khi tải bài học");
      } finally {
        setLessonLoading(false);
      }
    };

    fetchLesson();
  }, [user, isVip, lessonId]);

  const handleMarkComplete = async () => {
    if (!user || !lesson) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("Phiên đăng nhập đã hết hạn");
        return;
      }

      const response = await fetch("/api/vip/progress", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lesson_id: lesson.id,
          progress_type: "lesson",
          completed: !completed,
          progress_data: {
            completed_at: new Date().toISOString(),
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update progress");
      }

      setCompleted(!completed);
    } catch (err: any) {
      console.error("Error updating progress:", err);
      setError(err.message || "Đã xảy ra lỗi khi cập nhật tiến độ");
    }
  };

  if (loading || lessonLoading) {
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
          <p className="text-gray-600 font-body">Đang tải bài học...</p>
        </div>
      </main>
    );
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
            { label: "Khóa Học Tarot", href: "/vip/lessons" },
            { label: lesson?.title || "Bài học" },
          ]}
        />

        {error ? (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-md text-sm font-body">
            {error}
          </div>
        ) : lesson ? (
          <article className="max-w-4xl mx-auto">
            <header className="mb-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-heading font-bold text-black mb-2">
                    {lesson.order_number}. {lesson.title}
                  </h1>
                  <p className="text-gray-600 font-body">
                    {lesson.lesson_type === "beginner"
                      ? "Người mới bắt đầu"
                      : lesson.lesson_type === "intermediate"
                      ? "Trung cấp"
                      : lesson.lesson_type === "advanced"
                      ? "Nâng cao"
                      : "Chung"}
                  </p>
                </div>
                <button
                  onClick={handleMarkComplete}
                  className={`px-4 py-2 rounded-md font-body transition-all ${
                    completed
                      ? "bg-green-100 text-green-800 hover:bg-green-200"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                >
                  {completed ? "✓ Đã hoàn thành" : "Đánh dấu hoàn thành"}
                </button>
              </div>
            </header>

            {lesson.image_url && (
              <div className="relative w-full h-96 mb-8 rounded-lg overflow-hidden">
                <Image
                  src={lesson.image_url}
                  alt={lesson.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 1024px"
                />
              </div>
            )}

            {lesson.video_url && (
              <div className="mb-8">
                <iframe
                  src={lesson.video_url}
                  className="w-full h-96 rounded-lg"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}

            <div
              className="prose max-w-none font-body text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: lesson.content }}
            />
          </article>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-600 font-body">
              Không tìm thấy bài học.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

