"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useVIP } from "@/hooks/useVIP";
import { supabase } from "@/lib/supabaseClient";
import Breadcrumb from "@/components/Breadcrumb";
import LoadingSpinner from "@/components/LoadingSpinner";
import Image from "next/image";

interface Magazine {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  published_at: string;
  created_at: string;
}

export default function MagazineDetailPage() {
  const { user, isVip, loading } = useVIP();
  const router = useRouter();
  const params = useParams();
  const magazineId = params?.id as string;
  const [magazine, setMagazine] = useState<Magazine | null>(null);
  const [magazineLoading, setMagazineLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    if (!user || !isVip || !magazineId) return;

    const fetchMagazine = async () => {
      try {
        setMagazineLoading(true);
        setError(null);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setError("Phiên đăng nhập đã hết hạn");
          return;
        }

        // Fetch magazine using Supabase client (respects RLS)
        const { data, error: fetchError } = await supabase
          .from("magazines")
          .select("*")
          .eq("id", magazineId)
          .single();

        if (fetchError || !data) {
          throw new Error("Không tìm thấy bài viết");
        }

        setMagazine(data);
      } catch (err: any) {
        console.error("Error fetching magazine:", err);
        setError(err.message || "Đã xảy ra lỗi khi tải bài viết");
      } finally {
        setMagazineLoading(false);
      }
    };

    fetchMagazine();
  }, [user, isVip, magazineId]);

  if (loading || magazineLoading) {
    return <LoadingSpinner fullScreen text="Đang tải bài viết..." />;
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
            { label: "Tạp Chí Tarot", href: "/vip/magazines" },
            { label: magazine?.title || "Bài viết" },
          ]}
        />

        {error ? (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-md text-sm font-body">
            {error}
          </div>
        ) : magazine ? (
          <article className="max-w-4xl mx-auto">
            <header className="mb-8">
              <h1 className="text-4xl font-heading font-bold text-black mb-4">
                {magazine.title}
              </h1>
              <p className="text-gray-600 font-body">
                {new Date(magazine.published_at || magazine.created_at).toLocaleDateString(
                  "vi-VN",
                  {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )}
              </p>
            </header>

            {magazine.image_url && (
              <div className="relative w-full h-96 mb-8 rounded-lg overflow-hidden">
                <Image
                  src={magazine.image_url}
                  alt={magazine.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 1024px"
                />
              </div>
            )}

            <div
              className="prose max-w-none font-body text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: magazine.content }}
            />
          </article>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-600 font-body">
              Không tìm thấy bài viết.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

