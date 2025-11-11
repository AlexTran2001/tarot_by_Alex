"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import Breadcrumb from "@/components/Breadcrumb";
import { checkIsAdmin } from "@/lib/adminUtils";
import { useVIP } from "@/hooks/useVIP";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { isVip } = useVIP();

  useEffect(() => {
    let mounted = true;

    // Listen for auth changes (fires immediately with current session)
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
        
        // Redirect VIP users to VIP dashboard
        if (mounted && session.user && !checkIsAdmin(session.user)) {
          // Check VIP status and redirect if VIP
          // This will be handled after VIP status loads
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  // Redirect non-admin users
  useEffect(() => {
    if (!loading && user) {
      const isAdmin = checkIsAdmin(user);
      if (!isAdmin) {
        // If VIP, redirect to VIP dashboard
        if (isVip) {
          router.push("/vip/dashboard");
          return;
        }
        // If not VIP and not admin, redirect to home
        router.push("/");
        return;
      }
    }
  }, [user, loading, isVip, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Đang tải..." />;
  }

  // Only show dashboard to admin users
  if (!loading && user && !checkIsAdmin(user)) {
    return null; // Will redirect in useEffect
  }

  return (
    <main className="min-h-screen px-4 pt-24 pb-12 bg-white">
      <div className="container-max mx-auto">
        <Breadcrumb items={[{ label: "Dashboard" }]} />
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-heading font-bold text-black mb-2">Bảng điều khiển</h1>
            <p className="text-gray-600 font-body">
              Chào mừng, {user?.email || "Người dùng"}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-black text-white rounded-md font-medium font-body hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-all"
          >
            Đăng xuất
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/ads/manage"
            className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-all hover:border-black"
          >
            <h3 className="text-xl font-heading font-bold text-black mb-2">Quản lý Ads</h3>
            <p className="text-gray-600 font-body text-sm mb-4">Tạo và quản lý các bài quảng cáo</p>
            <span className="text-black font-body text-sm font-medium">Xem chi tiết →</span>
          </Link>

          <Link
            href="/booking/manage"
            className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-all hover:border-black"
          >
            <h3 className="text-xl font-heading font-bold text-black mb-2">Quản lý Booking</h3>
            <p className="text-gray-600 font-body text-sm mb-4">Xem và quản lý các đặt lịch Tarot</p>
            <span className="text-black font-body text-sm font-medium">Xem chi tiết →</span>
          </Link>

          <Link
            href="/users/manage"
            className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-all hover:border-black"
          >
            <h3 className="text-xl font-heading font-bold text-black mb-2">Quản lý Người dùng</h3>
            <p className="text-gray-600 font-body text-sm mb-4">Quản lý tài khoản người dùng</p>
            <span className="text-black font-body text-sm font-medium">Xem chi tiết →</span>
          </Link>

          <Link
            href="/admin/magazines/manage"
            className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-all hover:border-black"
          >
            <h3 className="text-xl font-heading font-bold text-black mb-2">Quản lý Tạp Chí</h3>
            <p className="text-gray-600 font-body text-sm mb-4">Tạo và quản lý các bài tạp chí VIP</p>
            <span className="text-black font-body text-sm font-medium">Xem chi tiết →</span>
          </Link>

          <Link
            href="/admin/daily-cards/manage"
            className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-all hover:border-black"
          >
            <h3 className="text-xl font-heading font-bold text-black mb-2">Quản lý Bài Tarot Hôm Nay</h3>
            <p className="text-gray-600 font-body text-sm mb-4">Tạo và quản lý các bài Tarot hàng ngày</p>
            <span className="text-black font-body text-sm font-medium">Xem chi tiết →</span>
          </Link>

          <Link
            href="/admin/lessons/manage"
            className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-all hover:border-black"
          >
            <h3 className="text-xl font-heading font-bold text-black mb-2">Quản lý Khóa Học</h3>
            <p className="text-gray-600 font-body text-sm mb-4">Tạo và quản lý các khóa học VIP</p>
            <span className="text-black font-body text-sm font-medium">Xem chi tiết →</span>
          </Link>

          <Link
            href="/admin/tarot-decks/manage"
            className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-all hover:border-black"
          >
            <h3 className="text-xl font-heading font-bold text-black mb-2">Quản lý Bộ bài Tarot</h3>
            <p className="text-gray-600 font-body text-sm mb-4">Tạo và quản lý các bộ bài Tarot và lá bài</p>
            <span className="text-black font-body text-sm font-medium">Xem chi tiết →</span>
          </Link>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
          <h2 className="text-2xl font-heading font-bold text-black mb-4">Thông tin tài khoản</h2>
          <div className="space-y-4 font-body">
            <div>
              <p className="text-sm text-gray-600 mb-1">Email</p>
              <p className="text-black">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">ID người dùng</p>
              <p className="text-black text-sm font-mono break-all">{user?.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Đã xác thực</p>
              <p className="text-black">{user?.email_confirmed_at ? "Có" : "Chưa"}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

