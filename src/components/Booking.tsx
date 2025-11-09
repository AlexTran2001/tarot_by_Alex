"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

type FormState = {
  name: string;
  email: string;
  date: string;
  time: string;
  type: string;
  note: string;
};

const initial: FormState = {
  name: "",
  email: "",
  date: "",
  time: "",
  type: "Trải bài cơ bản (15-30 phút) - 200.000đ",
  note: "",
};

// Generate time slots in 30-minute intervals
const generateTimeSlots = (isWeekend: boolean, selectedDate?: string): string[] => {
  const slots: string[] = [];
  const now = new Date();
  
  if (isWeekend) {
    // Weekend: All day from 8:00 AM to 11:30 PM
    for (let hour = 8; hour < 24; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < 23) {
        slots.push(`${hour.toString().padStart(2, '0')}:30`);
      }
    }
  } else {
    // Weekday: Only from 8:00 PM (20:00) to 11:30 PM (23:30)
    // Note: 12am (midnight) is 00:00 of next day, so we end at 23:30
    for (let hour = 20; hour < 24; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < 23) {
        slots.push(`${hour.toString().padStart(2, '0')}:30`);
      }
    }
  }
  
  // Filter out past time slots if selected date is today
  if (selectedDate) {
    const selected = new Date(selectedDate + 'T00:00:00');
    const today = new Date();
    const isToday = selected.toDateString() === today.toDateString();
    
    if (isToday) {
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTimeMinutes = currentHour * 60 + currentMinute;
      
      return slots.filter(slot => {
        const [hours, minutes] = slot.split(':').map(Number);
        const slotTimeMinutes = hours * 60 + minutes;
        return slotTimeMinutes > currentTimeMinutes;
      });
    }
  }
  
  return slots;
};

