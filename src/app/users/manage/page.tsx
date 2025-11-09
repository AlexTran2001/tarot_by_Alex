"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import Breadcrumb from "@/components/Breadcrumb";
import Link from "next/link";
import { checkIsAdmin } from "@/lib/adminUtils";

interface UserAccount {
    id: string;
    email: string;
    email_confirmed_at: string | null;
    created_at: string;
    updated_at: string;
    last_sign_in_at: string | null;
    role: string;
    user_metadata: Record<string, any>;
    app_metadata: Record<string, any>;
    vipStatus?: {
        isVip: boolean;
        expiresAt: string | null;
    };
}

type SortField = "created_at" | "email" | "last_sign_in_at" | "email_confirmed_at";
type SortOrder = "asc" | "desc";

export default function UsersManagePage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<UserAccount[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<UserAccount[]>([]);
    const [usersLoading, setUsersLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortField, setSortField] = useState<SortField>("created_at");
    const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
    const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
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
            fetchUsers();
        }
    }, [user, router]);

    // Redirect non-admin users
    useEffect(() => {
        if (!loading && user && !checkIsAdmin(user)) {
            router.push("/");
        }
    }, [user, loading, router]);

    useEffect(() => {
        // Filter and sort users
        let filtered = [...users];

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (user) =>
                    user.email.toLowerCase().includes(query) ||
                    user.user_metadata?.name?.toLowerCase().includes(query) ||
                    user.role?.toLowerCase().includes(query)
            );
        }

        // Sort
        filtered.sort((a, b) => {
            let aVal: any = a[sortField];
            let bVal: any = b[sortField];

            if (sortField === "created_at" || sortField === "last_sign_in_at" || sortField === "email_confirmed_at") {
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

        setFilteredUsers(filtered);
    }, [users, searchQuery, sortField, sortOrder]);

    const fetchUsers = async () => {
        try {
            setUsersLoading(true);
            const response = await fetch("/api/users");
            const data = await response.json();

            if (!response.ok) {
                console.error("Error fetching users:", data.error);
                setUsers([]);
            } else {
                // Fetch VIP status for each user
                const usersWithVIP = await Promise.all(
                    (data.users || []).map(async (user: UserAccount) => {
                        try {
                            const vipResponse = await fetch(`/api/vip/users/${user.id}`);
                            if (vipResponse.ok) {
                                const vipData = await vipResponse.json();
                                return {
                                    ...user,
                                    vipStatus: {
                                        isVip: vipData.isVip || false,
                                        expiresAt: vipData.expiresAt || null,
                                    },
                                };
                            }
                        } catch (err) {
                            console.error(`Error fetching VIP status for user ${user.id}:`, err);
                        }
                        return {
                            ...user,
                            vipStatus: {
                                isVip: false,
                                expiresAt: null,
                            },
                        };
                    })
                );
                setUsers(usersWithVIP);
            }
        } catch (err) {
            console.error("Error:", err);
            setUsers([]);
        } finally {
            setUsersLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        // Prevent deleting own account
        if (user && user.id === id) {
            alert("Bạn không thể xóa tài khoản của chính mình.");
            return;
        }

        if (!confirm("Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác.")) {
            return;
        }

        try {
            setDeleteLoading(id);
            const response = await fetch(`/api/users/${id}`, {
                method: "DELETE",
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("Error deleting user:", data.error);
                alert("Lỗi khi xóa người dùng: " + data.error);
            } else {
                setUsers(users.filter((u) => u.id !== id));
            }
        } catch (err) {
            console.error("Error:", err);
            alert("Lỗi khi xóa người dùng");
        } finally {
            setDeleteLoading(null);
        }
    };

    const handleEdit = (user: UserAccount) => {
        setSelectedUser(user);
        setShowEditModal(true);
    };

    const handleCreate = () => {
        setSelectedUser(null);
        setShowCreateModal(true);
    };

    const handleToggleVIP = async (userAccount: UserAccount) => {
        const newVipStatus = !userAccount.vipStatus?.isVip;
        const message = newVipStatus
            ? `Bạn có chắc chắn muốn thêm quyền VIP cho ${userAccount.email}?`
            : `Bạn có chắc chắn muốn hủy quyền VIP cho ${userAccount.email}?`;

        if (!confirm(message)) {
            return;
        }

        try {
            // Ask for expiration date if setting VIP
            let expiresAt: string | undefined = undefined;
            if (newVipStatus) {
                const days = prompt("Nhập số ngày VIP (để trống cho không giới hạn):");
                if (days && !isNaN(Number(days)) && Number(days) > 0) {
                    const expirationDate = new Date();
                    expirationDate.setDate(expirationDate.getDate() + Number(days));
                    expiresAt = expirationDate.toISOString();
                }
            }

            const response = await fetch(`/api/vip/users/${userAccount.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    isVip: newVipStatus,
                    expiresAt: expiresAt || null,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to update VIP status");
            }

            // Refresh users list
            fetchUsers();
        } catch (err: any) {
            console.error("Error updating VIP status:", err);
            alert("Lỗi khi cập nhật quyền VIP: " + err.message);
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
                        { label: "Quản lý Người dùng" },
                    ]}
                />

                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-heading font-bold text-black mb-2">
                            Quản lý Người dùng
                        </h1>
                        <p className="text-gray-600 font-body">
                            Quản lý tài khoản người dùng ({users.length} {users.length === 1 ? "người dùng" : "người dùng"}{searchQuery ? ` - ${filteredUsers.length} kết quả` : ""})
                        </p>
                    </div>
                    <button
                        onClick={handleCreate}
                        className="px-6 py-2 bg-black text-white rounded-md font-medium font-body hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-all"
                    >
                        + Tạo người dùng
                    </button>
                </div>

                {/* Search and Sort Controls */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo email, tên hoặc vai trò..."
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
                            <option value="email">Email</option>
                            <option value="last_sign_in_at">Lần đăng nhập cuối</option>
                            <option value="email_confirmed_at">Ngày xác thực</option>
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

                {usersLoading ? (
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
                ) : filteredUsers.length === 0 ? (
                    <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm text-center">
                        <p className="text-gray-600 font-body mb-4">
                            {searchQuery ? "Không tìm thấy kết quả." : "Chưa có người dùng nào."}
                        </p>
                        {!searchQuery && (
                            <button
                                onClick={handleCreate}
                                className="px-6 py-2 bg-black text-white rounded-md font-medium font-body hover:bg-gray-800 transition-all"
                            >
                                Tạo người dùng đầu tiên
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider font-body">
                                            Email
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider font-body">
                                            Vai trò
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider font-body">
                                            Đã xác thực
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider font-body">
                                            Lần đăng nhập cuối
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider font-body">
                                            Ngày tạo
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider font-body">
                                            VIP
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider font-body">
                                            Thao tác
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredUsers.map((userAccount) => (
                                        <tr key={userAccount.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-body">
                                                {userAccount.email}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-body">
                                                {userAccount.role || "authenticated"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-body">
                                                {userAccount.email_confirmed_at ? (
                                                    <span className="text-green-600">✓ Đã xác thực</span>
                                                ) : (
                                                    <span className="text-gray-400">Chưa xác thực</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-body">
                                                {userAccount.last_sign_in_at
                                                    ? new Date(userAccount.last_sign_in_at).toLocaleDateString("vi-VN")
                                                    : "Chưa đăng nhập"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-body">
                                                {new Date(userAccount.created_at).toLocaleDateString("vi-VN")}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-body">
                                                {userAccount.vipStatus?.isVip ? (
                                                    <div className="flex flex-col">
                                                        <span className="text-green-600 font-semibold">✓ VIP</span>
                                                        {userAccount.vipStatus.expiresAt && (
                                                            <span className="text-xs text-gray-500">
                                                                Hết hạn: {new Date(userAccount.vipStatus.expiresAt).toLocaleDateString("vi-VN")}
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium font-body">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEdit(userAccount)}
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                    >
                                                        Sửa
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleVIP(userAccount)}
                                                        className={`${userAccount.vipStatus?.isVip
                                                            ? "text-orange-600 hover:text-orange-900"
                                                            : "text-green-600 hover:text-green-900"
                                                            }`}
                                                    >
                                                        {userAccount.vipStatus?.isVip ? "Hủy VIP" : "Thêm VIP"}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(userAccount.id)}
                                                        disabled={deleteLoading === userAccount.id || user?.id === userAccount.id}
                                                        className="text-rose-600 hover:text-rose-900 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        title={user?.id === userAccount.id ? "Không thể xóa tài khoản của chính mình" : "Xóa người dùng"}
                                                    >
                                                        {deleteLoading === userAccount.id
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

                {/* Create User Modal */}
                {showCreateModal && (
                    <UserModal
                        user={null}
                        onClose={() => {
                            setShowCreateModal(false);
                            setSelectedUser(null);
                        }}
                        onSuccess={() => {
                            setShowCreateModal(false);
                            fetchUsers();
                        }}
                    />
                )}

                {/* Edit User Modal */}
                {showEditModal && selectedUser && (
                    <UserModal
                        user={selectedUser}
                        onClose={() => {
                            setShowEditModal(false);
                            setSelectedUser(null);
                        }}
                        onSuccess={() => {
                            setShowEditModal(false);
                            setSelectedUser(null);
                            fetchUsers();
                        }}
                    />
                )}
            </div>
        </main>
    );
}

// User Modal Component for Create/Edit
function UserModal({
    user,
    onClose,
    onSuccess,
}: {
    user: UserAccount | null;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [email, setEmail] = useState(user?.email || "");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (!email) {
            setError("Email là bắt buộc");
            return;
        }

        if (!user && !password) {
            setError("Mật khẩu là bắt buộc khi tạo người dùng mới");
            return;
        }

        if (password && password !== confirmPassword) {
            setError("Mật khẩu xác nhận không khớp");
            return;
        }

        if (password && password.length < 6) {
            setError("Mật khẩu phải có ít nhất 6 ký tự");
            return;
        }

        try {
            setLoading(true);

            if (user) {
                // Update user
                const updateData: any = { email };
                if (password) {
                    updateData.password = password;
                }

                const response = await fetch(`/api/users/${user.id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(updateData),
                });

                const data = await response.json();

                if (!response.ok) {
                    setError(data.error || "Lỗi khi cập nhật người dùng");
                    return;
                }

                onSuccess();
            } else {
                // Create user
                const response = await fetch("/api/users", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email,
                        password,
                    }),
                });

                const data = await response.json();

                if (!response.ok) {
                    setError(data.error || "Lỗi khi tạo người dùng");
                    return;
                }

                onSuccess();
            }
        } catch (err: any) {
            setError(err?.message || "Đã xảy ra lỗi");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-heading font-bold text-black">
                        {user ? "Sửa người dùng" : "Tạo người dùng mới"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 font-body">
                            Email <span className="text-rose-500">*</span>
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent font-body"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1 font-body">
                            Mật khẩu {!user && <span className="text-rose-500">*</span>}
                            {user && <span className="text-gray-500 text-xs">(Để trống nếu không đổi)</span>}
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent font-body"
                            required={!user}
                            minLength={6}
                        />
                    </div>

                    {!user && (
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1 font-body">
                                Xác nhận mật khẩu <span className="text-rose-500">*</span>
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent font-body"
                                required
                                minLength={6}
                            />
                        </div>
                    )}

                    {error && (
                        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-md text-sm font-body">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 font-body hover:bg-gray-50 transition-all"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-black text-white rounded-md font-body hover:bg-gray-800 disabled:opacity-50 transition-all"
                        >
                            {loading ? "Đang xử lý..." : user ? "Cập nhật" : "Tạo"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

