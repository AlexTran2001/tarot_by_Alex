"use client";

import Image from "next/image";
import { useState, useEffect, useRef, memo } from "react";

const Hero = memo(function Hero() {
  const text = "Chạm vào chính mình";
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const currentIndexRef = useRef<number>(0);
  const SPEED = 100; // milliseconds per character

  useEffect(() => {
    // Reset state when text changes
    currentIndexRef.current = 0;
    setDisplayedText("");
    setIsTyping(true);

    // Use a timeout-based approach for better control over typing speed
    let timeoutId: NodeJS.Timeout | null = null;

    const typeNextChar = () => {
      if (currentIndexRef.current < text.length) {
        currentIndexRef.current += 1;
        setDisplayedText(text.slice(0, currentIndexRef.current));
        timeoutId = setTimeout(typeNextChar, SPEED);
      } else {
        setIsTyping(false);
      }
    };

    // Start typing animation
    timeoutId = setTimeout(typeNextChar, SPEED);

    return () => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
    };
  }, [text]);

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
            className="font-heading text-2xl md:text-3xl lg:text-4xl leading-tight text-black"
          >
            {displayedText}
            {isTyping && (
              <span className="inline-block w-0.5 h-[1em] bg-black ml-1 align-middle cursor-blink">
                |
              </span>
            )}
          </h1>

          <p className="mt-6 text-lg text-zinc-600 font-body">
            Tarot by Alex không chỉ dự đoán tương lai – đây là hành trình để bạn hiểu rõ hiện tại, vượt qua thử thách, và phát triển bản thân với sự thấu hiểu, đồng cảm và hướng dẫn từ trải bài Tarot.
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
});

export default Hero;
