"use client";

import { useState } from "react";

type FormState = {
  name: string;
  email: string;
  datetime: string;
  type: string;
  note: string;
};

const initial: FormState = { name: "", email: "", datetime: "", type: "Tarot - General", note: "" };

export default function Booking() {
  const [form, setForm] = useState<FormState>(initial);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [success, setSuccess] = useState("");

  function validate() {
    const e: Partial<FormState> = {};
    if (!form.name.trim()) e.name = "Họ và tên là bắt buộc";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Email không hợp lệ";
    if (!form.datetime) e.datetime = "Chọn ngày và giờ";
    return e;
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const eState = validate();
    setErrors(eState);
    if (Object.keys(eState).length === 0) {
      setSuccess("Cảm ơn! Yêu cầu của bạn đã được gửi. Chúng tôi sẽ liên hệ sớm.");
      setForm(initial);
      setTimeout(() => setSuccess(""), 5000);
    }
  }

  return (
    <section id="booking" className="py-16">
      <div className="container-max mx-auto px-6">
        <h2 className="font-heading text-2xl">Đặt lịch</h2>
        <p className="mt-2 text-zinc-600">Chọn gói và thời gian, chúng tôi sẽ xác nhận lại với bạn.</p>

        <form onSubmit={onSubmit} className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2" aria-label="Form đặt lịch Tarot">
          <div>
            <label htmlFor="name" className="text-sm">Họ và tên</label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 w-full rounded-md border border-zinc-200 px-3 py-2"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
              required
            />
            {errors.name && <div id="name-error" className="mt-1 text-sm text-rose-600">{errors.name}</div>}
          </div>

          <div>
            <label htmlFor="email" className="text-sm">Email</label>
            <input
              id="email"
              name="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1 w-full rounded-md border border-zinc-200 px-3 py-2"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
              required
            />
            {errors.email && <div id="email-error" className="mt-1 text-sm text-rose-600">{errors.email}</div>}
          </div>

          <div>
            <label htmlFor="datetime" className="text-sm">Ngày & thời gian</label>
            <input
              id="datetime"
              name="datetime"
              type="datetime-local"
              value={form.datetime}
              onChange={(e) => setForm({ ...form, datetime: e.target.value })}
              className="mt-1 w-full rounded-md border border-zinc-200 px-3 py-2"
              aria-invalid={!!errors.datetime}
              aria-describedby={errors.datetime ? "datetime-error" : undefined}
              required
            />
            {errors.datetime && <div id="datetime-error" className="mt-1 text-sm text-rose-600">{errors.datetime}</div>}
          </div>

          <div>
            <label htmlFor="type" className="text-sm">Loại đọc</label>
            <select
              id="type"
              name="type"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="mt-1 w-full rounded-md border border-zinc-200 px-3 py-2"
            >
              <option>Tarot - General</option>
              <option>Tarot - Love</option>
              <option>Tarot - Career</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="note" className="text-sm">Ghi chú</label>
            <textarea
              id="note"
              name="note"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              className="mt-1 w-full rounded-md border border-zinc-200 px-3 py-2"
              rows={4}
            />
          </div>

          <div className="sm:col-span-2 flex items-center gap-4">
            <button
              type="submit"
              className="rounded-full bg-black px-6 py-3 text-white text-sm font-medium"
            >
              Gửi yêu cầu
            </button>
            {success && (
              <div role="status" aria-live="polite" className="text-sm text-green-600">{success}</div>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
