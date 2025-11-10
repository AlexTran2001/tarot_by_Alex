"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import FormTarotCard from "@/components/admin/FormTarotCard";
import Breadcrumb from "@/components/Breadcrumb";
import { checkIsAdmin } from "@/lib/adminUtils";

export default function NewTarotCardPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [deck, setDeck] = useState<{ id: string; name: string } | null>(null);
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
        }
    }, [user, id, router]);

    // Redirect non-admin users
    useEffect(() => {
        if (!loading && user && !checkIsAdmin(user)) {
            router.push("/");
        }
    }, [user, loading, router]);

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
                        { label: "Quản lý lá bài", href: `/admin/tarot-decks/${id}/cards/manage` },
                        { label: "Tạo mới" }
                    ]} 
                />
                <div className="mb-8">
                    <h1 className="text-4xl font-heading font-bold text-black mb-2">Tạo lá bài Tarot mới</h1>
                    <p className="text-gray-600 font-body">Tạo lá bài Tarot mới trong bộ bài {deck?.name || ""}</p>
                </div>
                <FormTarotCard deckId={id} />
            </div>
        </main>
    );
}

