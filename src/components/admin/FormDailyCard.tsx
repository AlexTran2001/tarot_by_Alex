"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { getTodayDate } from "@/lib/dateUtils";

interface FormDailyCardProps {
    cardId?: string;
}

export default function FormDailyCard({ cardId }: FormDailyCardProps) {
    const router = useRouter();
    const isEditMode = !!cardId;

    const [form, setForm] = useState({
        card_name: "",
        card_image_url: "",
        card_meaning: "",
        card_description: "",
        card_date: getTodayDate("Asia/Ho_Chi_Minh"),
    });

    const [loading, setLoading] = useState(isEditMode);
    const [status, setStatus] = useState<"idle" | "saving" | "error" | "success">("idle");
    const [errorMsg, setErrorMsg] = useState("");

    // Load card data if editing
    useEffect(() => {
        if (isEditMode && cardId) {
            const fetchCard = async () => {
                try {
                    setLoading(true);
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session) {
                        throw new Error("Phiên đăng nhập đã hết hạn");
                    }

                    const res = await fetch(`/api/admin/daily-cards/${cardId}`, {
                        headers: {
                            Authorization: `Bearer ${session.access_token}`,
                        },
                    });
                    if (!res.ok) {
                        throw new Error("Không tìm thấy bài Tarot");
                    }
                    const data = await res.json();
                    const card = data.card;

                    setForm({
                        card_name: card.card_name || "",
                        card_image_url: card.card_image_url || "",
                        card_meaning: card.card_meaning || "",
                        card_description: card.card_description || "",
                        card_date: card.card_date || new Date().toISOString().split("T")[0],
                    });
                } catch (err: any) {
                    setErrorMsg(err.message || "Lỗi khi tải dữ liệu");
                } finally {
                    setLoading(false);
                }
            };
            fetchCard();
        }
    }, [isEditMode, cardId]);

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
                ? `/api/admin/daily-cards/${cardId}`
                : "/api/admin/daily-cards";
            const method = isEditMode ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                    card_name: form.card_name,
                    card_image_url: form.card_image_url || null,
                    card_meaning: form.card_meaning,
                    card_description: form.card_description,
                    card_date: form.card_date,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Không thể lưu bài Tarot");
            }

            setStatus("success");
            setTimeout(() => {
                router.push("/admin/daily-cards/manage");
            }, 1500);
        } catch (err: any) {
            setErrorMsg(err.message || "Lỗi khi lưu bài Tarot");
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
                <label htmlFor="card_name" className="block text-sm font-medium text-gray-700 mb-1 font-body">
                    Tên bài Tarot <span className="text-rose-500">*</span>
                </label>
                <input
                    id="card_name"
                    type="text"
                    value={form.card_name}
                    onChange={(e) => setForm({ ...form, card_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent font-body"
                    required
                />
            </div>

            <div>
                <label htmlFor="card_image_url" className="block text-sm font-medium text-gray-700 mb-1 font-body">
                    URL hình ảnh
                </label>
                <input
                    id="card_image_url"
                    type="url"
                    value={form.card_image_url}
                    onChange={(e) => setForm({ ...form, card_image_url: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent font-body"
                    placeholder="https://example.com/image.jpg"
                />
            </div>

            <div>
                <label htmlFor="card_meaning" className="block text-sm font-medium text-gray-700 mb-1 font-body">
                    Ý nghĩa <span className="text-rose-500">*</span>
                </label>
                <textarea
                    id="card_meaning"
                    value={form.card_meaning}
                    onChange={(e) => setForm({ ...form, card_meaning: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent font-body"
                    required
                />
            </div>

            <div>
                <label htmlFor="card_description" className="block text-sm font-medium text-gray-700 mb-1 font-body">
                    Mô tả <span className="text-rose-500">*</span>
                </label>
                <textarea
                    id="card_description"
                    value={form.card_description}
                    onChange={(e) => setForm({ ...form, card_description: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent font-body"
                    required
                />
            </div>

            <div>
                <label htmlFor="card_date" className="block text-sm font-medium text-gray-700 mb-1 font-body">
                    Ngày <span className="text-rose-500">*</span>
                </label>
                <input
                    id="card_date"
                    type="date"
                    value={form.card_date}
                    onChange={(e) => setForm({ ...form, card_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent font-body"
                    required
                />
            </div>

            {errorMsg && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-md text-sm font-body">
                    {errorMsg}
                </div>
            )}

            {status === "success" && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm font-body">
                    {isEditMode ? "Đã cập nhật bài Tarot thành công!" : "Đã tạo bài Tarot thành công!"}
                </div>
            )}

            <div className="flex gap-3 pt-4">
                <button
                    type="button"
                    onClick={() => router.push("/admin/daily-cards/manage")}
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