// Format time for display (e.g., "20:00" -> "8:00 PM")
const formatTimeDisplay = (time: string): string => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:${minutes} ${period}`;
};

export default function Booking() {
  const [form, setForm] = useState<FormState>(initial);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  // Get available time slots based on selected date
  const availableTimeSlots = useMemo(() => {
    if (!form.date) return [];
    
    const selectedDate = new Date(form.date + 'T00:00:00');
    const dayOfWeek = selectedDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    return generateTimeSlots(isWeekend, form.date);
  }, [form.date]);

  // Check if selected date/time is valid
  const validateDateTime = useCallback((): { valid: boolean; message?: string } => {
    if (!form.date) {
      return { valid: false, message: "Vui lòng chọn ngày" };
    }
    
    if (!form.time) {
      return { valid: false, message: "Vui lòng chọn giờ" };
    }
    
    // Combine date and time
    const datetimeString = `${form.date}T${form.time}:00`;
    const chosen = new Date(datetimeString);
    const now = new Date();
    
    // Check if in the past
    if (chosen < now) {
      return { valid: false, message: "Không thể chọn thời gian trong quá khứ" };
    }
    
    // Check if time slot is available
    if (!availableTimeSlots.includes(form.time)) {
      return { valid: false, message: "Thời gian đã chọn không khả dụng" };
    }
    
    return { valid: true };
  }, [form.date, form.time, availableTimeSlots]);

  const validate = useCallback((formData: FormState) => {
    const e: Partial<FormState> = {};
    if (!formData.name.trim()) e.name = "Họ và tên là bắt buộc";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = "Email không hợp lệ";
    
    // Validate date and time
    const dateTimeValidation = validateDateTime();
    if (!dateTimeValidation.valid) {
      if (!formData.date) {
        e.date = dateTimeValidation.message;
      } else if (!formData.time) {
        e.time = dateTimeValidation.message;
      } else {
        e.time = dateTimeValidation.message;
      }
    }
    
    return e;
  }, [validateDateTime]);

  const onSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const eState = validate(form);
    setErrors(eState);

    if (Object.keys(eState).length === 0) {
      setStatus("loading");

      try {
        // Combine date and time into datetime string
        const datetime = `${form.date}T${form.time}:00`;
        
        // Save booking to database
        const bookingResponse = await fetch("/api/booking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            datetime: datetime,
            type: form.type,
            note: form.note,
          }),
        });

        if (!bookingResponse.ok) {
          const errorData = await bookingResponse.json();
          throw new Error(errorData?.error || "Failed to save booking");
        }

        // Send email notification (optional - can fail without breaking the flow)
        // Dynamically import emailjs only when needed
        try {
          const emailjs = (await import("emailjs-com")).default;
          await emailjs.send(
            process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
            process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
            {
              name: form.name,
              email: form.email,
              type: form.type,
              note: form.note,
              formatted_date: new Date(datetime).toLocaleString("vi-VN"),
            },
            process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
          );
        } catch (emailError) {
          console.warn("Email sending failed, but booking was saved:", emailError);
          // Continue even if email fails
        }

        setStatus("success");
        setForm(initial);
        setTimeout(() => setStatus("idle"), 6000);
      } catch (err: any) {
        console.error("Booking submission error:", err);
        setStatus("error");
        setTimeout(() => setStatus("idle"), 5000);
      }
    }
  }, [form, validate]);

  return (
    <section id="booking" className="py-20 bg-gradient-to-b from-[var(--muted)] via-soft to-white">
      <div className="max-w-2xl mx-auto px-6">
        <h2 className="font-heading text-3xl font-semibold text-center text-black">
          Đặt lịch Tarot
        </h2>
        <p className="mt-2 text-center text-black mb-1">
          Chọn chủ đề và thời gian phù hợp, chúng tôi sẽ xác nhận qua email.
        </p>
        <p className="text-center text-sm text-zinc-600 mb-2">
          ⏰ <strong>Giờ làm việc:</strong> Trong tuần (20:00 - 24:00) | Cuối tuần (cả ngày)
        </p>

        <form
          onSubmit={onSubmit}
          className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2"
          aria-label="Form đặt lịch Tarot"
        >
          {/* Họ tên */}
          <div>
            <label htmlFor="name" className="text-sm font-medium text-black">Họ và tên</label>
            <input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-white px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-black"
              aria-invalid={!!errors.name}
            />
            {errors.name && <p className="mt-1 text-sm text-rose-500">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="text-sm font-medium text-black">Email</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-white px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-black"
              aria-invalid={!!errors.email}
            />
            {errors.email && <p className="mt-1 text-sm text-rose-500">{errors.email}</p>}
          </div>

          {/* Ngày */}
          <div>
            <label htmlFor="date" className="text-sm font-medium text-black">Ngày</label>
            <input
              id="date"
              type="date"
              value={form.date}
              onChange={(e) => {
                setForm({ ...form, date: e.target.value, time: "" }); // Reset time when date changes
                // Clear errors
                if (errors.date) {
                  setErrors({ ...errors, date: undefined, time: undefined });
                }
              }}
              min={new Date().toISOString().split('T')[0]}
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-white px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-black"
              aria-invalid={!!errors.date}
            />
            {errors.date && <p className="mt-1 text-sm text-rose-500">{errors.date}</p>}
            {form.date && !errors.date && (
              <p className="mt-1 text-xs text-zinc-600">
                {(() => {
                  const selectedDate = new Date(form.date + 'T00:00:00');
                  const dayOfWeek = selectedDate.getDay();
                  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                  return isWeekend 
                    ? "✓ Cuối tuần - chọn giờ bất kỳ" 
                    : "✓ Trong tuần - chọn giờ từ 8:00 PM";
                })()}
              </p>
            )}
          </div>

          {/* Giờ */}
          <div>
            <label htmlFor="time" className="text-sm font-medium text-black">Giờ</label>
            {!form.date ? (
              <div className="mt-1 w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-500">
                Vui lòng chọn ngày trước
              </div>
            ) : (
              <>
                <select
                  id="time"
                  value={form.time}
                  onChange={(e) => {
                    setForm({ ...form, time: e.target.value });
                    if (errors.time) {
                      setErrors({ ...errors, time: undefined });
                    }
                  }}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-white px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-black"
                  aria-invalid={!!errors.time}
                >
                  <option value="">Chọn giờ</option>
                  {availableTimeSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {formatTimeDisplay(slot)}
                    </option>
                  ))}
                </select>
                {errors.time && <p className="mt-1 text-sm text-rose-500">{errors.time}</p>}
              </>
            )}
          </div>

          {/* Loại đọc */}
          <div>
            <label htmlFor="type" className="text-sm font-medium text-black">Loại đọc</label>
            <select
              id="type"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-white px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-black"
            >
              <option>Trải bài cơ bản (15-30 phút) - 200.000đ</option>
              <option>Trải bài chuyên sâu (30-90 phút) - 200.000đ + 50.000đ/30ph</option>
              <option>Trải bài hằng ngày (VIP) - Gói riêng</option>
            </select>
          </div>

          {/* Ghi chú */}
          <div className="sm:col-span-2">
            <label htmlFor="note" className="text-sm font-medium text-black">Ghi chú</label>
            <textarea
              id="note"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              rows={4}
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-white px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-black"
            />
          </div>

          {/* Nút gửi */}
          <div className="sm:col-span-2 flex items-center gap-4">
            <button
              type="submit"
              disabled={status === "loading"}
              className="rounded-full bg-indigo-600 px-8 py-3 text-white text-sm font-medium transition-all hover:scale-105 disabled:opacity-60"
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
