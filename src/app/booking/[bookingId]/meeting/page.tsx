"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import { checkIsAdmin } from "@/lib/adminUtils";
import Breadcrumb from "@/components/Breadcrumb";
import LoadingSpinner from "@/components/LoadingSpinner";
import Link from "next/link";

interface Booking {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  date: string;
  time: string;
  type: string;
  note: string | null;
  customer_user_id: string | null;
  created_at: string;
}

interface Meeting {
  id: string;
  booking_id: string;
  title: string | null;
  scheduled_for: string | null;
  platform: string | null;
  meeting_link: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
}

interface SpreadCard {
  id: string;
  meeting_id: string;
  question: string;
  answer: string;
  image_urls: string[] | null;
  position: number | null;
  created_at: string;
  updated_at: string | null;
}

interface MeetingFormState {
  title: string;
  scheduledDate: string;
  scheduledTime: string;
  platform: string;
  meetingLink: string;
  notes: string;
}

interface SpreadCardFormState {
  question: string;
  answer: string;
  imageUrls: string[];
}

export default function BookingMeetingPage() {
  const router = useRouter();
  const params = useParams<{ bookingId: string }>();
  const bookingId = params?.bookingId;

  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [initializing, setInitializing] = useState(true);

  const [booking, setBooking] = useState<Booking | null>(null);
  const [bookingLoading, setBookingLoading] = useState(true);

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [meetingLoading, setMeetingLoading] = useState(true);
  const [meetingSaving, setMeetingSaving] = useState(false);
  const [meetingForm, setMeetingForm] = useState<MeetingFormState>({
    title: "",
    scheduledDate: "",
    scheduledTime: "",
    platform: "",
    meetingLink: "",
    notes: "",
  });

  const [spreadCards, setSpreadCards] = useState<SpreadCard[]>([]);
  const [cardSaving, setCardSaving] = useState(false);
  const [cardForm, setCardForm] = useState<SpreadCardFormState>({
    question: "",
    answer: "",
    imageUrls: [""],
  });

  const [error, setError] = useState<string | null>(null);
  const [cardError, setCardError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        setInitializing(true);
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          throw error;
        }

        if (!mounted) return;

        if (!data.session) {
          router.push("/login");
          return;
        }

        const currentUser = data.session.user;
        if (!checkIsAdmin(currentUser)) {
          router.push("/");
          return;
        }

        setUser(currentUser);
        setSession(data.session);
      } catch (err) {
        console.error("Error initializing booking meeting page:", err);
        if (mounted) {
          setError("Không thể xác thực người dùng. Vui lòng đăng nhập lại.");
        }
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

  useEffect(() => {
    if (!bookingId || !user) return;

    const fetchBooking = async () => {
      try {
        setBookingLoading(true);
        const { data, error: fetchError } = await supabase
          .from<Booking>("bookings")
          .select("*")
          .eq("id", bookingId)
          .single();

        if (fetchError) {
          console.error("Error fetching booking:", fetchError);
          setError("Không tìm thấy booking hoặc bạn không có quyền truy cập.");
          setBooking(null);
          return;
        }

        setBooking(data);

        // Prefill meeting form defaults if not set yet
        setMeetingForm((prev) => ({
          ...prev,
          scheduledDate: prev.scheduledDate || data.date || "",
          scheduledTime: prev.scheduledTime || data.time || "",
        }));
      } catch (err) {
        console.error("Unexpected error fetching booking:", err);
        setError("Đã xảy ra lỗi khi tải booking.");
        setBooking(null);
      } finally {
        setBookingLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId, user]);

  const authHeaders = useMemo(() => {
    if (!session?.access_token) return undefined;
    return {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    };
  }, [session]);

  const fetchMeeting = async () => {
    if (!bookingId || !authHeaders) return;

    try {
      setMeetingLoading(true);
      setError(null);
      const response = await fetch(
        `/api/admin/meetings?bookingId=${bookingId}&withCards=true`,
        {
          headers: authHeaders,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Không thể tải thông tin meeting.");
      }

      const data = await response.json();
      const meetings: (Meeting & { spread_cards?: SpreadCard[] })[] = data.meetings || [];
      const currentMeeting = meetings.length > 0 ? meetings[0] : null;

      if (currentMeeting) {
        setMeeting(currentMeeting);
        setMeetingForm({
          title: currentMeeting.title ?? "",
          scheduledDate: currentMeeting.scheduled_for
            ? new Date(currentMeeting.scheduled_for).toISOString().split("T")[0]
            : "",
          scheduledTime: currentMeeting.scheduled_for
            ? new Date(currentMeeting.scheduled_for)
                .toISOString()
                .split("T")[1]
                ?.slice(0, 5) ?? ""
            : "",
          platform: currentMeeting.platform ?? "",
          meetingLink: currentMeeting.meeting_link ?? "",
          notes: currentMeeting.notes ?? "",
        });
        setSpreadCards(currentMeeting.spread_cards ?? []);
      } else {
        setMeeting(null);
        setSpreadCards([]);
      }
    } catch (err: any) {
      console.error("Error fetching meeting:", err);
      setError(err.message || "Đã xảy ra lỗi khi tải meeting.");
      setMeeting(null);
      setSpreadCards([]);
    } finally {
      setMeetingLoading(false);
    }
  };

  useEffect(() => {
    if (!authHeaders || !bookingId) return;
    fetchMeeting();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authHeaders, bookingId]);

  const derivedMeetingDateTime = useMemo(() => {
    if (!meetingForm.scheduledDate && !meetingForm.scheduledTime) return null;
    if (!meetingForm.scheduledDate) return null;
    const time = meetingForm.scheduledTime || "00:00";
    return new Date(`${meetingForm.scheduledDate}T${time}:00`);
  }, [meetingForm.scheduledDate, meetingForm.scheduledTime]);

  const handleMeetingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authHeaders) return;

    try {
      setMeetingSaving(true);
      setError(null);

      const payload = {
        bookingId,
        title: meetingForm.title,
        scheduledFor: derivedMeetingDateTime ? derivedMeetingDateTime.toISOString() : null,
        platform: meetingForm.platform,
        meetingLink: meetingForm.meetingLink,
        notes: meetingForm.notes,
      };

      const url = meeting ? `/api/admin/meetings/${meeting.id}` : "/api/admin/meetings";
      const method = meeting ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: authHeaders,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Không thể lưu meeting.");
      }

      await fetchMeeting();
    } catch (err: any) {
      console.error("Error saving meeting:", err);
      setError(err.message || "Đã xảy ra lỗi khi lưu meeting.");
    } finally {
      setMeetingSaving(false);
    }
  };

  const handleAddImageField = () => {
    setCardForm((prev) => ({
      ...prev,
      imageUrls: [...prev.imageUrls, ""],
    }));
  };

  const handleCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authHeaders || !meeting) return;

    const sanitizedImageUrls = cardForm.imageUrls
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    if (!cardForm.question.trim() || !cardForm.answer.trim()) {
      setCardError("Vui lòng nhập đầy đủ câu hỏi và câu trả lời.");
      return;
    }

    try {
      setCardSaving(true);
      setCardError(null);

      const response = await fetch(
        `/api/admin/meetings/${meeting.id}/spread-cards`,
        {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({
            question: cardForm.question,
            answer: cardForm.answer,
            imageUrls: sanitizedImageUrls,
            position: spreadCards.length + 1,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Không thể thêm spread card.");
      }

      const { spreadCard } = await response.json();
      setSpreadCards((prev) => [...prev, spreadCard]);
      setCardForm({
        question: "",
        answer: "",
        imageUrls: [""],
      });
    } catch (err: any) {
      console.error("Error creating spread card:", err);
      setCardError(err.message || "Đã xảy ra lỗi khi thêm spread card.");
    } finally {
      setCardSaving(false);
    }
  };

  const handleDeleteSpreadCard = async (id: string) => {
    if (!authHeaders) return;
    if (!confirm("Bạn có chắc chắn muốn xóa spread card này?")) return;

    try {
      const response = await fetch(`/api/admin/spread-cards/${id}`, {
        method: "DELETE",
        headers: authHeaders,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Không thể xóa spread card.");
      }

      setSpreadCards((prev) => prev.filter((card) => card.id !== id));
    } catch (err: any) {
      console.error("Error deleting spread card:", err);
      alert(err.message || "Đã xảy ra lỗi khi xóa spread card.");
    }
  };

  if (initializing || bookingLoading || meetingLoading) {
    return <LoadingSpinner fullScreen text="Đang tải thông tin meeting..." />;
  }

  if (!user || !bookingId) {
    return null;
  }

  if (!booking) {
    return (
      <main className="min-h-screen px-4 pt-24 pb-12 bg-white">
        <div className="container-max mx-auto">
          <Breadcrumb
            items={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Quản lý Booking", href: "/booking/manage" },
              { label: "Meeting" },
            ]}
          />

          <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm text-center">
            <h1 className="text-2xl font-heading font-bold text-black mb-4">
              Không tìm thấy booking
            </h1>
            <p className="text-gray-600 font-body mb-6">
              Booking bạn đang tìm có thể đã bị xoá hoặc bạn không có quyền truy cập.
            </p>
            <Link
              href="/booking/manage"
              className="inline-flex items-center justify-center rounded-lg bg-black px-6 py-2.5 font-body font-medium text-white transition hover:bg-gray-900"
            >
              Quay lại quản lý booking
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 pt-24 pb-16 bg-white">
      <div className="container-max mx-auto">
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Quản lý Booking", href: "/booking/manage" },
            { label: booking.name },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold text-black mb-2">
            Meeting cho {booking.name}
          </h1>
          <p className="text-gray-600 font-body">
            Quản lý cuộc hẹn và các spread cards cho booking này.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700 text-sm font-body">
            {error}
          </div>
        )}

        <section className="mb-10 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-heading font-semibold text-black mb-4">
            Thông tin Booking
          </h2>
          <dl className="grid gap-4 sm:grid-cols-2 font-body text-gray-700">
            <div>
              <dt className="text-sm text-gray-500">Khách hàng</dt>
              <dd className="text-lg font-medium text-gray-900">{booking.name}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Email</dt>
              <dd className="text-lg font-medium text-gray-900">
                {booking.email || "Chưa có email"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Số điện thoại</dt>
              <dd className="text-lg font-medium text-gray-900">
                {booking.phone || "Chưa cung cấp"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Ngày & Giờ</dt>
              <dd className="text-lg font-medium text-gray-900">
                {booking.date
                  ? new Date(booking.date).toLocaleDateString("vi-VN")
                  : "Chưa xác định"}{" "}
                {booking.time}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Loại</dt>
              <dd className="text-lg font-medium text-gray-900">{booking.type}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm text-gray-500">Ghi chú</dt>
              <dd className="text-gray-700">{booking.note || "Không có ghi chú"}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm text-gray-500">Tài khoản gắn liên kết</dt>
              <dd className="text-gray-700">
                {booking.customer_user_id ? (
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">
                    Đã liên kết ({booking.customer_user_id})
                  </span>
                ) : (
                  "Chưa liên kết"
                )}
              </dd>
            </div>
          </dl>
        </section>

        <section className="mb-10 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-heading font-semibold text-black">
                {meeting ? "Chỉnh sửa Meeting" : "Tạo Meeting mới"}
              </h2>
              <p className="text-sm text-gray-600 font-body">
                Thiết lập thông tin cuộc hẹn với khách hàng.
              </p>
            </div>
            {meeting && (
              <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
                Meeting đã được tạo
              </span>
            )}
          </div>

          <form onSubmit={handleMeetingSubmit} className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="meeting_title" className="block text-sm font-medium text-gray-700 font-body">
                  Tiêu đề meeting
                </label>
                <input
                  id="meeting_title"
                  type="text"
                  value={meetingForm.title}
                  onChange={(e) =>
                    setMeetingForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 font-body shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Ví dụ: Tarot Reading với Alex"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="meeting_platform" className="block text-sm font-medium text-gray-700 font-body">
                  Nền tảng
                </label>
                <input
                  id="meeting_platform"
                  type="text"
                  value={meetingForm.platform}
                  onChange={(e) =>
                    setMeetingForm((prev) => ({ ...prev, platform: e.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 font-body shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Zoom, Google Meet..."
                />
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="meeting_date" className="block text-sm font-medium text-gray-700 font-body">
                  Ngày meeting
                </label>
                <input
                  id="meeting_date"
                  type="date"
                  value={meetingForm.scheduledDate}
                  onChange={(e) =>
                    setMeetingForm((prev) => ({
                      ...prev,
                      scheduledDate: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 font-body shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="meeting_time" className="block text-sm font-medium text-gray-700 font-body">
                  Giờ meeting
                </label>
                <input
                  id="meeting_time"
                  type="time"
                  value={meetingForm.scheduledTime}
                  onChange={(e) =>
                    setMeetingForm((prev) => ({
                      ...prev,
                      scheduledTime: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 font-body shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="meeting_link" className="block text-sm font-medium text-gray-700 font-body">
                Link meeting
              </label>
              <input
                id="meeting_link"
                type="url"
                value={meetingForm.meetingLink}
                onChange={(e) =>
                  setMeetingForm((prev) => ({ ...prev, meetingLink: e.target.value }))
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 font-body shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="meeting_notes" className="block text-sm font-medium text-gray-700 font-body">
                Ghi chú
              </label>
              <textarea
                id="meeting_notes"
                value={meetingForm.notes}
                onChange={(e) =>
                  setMeetingForm((prev) => ({ ...prev, notes: e.target.value }))
                }
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 font-body shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Ghi chú chuẩn bị, chủ đề chính..."
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={meetingSaving}
                className="inline-flex items-center justify-center rounded-lg bg-black px-6 py-2.5 font-body font-medium text-white transition hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {meetingSaving
                  ? "Đang lưu..."
                  : meeting
                  ? "Cập nhật meeting"
                  : "Tạo meeting"}
              </button>
            </div>
          </form>
        </section>

        <section className="mb-16 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-heading font-semibold text-black">
                Spread Cards
              </h2>
              <p className="text-sm text-gray-600 font-body">
                Mỗi spread card bao gồm câu hỏi, hình ảnh và phần giải bài chi tiết.
              </p>
            </div>
            {!meeting && (
              <span className="text-sm font-body text-rose-600">
                Tạo meeting trước khi thêm spread cards.
              </span>
            )}
          </div>

          {meeting && (
            <form onSubmit={handleCardSubmit} className="mb-10 space-y-4">
              <div className="space-y-2">
                <label htmlFor="card_question" className="block text-sm font-medium text-gray-700 font-body">
                  Câu hỏi <span className="text-rose-500">*</span>
                </label>
                <input
                  id="card_question"
                  type="text"
                  value={cardForm.question}
                  onChange={(e) =>
                    setCardForm((prev) => ({ ...prev, question: e.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 font-body shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="card_answer" className="block text-sm font-medium text-gray-700 font-body">
                  Câu trả lời chi tiết <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="card_answer"
                  value={cardForm.answer}
                  onChange={(e) =>
                    setCardForm((prev) => ({ ...prev, answer: e.target.value }))
                  }
                  rows={6}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 font-body shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-black"
                  required
                  placeholder="Viết phần giải bài Tarot chi tiết..."
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 font-body">
                  Hình ảnh (nhiều URL)
                </label>

                <div className="space-y-3">
                  {cardForm.imageUrls.map((url, index) => (
                    <div key={index} className="flex gap-3">
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => {
                          const newUrls = [...cardForm.imageUrls];
                          newUrls[index] = e.target.value;
                          setCardForm((prev) => ({
                            ...prev,
                            imageUrls: newUrls,
                          }));
                        }}
                        placeholder="https://..."
                        className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 font-body shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-black"
                      />
                      {cardForm.imageUrls.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            setCardForm((prev) => ({
                              ...prev,
                              imageUrls: prev.imageUrls.filter((_, i) => i !== index),
                            }));
                          }}
                          className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-3 py-2 font-body text-sm text-gray-600 hover:bg-gray-50 transition"
                        >
                          Xoá
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleAddImageField}
                  className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2 font-body text-sm text-gray-700 hover:bg-gray-50 transition"
                >
                  + Thêm hình ảnh
                </button>
              </div>

              {cardError && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700 text-sm font-body">
                  {cardError}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={cardSaving}
                  className="inline-flex items-center justify-center rounded-lg bg-black px-6 py-2.5 font-body font-medium text-white transition hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {cardSaving ? "Đang lưu..." : "Thêm spread card"}
                </button>
              </div>
            </form>
          )}

          {spreadCards.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center">
              <p className="text-gray-600 font-body">
                {meeting
                  ? "Chưa có spread card nào. Tạo mới ở form bên trên."
                  : "Tạo meeting trước để thêm spread cards."}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {spreadCards.map((spreadCard, index) => (
                <article
                  key={spreadCard.id}
                  className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-xl font-heading font-semibold text-black">
                        Spread Card #{index + 1}
                      </h3>
                      <p className="text-sm text-gray-500 font-body">
                        Câu hỏi: {spreadCard.question}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteSpreadCard(spreadCard.id)}
                      className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-3 py-1.5 font-body text-sm text-gray-600 hover:bg-gray-50 transition"
                    >
                      Xoá
                    </button>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide font-body">
                        Câu trả lời
                      </h4>
                      <p className="mt-1 whitespace-pre-line text-gray-700 font-body leading-relaxed">
                        {spreadCard.answer}
                      </p>
                    </div>

                    {spreadCard.image_urls && spreadCard.image_urls.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide font-body">
                          Hình ảnh
                        </h4>
                        <div className="mt-2 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {spreadCard.image_urls.map((url, imgIndex) => (
                            <div
                              key={imgIndex}
                              className="relative aspect-[2/3] overflow-hidden rounded-lg border border-gray-200 bg-gray-100"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={url}
                                alt={`Spread card ${index + 1} image ${imgIndex + 1}`}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}


