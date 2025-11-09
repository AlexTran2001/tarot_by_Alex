"use client";

import { useEffect } from "react";
import Image from "next/image";

interface ImageModalProps {
  imageUrl: string;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ImageModal({ imageUrl, alt, isOpen, onClose }: ImageModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
    }

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-95 p-4 transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className="relative w-full h-full max-w-7xl max-h-[95vh] flex items-center justify-center p-4 md:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 md:top-4 md:right-4 z-10 text-white hover:text-gray-300 transition-colors bg-black bg-opacity-70 rounded-full p-2 md:p-3 hover:bg-opacity-90"
          aria-label="Đóng"
        >
          <svg
            className="w-5 h-5 md:w-6 md:h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Image Container */}
        <div className="relative w-full h-full flex items-center justify-center">
          <Image
            src={imageUrl}
            alt={alt}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
            priority
            quality={95}
          />
        </div>

        {/* Help Text */}
        <p className="absolute bottom-2 md:bottom-4 left-1/2 transform -translate-x-1/2 text-white text-xs md:text-sm bg-black bg-opacity-50 px-3 md:px-4 py-1 md:py-2 rounded-full font-body pointer-events-none">
          Nhấn ESC hoặc click bên ngoài để đóng
        </p>
      </div>
    </div>
  );
}

