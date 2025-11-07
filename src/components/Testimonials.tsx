'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Testimonial {
  quote: string;
  author: string;
  service: string;
}

const testimonials: Testimonial[] = [
  {
    quote: "Alex có cách tiếp cận rất nhẹ nhàng và chuyên nghiệp. Những lời khuyên tôi nhận được rất thực tế và giúp tôi tự tin hơn với quyết định của mình.",
    author: "Phương Anh",
    service: "Đọc Chuyên Sâu",
  },
  {
    quote: "Buổi đọc bài với Alex giúp tôi nhìn nhận vấn đề từ những góc độ mới. Không gian rất thoải mái và những thông điệp được truyền đạt rất rõ ràng.",
    author: "Minh Tuấn",
    service: "Đọc Tổng Quan",
  },
  {
    quote: "Tôi đã theo học các buổi đọc định kỳ và thấy rõ sự tiến bộ trong việc đưa ra quyết định. Alex không chỉ đọc bài mà còn hướng dẫn cách phát triển trực giác.",
    author: "Thu Hà",
    service: "Theo Dõi & Hướng Dẫn",
  },
];

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => setCurrentIndex((c) => (c + 1) % testimonials.length);
  const prev = () => setCurrentIndex((c) => (c - 1 + testimonials.length) % testimonials.length);

  // 🕒 Tự động chuyển testimonial sau 6s
  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="testimonials" className="py-24 bg-[var(--muted)]">
      <div className="container-max mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl mb-3">Lời chứng thực</h2>
          <p className="text-zinc-600">Trải nghiệm từ những người đã kết nối cùng Tarot</p>
        </div>

        <div className="relative max-w-3xl mx-auto">
          <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-10 shadow-lg border border-zinc-100">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <blockquote className="text-lg text-zinc-700 italic mb-6 relative">
                  <span className="text-4xl text-zinc-400 absolute -left-3 top-0">“</span>
                  {testimonials[currentIndex].quote}
                  <span className="text-4xl text-zinc-400 absolute -right-3 bottom-[-10px]">”</span>
                </blockquote>

                <footer className="mt-6">
                  <div className="font-semibold text-zinc-900">{testimonials[currentIndex].author}</div>
                  <div className="text-sm text-zinc-500">{testimonials[currentIndex].service}</div>
                </footer>
              </motion.div>
            </AnimatePresence>

            <div className="mt-10 flex items-center justify-between">
              <button
                onClick={prev}
                className="p-2 hover:bg-zinc-100 rounded-full transition-all"
                aria-label="Trước"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" stroke="currentColor" fill="none">
                  <path d="M15 19l-7-7 7-7" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>

              <div className="flex gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`w-3 h-3 rounded-full transition-all ${i === currentIndex ? 'bg-black scale-110' : 'bg-zinc-300 hover:bg-zinc-400'
                      }`}
                    aria-label={`Lời chứng thực ${i + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={next}
                className="p-2 hover:bg-zinc-100 rounded-full transition-all"
                aria-label="Tiếp theo"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" stroke="currentColor" fill="none">
                  <path d="M9 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>

          {/* Hiệu ứng ánh sáng tinh tế */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-gradient-to-r from-yellow-200/40 to-pink-200/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-l from-indigo-200/40 to-cyan-200/20 rounded-full blur-3xl pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
