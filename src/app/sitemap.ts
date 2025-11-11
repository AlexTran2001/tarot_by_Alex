import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

// Get site URL from environment variable or use default
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tarot-by-alex.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Initialize Supabase client for fetching ads
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Static pages with high priority
  // Priority: 1.0 (highest) = Home page, 0.8 = Important pages, 0.5 = Less important
  // ChangeFrequency: 'daily' = Frequently updated, 'weekly' = Regular updates, 'monthly' = Rarely updated
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0, // Home page - highest priority
    },
    {
      url: `${siteUrl}/ads`,
      lastModified: new Date(),
      changeFrequency: 'daily', // Ads page updates frequently with new ads
      priority: 0.8, // High priority - important for SEO
    },
    {
      url: `${siteUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly', // Login page rarely changes
      priority: 0.5, // Lower priority - less important for SEO
    },
  ];

  // Fetch active ads (not expired)
  try {
    const { data: ads, error } = await supabase
      .from('ads')
      .select('id, updated_at, expire_at')
      .or(`expire_at.is.null,expire_at.gt.${new Date().toISOString()}`)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching ads for sitemap:', error);
      // Return static pages only if there's an error
      return staticPages;
    }

    // Create sitemap entries for active ads (only non-expired ads)
    // These pages have medium priority and update weekly
    const adPages: MetadataRoute.Sitemap =
      ads?.map((ad) => ({
        url: `${siteUrl}/ads/${ad.id}`,
        lastModified: ad.updated_at ? new Date(ad.updated_at) : new Date(),
        changeFrequency: 'weekly' as const, // Ads may be updated occasionally
        priority: 0.7, // Medium priority - important but not as critical as main pages
      })) || [];

    // Combine static and dynamic pages
    return [...staticPages, ...adPages];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return static pages only if there's an error
    return staticPages;
  }
}

