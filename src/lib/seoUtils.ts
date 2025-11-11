/**
 * SEO utility functions for generating metadata and structured data
 */

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tarot-by-alex.vercel.app';
const siteName = 'Tarot by Alex';

export interface SEOConfig {
  title: string;
  description: string;
  url?: string;
  image?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  keywords?: string[];
  noindex?: boolean;
}

/**
 * Generates metadata for a page
 */
export function generateMetadata(config: SEOConfig) {
  const {
    title,
    description,
    url,
    image,
    type = 'website',
    publishedTime,
    modifiedTime,
    author,
    keywords,
    noindex = false,
  } = config;

  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;
  const pageUrl = url ? `${siteUrl}${url}` : siteUrl;
  const ogImage = image || `${siteUrl}/og-image.jpg`; // You should create this image

  return {
    title: fullTitle,
    description,
    keywords: keywords?.join(', '),
    authors: author ? [{ name: author }] : undefined,
    openGraph: {
      title: fullTitle,
      description,
      url: pageUrl,
      siteName,
      locale: 'vi_VN',
      type,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      publishedTime,
      modifiedTime,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [ogImage],
      site: '@tarotbyalex',
    },
    robots: {
      index: !noindex,
      follow: !noindex,
    },
    alternates: {
      canonical: pageUrl,
    },
  };
}

/**
 * Generates Organization structured data (JSON-LD)
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteName,
    url: siteUrl,
    logo: `${siteUrl}/logo.jpg`,
    description:
      'Trải nghiệm xem bài Tarot chuyên nghiệp, tinh tế và chuẩn xác cùng Tarot by Alex — nơi bạn tìm thấy bình an, thấu hiểu và định hướng cho tình yêu, công việc, sự nghiệp và tâm linh.',
    sameAs: [
      // Add your social media URLs here
      // 'https://www.facebook.com/tarotbyalex',
      // 'https://www.instagram.com/tarotbyalex',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      availableLanguage: 'Vietnamese',
    },
  };
}

/**
 * Generates WebSite structured data (JSON-LD)
 */
export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: siteUrl,
    description:
      'Trải nghiệm xem bài Tarot chuyên nghiệp, tinh tế và chuẩn xác cùng Tarot by Alex.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/ads?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Generates Service structured data (JSON-LD)
 */
export function generateServiceSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'Tarot Reading',
    provider: {
      '@type': 'Organization',
      name: siteName,
      url: siteUrl,
    },
    areaServed: {
      '@type': 'Country',
      name: 'Vietnam',
    },
    availableChannel: {
      '@type': 'ServiceChannel',
      serviceUrl: `${siteUrl}/#booking`,
      serviceType: 'Online',
    },
    description:
      'Dịch vụ xem bài Tarot chuyên nghiệp, tinh tế và chuẩn xác. Đặt lịch để lắng nghe thông điệp từ vũ trụ dành riêng cho bạn.',
    offers: [
      {
        '@type': 'Offer',
        name: 'Trải bài cơ bản',
        price: '200000',
        priceCurrency: 'VND',
        availability: 'https://schema.org/InStock',
        url: `${siteUrl}/#booking`,
      },
      {
        '@type': 'Offer',
        name: 'Trải bài chuyên sâu',
        price: '200000',
        priceCurrency: 'VND',
        availability: 'https://schema.org/InStock',
        url: `${siteUrl}/#booking`,
      },
    ],
  };
}

/**
 * Generates Article structured data (JSON-LD)
 */
export function generateArticleSchema(config: {
  title: string;
  description: string;
  url: string;
  image?: string;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
}) {
  const { title, description, url, image, publishedTime, modifiedTime, author } = config;

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    image: image || `${siteUrl}/og-image.jpg`,
    datePublished: publishedTime,
    dateModified: modifiedTime || publishedTime,
    author: {
      '@type': 'Person',
      name: author || 'Alex',
    },
    publisher: {
      '@type': 'Organization',
      name: siteName,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.jpg`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}${url}`,
    },
  };
}

/**
 * Generates BreadcrumbList structured data (JSON-LD)
 */
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${item.url}`,
    })),
  };
}

/**
 * Generates FAQ structured data (JSON-LD)
 */
export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

