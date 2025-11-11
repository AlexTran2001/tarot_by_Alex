// app/ads/page.tsx
import { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import CardAd from "@/components/ads/CardAd";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export const metadata: Metadata = {
  title: "Quảng cáo",
  description:
    "Xem các bài quảng cáo và thông báo mới nhất từ Tarot by Alex. Cập nhật về dịch vụ, sự kiện và các chương trình đặc biệt.",
  keywords: ["quảng cáo", "thông báo", "sự kiện", "tarot by alex", "tin tức"],
  openGraph: {
    title: "Quảng cáo | Tarot by Alex",
    description: "Xem các bài quảng cáo và thông báo mới nhất từ Tarot by Alex.",
    type: "website",
  },
  alternates: {
    canonical: "/ads",
  },
};

export default async function AdsPage() {
    const { data: ads, error } = await supabase
        .from("ads")
        .select("*")
        .or(`expire_at.is.null,expire_at.gt.${new Date().toISOString()}`)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching ads:", error);
    }

    return (
        <main className="min-h-screen px-4 pt-24 pb-12 bg-white">
            <div className="container-max mx-auto">
                <header className="mb-8">
                    <h1 className="text-4xl font-heading font-bold text-black mb-2">Quảng cáo</h1>
                    <p className="text-gray-600 font-body mb-6">
                        Xem các quảng cáo và thông báo mới nhất từ Tarot by Alex
                    </p>
                </header>
            {ads && ads.length > 0 ? (
                <div className="grid md:grid-cols-3 gap-6" role="list">
                    {ads.map((ad: any) => (
                        <article key={ad.id} role="listitem">
                            <CardAd ad={ad} />
                        </article>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-gray-600 font-body">Hiện tại không có quảng cáo nào.</p>
                </div>
            )}
            </div>
        </main>
    );
}
