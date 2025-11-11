"use client";

import { motion } from "framer-motion";
import React, { memo } from "react";

interface ServiceCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  delay?: number;
}

const ServiceCard = memo(function ServiceCard({ title, description, icon, delay = 0 }: ServiceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className="group p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-zinc-100 
                 transition-all hover:shadow-md hover:scale-[1.02] hover:bg-white"
    >
      <div className="mb-4 text-black group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="font-heading text-xl mb-2 text-zinc-900 group-hover:text-black transition-colors">
        {title}
      </h3>
      <p className="text-zinc-600 text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
});

export default function Services() {
  return (
    <section
      id="services"
      className="py-24 bg-gradient-to-b from-white via-soft to-white relative overflow-hidden"
    >
      {/* Subtle floating orbs for background atmosphere */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-48 h-48 bg-[#ffe9c7]/40 rounded-full blur-3xl -top-12 -left-12 animate-pulse"></div>
        <div className="absolute w-72 h-72 bg-[#cbe4ff]/40 rounded-full blur-3xl bottom-0 right-0 animate-pulse"></div>
      </div>

      <div className="container-max mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="font-heading text-3xl md:text-4xl mb-3 text-zinc-900">
            Dịch vụ
          </h2>
          <p className="text-zinc-600 text-base md:text-lg max-w-2xl mx-auto">
            Các hình thức đọc bài được điều chỉnh theo nhu cầu của bạn — từ
            những buổi đọc nhanh định hướng, đến hành trình khám phá sâu hơn.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8" role="list">
          <ServiceCard
            delay={0.1}
            title="Đọc Tổng Quan"
            description="Trải bài để có cái nhìn tổng thể về tình hình hiện tại và những điều cần lưu ý trong tương lai gần. Phù hợp cho người muốn định hướng nhanh."
            icon={
              <svg
                className="w-10 h-10"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M12 8v4l2 2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            }
          />

          <ServiceCard
            delay={0.2}
            title="Đọc Chuyên Sâu"
            description="Phân tích chi tiết từng khía cạnh của vấn đề, kết hợp nhiều bộ bài khác nhau để có cái nhìn đa chiều. Thích hợp cho các quyết định quan trọng."
            icon={
              <svg
                className="w-10 h-10"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3M3 16v3a2 2 0 002 2h3m8-5v3a2 2 0 002 2h3"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M12 12l4-4m-4 4l-4-4m4 4v-8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            }
          />

          <ServiceCard
            delay={0.3}
            title="Theo Dõi & Hướng Dẫn"
            description="Các buổi đọc định kỳ để theo dõi tiến triển và điều chỉnh hướng đi. Bao gồm lời khuyên thực tế và bài tập phát triển trực giác."
            icon={
              <svg
                className="w-10 h-10"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16 5l3 3-3 3M8 19l-3-3 3-3"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M3 12h18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            }
          />
        </div>
      </div>
    </section>
  );
}
