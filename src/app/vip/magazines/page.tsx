"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useVIP } from "@/hooks/useVIP";
import { supabase } from "@/lib/supabaseClient";
import Breadcrumb from "@/components/Breadcrumb";
import Image from "next/image";

interface Magazine {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  published_at: string;
  created_at: string;
}

export default function MagazinesPage() {
  const { user, isVip, loading } = useVIP();
  const router = useRouter();
  const [magazines, setMagazines] = useState<Magazine[]>([]);
  const [magazinesLoading, setMagazinesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }
    if (!loading && user && !isVip) {
      router.push("/dashboard");
      return;
    }
  }, [user, isVip, loading, router]);

  useEffect(() => {
    if (!user || !isVip) return;

    const fetchMagazines = async () => {
      try {
        setMagazinesLoading(true);
        setError(null);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setError("Phiên đăng nhập đã hết hạn");
          return;
        }

        const response = await fetch(`/api/vip/magazines?page=${page}&limit=10`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch magazines");
        }

        const data = await response.json();
        setMagazines(data.magazines || []);
        setTotalPages(data.pagination?.totalPages || 1);
      } catch (err: any) {
        console.error("Error fetching magazines:", err);
        setError(err.message || "Đã xảy ra lỗi khi tải tạp chí");
      } finally {
        setMagazinesLoading(false);
      }
    };

    fetchMagazines();
  }, [user, isVip, page]);

  if (loading || magazinesLoading) {
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
          <p className="text-gray-600 font-body">Đang tải tạp chí...</p>
        </div>
      </main>
    );
  }

  if (!loading && user && !isVip) {
    return null; // Will redirect in useEffect
  }

  if (!isVip) {
    return null;
  }

  return (
    <main className="min-h-screen px-4 pt-24 pb-12 bg-white">
      <div className="container-max mx-auto">
        <Breadcrumb
          items={[
            { label: "VIP Dashboard", href: "/vip/dashboard" },
            { label: "Tạp Chí Tarot" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold text-black mb-2">
            Tạp Chí Tarot
          </h1>
          <p className="text-gray-600 font-body">
            Khám phá các bài viết chuyên sâu về Tarot và tâm linh
          </p>
        </div>

        {error ? (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-md text-sm font-body">
            {error}
          </div>
        ) : magazines.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-600 font-body">
              Chưa có bài viết nào. Vui lòng quay lại sau.
            </p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {magazines.map((magazine) => (
                <Link
                  key={magazine.id}
                  href={`/vip/magazines/${magazine.id}`}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all hover:border-black"
                >
                  {magazine.image_url && (
                    <div className="relative w-full h-48">
                      <Image
                        src={magazine.image_url}
                        alt={magazine.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="text-lg font-heading font-bold text-black mb-2 line-clamp-2">
                      {magazine.title}
                    </h3>
                    <p className="text-sm text-gray-600 font-body line-clamp-3 mb-3">
                      {magazine.content.substring(0, 150)}...
                    </p>
                    <p className="text-xs text-gray-500 font-body">
                      {new Date(magazine.published_at || magazine.created_at).toLocaleDateString(
                        "vi-VN"
                      )}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed font-body hover:bg-gray-50"
                >
                  Trước
                </button>
                <span className="px-4 py-2 font-body">
                  Trang {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed font-body hover:bg-gray-50"
                >
                  Sau
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

