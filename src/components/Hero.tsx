import Image from "next/image";

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative pt-28 pb-20 overflow-hidden"
      aria-labelledby="hero-title"
    >
      <div className="container-max mx-auto px-6 flex flex-col-reverse sm:flex-row items-center justify-between gap-12">
        {/* ===== Bên trái: Nội dung Hero ===== */}
        <div className="text-center sm:text-left sm:w-1/2">
          <h1
            id="hero-title"
            className="font-heading text-4xl md:text-4xl lg:text-5xl leading-tight text-black"
          >
            Những trải nghiệm Tarot tĩnh lặng, chân thành và rõ ràng
          </h1>

          <p className="mt-6 text-lg text-zinc-600 font-body">
            Buổi đọc cá nhân hóa, kết hợp trực giác và hướng dẫn nhẹ nhàng để
            giúp bạn nhìn rõ lựa chọn và di chuyển tiếp với tự tin. Có cả đọc
            nhanh và phiên sâu tuỳ nhu cầu.
          </p>

          <div className="mt-8 flex items-center justify-center sm:justify-start gap-4">
            <a
              href="#booking"
              aria-label="Đặt lịch buổi đọc Tarot"
              className="inline-block rounded-full bg-black px-6 py-3 text-white text-sm font-medium transition-transform transform hover:scale-105"
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

        {/* ===== Bên phải: Hình ảnh minh họa ===== */}
        <div className="relative sm:w-1/2 flex justify-center">
          <Image
            src="/orbits.svg"
            alt="Mặt trời và các hành tinh quay quanh quỹ đạo"
            width={500}
            height={500}
            priority
            className="max-w-[480px] w-full h-auto drop-shadow-lg"
          />

          {/* Hiệu ứng nền nhẹ (glow hoặc gradient) */}
          <div className="absolute inset-0 bg-gradient-radial from-yellow-100/30 via-transparent to-transparent blur-2xl -z-10" />
        </div>
      </div>
    </section>
  );
}
