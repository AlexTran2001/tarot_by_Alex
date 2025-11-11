"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import { checkIsAdmin } from "@/lib/adminUtils";
import { useVIP } from "@/hooks/useVIP";

export default function NotFound() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { isVip } = useVIP();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    checkUser();
  }, []);

  const isAdmin = user ? checkIsAdmin(user) : false;

  return (
    <main className="min-h-screen flex items-center justify-center pt-24 pb-12 bg-white px-4">
      <div className="container-max mx-auto max-w-2xl text-center">
        {/* 404 Visual */}
        <div className="mb-8">
          <h1 className="text-9xl md:text-[12rem] font-heading font-bold text-black leading-none mb-4">
            404
          </h1>
          <div className="w-24 h-1 bg-black mx-auto mb-6"></div>
        </div>

        {/* Message */}
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-black mb-4">
            Trang không tìm thấy
          </h2>
          <p className="text-lg text-gray-600 font-body leading-relaxed max-w-md mx-auto">
            Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển. 
            Hãy quay lại trang chủ hoặc sử dụng các liên kết bên dưới.
          </p>
        </div>

        {/* Navigation Links */}
        <div className="space-y-4 mb-12">
          {/* Primary Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-block px-8 py-3 bg-black text-white rounded-full text-sm font-medium font-body hover:bg-gray-800 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
            >
              Về trang chủ
            </Link>
            <Link
              href="/#booking"
              className="inline-block px-8 py-3 border-2 border-black text-black rounded-full text-sm font-medium font-body hover:bg-black hover:text-white transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
            >
              Đặt lịch Tarot
            </Link>
          </div>

          {/* User-specific Links */}
          {!loading && (
            <div className="pt-8 border-t border-gray-200">
              {user ? (
                <div className="space-y-4">
                  {isVip && (
                    <div>
                      <p className="text-sm text-gray-600 font-body mb-3">
                        Bạn là thành viên VIP
                      </p>
                      <Link
                        href="/vip/dashboard"
                        className="inline-block px-6 py-2 text-black border border-gray-300 rounded-md text-sm font-medium font-body hover:bg-gray-50 transition-all focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                      >
                        VIP Dashboard →
                      </Link>
                    </div>
                  )}
                  {isAdmin && (
                    <div>
                      <p className="text-sm text-gray-600 font-body mb-3">
                        Bạn là quản trị viên
                      </p>
                      <Link
                        href="/dashboard"
                        className="inline-block px-6 py-2 text-black border border-gray-300 rounded-md text-sm font-medium font-body hover:bg-gray-50 transition-all focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                      >
                        Admin Dashboard →
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-600 font-body mb-3">
                    Bạn chưa đăng nhập
                  </p>
                  <Link
                    href="/login"
                    className="inline-block px-6 py-2 text-black border border-gray-300 rounded-md text-sm font-medium font-body hover:bg-gray-50 transition-all focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                  >
                    Đăng nhập →
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Common Links */}
          <div className="pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-600 font-body mb-4">
              Các trang phổ biến
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/ads"
                className="text-gray-600 hover:text-black text-sm font-body underline-offset-4 hover:underline transition-colors"
              >
                Quảng cáo
              </Link>
              <Link
                href="/#services"
                className="text-gray-600 hover:text-black text-sm font-body underline-offset-4 hover:underline transition-colors"
              >
                Dịch vụ
              </Link>
              <Link
                href="/#about"
                className="text-gray-600 hover:text-black text-sm font-body underline-offset-4 hover:underline transition-colors"
              >
                Giới thiệu
              </Link>
              <Link
                href="/#pricing"
                className="text-gray-600 hover:text-black text-sm font-body underline-offset-4 hover:underline transition-colors"
              >
                Bảng giá
              </Link>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-black text-sm font-body underline-offset-4 hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 rounded"
          >
            ← Quay lại trang trước
          </button>
        </div>

        {/* Decorative Element */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <p className="text-xs text-gray-500 font-body">
            Tarot by Alex — Trải nghiệm xem bài Tarot chuyên nghiệp & tinh tế
          </p>
        </div>
      </div>
    </main>
  );
}

