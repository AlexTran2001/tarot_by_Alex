export default function Hero() {
  return (
    <section id="hero" className="relative pt-28 pb-20" aria-labelledby="hero-title">
    

      <div className="container-max mx-auto px-6 text-center sm:text-left">
        <div className="max-w-3xl mx-auto sm:mx-0">
          <h1 id="hero-title" className="font-heading text-4xl md:text-5xl lg:text-6xl leading-tight text-black">
            Những trải nghiệm Tarot tĩnh lặng, chân thành và rõ ràng
          </h1>

          <p className="mt-6 text-lg text-zinc-600 font-body">
            Buổi đọc cá nhân hóa, kết hợp trực giác và hướng dẫn nhẹ nhàng để
            giúp bạn nhìn rõ lựa chọn và di chuyển tiếp với tự tin. Có cả đọc nhanh
            và phiên sâu tuỳ nhu cầu.
          </p>

          <div className="mt-8 flex items-center justify-center sm:justify-start gap-4">
            <a
              href="#booking"
              aria-label="Đặt lịch buổi đọc Tarot"
              className="inline-block rounded-full bg-black px-6 py-3 text-white text-sm font-medium transition-transform transform motion-safe:hover:scale-102"
            >
              Đặt lịch
            </a>

            <a
              href="#services"
              className="text-sm text-zinc-700 underline-offset-4 hover:underline focus:outline-none"
            >
              Tìm hiểu dịch vụ
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
