// components/ads/CardAd.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function CardAd({ ad }: { ad: any }) {
    const [imageError, setImageError] = useState(false);

    return (
        <Link href={`/ads/${ad.id}`} className="block group">
            <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition transform group-hover:-translate-y-1">
                {ad.image_url && !imageError ? (
                    <div className="relative w-full h-48">
                        <Image
                            src={ad.image_url}
                            alt={ad.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            onError={() => {
                                console.error("Image load error for ad:", ad.id, ad.image_url);
                                setImageError(true);
                            }}
                        />
                    </div>
                ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-sm">Không có ảnh</span>
                    </div>
                )}
                <div className="p-4">
                    <h3 className="font-semibold mb-2">{ad.title}</h3>
                    <p className="text-sm text-zinc-600 line-clamp-3">{ad.content}</p>
                    <div className="mt-3 text-xs text-zinc-500">Hết hạn: {ad.expire_at ? new Date(ad.expire_at).toLocaleString() : "Không"}</div>
                </div>
            </div>
        </Link>
    );
}
