"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        let ticking = false;
        
        function onScroll() {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    setScrolled(window.scrollY > 20);
                    ticking = false;
                });
                ticking = true;
            }
        }
        
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // Khóa cuộn nền khi mở menu
    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "auto";
    }, [open]);

    // Check authentication
    useEffect(() => {
        let mounted = true;
        
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (mounted) {
                setUser(user);
                setLoading(false);
            }
        };

        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (!mounted) return;
            
            setUser(session?.user ?? null);
            // If signed out and on a protected page, redirect to home
            if (event === "SIGNED_OUT" && (pathname?.startsWith("/dashboard") ||
                pathname?.startsWith("/ads/new") ||
                pathname?.startsWith("/booking/manage"))) {
                router.push("/");
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, [pathname, router]);

    // Memoize scroll to hash function
    const scrollToHash = useCallback((hash: string) => {
        const element = document.querySelector(hash);
        if (element) {
            const navbarHeight = 80;
            const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
            const offsetPosition = elementPosition - navbarHeight;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
        }
    }, []);

    // Handle hash navigation on page load
    useEffect(() => {
        if (pathname === "/" && window.location.hash) {
            const hash = window.location.hash;
            // Wait for page to fully render
            const timeoutId = setTimeout(() => {
                scrollToHash(hash);
            }, 100);
            
            return () => clearTimeout(timeoutId);
        }
    }, [pathname, scrollToHash]);

    const handleLogout = useCallback(async () => {
        try {
            // Clear user state immediately for UI update
            setUser(null);

            // Sign out from Supabase
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error("Logout error:", error);
                // Re-check user if logout failed
                const { data: { user } } = await supabase.auth.getUser();
                setUser(user);
                return;
            }

            // Force redirect to home page, especially if on protected route
            window.location.href = "/";
        } catch (err) {
            console.error("Logout error:", err);
        }
    }, []);

    const publicNavLinks = useMemo(() => [
        { href: "#services", label: "Dịch vụ", isHash: true },
        { href: "#pricing", label: "Bảng giá", isHash: true },
        { href: "#booking", label: "Đặt lịch", isHash: true },
        { href: "/ads", label: "Quảng cáo", isHash: false },
    ], []);

    const adminNavLinks = useMemo(() => [
        { href: "/dashboard", label: "Dashboard", isHash: false },
        { href: "/ads/manage", label: "Quản lý Ads", isHash: false },
        { href: "/booking/manage", label: "Quản lý Booking", isHash: false },
    ], []);

    const navLinks = useMemo(() => user ? adminNavLinks : publicNavLinks, [user, adminNavLinks, publicNavLinks]);

    // Check if we're on a management page
    const isManagementPage = useMemo(() => 
        pathname?.startsWith("/dashboard") ||
        pathname?.startsWith("/ads/manage") ||
        pathname?.startsWith("/ads/new") ||
        (pathname?.startsWith("/ads/") && pathname?.includes("/edit")) ||
        pathname?.startsWith("/booking/manage") ||
        pathname === "/login",
        [pathname]
    );

    return (
        <header
            className={`fixed left-0 right-0 top-0 z-40 transition-all duration-500 ease-smooth ${isManagementPage || scrolled
                ? "bg-white/95 backdrop-blur-md border-b border-black/10 shadow-sm"
                : "bg-transparent"
                }`}
        >
            <div className="container-max mx-auto px-6 py-4 flex items-center justify-between">
                <Link
                    href="/"
                    className="font-heading text-lg tracking-wide text-black"
                    aria-label="Trang chủ"
                >
                    Tarot by Alex
                </Link>

                {/* Desktop nav */}
                <nav aria-label="Primary" className="hidden sm:flex items-center gap-6 text-sm text-zinc-800">
                    {navLinks.map((link) => {
                        if (link.isHash) {
                            return (
                                <a
                                    key={link.href}
                                    href={pathname === "/" ? link.href : `/${link.href}`}
                                    onClick={(e) => {
                                        if (pathname === "/") {
                                            e.preventDefault();
                                            scrollToHash(link.href);
                                        } else {
                                            e.preventDefault();
                                            router.push(`/${link.href}`);
                                        }
                                    }}
                                    className="relative group"
                                >
                                    {link.label}
                                    <span className="absolute left-0 bottom-0 w-0 h-[1.5px] bg-black transition-all duration-300 group-hover:w-full"></span>
                                </a>
                            );
                        }
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="relative group"
                            >
                                {link.label}
                                <span className="absolute left-0 bottom-0 w-0 h-[1.5px] bg-black transition-all duration-300 group-hover:w-full"></span>
                            </Link>
                        );
                    })}
                    {user ? (
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 text-sm text-zinc-800 hover:text-black border border-zinc-300 rounded-md hover:bg-zinc-50 transition-all"
                        >
                            Đăng xuất
                        </button>
                    ) : (
                        <Link
                            href="/login"
                            className="px-4 py-2 text-sm text-white bg-black rounded-md hover:bg-gray-800 transition-all"
                        >
                            Đăng nhập
                        </Link>
                    )}
                </nav>

                {/* Mobile nav */}
                <div className="sm:hidden text-black">
                    <button
                        onClick={() => setOpen((s) => !s)}
                        aria-label={open ? "Đóng menu" : "Mở menu"}
                        aria-expanded={open}
                        className="inline-flex items-center justify-center rounded-md p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                        <svg
                            width="26"
                            height="26"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden
                        >
                            {open ? (
                                <path
                                    d="M6 18L18 6M6 6l12 12"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            ) : (
                                <path
                                    d="M3 6h18M3 12h18M3 18h18"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            )}
                        </svg>
                    </button>

                    {/* Hiệu ứng xuất hiện của menu */}
                    <AnimatePresence>
                        {open && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                                className="absolute right-4 top-16 z-50 w-52 rounded-2xl bg-white shadow-xl border border-black/5"
                            >
                                <div className="flex flex-col p-2">
                                    {navLinks.map((link) => {
                                        if (link.isHash) {
                                            return (
                                                <a
                                                    key={link.href}
                                                    href={pathname === "/" ? link.href : `/${link.href}`}
                                                    onClick={(e) => {
                                                        if (pathname === "/") {
                                                            e.preventDefault();
                                                            scrollToHash(link.href);
                                                        } else {
                                                            e.preventDefault();
                                                            router.push(`/${link.href}`);
                                                        }
                                                        setOpen(false);
                                                    }}
                                                    className="px-4 py-3 text-sm rounded-lg hover:bg-zinc-100 transition-all"
                                                >
                                                    {link.label}
                                                </a>
                                            );
                                        }
                                        return (
                                            <Link
                                                key={link.href}
                                                href={link.href}
                                                onClick={() => setOpen(false)}
                                                className="px-4 py-3 text-sm rounded-lg hover:bg-zinc-100 transition-all"
                                            >
                                                {link.label}
                                            </Link>
                                        );
                                    })}
                                    {user ? (
                                        <button
                                            onClick={() => {
                                                handleLogout();
                                                setOpen(false);
                                            }}
                                            className="px-4 py-3 text-sm rounded-lg hover:bg-zinc-100 transition-all text-left border-t border-zinc-200 mt-2 pt-3"
                                        >
                                            Đăng xuất
                                        </button>
                                    ) : (
                                        <Link
                                            href="/login"
                                            onClick={() => setOpen(false)}
                                            className="px-4 py-3 text-sm rounded-lg hover:bg-zinc-100 transition-all text-center bg-black text-white mt-2"
                                        >
                                            Đăng nhập
                                        </Link>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
}
