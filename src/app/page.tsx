import dynamic from "next/dynamic";
import Hero from "@/components/Hero";
import StructuredData from "@/components/StructuredData";
import { generateFAQSchema } from "@/lib/seoUtils";

// Lazy load below-the-fold components for better initial page load
const Services = dynamic(() => import("@/components/Services"), {
  loading: () => <div className="py-24" />,
});

const About = dynamic(() => import("@/components/About"), {
  loading: () => <div className="py-24" />,
});

const Testimonials = dynamic(() => import("@/components/Testimonials"), {
  loading: () => <div className="py-24" />,
});

const Pricing = dynamic(() => import("@/components/Pricing"), {
  loading: () => <div className="py-24" />,
});

const Booking = dynamic(() => import("@/components/Booking"), {
  loading: () => <div className="py-20" />,
});

export default function Home() {
  // FAQ structured data for SEO
  const faqSchema = generateFAQSchema([
    {
      question: "Tarot by Alex là gì?",
      answer:
        "Tarot by Alex là dịch vụ xem bài Tarot chuyên nghiệp, tinh tế và chuẩn xác. Chúng tôi cung cấp các buổi đọc bài Tarot cá nhân hóa giúp bạn khám phá bản thân, thấu hiểu tình yêu, công việc, sự nghiệp và con đường tâm linh.",
    },
    {
      question: "Làm thế nào để đặt lịch xem bài Tarot?",
      answer:
        "Bạn có thể đặt lịch xem bài Tarot bằng cách điền vào form đặt lịch trên trang web, chọn ngày giờ phù hợp và loại dịch vụ bạn muốn. Chúng tôi sẽ xác nhận và liên hệ với bạn qua email.",
    },
    {
      question: "Có những loại dịch vụ Tarot nào?",
      answer:
        "Chúng tôi cung cấp ba loại dịch vụ chính: Trải bài cơ bản (15-30 phút), Trải bài chuyên sâu (30-90 phút), và Trải bài hằng ngày (VIP) theo gói tháng/quý.",
    },
    {
      question: "Xem bài Tarot có chính xác không?",
      answer:
        "Tarot là công cụ để khám phá bản thân và nhận định hướng, không phải để dự đoán tương lai một cách tuyệt đối. Chúng tôi tập trung vào việc giúp bạn hiểu rõ hiện tại, vượt qua thử thách và phát triển bản thân.",
    },
  ]);

  return (
    <>
      <StructuredData data={faqSchema} />
      <main id="main-content" className="min-h-screen bg-white text-black" tabIndex={-1}>
        <Hero />

        <Services />
        <About />
        <Testimonials />

        <Pricing />

        <Booking />

        <footer className="relative py-12" role="contentinfo">
          <div className="container-max mx-auto px-6 text-center text-sm text-zinc-600">
            <div>© Tarot by Alex</div>
            <div className="mt-3 flex items-center justify-center gap-4">
              <a href="#" aria-label="Instagram" className="text-zinc-600">IG</a>
              <a href="#" aria-label="Facebook" className="text-zinc-600">FB</a>
              <a href="#" aria-label="Email" className="text-zinc-600">Email</a>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
