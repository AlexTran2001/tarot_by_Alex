"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        function onScroll() {
            setScrolled(window.scrollY > 20);
        }
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // Khóa cuộn nền khi mở menu
    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "auto";
    }, [open]);

    const navLinks = [
        { href: "#services", label: "Dịch vụ" },
        { href: "#pricing", label: "Bảng giá" },
        { href: "#booking", label: "Đặt lịch" },
    ];

    return (
        <header
            className={`fixed left-0 right-0 top-0 z-40 transition-all duration-500 ease-smooth ${scrolled
                    ? "bg-white/80 backdrop-blur-md border-b border-black/5 shadow-sm"
                    : "bg-transparent"
                }`}
        >
            <div className="container-max mx-auto px-6 py-4 flex items-center justify-between">
                <a
                    href="#"
                    className="font-heading text-lg tracking-wide text-black"
                    aria-label="Trang chủ"
                >
                    Tarot by Alex
                </a>

                {/* Desktop nav */}
                <nav aria-label="Primary" className="hidden sm:flex gap-6 text-sm text-zinc-800">
                    {navLinks.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            className="relative group"
                        >
                            {link.label}
                            <span className="absolute left-0 bottom-0 w-0 h-[1.5px] bg-black transition-all duration-300 group-hover:w-full"></span>
                        </a>
                    ))}
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
                                    {navLinks.map((link) => (
                                        <a
                                            key={link.href}
                                            href={link.href}
                                            onClick={() => setOpen(false)}
                                            className="px-4 py-3 text-sm rounded-lg hover:bg-zinc-100 transition-all"
                                        >
                                            {link.label}
                                        </a>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
}
