"use client";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function TransitionProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    
    // Skip transitions for management pages to prevent double renders
    const isManagementPage = pathname?.startsWith("/dashboard") || 
                             pathname?.startsWith("/ads/manage") ||
                             pathname?.startsWith("/ads/new") || 
                             (pathname?.startsWith("/ads/") && pathname?.includes("/edit")) ||
                             pathname?.startsWith("/booking/manage") ||
                             pathname === "/login";

    if (isManagementPage) {
        return <>{children}</>;
    }

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}
