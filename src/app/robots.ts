import { MetadataRoute } from 'next';

// Get site URL from environment variable or use default
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tarot-by-alex.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*', // Apply to all search engine crawlers
        allow: '/', // Allow crawling of the root and all public pages
        disallow: [
          '/api/', // API routes - no need to index
          '/admin/', // Admin pages - protected, should not be indexed
          '/dashboard/', // Admin dashboard - protected
          '/vip/', // VIP pages - protected, requires authentication
          '/booking/manage/', // Admin-only booking management
          '/users/manage/', // Admin-only user management
          '/ads/manage/', // Admin-only ads management
          '/ads/new/', // Admin-only - creating new ads
          '/ads/*/edit/', // Admin-only - editing ads
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`, // Location of the sitemap
  };
}

