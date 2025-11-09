"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

interface FormMagazineProps {
    magazineId?: string;
}

export default function FormMagazine({ magazineId }: FormMagazineProps) {
    const router = useRouter();
    const isEditMode = !!magazineId;

    const [form, setForm] = useState({
        title: "",
        content: "",
        image_url: "",
        published_at: new Date().toISOString().slice(0, 16),
    });

    const [loading, setLoading] = useState(isEditMode);
    const [status, setStatus] = useState<"idle" | "saving" | "error" | "success">("idle");
    const [errorMsg, setErrorMsg] = useState("");

    // Load magazine data if editing
    useEffect(() => {
        if (isEditMode && magazineId) {
            const fetchMagazine = async () => {
                try {
                    setLoading(true);
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session) {
                        throw new Error("Phiên đăng nhập đã hết hạn");
                    }

                    const res = await fetch(`/api/admin/magazines/${magazineId}`, {
                        headers: {
                            Authorization: `Bearer ${session.access_token}`,
                        },
                    });
                    if (!res.ok) {
                        throw new Error("Không tìm thấy tạp chí");
                    }
                    const data = await res.json();
                    const magazine = data.magazine;

                    setForm({
                        title: magazine.title || "",
                        content: magazine.content || "",
                        image_url: magazine.image_url || "",
                        published_at: magazine.published_at
                            ? new Date(magazine.published_at).toISOString().slice(0, 16)
                            : new Date().toISOString().slice(0, 16),
                    });
                } catch (err: any) {
                    setErrorMsg(err.message || "Lỗi khi tải dữ liệu");
                } finally {
                    setLoading(false);
                }
            };
            fetchMagazine();
        }
    }, [isEditMode, magazineId]);

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
                ? `/api/admin/magazines/${magazineId}`
                : "/api/admin/magazines";
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
                    image_url: form.image_url || null,
                    published_at: form.published_at || new Date().toISOString(),
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Không thể lưu tạp chí");
            }

            setStatus("success");
            setTimeout(() => {
                router.push("/admin/magazines/manage");
            }, 1500);
        } catch (err: any) {
            setErrorMsg(err.message || "Lỗi khi lưu tạp chí");
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

            <div>
                <label htmlFor="published_at" className="block text-sm font-medium text-gray-700 mb-1 font-body">
                    Ngày xuất bản
                </label>
                <input
                    id="published_at"
                    type="datetime-local"
                    value={form.published_at}
                    onChange={(e) => setForm({ ...form, published_at: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent font-body"
                />
            </div>

            {errorMsg && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-md text-sm font-body">
                    {errorMsg}
                </div>
            )}

            {status === "success" && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm font-body">
                    {isEditMode ? "Đã cập nhật tạp chí thành công!" : "Đã tạo tạp chí thành công!"}
                </div>
            )}

            <div className="flex gap-3 pt-4">
                <button
                    type="button"
                    onClick={() => router.push("/admin/magazines/manage")}
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

