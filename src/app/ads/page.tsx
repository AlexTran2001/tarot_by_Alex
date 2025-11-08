// app/ads/page.tsx
import { createClient } from "@supabase/supabase-js";
import CardAd from "@/components/ads/CardAd";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default async function AdsPage() {
    const { data: ads, error } = await supabase
        .from("ads")
        .select("*")
        .or(`expire_at.is.null,expire_at.gt.${new Date().toISOString()}`)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching ads:", error);
    }

    // Debug: log ads data
    if (ads) {
        console.log("Fetched ads:", ads.map((ad: any) => ({ id: ad.id, title: ad.title, image_url: ad.image_url })));
    }

    return (
        <main className="min-h-screen px-4 pt-24 pb-12 bg-white">
            <div className="container-max mx-auto">
                <h1 className="text-4xl font-heading font-bold text-black mb-2">Quảng cáo</h1>
                <p className="text-gray-600 font-body mb-6">Xem các quảng cáo hiện có</p>
            {ads && ads.length > 0 ? (
                <div className="grid md:grid-cols-3 gap-6">
                    {ads.map((ad: any) => (
                        <CardAd key={ad.id} ad={ad} />
                    ))}
                </div>
            ) : (
                <p className="text-gray-600">Không có quảng cáo nào.</p>
            )}
            </div>
        </main>
    );
}
