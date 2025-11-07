import React from 'react';

interface ServiceCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

function ServiceCard({ title, description, icon }: ServiceCardProps) {
  return (
    <div className="group p-6 bg-white rounded-lg transition-all motion-safe:hover:scale-[1.02]">
      <div className="mb-4 text-black">{icon}</div>
      <h3 className="font-heading text-xl mb-2">{title}</h3>
      <p className="text-zinc-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

export default function Services() {
  return (
    <section id="services" className="py-20">
      <div className="container-max mx-auto px-6">
        <h2 className="font-heading text-2xl mb-2">Dịch vụ</h2>
        <p className="text-zinc-600 mb-12">
          Các hình thức đọc bài được điều chỉnh theo nhu cầu của bạn
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          <ServiceCard
            title="Đọc Tổng Quan"
            description="Trải bài để có cái nhìn tổng thể về tình hình hiện tại và những điều cần lưu ý trong tương lai gần. Phù hợp cho người muốn định hướng nhanh."
            icon={
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M12 8v4l2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            }
          />

          <ServiceCard
            title="Đọc Chuyên Sâu"
            description="Phân tích chi tiết từng khía cạnh của vấn đề, kết hợp nhiều bộ bài khác nhau để có cái nhìn đa chiều. Thích hợp cho các quyết định quan trọng."
            icon={
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3M3 16v3a2 2 0 002 2h3m8-5v3a2 2 0 002 2h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M12 12l4-4m-4 4l-4-4m4 4v-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            }
          />

          <ServiceCard
            title="Theo Dõi & Hướng Dẫn"
            description="Các buổi đọc định kỳ để theo dõi tiến triển và điều chỉnh hướng đi. Bao gồm lời khuyên thực tế và bài tập phát triển trực giác."
            icon={
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 5l3 3-3 3M8 19l-3-3 3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M3 12h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            }
          />
        </div>
      </div>
    </section>
  );
}