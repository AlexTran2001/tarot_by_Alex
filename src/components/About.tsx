

export default function About() {
  return (
    <section id="about" className="relative py-20 bg-[var(--muted)]">


      <div className="container-max mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative aspect-[4/5] bg-zinc-100 rounded-lg overflow-hidden">
            {/* Placeholder for actual photo */}
            <div className="absolute inset-0 flex items-center justify-center text-zinc-400">
              <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 16l4-4 4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
          </div>

          <div>
            <h2 className="font-heading text-2xl mb-6">Về tôi</h2>
            
            <div className="space-y-4 text-zinc-600">
              <p>
                Xin chào, tôi là Alex. Tôi đã dành hơn 5 năm để nghiên cứu và thực hành Tarot,
                kết hợp với kiến thức tâm lý học để mang đến những góc nhìn sâu sắc và thiết thực.
              </p>
              
              <p>
                Cách tiếp cận của tôi tập trung vào việc tạo không gian an toàn và thoải mái,
                nơi chúng ta có thể cùng khám phá và tìm hiểu những thông điệp từ bộ bài một cách
                rõ ràng và chân thực.
              </p>

              <p>
                Tôi tin rằng Tarot không chỉ là công cụ tiên tri, mà còn là phương tiện để
                kết nối với trực giác và khám phá tiềm năng bên trong mỗi người.
              </p>
            </div>

            <div className="mt-8 flex items-center gap-4">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-zinc-200 border-2 border-white flex items-center justify-center text-xs text-zinc-600"
                  >
                    ★
                  </div>
                ))}
              </div>
              <p className="text-sm text-zinc-600">
                Hơn 500 buổi đọc bài thành công
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}