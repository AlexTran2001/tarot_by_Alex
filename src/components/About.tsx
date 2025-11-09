"use client";
import { motion } from "framer-motion";
import Image from "next/image";

export default function About() {
  return (
    <section
      id="about"
      className="relative py-24 bg-gradient-to-b from-white via-[#f8f8f8] to-[var(--muted)] overflow-hidden"
    >
      {/* Ambient glowing lights */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute w-72 h-72 bg-[#e0eaff]/40 rounded-full blur-3xl top-10 left-20 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-[#ffe9d6]/40 rounded-full blur-3xl bottom-0 right-0 animate-pulse"></div>
      </div>

      <div className="container-max mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Ảnh đại diện */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-lg"
          >
            <Image
              src="/logo.jpg"
              alt="Alex Tarot Logo"
              fill
              className="object-cover scale-105 hover:scale-110 transition-transform duration-700 ease-[cubic-bezier(.2,.8,.2,1)]"
              sizes="(max-width: 768px) 100vw, 50vw"
              loading="lazy"
            />

            {/* Ánh sáng overlay mờ */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent"></div>
          </motion.div>

          {/* Nội dung */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          >
            <h2 className="font-heading text-3xl md:text-4xl text-zinc-900 mb-6">
              Về tôi
            </h2>

            <div className="space-y-5 text-zinc-600 leading-relaxed text-base md:text-lg font-body">
              <p>
                Xin chào, tôi là <span className="text-zinc-800 font-medium">Alex</span> —
                người đồng hành cùng bạn trong hành trình khám phá bản thân qua Tarot.
                Tôi đã dành hơn 5 năm để nghiên cứu, thực hành và chia sẻ Tarot kết hợp với
                tâm lý học ứng dụng, nhằm mang lại những buổi đọc rõ ràng và thực tế.
              </p>

              <p>
                Tôi tin rằng mỗi lá bài là tấm gương phản chiếu nội tâm. Thông qua sự kết nối
                giữa trực giác và câu chuyện của bạn, chúng ta có thể tìm thấy hướng đi sáng
                suốt và nhẹ nhàng hơn.
              </p>

              <p>
                Tarot không chỉ là công cụ tiên tri — mà là cách lắng nghe chính mình, nhận
                diện cảm xúc và mở rộng nhận thức. Mỗi buổi đọc là một cuộc trò chuyện chân
                thành giữa bạn và vũ trụ.
              </p>
            </div>

            <div className="mt-10 flex items-center gap-5">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="w-10 h-10 rounded-full bg-white shadow-sm border border-zinc-200 flex items-center justify-center text-yellow-500 text-lg"
                  >
                    ★
                  </motion.div>
                ))}
              </div>
              <p className="text-sm md:text-base text-zinc-600">
                Hơn <span className="font-medium text-zinc-800">500</span> buổi đọc bài thành công
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
