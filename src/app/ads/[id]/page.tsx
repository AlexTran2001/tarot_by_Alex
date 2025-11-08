// app/ads/[id]/page.tsx

import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default async function AdDetail({ params }: { params: { id: string } }) {
    const { id } = await params;
    const { data: ad, error } = await supabase.from("ads").select("*").eq("id", id).single();

    if (error || !ad) {
        console.error("Error fetching ad:", error);
        return notFound();
    }

    const expired = ad.expire_at && new Date(ad.expire_at) < new Date();

    return (
        <main className="min-h-screen px-4 pt-24 pb-12 bg-white">
            <div className="container-max mx-auto">
            <article className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-heading mb-3">{ad.title}</h1>
                {expired && <div className="text-sm text-rose-500 mb-3">Bài đã hết hạn</div>}
                {ad.image_url && (
                    <img 
                        src={ad.image_url} 
                        alt={ad.title} 
                        className="w-full rounded mb-4 object-cover"
                        onError={(e) => {
                            console.error("Image load error:", ad.image_url);
                            (e.target as HTMLImageElement).style.display = 'none';
                        }}
                    />
                )}
                <div className="prose max-w-none">{ad.content}</div>
            </article>
            </div>
        </main>
    );
}
