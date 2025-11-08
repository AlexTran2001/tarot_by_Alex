// app/ads/new/page.tsx
import FormAd from "@/components/ads/FormAd";
import Breadcrumb from "@/components/Breadcrumb";

export default function NewAdPage() {
    return (
        <main className="min-h-screen px-4 pt-24 pb-12 bg-white">
            <div className="container-max mx-auto">
                <Breadcrumb 
                    items={[
                        { label: "Dashboard", href: "/dashboard" },
                        { label: "Quản lý Ads", href: "/ads/manage" },
                        { label: "Tạo mới" }
                    ]} 
                />
                <div className="mb-8">
                    <h1 className="text-4xl font-heading font-bold text-black mb-2">Đăng quảng cáo mới</h1>
                    <p className="text-gray-600 font-body">Tạo và đăng bài quảng cáo mới</p>
                </div>
                <FormAd />
            </div>
        </main>
    );
}
