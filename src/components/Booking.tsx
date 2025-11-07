"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import emailjs from "emailjs-com";

type FormState = {
  name: string;
  email: string;
  datetime: string;
  type: string;
  note: string;
};

const initial: FormState = {
  name: "",
  email: "",
  datetime: "",
  type: "Tarot - General",
  note: "",
};

export default function Booking() {
  const [form, setForm] = useState<FormState>(initial);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  function validate() {
    const e: Partial<FormState> = {};
    if (!form.name.trim()) e.name = "Họ và tên là bắt buộc";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Email không hợp lệ";
    if (!form.datetime) e.datetime = "Vui lòng chọn ngày và giờ";
    else {
      const chosen = new Date(form.datetime);
      if (chosen < new Date()) e.datetime = "Không thể chọn thời gian trong quá khứ";
    }
    return e;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const eState = validate();
    setErrors(eState);

    if (Object.keys(eState).length === 0) {
      setStatus("loading");

      try {
        await emailjs.send(
          process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
          process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
          {
            ...form,
            formatted_date: new Date(form.datetime).toLocaleString("vi-VN"),
          },
          process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
        );

        setStatus("success");
        setForm(initial);
        setTimeout(() => setStatus("idle"), 6000);
      } catch (err) {
        console.error(err);
        setStatus("error");
        setTimeout(() => setStatus("idle"), 5000);
      }
    }
  }

  return (
    <section id="booking" className="py-20 bg-gradient-to-b from-white to-zinc-50 dark:from-zinc-950 dark:to-zinc-900 transition-colors">
      <div className="max-w-2xl mx-auto px-6">
        <h2 className="font-heading text-3xl font-semibold text-center dark:text-white">
          Đặt lịch Tarot
        </h2>
        <p className="mt-2 text-center text-zinc-600 dark:text-zinc-400">
          Chọn chủ đề và thời gian phù hợp, chúng tôi sẽ xác nhận qua email.
        </p>

        <form
          onSubmit={onSubmit}
          className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2"
          aria-label="Form đặt lịch Tarot"
        >
          {/* Họ tên */}
          <div>
            <label htmlFor="name" className="text-sm font-medium dark:text-zinc-300">Họ và tên</label>
            <input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              aria-invalid={!!errors.name}
            />
            {errors.name && <p className="mt-1 text-sm text-rose-500">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="text-sm font-medium dark:text-zinc-300">Email</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1 w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              aria-invalid={!!errors.email}
            />
            {errors.email && <p className="mt-1 text-sm text-rose-500">{errors.email}</p>}
          </div>

          {/* Ngày & giờ */}
          <div>
            <label htmlFor="datetime" className="text-sm font-medium dark:text-zinc-300">Ngày & thời gian</label>
            <input
              id="datetime"
              type="datetime-local"
              value={form.datetime}
              onChange={(e) => setForm({ ...form, datetime: e.target.value })}
              className="mt-1 w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              aria-invalid={!!errors.datetime}
            />
            {errors.datetime && <p className="mt-1 text-sm text-rose-500">{errors.datetime}</p>}
          </div>

          {/* Loại đọc */}
          <div>
            <label htmlFor="type" className="text-sm font-medium dark:text-zinc-300">Loại đọc</label>
            <select
              id="type"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="mt-1 w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            >
              <option>Tarot - General</option>
              <option>Tarot - Love</option>
              <option>Tarot - Career</option>
            </select>
          </div>

          {/* Ghi chú */}
          <div className="sm:col-span-2">
            <label htmlFor="note" className="text-sm font-medium dark:text-zinc-300">Ghi chú</label>
            <textarea
              id="note"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              rows={4}
              className="mt-1 w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Nút gửi */}
          <div className="sm:col-span-2 flex items-center gap-4">
            <button
              type="submit"
              disabled={status === "loading"}
              className="rounded-full bg-black dark:bg-indigo-600 px-8 py-3 text-white text-sm font-medium transition-all hover:scale-105 disabled:opacity-60"
            >
              {status === "loading" ? "Đang gửi..." : "Gửi yêu cầu"}
            </button>

            <AnimatePresence>
              {status === "success" && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.4 }}
                  className="text-sm text-green-600"
                >
                  ✅ Đã gửi! Chúng tôi sẽ liên hệ sớm.
                </motion.div>
              )}
              {status === "error" && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.4 }}
                  className="text-sm text-rose-600"
                >
                  ⚠️ Có lỗi xảy ra. Vui lòng thử lại sau.
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </form>
      </div>
    </section>
  );
}
