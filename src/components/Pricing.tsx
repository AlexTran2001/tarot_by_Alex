
interface PriceCardProps {
  name: string;
  price: string;
  duration: string;
  features: string[];
  isPopular?: boolean;
}

function PriceCard({ name, price, duration, features, isPopular }: PriceCardProps) {
  return (
    <div
      className={`relative flex flex-col p-6 bg-white border rounded-lg transition-transform motion-safe:hover:scale-[1.02] ${
        isPopular ? 'border-black shadow-sm' : 'border-zinc-200'
      }`}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-3 py-1 rounded-full">
          Phổ biến nhất
        </div>
      )}
      
      <div className="mb-4">
        <h3 className="font-heading text-xl mb-1">{name}</h3>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-semibold">{price}</span>
          <span className="text-zinc-600">/ {duration}</span>
        </div>
      </div>

      <ul className="flex-1 space-y-3 mb-6">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              className="flex-none mt-0.5"
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
        className={`block w-full py-2 text-center rounded-md text-sm transition-colors ${
          isPopular
            ? 'bg-black text-white hover:bg-zinc-800'
            : 'border border-black hover:bg-zinc-50'
        }`}
      >
        Đặt lịch ngay
      </a>
    </div>
  );
}

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 bg-[var(--muted)]">
      <div className="container-max mx-auto px-6">
        <h2 className="font-heading text-2xl mb-2">Bảng giá</h2>
        <p className="text-zinc-600 mb-12">
          Ba gói được thiết kế phù hợp với nhu cầu của bạn
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          <PriceCard
            name="Góc nhìn nhanh"
            price="500k"
            duration="30 phút"
            features={[
              "Trải bài nhanh cho 1 câu hỏi",
              "Giải thích ý nghĩa lá bài",
              "Góc nhìn tổng quan",
              "Lời khuyên ngắn gọn",
            ]}
          />

          <PriceCard
            name="Đọc chi tiết"
            price="900k"
            duration="60 phút"
            isPopular={true}
            features={[
              "Trải bài cho 2-3 câu hỏi",
              "Phân tích sâu từng lá bài",
              "Kết nối các yếu tố",
              "Lời khuyên chi tiết",
              "Ghi âm buổi đọc bài",
            ]}
          />

          <PriceCard
            name="Hành trình sâu"
            price="1.500k"
            duration="90 phút"
            features={[
              "Trải bài không giới hạn câu hỏi",
              "Phân tích chuyên sâu",
              "Kết hợp nhiều bộ bài",
              "Lời khuyên toàn diện",
              "Ghi âm buổi đọc bài",
              "15p follow-up qua tin nhắn",
            ]}
          />
        </div>
      </div>
    </section>
  );
}