"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import Breadcrumb from "@/components/Breadcrumb";
import { checkIsAdmin } from "@/lib/adminUtils";

interface TarotCard {
    id: string;
    deck_id: string;
    name: string;
    image_url: string | null;
    meaning: string;
    created_at: string;
}

interface TarotDeck {
    id: string;
    name: string;
}

type SortField = "created_at" | "name";
type SortOrder = "asc" | "desc";

export default function TarotCardsManagePage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [deck, setDeck] = useState<TarotDeck | null>(null);
    const [cards, setCards] = useState<TarotCard[]>([]);
    const [filteredCards, setFilteredCards] = useState<TarotCard[]>([]);
    const [cardsLoading, setCardsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortField, setSortField] = useState<SortField>("created_at");
    const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
    const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
    const params = useParams();
    const id = params?.id as string; // id is the deck ID
    const router = useRouter();

    useEffect(() => {
        let mounted = true;

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!mounted) return;
            
            if (!session) {
                setUser(null);
                setLoading(false);
                if (mounted) {
                    router.push("/login");
                }
            } else {
                setUser(session.user);
                setLoading(false);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, [router]);

    useEffect(() => {
        if (user && id) {
            // Only admin can access this page
            if (!checkIsAdmin(user)) {
                router.push("/");
                return;
            }
            fetchDeck();
            fetchCards();
        }
    }, [user, id, router]);

    // Redirect non-admin users
    useEffect(() => {
        if (!loading && user && !checkIsAdmin(user)) {
            router.push("/");
        }
    }, [user, loading, router]);

    useEffect(() => {
        // Filter and sort cards
        let filtered = [...cards];

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (card) =>
                    card.name.toLowerCase().includes(query) ||
                    card.meaning?.toLowerCase().includes(query)
            );
        }

        // Sort
        filtered.sort((a, b) => {
            let aVal: any = a[sortField];
            let bVal: any = b[sortField];

            if (sortField === "created_at") {
                aVal = aVal ? new Date(aVal).getTime() : 0;
                bVal = bVal ? new Date(bVal).getTime() : 0;
            } else {
                aVal = aVal?.toLowerCase() || "";
                bVal = bVal?.toLowerCase() || "";
            }

            if (sortOrder === "asc") {
                return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
            } else {
                return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
            }
        });

        setFilteredCards(filtered);
    }, [cards, searchQuery, sortField, sortOrder]);

    const fetchDeck = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                throw new Error("Phiên đăng nhập đã hết hạn");
            }

            const response = await fetch(`/api/admin/tarot-decks/${id}`, {
                headers: {
                    Authorization: `Bearer ${session.access_token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("Error fetching tarot deck:", data.error);
                setDeck(null);
            } else {
                setDeck(data.deck);
            }
        } catch (err) {
            console.error("Error:", err);
            setDeck(null);
        }
    };

    const fetchCards = async () => {
        try {
            setCardsLoading(true);
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                throw new Error("Phiên đăng nhập đã hết hạn");
            }

            // Build query string with pagination parameters
            const params = new URLSearchParams({
                page: "1",
                limit: "1000", // Get all cards for client-side filtering
            });

            const response = await fetch(`/api/admin/tarot-decks/${id}/cards?${params.toString()}`, {
                headers: {
                    Authorization: `Bearer ${session.access_token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("Error fetching tarot cards:", data.error);
                setCards([]);
            } else {
                setCards(data.cards || []);
            }
        } catch (err) {
            console.error("Error:", err);
            setCards([]);
        } finally {
            setCardsLoading(false);
        }
    };

    const handleDelete = async (cardId: string) => {
        if (!confirm("Bạn có chắc chắn muốn xóa lá bài Tarot này?")) {
            return;
        }

        try {
            setDeleteLoading(cardId);
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                throw new Error("Phiên đăng nhập đã hết hạn");
            }

            const response = await fetch(`/api/admin/tarot-decks/${id}/cards/${cardId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${session.access_token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Lỗi khi xóa lá bài Tarot");
            }

            setCards(cards.filter((c) => c.id !== cardId));
        } catch (err: any) {
            console.error("Error:", err);
            alert("Lỗi khi xóa lá bài Tarot: " + err.message);
        } finally {
            setDeleteLoading(null);
        }
    };

    if (loading) {
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
                    <p className="text-gray-600 font-body">Đang tải...</p>
                </div>
            </main>
        );
    }

    // Only admin can access this page
    if (!loading && user && !checkIsAdmin(user)) {
        return (
            <main className="min-h-screen flex items-center justify-center pt-24">
                <div className="text-center">
                    <h1 className="text-2xl font-heading font-bold text-black mb-4">
                        Truy cập bị từ chối
                    </h1>
                    <p className="text-gray-600 font-body mb-4">
                        Chỉ quản trị viên mới có thể truy cập trang này.
                    </p>
                    <Link
                        href="/"
                        className="inline-block px-6 py-3 bg-black text-white rounded-md font-medium font-body hover:bg-gray-800 transition-all"
                    >
                        Về trang chủ
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen px-4 pt-24 pb-12 bg-white">
            <div className="container-max mx-auto">
                <Breadcrumb
                    items={[
                        { label: "Dashboard", href: "/dashboard" },
                        { label: "Quản lý Bộ bài Tarot", href: "/admin/tarot-decks/manage" },
                        { label: deck?.name || "Bộ bài", href: `/admin/tarot-decks/${id}/edit` },
                        { label: "Quản lý lá bài" },
                    ]}
                />

                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h1 className="text-4xl font-heading font-bold text-black mb-2">
                                Quản lý lá bài - {deck?.name || "Đang tải..."}
                            </h1>
                            <p className="text-gray-600 font-body">
                                Quản lý và chỉnh sửa các lá bài trong bộ bài này
                            </p>
                        </div>
                        <Link
                            href={`/admin/tarot-decks/${id}/cards/new`}
                            className="px-6 py-3 bg-black text-white rounded-md font-medium font-body hover:bg-gray-800 transition-all"
                        >
                            + Tạo mới
                        </Link>
                    </div>

                    {/* Search and Sort Controls */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo tên lá bài hoặc ý nghĩa..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent font-body"
                            />
                        </div>
                        <div className="flex gap-2">
                            <select
                                value={sortField}
                                onChange={(e) => setSortField(e.target.value as SortField)}
                                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent font-body"
                            >
                                <option value="created_at">Ngày tạo</option>
                                <option value="name">Tên lá bài</option>
                            </select>
                            <button
                                onClick={() =>
                                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                                }
                                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-all font-body"
                                title={sortOrder === "asc" ? "Tăng dần" : "Giảm dần"}
                            >
                                {sortOrder === "asc" ? "↑" : "↓"}
                            </button>
                        </div>
                    </div>
                </div>

                {cardsLoading ? (
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
                        <p className="text-gray-600 font-body">Đang tải dữ liệu...</p>
                    </div>
                ) : filteredCards.length === 0 ? (
                    <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm text-center">
                        <p className="text-gray-600 font-body mb-4">
                            {searchQuery ? "Không tìm thấy kết quả." : "Chưa có lá bài Tarot nào trong bộ bài này."}
                        </p>
                        {!searchQuery && (
                            <Link
                                href={`/admin/tarot-decks/${id}/cards/new`}
                                className="inline-block px-6 py-3 bg-black text-white rounded-md font-medium font-body hover:bg-gray-800 transition-all"
                            >
                                Tạo lá bài Tarot đầu tiên
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider font-body">
                                            Hình ảnh
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider font-body">
                                            Tên lá bài
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider font-body">
                                            Ý nghĩa
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider font-body">
                                            Ngày tạo
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider font-body">
                                            Thao tác
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredCards.map((card) => (
                                        <tr key={card.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                {card.image_url ? (
                                                    <img
                                                        src={card.image_url}
                                                        alt={card.name}
                                                        className="w-16 h-16 object-cover rounded-md border border-gray-300"
                                                    />
                                                ) : (
                                                    <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center text-gray-400 text-xs font-body">
                                                        No Image
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900 font-body">
                                                    {card.name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-500 font-body line-clamp-2 max-w-md">
                                                    {card.meaning.substring(0, 100)}...
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-body">
                                                {new Date(card.created_at).toLocaleDateString("vi-VN")}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium font-body">
                                                <div className="flex gap-2">
                                                    <Link
                                                        href={`/admin/tarot-decks/${id}/cards/${card.id}/edit`}
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                    >
                                                        Sửa
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(card.id)}
                                                        disabled={deleteLoading === card.id}
                                                        className="text-rose-600 hover:text-rose-900 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {deleteLoading === card.id
                                                            ? "Đang xóa..."
                                                            : "Xóa"}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}

