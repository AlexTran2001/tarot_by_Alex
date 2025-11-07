'use client';

import { useState } from 'react';

interface Testimonial {
  quote: string;
  author: string;
  service: string;
}

const testimonials: Testimonial[] = [
  {
    quote: "Alex có cách tiếp cận rất nhẹ nhàng và chuyên nghiệp. Những lời khuyên tôi nhận được rất thực tế và giúp tôi tự tin hơn với quyết định của mình.",
    author: "Phương Anh",
    service: "Đọc Chuyên Sâu"
  },
  {
    quote: "Buổi đọc bài với Alex giúp tôi nhìn nhận vấn đề từ những góc độ mới. Không gian rất thoải mái và những thông điệp được truyền đạt rất rõ ràng.",
    author: "Minh Tuấn",
    service: "Đọc Tổng Quan"
  },
  {
    quote: "Tôi đã theo học các buổi đọc định kỳ và thấy rõ sự tiến bộ trong việc đưa ra quyết định. Alex không chỉ đọc bài mà còn hướng dẫn cách phát triển trực giác.",
    author: "Thu Hà",
    service: "Theo Dõi & Hướng Dẫn"
  }
];

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => {
    setCurrentIndex((current) => (current + 1) % testimonials.length);
  };

  const prev = () => {
    setCurrentIndex((current) => (current - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section id="testimonials" className="py-20">
      <div className="container-max mx-auto px-6">
        <h2 className="font-heading text-2xl mb-2">Lời chứng thực</h2>
        <p className="text-zinc-600 mb-12">
          Trải nghiệm từ những người đã trải qua buổi đọc
        </p>

        <div className="max-w-3xl mx-auto">
          <div className="relative bg-white rounded-lg p-8">
            {/* Sun-line accent background */}
            <div className="absolute right-6 top-6 z-0 hidden md:block">
              <img
                src="/sun-line.svg"
                alt="Sunburst accent"
                role="img"
                aria-label="Sunburst accent"
                className="w-20 opacity-10"
              />
            </div>

            <div className="min-h-[12rem] flex flex-col">
              <blockquote className="flex-1 text-lg mb-4">
                <img
                  src="/star-sparkle.svg"
                  alt="Star sparkle"
                  role="img"
                  aria-label="Star sparkle"
                  className="w-6 h-6 inline-block mr-2 opacity-15 align-top"
                />
                {testimonials[currentIndex].quote}
              </blockquote>

              <footer>
                <div className="font-medium">{testimonials[currentIndex].author}</div>
                <div className="text-sm text-zinc-600">{testimonials[currentIndex].service}</div>
              </footer>
            </div>

            <div className="mt-8 flex items-center justify-between">
              <button
                onClick={prev}
                className="p-2 hover:bg-zinc-50 rounded-full transition-colors"
                aria-label="Xem lời chứng thực trước"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M15 19l-7-7 7-7" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>

              <div className="flex gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      i === currentIndex ? 'bg-black' : 'bg-zinc-200'
                    }`}
                    aria-label={`Chuyển đến lời chứng thực ${i + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={next}
                className="p-2 hover:bg-zinc-50 rounded-full transition-colors"
                aria-label="Xem lời chứng thực tiếp theo"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M9 5l7 7-7 7" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}