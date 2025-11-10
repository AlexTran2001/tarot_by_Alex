"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

interface FormTarotDeckProps {
    deckId?: string;
}

export default function FormTarotDeck({ deckId }: FormTarotDeckProps) {
    const router = useRouter();
    const isEditMode = !!deckId;

    const [form, setForm] = useState({
        name: "",
        description: "",
        image_url: "",
    });

    const [loading, setLoading] = useState(isEditMode);
    const [status, setStatus] = useState<"idle" | "saving" | "error" | "success">("idle");
    const [errorMsg, setErrorMsg] = useState("");

    // Load deck data if editing
    useEffect(() => {
        if (isEditMode && deckId) {
            const fetchDeck = async () => {
                try {
                    setLoading(true);
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session) {
                        throw new Error("Phiên đăng nhập đã hết hạn");
                    }

                    const res = await fetch(`/api/admin/tarot-decks/${deckId}`, {
                        headers: {
                            Authorization: `Bearer ${session.access_token}`,
                        },
                    });
                    if (!res.ok) {
                        throw new Error("Không tìm thấy bộ bài Tarot");
                    }
                    const data = await res.json();
                    const deck = data.deck;

                    setForm({
                        name: deck.name || "",
                        description: deck.description || "",
                        image_url: deck.image_url || "",
                    });
                } catch (err: any) {
                    setErrorMsg(err.message || "Lỗi khi tải dữ liệu");
                } finally {
                    setLoading(false);
                }
            };
            fetchDeck();
        }
    }, [isEditMode, deckId]);

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
                ? `/api/admin/tarot-decks/${deckId}`
                : "/api/admin/tarot-decks";
            const method = isEditMode ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                    name: form.name,
                    description: form.description || null,
                    image_url: form.image_url || null,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Không thể lưu bộ bài Tarot");
            }

            setStatus("success");
            setTimeout(() => {
                router.push("/admin/tarot-decks/manage");
            }, 1500);
        } catch (err: any) {
            setErrorMsg(err.message || "Lỗi khi lưu bộ bài Tarot");
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
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1 font-body">
                    Tên bộ bài <span className="text-rose-500">*</span>
                </label>
                <input
                    id="name"
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent font-body"
                    required
                />
            </div>

            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1 font-body">
                    Mô tả
                </label>
                <textarea
                    id="description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent font-body"
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

            {errorMsg && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-md text-sm font-body">
                    {errorMsg}
                </div>
            )}

            {status === "success" && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm font-body">
                    {isEditMode ? "Đã cập nhật bộ bài Tarot thành công!" : "Đã tạo bộ bài Tarot thành công!"}
                </div>
            )}

            <div className="flex gap-3 pt-4">
                <button
                    type="button"
                    onClick={() => router.push("/admin/tarot-decks/manage")}
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

