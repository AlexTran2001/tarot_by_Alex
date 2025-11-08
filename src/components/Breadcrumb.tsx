"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
    const pathname = usePathname();

    return (
        <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center space-x-2 text-sm font-body">
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;
                    
                    return (
                        <li key={index} className="flex items-center">
                            {index > 0 && (
                                <svg
                                    className="w-4 h-4 text-gray-400 mx-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5l7 7-7 7"
                                    />
                                </svg>
                            )}
                            {isLast ? (
                                <span className="text-gray-900 font-medium">{item.label}</span>
                            ) : item.href ? (
                                <Link
                                    href={item.href}
                                    className="text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                    {item.label}
                                </Link>
                            ) : (
                                <span className="text-gray-600">{item.label}</span>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}

