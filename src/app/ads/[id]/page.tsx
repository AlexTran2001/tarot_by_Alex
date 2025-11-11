// app/ads/[id]/page.tsx

import { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import Image from "next/image";
import StructuredData from "@/components/StructuredData";
import { generateArticleSchema, generateBreadcrumbSchema } from "@/lib/seoUtils";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const { data: ad } = await supabase.from("ads").select("*").eq("id", id).single();

  if (!ad) {
    return {
      title: "Không tìm thấy",
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tarot-by-alex.vercel.app';
  const description = ad.content 
    ? ad.content.substring(0, 160).replace(/<[^>]*>/g, '') 
    : `Xem quảng cáo: ${ad.title}`;

  return {
    title: ad.title,
    description,
    openGraph: {
      title: ad.title,
      description,
      type: "article",
      url: `${siteUrl}/ads/${id}`,
      images: ad.image_url ? [
        {
          url: ad.image_url,
          width: 1200,
          height: 630,
          alt: ad.title,
        },
      ] : undefined,
      publishedTime: ad.created_at,
      modifiedTime: ad.updated_at || ad.created_at,
    },
    twitter: {
      card: "summary_large_image",
      title: ad.title,
      description,
      images: ad.image_url ? [ad.image_url] : undefined,
    },
    alternates: {
      canonical: `${siteUrl}/ads/${id}`,
    },
  };
}

export default async function AdDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { data: ad, error } = await supabase.from("ads").select("*").eq("id", id).single();

    if (error || !ad) {
        console.error("Error fetching ad:", error);
        return notFound();
    }

    const expired = ad.expire_at && new Date(ad.expire_at) < new Date();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tarot-by-alex.vercel.app';

    // Generate structured data
    const articleSchema = generateArticleSchema({
      title: ad.title,
      description: ad.content ? ad.content.substring(0, 200).replace(/<[^>]*>/g, '') : ad.title,
      url: `/ads/${id}`,
      image: ad.image_url || undefined,
      publishedTime: ad.created_at,
      modifiedTime: ad.updated_at || ad.created_at,
      author: "Alex",
    });

    const breadcrumbSchema = generateBreadcrumbSchema([
      { name: "Trang chủ", url: "/" },
      { name: "Quảng cáo", url: "/ads" },
      { name: ad.title, url: `/ads/${id}` },
    ]);

    return (
        <>
          <StructuredData data={[articleSchema, breadcrumbSchema]} />
          <main className="min-h-screen px-4 pt-24 pb-12 bg-white">
              <div className="container-max mx-auto">
              <article className="max-w-3xl mx-auto" itemScope itemType="https://schema.org/Article">
                  <header className="mb-6">
                    <h1 className="text-3xl md:text-4xl font-heading font-bold mb-3" itemProp="headline">{ad.title}</h1>
                    {expired && (
                      <div className="inline-block px-3 py-1 bg-rose-100 text-rose-700 text-sm rounded-md mb-3 font-body">
                        Bài đã hết hạn
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-600 font-body mb-4">
                      <time dateTime={ad.created_at} itemProp="datePublished">
                        {new Date(ad.created_at).toLocaleDateString("vi-VN", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </time>
                      {ad.updated_at && ad.updated_at !== ad.created_at && (
                        <time dateTime={ad.updated_at} itemProp="dateModified">
                          (Cập nhật: {new Date(ad.updated_at).toLocaleDateString("vi-VN")})
                        </time>
                      )}
                    </div>
                    <meta itemProp="author" content="Alex" />
                  </header>
                  {ad.image_url && (
                      <div className="relative w-full h-96 mb-6 rounded-lg overflow-hidden shadow-md">
                          <Image 
                              src={ad.image_url} 
                              alt={`${ad.title} - Quảng cáo từ Tarot by Alex`}
                              itemProp="image"
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, 768px"
                              priority
                          />
                      </div>
                  )}
                  <div 
                    className="prose prose-lg max-w-none font-body text-gray-700 leading-relaxed" 
                    itemProp="articleBody"
                    dangerouslySetInnerHTML={{ __html: ad.content || '' }}
                  />
              </article>
              </div>
          </main>
        </>
    );
}
