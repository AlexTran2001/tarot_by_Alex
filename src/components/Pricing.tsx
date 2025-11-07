'use client';

import { motion } from 'framer-motion';

interface PriceCardProps {
  name: string;
  price: string;
  duration: string;
  features: string[];
  isPopular?: boolean;
}

function PriceCard({ name, price, duration, features, isPopular }: PriceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      viewport={{ once: true }}
      className={`relative flex flex-col p-8 rounded-2xl transition-all shadow-sm ${isPopular
          ? 'bg-gradient-to-b from-white via-white to-zinc-50 border border-black/10 ring-2 ring-black/10'
          : 'bg-white border border-zinc-200'
        } hover:shadow-lg hover:-translate-y-1`}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-4 py-1 rounded-full tracking-wide shadow-sm">
          ✦ Phổ biến nhất ✦
        </div>
      )}

      <div className="mb-6 text-center">
        <h3 className="font-heading text-xl mb-1">{name}</h3>
        <div className="flex justify-center items-baseline gap-1">
          <span className="text-3xl font-semibold">{price}</span>
          <span className="text-zinc-600">/ {duration}</span>
        </div>
      </div>

      <ul className="flex-1 space-y-3 mb-8 text-zinc-700">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              className="flex-none mt-0.5 text-black"
            >
              <path
                d="M7 10l2 2 4-4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {feature}
          </li>
        ))}
      </ul>

      <a
        href="#booking"
        className={`relative block w-full py-2 text-center rounded-md text-sm font-medium overflow-hidden transition-all group ${isPopular
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
}

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

        <div className="grid md:grid-cols-3 gap-8">
          <PriceCard
            name="Góc nhìn nhanh"
            price="500k"
            duration="30 phút"
            features={[
              'Trải bài nhanh cho 1 câu hỏi',
              'Giải thích ý nghĩa lá bài',
              'Góc nhìn tổng quan',
              'Lời khuyên ngắn gọn',
            ]}
          />

          <PriceCard
            name="Đọc chi tiết"
            price="900k"
            duration="60 phút"
            isPopular
            features={[
              'Trải bài cho 2-3 câu hỏi',
              'Phân tích sâu từng lá bài',
              'Kết nối các yếu tố',
              'Lời khuyên chi tiết',
              'Ghi âm buổi đọc bài',
            ]}
          />

          <PriceCard
            name="Hành trình sâu"
            price="1.500k"
            duration="90 phút"
            features={[
              'Trải bài không giới hạn câu hỏi',
              'Phân tích chuyên sâu',
              'Kết hợp nhiều bộ bài',
              'Lời khuyên toàn diện',
              'Ghi âm buổi đọc bài',
              '15p follow-up qua tin nhắn',
            ]}
          />
        </div>
      </div>
    </section>
  );
}
