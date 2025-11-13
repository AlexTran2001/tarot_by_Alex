"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import Breadcrumb from "@/components/Breadcrumb";
import { checkIsAdmin } from "@/lib/adminUtils";
import LoadingSpinner from "@/components/LoadingSpinner";
import Link from "next/link";

interface Booking {
    id: string;
    name: string;
    email: string | null;
    note: string | null;
    phone: string | null;
    date: string;
    time: string;
    type: string;
    customer_user_id: string | null;
    created_at: string;
}

type SortField = "created_at" | "date" | "name" | "email";
type SortOrder = "asc" | "desc";

export default function BookingManagePage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
    const [bookingsLoading, setBookingsLoading] = useState(true);
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
            // Only admin can access this page
            if (!checkIsAdmin(user)) {
                router.push("/");
                return;
            }
            fetchBookings();
        }
    }, [user, router]);

    // Redirect non-admin users
    useEffect(() => {
        if (!loading && user && !checkIsAdmin(user)) {
            router.push("/");
        }
    }, [user, loading, router]);

    useEffect(() => {
        // Filter and sort bookings
        let filtered = [...bookings];

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (booking) =>
                    booking.name.toLowerCase().includes(query) ||
                    booking.email?.toLowerCase().includes(query) ||
                    booking.phone?.toLowerCase().includes(query) ||
                    booking.type.toLowerCase().includes(query) ||
                    booking.note?.toLowerCase().includes(query)
            );
        }

        // Sort
        filtered.sort((a, b) => {
            let aVal: any = a[sortField];
            let bVal: any = b[sortField];

            if (sortField === "created_at" || sortField === "date") {
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

        setFilteredBookings(filtered);
    }, [bookings, searchQuery, sortField, sortOrder]);

    const fetchBookings = async () => {
        try {
            setBookingsLoading(true);
            const { data, error } = await supabase
                .from("bookings")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Error fetching bookings:", error);
                setBookings([]);
            } else {
                setBookings(data || []);
            }
        } catch (err) {
            console.error("Error:", err);
            setBookings([]);
        } finally {
            setBookingsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bạn có chắc chắn muốn xóa booking này?")) {
            return;
        }

        try {
            setDeleteLoading(id);
            const { error } = await supabase.from("bookings").delete().eq("id", id);

            if (error) {
                console.error("Error deleting booking:", error);
                alert("Lỗi khi xóa booking");
            } else {
                setBookings(bookings.filter((booking) => booking.id !== id));
            }
        } catch (err) {
            console.error("Error:", err);
            alert("Lỗi khi xóa booking");
        } finally {
            setDeleteLoading(null);
        }
    };

    if (loading) {
        return <LoadingSpinner fullScreen text="Đang tải..." />;
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
                        { label: "Quản lý Booking" },
                    ]}
                />

                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-4xl font-heading font-bold text-black mb-2">
                        Quản lý Booking
                    </h1>
                    <div className="flex flex-col sm:items-end gap-3">
                        <p className="text-gray-600 font-body">
                            Xem và quản lý các đặt lịch Tarot
                        </p>
                        <Link
                            href="/booking/new"
                            className="inline-flex items-center justify-center rounded-lg bg-black px-4 py-2 font-body text-sm font-medium text-white transition hover:bg-gray-900"
                        >
                            + Tạo booking
                        </Link>
                    </div>
                </div>

                {/* Search and Sort Controls */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên, email, loại hoặc ghi chú..."
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
                            <option value="created_at">Ngày đặt</option>
                            <option value="date">Ngày hẹn</option>
                            <option value="name">Tên</option>
                            <option value="email">Email</option>
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

                {bookingsLoading ? (
                    <div className="text-center py-12">
                        <LoadingSpinner text="Đang tải dữ liệu..." />
                    </div>
                ) : filteredBookings.length === 0 ? (
                    <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm text-center">
                        <p className="text-gray-600 font-body mb-4">
                            {searchQuery ? "Không tìm thấy kết quả." : "Chưa có booking nào."}
                        </p>
                    </div>
                ) : (
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider font-body">
                                            Tên
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider font-body">
                                            Liên hệ
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider font-body">
                                            Ngày & Giờ
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider font-body">
                                            Loại
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider font-body">
                                            Ghi chú
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider font-body">
                                            Tài khoản
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider font-body">
                                            Ngày đặt
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider font-body">
                                            Thao tác
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredBookings.map((booking) => (
                                        <tr key={booking.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-body">
                                                {booking.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-body">
                                                <div className="space-y-1">
                                                    {booking.email ? <p>{booking.email}</p> : <p>-</p>}
                                                    {booking.phone ? <p className="text-gray-500">{booking.phone}</p> : null}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-body">
                                                {new Date(booking.date).toLocaleDateString("vi-VN")}{" "}
                                                {booking.time}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-body">
                                                {booking.type}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 font-body max-w-xs truncate">
                                                {booking.note || "-"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-body">
                                                {booking.customer_user_id ? (
                                                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">
                                                        Đã liên kết
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-body">
                                                {new Date(booking.created_at).toLocaleDateString(
                                                    "vi-VN"
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium font-body">
                                                <div className="flex items-center gap-3">
                                                    <Link
                                                        href={`/booking/${booking.id}/meeting`}
                                                        className="text-black hover:text-gray-800 transition"
                                                    >
                                                        Meeting
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(booking.id)}
                                                        disabled={deleteLoading === booking.id}
                                                        className="text-rose-600 hover:text-rose-900 disabled:opacity-50"
                                                    >
                                                        {deleteLoading === booking.id
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

