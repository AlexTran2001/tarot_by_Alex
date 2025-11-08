"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import FormAd from "@/components/ads/FormAd";
import Breadcrumb from "@/components/Breadcrumb";

export default function EditAdPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;

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
                        { label: "Quản lý Ads", href: "/ads/manage" },
                        { label: "Chỉnh sửa" },
                    ]}
                />
                <div className="mb-8">
                    <h1 className="text-4xl font-heading font-bold text-black mb-2">
                        Chỉnh sửa quảng cáo
                    </h1>
                    <p className="text-gray-600 font-body">Cập nhật thông tin quảng cáo</p>
                </div>
                <FormAd adId={id} />
            </div>
        </main>
    );
}

