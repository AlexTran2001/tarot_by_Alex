"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

interface FormTarotCardProps {
    deckId: string;
    cardId?: string;
}

export default function FormTarotCard({ deckId, cardId }: FormTarotCardProps) {
    const router = useRouter();
    const isEditMode = !!cardId;

    const [form, setForm] = useState({
        name: "",
        meaning: "",
        image_url: "",
    });

    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>("");
    const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(isEditMode);
    const [status, setStatus] = useState<"idle" | "uploading" | "saving" | "error" | "success">("idle");
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

                    const res = await fetch(`/api/admin/tarot-decks/${deckId}/cards/${cardId}`, {
                        headers: {
                            Authorization: `Bearer ${session.access_token}`,
                        },
                    });
                    if (!res.ok) {
                        throw new Error("Không tìm thấy lá bài Tarot");
                    }
                    const data = await res.json();
                    const card = data.card;

                    setForm({
                        name: card.name || "",
                        meaning: card.meaning || "",
                        image_url: card.image_url || "",
                    });
                    if (card.image_url) {
                        setExistingImageUrl(card.image_url);
                    }
                } catch (err: any) {
                    setErrorMsg(err.message || "Lỗi khi tải dữ liệu");
                } finally {
                    setLoading(false);
                }
            };
            fetchCard();
        }
    }, [isEditMode, cardId, deckId]);

    // Cleanup preview URL on unmount
    useEffect(() => {
        return () => {
            if (preview) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [preview]);

    async function uploadImage() {
        if (!file) return null;
        setStatus("uploading");

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                throw new Error("Phiên đăng nhập đã hết hạn");
            }

            // Validate file type
            if (!file.type.startsWith("image/")) {
                throw new Error("File phải là hình ảnh.");
            }

            // Validate file size (max 5MB)
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (file.size > maxSize) {
                throw new Error("Kích thước file phải nhỏ hơn 5MB.");
            }

            // Upload via API route
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/admin/tarot-cards/upload", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${session.access_token}`,
                },
                body: formData,
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data?.error || "Không thể tải ảnh lên.");
            }

            const data = await res.json();
            console.log("Image uploaded successfully, URL:", data.url);
            return data.url;
        } catch (err: any) {
            throw new Error(err.message || "Lỗi khi tải ảnh lên.");
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("saving");
        setErrorMsg("");

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                throw new Error("Phiên đăng nhập đã hết hạn");
            }

            // Only upload image if file is selected
            let imageUrl: string | null = null;
            if (file) {
                imageUrl = await uploadImage();
            }

            const url = isEditMode
                ? `/api/admin/tarot-decks/${deckId}/cards/${cardId}`
                : `/api/admin/tarot-decks/${deckId}/cards`;
            const method = isEditMode ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                    name: form.name,
                    meaning: form.meaning,
                    image_url: imageUrl || existingImageUrl || null,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Không thể lưu lá bài Tarot");
            }

            setStatus("success");
            setTimeout(() => {
                router.push(`/admin/tarot-decks/${deckId}/cards/manage`);
            }, 1500);
        } catch (err: any) {
            setErrorMsg(err.message || "Lỗi khi lưu lá bài Tarot");
            setStatus("error");
        }
    };

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const selected = e.target.files?.[0];
        if (selected) {
            // Validate file type
            if (!selected.type.startsWith("image/")) {
                setErrorMsg("File phải là hình ảnh.");
                return;
            }

            // Validate file size (max 5MB)
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (selected.size > maxSize) {
                setErrorMsg("Kích thước file phải nhỏ hơn 5MB.");
                return;
            }

            // Clear previous error
            setErrorMsg("");
            setFile(selected);
            setPreview(URL.createObjectURL(selected));
        }
    }

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
                    Tên lá bài <span className="text-rose-500">*</span>
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
                <label htmlFor="meaning" className="block text-sm font-medium text-gray-700 mb-1 font-body">
                    Ý nghĩa <span className="text-rose-500">*</span>
                </label>
                <textarea
                    id="meaning"
                    value={form.meaning}
                    onChange={(e) => setForm({ ...form, meaning: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent font-body"
                    required
                />
            </div>

            <div>
                <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1 font-body">
                    Hình ảnh lá bài
                </label>
                <input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent font-body"
                />
                {(preview || existingImageUrl) && (
                    <div className="mt-4">
                        <img
                            src={preview || existingImageUrl || ""}
                            alt="preview"
                            className="w-40 h-40 object-cover rounded-md border border-gray-300"
                        />
                        {existingImageUrl && !preview && (
                            <p className="text-xs text-gray-500 mt-2 font-body">Ảnh hiện tại</p>
                        )}
                    </div>
                )}
            </div>

            {errorMsg && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-md text-sm font-body">
                    {errorMsg}
                </div>
            )}

            {status === "success" && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm font-body">
                    {isEditMode ? "Đã cập nhật lá bài Tarot thành công!" : "Đã tạo lá bài Tarot thành công!"}
                </div>
            )}

            <div className="flex gap-3 pt-4">
                <button
                    type="button"
                    onClick={() => router.push(`/admin/tarot-decks/${deckId}/cards/manage`)}
                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 font-body hover:bg-gray-50 transition-all"
                >
                    Hủy
                </button>
                <button
                    type="submit"
                    disabled={status === "uploading" || status === "saving"}
                    className="px-6 py-2 bg-black text-white rounded-md font-body hover:bg-gray-800 disabled:opacity-50 transition-all"
                >
                    {status === "uploading" ? "Đang tải ảnh..." : status === "saving" ? "Đang lưu..." : isEditMode ? "Cập nhật" : "Tạo mới"}
                </button>
            </div>
        </form>
    );
}

