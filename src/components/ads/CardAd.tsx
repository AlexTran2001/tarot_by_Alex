// components/ads/CardAd.tsx
"use client";

import Link from "next/link";
import { useState } from "react";

export default function CardAd({ ad }: { ad: any }) {
    const [imageError, setImageError] = useState(false);

    return (
        <Link href={`/ads/${ad.id}`} className="block group">
            <div className="bg-white dark:bg-zinc-800 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition transform group-hover:-translate-y-1">
                {ad.image_url && !imageError ? (
                    <img
                        src={ad.image_url}
                        alt={ad.title}
                        className="w-full h-48 object-cover"
                        onError={() => {
                            console.error("Image load error for ad:", ad.id, ad.image_url);
                            setImageError(true);
                        }}
                    />
                ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-sm">Không có ảnh</span>
                    </div>
                )}
                <div className="p-4">
                    <h3 className="font-semibold mb-2">{ad.title}</h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-300 line-clamp-3">{ad.content}</p>
                    <div className="mt-3 text-xs text-zinc-500">Hết hạn: {ad.expire_at ? new Date(ad.expire_at).toLocaleString() : "Không"}</div>
                </div>
            </div>
        </Link>
    );
}
