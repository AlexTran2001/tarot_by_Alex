import type { Metadata } from "next";
import { Playfair_Display, Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import TransitionProvider from "@/components/TransitionProvider";
import StructuredData from "@/components/StructuredData";
import {
  generateOrganizationSchema,
  generateWebsiteSchema,
  generateServiceSchema,
} from "@/lib/seoUtils";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["vietnamese", "latin"],
  display: "swap",
  weight: ["400", "700"],
});

const beVietnam = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  subsets: ["vietnamese", "latin"],
  display: "swap",
  weight: ["300", "400", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://tarot-by-alex.vercel.app'),
  title: {
    default: "Tarot by Alex — Trải bài Tarot chuyên nghiệp & tinh tế",
    template: "%s | Tarot by Alex",
  },
  description:
    "Trải nghiệm xem bài Tarot chuyên nghiệp, tinh tế và chuẩn xác cùng Tarot by Alex — nơi bạn tìm thấy bình an, thấu hiểu và định hướng cho tình yêu, công việc, sự nghiệp và tâm linh. Đặt lịch để lắng nghe thông điệp từ vũ trụ dành riêng cho bạn.",
  keywords: [
    "tarot",
    "xem bài tarot",
    "bói bài tarot",
    "tarot reading",
    "tarot việt nam",
    "tarot chuyên nghiệp",
    "tarot by alex",
    "đọc bài tarot",
    "trải bài tarot",
    "tarot tình yêu",
    "tarot công việc",
    "tarot tâm linh",
    "tarot online",
  ],
  authors: [{ name: "Alex", url: "https://tarot-by-alex.vercel.app" }],
  creator: "Tarot by Alex",
  publisher: "Tarot by Alex",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "Tarot by Alex — Trải bài Tarot chuyên nghiệp & tinh tế",
    description:
      "Tarot by Alex mang đến không gian xem bài Tarot sang trọng, tĩnh lặng và cá nhân hóa — giúp bạn khám phá bản thân, thấu hiểu tình yêu, công việc, sự nghiệp và con đường tâm linh. Đặt lịch trải bài Tarot cùng Alex để đón nhận thông điệp từ vũ trụ với sự tinh tế và sâu sắc.",
    url: "https://tarot-by-alex.vercel.app/",
    siteName: "Tarot by Alex",
    locale: "vi_VN",
    type: "website",
    images: [
      {
        url: "/og-image.jpg", // You should create this image (1200x630px)
        width: 1200,
        height: 630,
        alt: "Tarot by Alex — Xem bài Tarot chuyên nghiệp, sang trọng và tinh tế",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tarot by Alex — Xem bài Tarot chuyên nghiệp & tinh tế",
    description:
      "Tarot by Alex — trải nghiệm xem bài Tarot cá nhân hóa, sang trọng và bình an. Khám phá thông điệp từ vũ trụ dành riêng cho bạn.",
    images: ["/og-image.jpg"],
    site: "@tarotbyalex",
    creator: "@tarotbyalex",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://tarot-by-alex.vercel.app/",
  },
  verification: {
    // Add your verification codes here when available
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
    // yahoo: "your-yahoo-verification-code",
  },
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Generate structured data for SEO
  const organizationSchema = generateOrganizationSchema();
  const websiteSchema = generateWebsiteSchema();
  const serviceSchema = generateServiceSchema();

  return (
    <html lang="vi" data-scroll-behavior="smooth">
      <body className={`${playfair.variable} ${beVietnam.variable} font-body antialiased bg-white text-zinc-800 antialiased transition-all duration-500`}>
        {/* Structured Data for SEO */}
        <StructuredData data={[organizationSchema, websiteSchema, serviceSchema]} />

        {/* Skip link for keyboard and screen reader users */}
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-white px-3 py-2 rounded-md text-sm">
          Bỏ qua tới nội dung
        </a>

        <Navbar />
        <TransitionProvider>{children}</TransitionProvider>
      </body>
    </html>
  );
}
