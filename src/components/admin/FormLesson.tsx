"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

interface FormLessonProps {
    lessonId?: string;
}

export default function FormLesson({ lessonId }: FormLessonProps) {
    const router = useRouter();
    const isEditMode = !!lessonId;

    const [form, setForm] = useState({
        title: "",
        content: "",
        video_url: "",
        image_url: "",
        order_number: 0,
        lesson_type: "general",
    });

    const [loading, setLoading] = useState(isEditMode);
    const [status, setStatus] = useState<"idle" | "saving" | "error" | "success">("idle");
    const [errorMsg, setErrorMsg] = useState("");

    // Load lesson data if editing
    useEffect(() => {
        if (isEditMode && lessonId) {
            const fetchLesson = async () => {
                try {
                    setLoading(true);
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session) {
                        throw new Error("Phiên đăng nhập đã hết hạn");
                    }

                    const res = await fetch(`/api/admin/lessons/${lessonId}`, {
                        headers: {
                            Authorization: `Bearer ${session.access_token}`,
                        },
                    });
                    if (!res.ok) {
                        throw new Error("Không tìm thấy khóa học");
                    }
                    const data = await res.json();
                    const lesson = data.lesson;

                    setForm({
                        title: lesson.title || "",
                        content: lesson.content || "",
                        video_url: lesson.video_url || "",
                        image_url: lesson.image_url || "",
                        order_number: lesson.order_number || 0,
                        lesson_type: lesson.lesson_type || "general",
                    });
                } catch (err: any) {
                    setErrorMsg(err.message || "Lỗi khi tải dữ liệu");
                } finally {
                    setLoading(false);
                }
            };
            fetchLesson();
        }
    }, [isEditMode, lessonId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("saving");
        setErrorMsg("");

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                throw new Error("Phiên đăng nhập đã hết hạn");
            }

            const url = isEditMode
                ? `/api/admin/lessons/${lessonId}`
                : "/api/admin/lessons";
            const method = isEditMode ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                    title: form.title,
                    content: form.content,
                    video_url: form.video_url || null,
                    image_url: form.image_url || null,
                    order_number: parseInt(form.order_number.toString()),
                    lesson_type: form.lesson_type,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Không thể lưu khóa học");
            }

            setStatus("success");
            setTimeout(() => {
                router.push("/admin/lessons/manage");
            }, 1500);
        } catch (err: any) {
            setErrorMsg(err.message || "Lỗi khi lưu khóa học");
            setStatus("error");
        }
    };

    if (loading) {
        return (
            <div className="text-center py-12">
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
                <p className="text-gray-600 font-body">Đang tải...</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1 font-body">
                    Tiêu đề <span className="text-rose-500">*</span>
                </label>
                <input
                    id="title"
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent font-body"
                    required
                />
            </div>

            <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1 font-body">
                    Nội dung <span className="text-rose-500">*</span>
                </label>
                <textarea
                    id="content"
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    rows={10}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent font-body"
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="video_url" className="block text-sm font-medium text-gray-700 mb-1 font-body">
                        URL video
                    </label>
                    <input
                        id="video_url"
                        type="url"
                        value={form.video_url}
                        onChange={(e) => setForm({ ...form, video_url: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent font-body"
                        placeholder="https://youtube.com/watch?v=..."
                    />
                </div>

                <div>
                    <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-1 font-body">
                        URL hình ảnh
                    </label>
                    <input
                        id="image_url"
                        type="url"
                        value={form.image_url}
                        onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent font-body"
                        placeholder="https://example.com/image.jpg"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="order_number" className="block text-sm font-medium text-gray-700 mb-1 font-body">
                        Số thứ tự <span className="text-rose-500">*</span>
                    </label>
                    <input
                        id="order_number"
                        type="number"
                        value={form.order_number}
                        onChange={(e) => setForm({ ...form, order_number: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent font-body"
                        required
                        min="0"
                    />
                </div>

                <div>
                    <label htmlFor="lesson_type" className="block text-sm font-medium text-gray-700 mb-1 font-body">
                        Loại khóa học
                    </label>
                    <select
                        id="lesson_type"
                        value={form.lesson_type}
                        onChange={(e) => setForm({ ...form, lesson_type: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent font-body"
                    >
                        <option value="general">Tổng quan</option>
                        <option value="beginner">Người mới</option>
                        <option value="intermediate">Trung cấp</option>
                        <option value="advanced">Nâng cao</option>
                    </select>
                </div>
            </div>

            {errorMsg && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-md text-sm font-body">
                    {errorMsg}
                </div>
            )}

            {status === "success" && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm font-body">
                    {isEditMode ? "Đã cập nhật khóa học thành công!" : "Đã tạo khóa học thành công!"}
                </div>
            )}

            <div className="flex gap-3 pt-4">
                <button
                    type="button"
                    onClick={() => router.push("/admin/lessons/manage")}
                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 font-body hover:bg-gray-50 transition-all"
                >
                    Hủy
                </button>
                <button
                    type="submit"
                    disabled={status === "saving"}
                    className="px-6 py-2 bg-black text-white rounded-md font-body hover:bg-gray-800 disabled:opacity-50 transition-all"
                >
                    {status === "saving" ? "Đang lưu..." : isEditMode ? "Cập nhật" : "Tạo mới"}
                </button>
            </div>
        </form>
    );
}

