"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import Breadcrumb from "@/components/Breadcrumb";

interface Ad {
    id: string;
    title: string;
    content: string;
    image_url: string | null;
    expire_at: string | null;
    created_at: string;
}

type SortField = "created_at" | "title" | "expire_at";
type SortOrder = "asc" | "desc";

export default function AdsManagePage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [ads, setAds] = useState<Ad[]>([]);
    const [filteredAds, setFilteredAds] = useState<Ad[]>([]);
    const [adsLoading, setAdsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortField, setSortField] = useState<SortField>("created_at");
    const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
    const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
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
        if (user) {
            fetchAds();
        }
    }, [user]);

    useEffect(() => {
        // Filter and sort ads
        let filtered = [...ads];

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (ad) =>
                    ad.title.toLowerCase().includes(query) ||
                    ad.content?.toLowerCase().includes(query)
            );
        }

        // Sort
        filtered.sort((a, b) => {
            let aVal: any = a[sortField];
            let bVal: any = b[sortField];

            if (sortField === "created_at" || sortField === "expire_at") {
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

        setFilteredAds(filtered);
    }, [ads, searchQuery, sortField, sortOrder]);

    const fetchAds = async () => {
        try {
            setAdsLoading(true);
            const { data, error } = await supabase
                .from("ads")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Error fetching ads:", error);
                setAds([]);
            } else {
                setAds(data || []);
            }
        } catch (err) {
            console.error("Error:", err);
            setAds([]);
        } finally {
            setAdsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bạn có chắc chắn muốn xóa quảng cáo này?")) {
            return;
        }

        try {
            setDeleteLoading(id);
            const { error } = await supabase.from("ads").delete().eq("id", id);

            if (error) {
                console.error("Error deleting ad:", error);
                alert("Lỗi khi xóa quảng cáo");
            } else {
                setAds(ads.filter((ad) => ad.id !== id));
            }
        } catch (err) {
            console.error("Error:", err);
            alert("Lỗi khi xóa quảng cáo");
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

    return (
        <main className="min-h-screen px-4 pt-24 pb-12 bg-white">
            <div className="container-max mx-auto">
                <Breadcrumb
                    items={[
                        { label: "Dashboard", href: "/dashboard" },
                        { label: "Quản lý Ads" },
                    ]}
                />

                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h1 className="text-4xl font-heading font-bold text-black mb-2">
                                Quản lý Ads
                            </h1>
                            <p className="text-gray-600 font-body">
                                Quản lý và chỉnh sửa các bài quảng cáo
                            </p>
                        </div>
                        <Link
                            href="/ads/new"
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
                                placeholder="Tìm kiếm theo tiêu đề hoặc nội dung..."
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
                                <option value="title">Tiêu đề</option>
                                <option value="expire_at">Ngày hết hạn</option>
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

                {adsLoading ? (
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
                ) : filteredAds.length === 0 ? (
                    <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm text-center">
                        <p className="text-gray-600 font-body mb-4">
                            {searchQuery ? "Không tìm thấy kết quả." : "Chưa có quảng cáo nào."}
                        </p>
                        {!searchQuery && (
                            <Link
                                href="/ads/new"
                                className="text-black font-medium hover:underline"
                            >
                                Tạo quảng cáo đầu tiên →
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
                                            Tiêu đề
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider font-body">
                                            Nội dung
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider font-body">
                                            Hết hạn
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
                                    {filteredAds.map((ad) => {
                                        const expired =
                                            ad.expire_at && new Date(ad.expire_at) < new Date();
                                        return (
                                            <tr key={ad.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    {ad.image_url ? (
                                                        <img
                                                            src={ad.image_url}
                                                            alt={ad.title}
                                                            className="w-16 h-16 object-cover rounded"
                                                            onError={(e) => {
                                                                (
                                                                    e.target as HTMLImageElement
                                                                ).style.display = "none";
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                                                            <span className="text-gray-400 text-xs">
                                                                No image
                                                            </span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-gray-900 font-body">
                                                        {ad.title}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-600 font-body max-w-xs truncate">
                                                        {ad.content || "-"}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-600 font-body">
                                                        {ad.expire_at
                                                            ? new Date(ad.expire_at).toLocaleDateString(
                                                                  "vi-VN"
                                                              )
                                                            : "Không hết hạn"}
                                                        {expired && (
                                                            <span className="ml-2 text-xs text-rose-500">
                                                                (Hết hạn)
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500 font-body">
                                                        {new Date(ad.created_at).toLocaleDateString(
                                                            "vi-VN"
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium font-body">
                                                    <div className="flex gap-2">
                                                        <Link
                                                            href={`/ads/${ad.id}/edit`}
                                                            className="text-indigo-600 hover:text-indigo-900"
                                                        >
                                                            Sửa
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(ad.id)}
                                                            disabled={deleteLoading === ad.id}
                                                            className="text-rose-600 hover:text-rose-900 disabled:opacity-50"
                                                        >
                                                            {deleteLoading === ad.id
                                                                ? "Đang xóa..."
                                                                : "Xóa"}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}

