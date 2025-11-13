"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import { checkIsAdmin } from "@/lib/adminUtils";
import Breadcrumb from "@/components/Breadcrumb";
import LoadingSpinner from "@/components/LoadingSpinner";

interface FormState {
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  type: string;
  description: string;
  customerAccountEmail: string;
}

interface FoundUser {
  id: string;
  email: string | null;
  role: string | null;
  created_at: string;
  last_sign_in_at: string | null;
}

const DEFAULT_FORM: FormState = {
  name: "",
  email: "",
  phone: "",
  date: "",
  time: "",
  type: "",
  description: "",
  customerAccountEmail: "",
};

export default function BookingCreatePage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [formErrors, setFormErrors] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [searchingAccount, setSearchingAccount] = useState(false);
  const [linkedUser, setLinkedUser] = useState<FoundUser | null>(null);
  const [accountError, setAccountError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;

        if (!data.session) {
          router.push("/login");
          return;
        }

        if (!checkIsAdmin(data.session.user)) {
          router.push("/");
          return;
        }

        setSession(data.session);
        setUser(data.session.user);
      } finally {
        if (mounted) {
          setInitializing(false);
        }
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, [router]);

  const authHeaders = useMemo(() => {
    if (!session?.access_token) return undefined;
    return {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    };
  }, [session]);

  const handleChange =
    (field: keyof FormState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = event.target.value;
      setForm((prev) => ({
        ...prev,
        [field]: value,
      }));

      if (field === "customerAccountEmail") {
        setLinkedUser(null);
        setAccountError(null);
      }
    };

  const handleFindAccount = async () => {
    if (!authHeaders) return;
    const email = form.customerAccountEmail.trim();

    if (!email) {
      setAccountError("Nhập email tài khoản để tìm kiếm.");
      return;
    }

    try {
      setSearchingAccount(true);
      setAccountError(null);
      setLinkedUser(null);

      const response = await fetch(
        `/api/admin/users/search?email=${encodeURIComponent(email)}`,
        {
          headers: authHeaders,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Không thể tìm kiếm tài khoản.");
      }

      const data = await response.json();
      if (!data.user) {
        setAccountError("Không tìm thấy tài khoản nào với email này.");
        return;
      }

      setLinkedUser(data.user);
    } catch (err: any) {
      console.error("Error searching account:", err);
      setAccountError(err.message || "Xảy ra lỗi khi tìm tài khoản.");
    } finally {
      setSearchingAccount(false);
    }
  };

  const validateForm = () => {
    if (!form.name.trim()) return "Tên khách hàng là bắt buộc.";
    if (!form.date || !form.time) return "Ngày và giờ cuộc hẹn là bắt buộc.";
    if (!form.type.trim()) return "Loại buổi xem bài là bắt buộc.";
    if (!form.email.trim() && !form.phone.trim()) {
      return "Cung cấp ít nhất một phương thức liên hệ (email hoặc số điện thoại).";
    }

    const datetime = new Date(`${form.date}T${form.time}`);
    if (Number.isNaN(datetime.getTime())) {
      return "Ngày/giờ không hợp lệ.";
    }

    return null;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!session) return;

    const error = validateForm();
    if (error) {
      setFormErrors(error);
      return;
    }

    setFormErrors(null);

    try {
      setSaving(true);

      const { error: insertError } = await supabase
        .from("bookings")
        .insert({
          name: form.name.trim(),
          email: form.email.trim() || null,
          phone: form.phone.trim() || null,
          date: form.date,
          time: form.time,
          type: form.type.trim(),
          note: form.description.trim() || null,
          customer_user_id: linkedUser?.id || null,
        });

      if (insertError) {
        throw insertError;
      }

      router.push("/booking/manage");
    } catch (err: any) {
      console.error("Error creating booking:", err);
      setFormErrors(err.message || "Không thể tạo booking. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  if (initializing) {
    return <LoadingSpinner fullScreen text="Đang chuẩn bị biểu mẫu..." />;
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen px-4 pt-24 pb-12 bg-white">
      <div className="container-max mx-auto">
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Quản lý Booking", href: "/booking/manage" },
            { label: "Tạo Booking" },
          ]}
        />

        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-heading font-bold text-black mb-2">
              Tạo Booking mới
            </h1>
            <p className="text-gray-600 font-body">
              Ghi nhận đặt lịch thủ công cho khách hàng, kèm thông tin liên hệ và mô tả.
            </p>
          </div>

          {formErrors && (
            <div className="mb-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700 text-sm font-body">
              {formErrors}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-heading font-semibold text-black mb-4">
                Thông tin khách hàng
              </h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="customer_name" className="block text-sm font-medium text-gray-700 font-body">
                    Tên khách hàng <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="customer_name"
                    type="text"
                    value={form.name}
                    onChange={handleChange("name")}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 font-body shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-black"
                    required
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="customer_email" className="block text-sm font-medium text-gray-700 font-body">
                      Email liên hệ
                    </label>
                    <input
                      id="customer_email"
                      type="email"
                      value={form.email}
                      onChange={handleChange("email")}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 font-body shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="customer@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="customer_phone" className="block text-sm font-medium text-gray-700 font-body">
                      Số điện thoại
                    </label>
                    <input
                      id="customer_phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleChange("phone")}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 font-body shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="+84..."
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-heading font-semibold text-black mb-4">
                Thông tin cuộc hẹn
              </h2>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="booking_date" className="block text-sm font-medium text-gray-700 font-body">
                    Ngày hẹn <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="booking_date"
                    type="date"
                    value={form.date}
                    onChange={handleChange("date")}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 font-body shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-black"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="booking_time" className="block text-sm font-medium text-gray-700 font-body">
                    Giờ hẹn <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="booking_time"
                    type="time"
                    value={form.time}
                    onChange={handleChange("time")}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 font-body shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-black"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="booking_type" className="block text-sm font-medium text-gray-700 font-body">
                  Loại buổi xem <span className="text-rose-500">*</span>
                </label>
                <input
                  id="booking_type"
                  type="text"
                  value={form.type}
                  onChange={handleChange("type")}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 font-body shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Ví dụ: Tarot Love Reading"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="booking_description" className="block text-sm font-medium text-gray-700 font-body">
                  Mô tả / ghi chú cho buổi xem
                </label>
                <textarea
                  id="booking_description"
                  rows={4}
                  value={form.description}
                  onChange={handleChange("description")}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 font-body shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Chủ đề cần tập trung, bối cảnh của khách hàng..."
                />
              </div>
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-heading font-semibold text-black mb-4">
                Gắn với tài khoản (tùy chọn)
              </h2>

              <p className="text-sm text-gray-600 font-body mb-4">
                Nếu khách hàng đã có tài khoản trên hệ thống, bạn có thể gắn booking với tài khoản đó để theo dõi dễ dàng hơn.
              </p>

              <div className="space-y-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="flex-1">
                    <input
                      type="email"
                      value={form.customerAccountEmail}
                      onChange={handleChange("customerAccountEmail")}
                      placeholder="Nhập email tài khoản..."
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 font-body shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleFindAccount}
                    disabled={!authHeaders || searchingAccount}
                    className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2.5 font-body text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 transition"
                  >
                    {searchingAccount ? "Đang tìm..." : "Tìm tài khoản"}
                  </button>
                </div>

                {accountError && (
                  <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700 font-body">
                    {accountError}
                  </div>
                )}

                {linkedUser && (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 font-body text-sm text-emerald-700">
                    <p className="font-semibold">
                      Đã tìm thấy tài khoản: {linkedUser.email || linkedUser.id}
                    </p>
                    <p>Mã người dùng: {linkedUser.id}</p>
                    <p>Role: {linkedUser.role || "user"}</p>
                  </div>
                )}
              </div>
            </section>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => router.push("/booking/manage")}
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-6 py-2.5 font-body text-gray-700 transition hover:bg-gray-50 hover:text-gray-900"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center rounded-lg bg-black px-6 py-2.5 font-body font-medium text-white transition hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Đang lưu..." : "Tạo Booking"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}


