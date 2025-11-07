"use client";

import { useEffect, useState } from "react";

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

    return (
        <header
            className={`fixed left-0 right-0 top-0 z-40 transition-colors duration-250 ease-smooth ${scrolled ? "bg-white/80 backdrop-blur-sm border-b border-black/5" : "bg-transparent"
                }`}
        >
            <div className="container-max mx-auto px-6 py-4 flex items-center justify-between">
                <a href="#" className="font-heading text-lg tracking-wide text-black" aria-label="Trang chủ">
                    Tarot by Alex
                </a>


                <nav aria-label="Primary" className="hidden sm:flex gap-6 text-sm">
                    <a href="#services" className="hover:underline">Dịch vụ</a>
                    <a href="#pricing" className="hover:underline">Bảng giá</a>
                    <a href="#booking" className="hover:underline">Đặt lịch</a>
                </nav>

                {/* Mobile menu */}
                <div className="sm:hidden text-black">
                    <button
                        onClick={() => setOpen((s) => !s)}
                        aria-label={open ? "Đóng menu" : "Mở menu"}
                        aria-expanded={open}
                        className="inline-flex items-center justify-center rounded-md p-2 text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                    >
                        <svg
                            width="24"
                            height="24"
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
                    {open && (
                        <div className="absolute right-4 top-16 z-50 w-48 rounded-md bg-white shadow-md border border-black/5">
                            <div className="flex flex-col p-2">
                                <a href="#services" className="px-3 py-2 text-sm" onClick={() => setOpen(false)}>Dịch vụ</a>
                                <a href="#pricing" className="px-3 py-2 text-sm" onClick={() => setOpen(false)}>Bảng giá</a>
                                <a href="#booking" className="px-3 py-2 text-sm" onClick={() => setOpen(false)}>Đặt lịch</a>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
