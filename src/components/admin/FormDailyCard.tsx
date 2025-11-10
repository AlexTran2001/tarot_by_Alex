"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { getTodayDate } from "@/lib/dateUtils";

interface FormDailyCardProps {
    cardId?: string;
}

interface TarotDeck {
    id: string;
    name: string;
    description: string | null;
}

interface TarotCard {
    id: string;
    name: string;
    image_url: string | null;
    meaning: string;
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
    
    // Deck and card selection
    const [decks, setDecks] = useState<TarotDeck[]>([]);
    const [selectedDeckId, setSelectedDeckId] = useState<string>("");
    const [cards, setCards] = useState<TarotCard[]>([]);
    const [selectedCardId, setSelectedCardId] = useState<string>("");
    const [loadingDecks, setLoadingDecks] = useState(false);
    const [loadingCards, setLoadingCards] = useState(false);

    // Load decks on mount
    useEffect(() => {
        const fetchDecks = async () => {
            try {
                setLoadingDecks(true);
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    return;
                }

                const res = await fetch("/api/admin/tarot-decks?limit=1000", {
                    headers: {
                        Authorization: `Bearer ${session.access_token}`,
                    },
                });
                if (res.ok) {
                    const data = await res.json();
                    setDecks(data.decks || []);
                }
            } catch (err) {
                console.error("Error fetching decks:", err);
            } finally {
                setLoadingDecks(false);
            }
        };
        fetchDecks();
    }, []);

    // Load cards when deck is selected
    useEffect(() => {
        if (!selectedDeckId) {
            setCards([]);
            setSelectedCardId("");
            return;
        }

        const fetchCards = async () => {
            try {
                setLoadingCards(true);
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    return;
                }

                const res = await fetch(`/api/admin/tarot-decks/${selectedDeckId}/cards?limit=1000`, {
                    headers: {
                        Authorization: `Bearer ${session.access_token}`,
                    },
                });
                if (res.ok) {
                    const data = await res.json();
                    setCards(data.cards || []);
                }
            } catch (err) {
                console.error("Error fetching cards:", err);
            } finally {
                setLoadingCards(false);
            }
        };
        fetchCards();
    }, [selectedDeckId]);

    // Populate form when card is selected
    useEffect(() => {
        if (selectedCardId && cards.length > 0) {
            const card = cards.find((c) => c.id === selectedCardId);
            if (card) {
                setForm((prev) => ({
                    ...prev,
                    card_name: card.name,
                    card_image_url: card.image_url || "",
                    card_meaning: card.meaning,
                }));
            }
        }
    }, [selectedCardId, cards]);

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

    const selectedDeck = selectedDeckId ? decks.find((deck) => deck.id === selectedDeckId) : null;

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* STEP 1 - Deck & Card Selection */}
            <section className="rounded-xl border border-gray-200 bg-gray-50/80 p-5 md:p-6">
                <div className="flex items-center gap-3 mb-6">
                    <span className="inline-flex h-9 min-w-[36px] items-center justify-center rounded-full bg-black text-sm font-semibold text-white">
                        1
                    </span>
                    <div>
                        <h3 className="text-lg font-heading font-semibold text-gray-900">
                            Chọn Bộ bài & Lá bài (tùy chọn)
                        </h3>
                        <p className="text-sm text-gray-600 font-body">
                            Chọn nhanh hình ảnh và ý nghĩa từ bộ bài hiện có. Bạn vẫn có thể chỉnh sửa nội dung sau đó.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-6 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] md:gap-8">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="selected_deck" className="block text-sm font-medium text-gray-700 mb-1 font-body">
                                Chọn Bộ bài
                            </label>
                            <select
                                id="selected_deck"
                                value={selectedDeckId}
                                onChange={(e) => {
                                    setSelectedDeckId(e.target.value);
                                    setSelectedCardId(""); // Reset card selection
                                }}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent font-body bg-white shadow-sm transition"
                                disabled={loadingDecks}
                            >
                                <option value="">-- Chọn bộ bài --</option>
                                {decks.map((deck) => (
                                    <option key={deck.id} value={deck.id}>
                                        {deck.name}
                                    </option>
                                ))}
                            </select>
                            {selectedDeck && (
                                <p className="mt-2 text-sm text-gray-500 font-body">
                                    {selectedDeck.description || "Không có mô tả cho bộ bài này."}
                                </p>
                            )}
                        </div>

                        {selectedDeckId && (
                            <div className="space-y-2">
                                <label htmlFor="selected_card" className="block text-sm font-medium text-gray-700 font-body">
                                    Chọn Lá bài
                                </label>
                                <select
                                    id="selected_card"
                                    value={selectedCardId}
                                    onChange={(e) => setSelectedCardId(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent font-body bg-white shadow-sm transition"
                                    disabled={loadingCards}
                                >
                                    <option value="">-- Chọn lá bài --</option>
                                    {cards.map((card) => (
                                        <option key={card.id} value={card.id}>
                                            {card.name}
                                        </option>
                                    ))}
                                </select>
                                {loadingCards && (
                                    <p className="text-sm text-gray-500 mt-1 font-body">Đang tải lá bài...</p>
                                )}
                                <div className="flex items-center gap-2 text-sm mt-1">
                                    {selectedCardId ? (
                                        <>
                                            <span className="text-green-600 font-medium font-body">
                                                ✓ Đã chọn lá bài từ bộ {selectedDeck?.name}.
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => setSelectedCardId("")}
                                                className="text-xs font-body text-gray-500 underline-offset-2 hover:underline"
                                            >
                                                Xoá lựa chọn
                                            </button>
                                        </>
                                    ) : (
                                        <span className="text-gray-500 font-body">
                                            Chọn lá bài để tự động điền thông tin.
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                        <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3 font-body">
                            Xem trước lá bài
                        </p>

                        <div className="flex flex-col sm:flex-row sm:items-start sm:gap-5">
                            <div className="mx-auto sm:mx-0">
                                {form.card_image_url ? (
                                    <img
                                        src={form.card_image_url}
                                        alt={form.card_name || "Tarot card preview"}
                                        className="h-40 w-28 rounded-lg border border-gray-200 object-cover shadow-sm"
                                    />
                                ) : (
                                    <div className="flex h-40 w-28 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-100 text-xs text-gray-500 font-body">
                                        Không có ảnh
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 space-y-2 sm:mt-0 sm:flex-1">
                                <h4 className="text-lg font-heading font-semibold text-gray-900">
                                    {form.card_name || "Tên lá bài"}
                                </h4>
                                <p className="text-sm text-gray-500 font-body">
                                    {selectedDeck ? `Thuộc bộ: ${selectedDeck.name}` : "Chưa chọn bộ bài"}
                                </p>
                                <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700 font-body leading-relaxed">
                                    {form.card_meaning ? (
                                        <p className="line-clamp-4">{form.card_meaning}</p>
                                    ) : (
                                        <p className="text-gray-400">Ý nghĩa sẽ hiển thị tại đây.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* STEP 2 - Daily Card Content */}
            <section className="rounded-xl border border-gray-200 bg-white p-5 md:p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <span className="inline-flex h-9 min-w-[36px] items-center justify-center rounded-full bg-black text-sm font-semibold text-white">
                        2
                    </span>
                    <div>
                        <h3 className="text-lg font-heading font-semibold text-gray-900">
                            Hoàn chỉnh nội dung Bài Tarot hôm nay
                        </h3>
                        <p className="text-sm text-gray-600 font-body">
                            Kiểm tra và tinh chỉnh nội dung theo thông điệp bạn muốn truyền tải.
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <label htmlFor="card_name" className="block text-sm font-medium text-gray-700 font-body">
                            Tên bài Tarot <span className="text-rose-500">*</span>
                        </label>
                        <input
                            id="card_name"
                            type="text"
                            value={form.card_name}
                            onChange={(e) => setForm({ ...form, card_name: e.target.value })}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 font-body shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-black"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="card_date" className="block text-sm font-medium text-gray-700 font-body">
                            Ngày hiển thị <span className="text-rose-500">*</span>
                        </label>
                        <input
                            id="card_date"
                            type="date"
                            value={form.card_date}
                            onChange={(e) => setForm({ ...form, card_date: e.target.value })}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 font-body shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-black"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label htmlFor="card_image_url" className="block text-sm font-medium text-gray-700 font-body">
                        URL hình ảnh
                    </label>
                    <input
                        id="card_image_url"
                        type="url"
                        value={form.card_image_url}
                        onChange={(e) => setForm({ ...form, card_image_url: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 font-body shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-black"
                        placeholder="https://example.com/image.jpg"
                    />
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <div className="space-y-2">
                        <label htmlFor="card_meaning" className="block text-sm font-medium text-gray-700 font-body">
                            Ý nghĩa <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                            id="card_meaning"
                            value={form.card_meaning}
                            onChange={(e) => setForm({ ...form, card_meaning: e.target.value })}
                            rows={6}
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 font-body shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-black"
                            placeholder="Tóm tắt ý nghĩa chính của lá bài."
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="card_description" className="block text-sm font-medium text-gray-700 font-body">
                            Thông điệp hôm nay <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                            id="card_description"
                            value={form.card_description}
                            onChange={(e) => setForm({ ...form, card_description: e.target.value })}
                            rows={6}
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 font-body shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-black"
                            placeholder="Viết lời nhắn riêng cho khách hàng hôm nay."
                            required
                        />
                    </div>
                </div>
            </section>

            {errorMsg && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700 text-sm font-body">
                    {errorMsg}
                </div>
            )}

            {status === "success" && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700 text-sm font-body">
                    {isEditMode ? "Đã cập nhật bài Tarot thành công!" : "Đã tạo bài Tarot thành công!"}
                </div>
            )}

            <div className="flex flex-col-reverse gap-3 pt-3 sm:flex-row sm:justify-end">
                <button
                    type="button"
                    onClick={() => router.push("/admin/daily-cards/manage")}
                    className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-6 py-2.5 font-body text-gray-700 transition hover:bg-gray-50 hover:text-gray-900"
                >
                    Hủy
                </button>
                <button
                    type="submit"
                    disabled={status === "saving"}
                    className="inline-flex items-center justify-center rounded-lg bg-black px-6 py-2.5 font-body font-medium text-white transition hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {status === "saving" ? "Đang lưu..." : isEditMode ? "Cập nhật" : "Tạo mới"}
                </button>
            </div>
        </form>
    );
}

