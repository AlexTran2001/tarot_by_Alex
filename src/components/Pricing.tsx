'use client';

import { motion } from 'framer-motion';
import { memo } from 'react';

interface PriceCardProps {
  name: string;
  price: string;
  duration: string;
  pricingNote?: string;
  features: string[];
  isPopular?: boolean;
}

const PriceCard = memo(function PriceCard({ name, price, duration, pricingNote, features, isPopular }: PriceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      viewport={{ once: true }}
      className={`relative flex flex-col p-6 md:p-8 rounded-2xl transition-all shadow-sm min-h-full ${isPopular
        ? 'bg-gradient-to-b from-white via-white to-zinc-50 border border-black/10 ring-2 ring-black/10'
        : 'bg-white border border-zinc-200'
        } hover:shadow-lg hover:-translate-y-1`}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-4 py-1 rounded-full tracking-wide shadow-sm whitespace-nowrap">
          ✦ Phổ biến nhất ✦
        </div>
      )}

      <div className="mb-5 text-center">
        <h3 className="font-heading text-lg md:text-xl mb-3 leading-tight">{name}</h3>
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-2xl md:text-3xl font-semibold text-black">{price}</span>
            {duration && (
              <span className="text-zinc-600 text-xs md:text-sm leading-tight">{duration}</span>
            )}
          </div>
          {pricingNote && (
            <p className="text-xs text-zinc-500 mt-1 leading-relaxed px-2">{pricingNote}</p>
          )}
        </div>
      </div>

      <ul className="flex-1 space-y-2.5 mb-6 text-zinc-700">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed">
            <svg
              width="18"
              height="18"
              viewBox="0 0 20 20"
              fill="none"
              className="flex-none mt-0.5 text-black shrink-0"
            >
              <path
                d="M7 10l2 2 4-4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="flex-1">{feature}</span>
          </li>
        ))}
      </ul>

      <a
        href="#booking"
        className={`relative block w-full py-2.5 md:py-3 text-center rounded-md text-sm font-medium overflow-hidden transition-all group mt-auto ${isPopular
          ? 'bg-black text-white hover:bg-zinc-900'
          : 'border border-black text-black hover:bg-zinc-50'
          }`}
      >
        <span className="relative z-10">Đặt lịch ngay</span>
        {isPopular && (
          <span className="absolute inset-0 bg-gradient-to-r from-indigo-200/20 via-pink-200/20 to-yellow-200/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
        )}
      </a>
    </motion.div>
  );
});

export default function Pricing() {
  return (
    <section id="pricing" className="relative py-24 bg-[var(--muted)] overflow-hidden">
      {/* Ánh sáng nền ảo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-56 h-56 bg-gradient-to-br from-yellow-200/30 to-pink-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-1/4 w-60 h-60 bg-gradient-to-tr from-indigo-200/30 to-cyan-200/30 rounded-full blur-3xl"></div>
      </div>

      <div className="container-max mx-auto px-6 relative">
        <div className="text-center mb-14">
          <h2 className="font-heading text-3xl mb-3">Bảng giá</h2>
          <p className="text-zinc-600 max-w-lg mx-auto">
            Ba gói được thiết kế để phù hợp với từng nhu cầu và cấp độ trải nghiệm Tarot của bạn.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          <PriceCard
            name="Trải bài cơ bản"
            price="200.000đ"
            duration="30 phút đầu tiên"
            features={[
              'Định hướng ngắn hạn, phù hợp người mới',
              'Thường tập trung 1–2 trải bài',
              'Về công việc, tình yêu, mối quan hệ',
              'Giải thích ý nghĩa lá bài',
            ]}
          />

          <PriceCard
            name="Trải bài chuyên sâu"
            price="200.000đ"
            duration="30 phút đầu"
            pricingNote="+ 50.000đ mỗi 30 phút tiếp theo"
            isPopular
            features={[
              'Đào sâu vào cảm xúc, năng lượng',
              'Sự nghiệp hoặc mối quan hệ',
              'Hỗ trợ phân tích và chữa lành',
              'Thời lượng linh hoạt 30–90 phút',
            ]}
          />

          <PriceCard
            name="Trải bài hằng ngày (VIP)"
            price="Gói riêng"
            duration="Theo tháng / quý"
            features={[
              'Mỗi ngày nhận thông điệp 1 lá bài',
              'Hướng dẫn năng lượng và cảm xúc',
              'Cá nhân hóa theo nhu cầu',
              'Liên hệ để biết thêm chi tiết',
            ]}
          />
        </div>
      </div>
    </section>
  );
}
