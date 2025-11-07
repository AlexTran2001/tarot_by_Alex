"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  function validate() {
    const e: Partial<FormState> = {};
    if (!form.name.trim()) e.name = "Họ và tên là bắt buộc";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Email không hợp lệ";
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
      setLoading(true);

      // giả lập gửi API
      await new Promise((r) => setTimeout(r, 1200));

      setLoading(false);
      setSuccess("✨ Cảm ơn bạn! Yêu cầu đã được gửi, chúng tôi sẽ sớm liên hệ.");
      setForm(initial);

      setTimeout(() => setSuccess(""), 6000);
    }
  }

  return (
    <section id="booking" className="py-20 bg-gradient-to-b from-white to-zinc-50">
      <div className="max-w-2xl mx-auto px-6">
        <h2 className="font-heading text-3xl font-semibold text-center">Đặt lịch Tarot</h2>
        <p className="mt-2 text-center text-zinc-600">
          Chọn chủ đề và thời gian phù hợp, chúng tôi sẽ xác nhận qua email.
        </p>

        <form
          onSubmit={onSubmit}
          className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2"
          aria-label="Form đặt lịch Tarot"
        >
          {/* Họ tên */}
          <div>
            <label htmlFor="name" className="text-sm font-medium">
              Họ và tên
            </label>
            <input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              aria-invalid={!!errors.name}
              required
            />
            {errors.name && <p className="mt-1 text-sm text-rose-600">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              aria-invalid={!!errors.email}
              required
            />
            {errors.email && <p className="mt-1 text-sm text-rose-600">{errors.email}</p>}
          </div>

          {/* Ngày & giờ */}
          <div>
            <label htmlFor="datetime" className="text-sm font-medium">
              Ngày & thời gian
            </label>
            <input
              id="datetime"
              type="datetime-local"
              value={form.datetime}
              onChange={(e) => setForm({ ...form, datetime: e.target.value })}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              aria-invalid={!!errors.datetime}
              required
            />
            {errors.datetime && (
              <p className="mt-1 text-sm text-rose-600">{errors.datetime}</p>
            )}
          </div>

          {/* Loại */}
          <div>
            <label htmlFor="type" className="text-sm font-medium">
              Loại đọc
            </label>
            <select
              id="type"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white"
            >
              <option>Tarot - General</option>
              <option>Tarot - Love</option>
              <option>Tarot - Career</option>
            </select>
          </div>

          {/* Ghi chú */}
          <div className="sm:col-span-2">
            <label htmlFor="note" className="text-sm font-medium">
              Ghi chú
            </label>
            <textarea
              id="note"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              rows={4}
            />
          </div>

          {/* Nút gửi */}
          <div className="sm:col-span-2 flex items-center gap-4">
            <button
              type="submit"
              disabled={loading}
              className={`rounded-full bg-black px-8 py-3 text-white text-sm font-medium transition-all hover:bg-zinc-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:opacity-60`}
            >
              {loading ? "Đang gửi..." : "Gửi yêu cầu"}
            </button>

            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.4 }}
                  role="status"
                  aria-live="polite"
                  className="text-sm text-green-600"
                >
                  {success}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </form>
      </div>
    </section>
  );
}
