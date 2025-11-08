"use client";

import { useState, useEffect } from "react";
import emailjs from "emailjs-com";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface FormAdProps {
    adId?: string;
}

export default function FormAd({ adId }: FormAdProps) {
    const router = useRouter();
    const isEditMode = !!adId;

    const [form, setForm] = useState({
        title: "",
        content: "",
        expireAt: "",
    });

    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>("");
    const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(isEditMode);
    const [status, setStatus] = useState<
        "idle" | "uploading" | "sending" | "error" | "success"
    >("idle");
    const [errorMsg, setErrorMsg] = useState("");

    // Load ad data if editing
    useEffect(() => {
        if (isEditMode && adId) {
            const fetchAd = async () => {
                try {
                    setLoading(true);
                    const res = await fetch(`/api/ads/${adId}`);
                    if (!res.ok) {
                        throw new Error("Không tìm thấy quảng cáo");
                    }
                    const data = await res.json();
                    const ad = data.ad;

                    setForm({
                        title: ad.title || "",
                        content: ad.content || "",
                        expireAt: ad.expire_at
                            ? new Date(ad.expire_at).toISOString().slice(0, 16)
                            : "",
                    });
                    if (ad.image_url) {
                        setExistingImageUrl(ad.image_url);
                    }
                } catch (err: any) {
                    setErrorMsg(err.message || "Lỗi khi tải dữ liệu");
                } finally {
                    setLoading(false);
                }
            };
            fetchAd();
        }
    }, [isEditMode, adId]);

    // Cleanup preview URL on unmount
    useEffect(() => {
        return () => {
            if (preview) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [preview]);

    async function uploadImage() {
        if (!file) return null;
        setStatus("uploading");

        try {
            // Validate file type
            if (!file.type.startsWith("image/")) {
                throw new Error("File phải là hình ảnh.");
            }

            // Validate file size (max 5MB)
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (file.size > maxSize) {
                throw new Error("Kích thước file phải nhỏ hơn 5MB.");
            }

            // Upload via API route
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/ads/upload", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data?.error || "Không thể tải ảnh lên.");
            }

            const data = await res.json();
            console.log("Image uploaded successfully, URL:", data.url);
            return data.url;
        } catch (err: any) {
            throw new Error(err.message || "Lỗi khi tải ảnh lên.");
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErrorMsg("");

        if (!form.title.trim()) {
            setErrorMsg("Tiêu đề là bắt buộc.");
            return;
        }

        try {
            // Only upload image if file is selected
            let imageUrl: string | null = null;
            if (file) {
                imageUrl = await uploadImage();
            }

            setStatus("sending");
            const payload = {
                ...form,
                image_url: imageUrl || existingImageUrl,
                author_id: null, // có thể thêm user ID thật sau
            };

            console.log("Submitting ad with payload:", { ...payload, image_url: imageUrl || existingImageUrl ? "present" : "null" });

            const url = isEditMode ? `/api/ads/${adId}` : "/api/ads";
            const method = isEditMode ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data?.error || "Lỗi server");
            }

            // Only send email on create, not on edit
            if (!isEditMode) {
                try {
                    await emailjs.send(
                        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
                        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
                        {
                            title: form.title,
                            content: form.content,
                            expire_at: form.expireAt,
                        },
                        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
                    );
                } catch (emailError) {
                    console.warn("Email sending failed:", emailError);
                    // Continue even if email fails
                }
            }

            setStatus("success");
            setTimeout(() => router.push("/ads/manage"), 1200);
        } catch (err: any) {
            console.error("Form submission error:", err);
            setErrorMsg(err.message || "Đã xảy ra lỗi. Vui lòng thử lại.");
            setStatus("error");
        }
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const selected = e.target.files?.[0];
        if (selected) {
            // Validate file type
            if (!selected.type.startsWith("image/")) {
                setErrorMsg("File phải là hình ảnh.");
                return;
            }

            // Validate file size (max 5MB)
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (selected.size > maxSize) {
                setErrorMsg("Kích thước file phải nhỏ hơn 5MB.");
                return;
            }

            // Clear previous error
            setErrorMsg("");
            setFile(selected);
            setPreview(URL.createObjectURL(selected));
        }
    }

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto py-12 px-6 bg-white rounded-xl shadow-md text-center">
                <svg
                    className="animate-spin h-8 w-8 text-black mx-auto mb-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    ></circle>
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                </svg>
                <p className="text-gray-600 font-body">Đang tải dữ liệu...</p>
            </div>
        );
    }

    return (
        <section className="max-w-2xl mx-auto py-12 px-6 bg-white rounded-xl shadow-md">
            <h2 className="text-2xl font-semibold mb-6 text-center">
                {isEditMode ? "✏️ Chỉnh sửa quảng cáo" : "🪄 Đăng bài quảng cáo Tarot"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Tiêu đề */}
                <div>
                    <label className="block text-sm font-medium text-zinc-700">
                        Tiêu đề <span className="text-rose-500">*</span>
                    </label>
                    <input
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        className="mt-1 w-full border border-zinc-300 rounded-lg px-3 py-2 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        placeholder="Ví dụ: Ưu đãi đọc bài tháng 11"
                    />
                </div>

                {/* Nội dung */}
                <div>
                    <label className="block text-sm font-medium text-zinc-700">
                        Nội dung
                    </label>
                    <textarea
                        value={form.content}
                        onChange={(e) => setForm({ ...form, content: e.target.value })}
                        className="mt-1 w-full border border-zinc-300 rounded-lg px-3 py-2 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        rows={5}
                        placeholder="Viết mô tả ngắn gọn về chương trình hoặc thông tin bạn muốn chia sẻ..."
                    />
                </div>

                {/* Ảnh */}
                <div>
                    <label className="block text-sm font-medium text-zinc-700">
                        Ảnh minh họa (tùy chọn)
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="mt-1 block w-full text-sm text-zinc-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />

                    {(preview || existingImageUrl) && (
                        <motion.div
                            key={preview || existingImageUrl}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mt-4 relative inline-block"
                        >
                            <img
                                src={preview || existingImageUrl || ""}
                                alt="preview"
                                className="w-40 h-40 object-cover rounded-lg border"
                            />
                            {existingImageUrl && !preview && (
                                <p className="text-xs text-gray-500 mt-2">Ảnh hiện tại</p>
                            )}
                        </motion.div>
                    )}
                </div>

                {/* Ngày hết hạn */}
                <div>
                    <label className="block text-sm font-medium text-zinc-700">
                        Ngày hết hạn
                    </label>
                    <input
                        type="datetime-local"
                        value={form.expireAt}
                        onChange={(e) => setForm({ ...form, expireAt: e.target.value })}
                        className="mt-1 w-full border border-zinc-300 rounded-lg px-3 py-2 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    />
                </div>

                {/* Trạng thái / thông báo */}
                <AnimatePresence>
                    {errorMsg && (
                        <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="text-sm text-rose-600"
                        >
                            ⚠️ {errorMsg}
                        </motion.div>
                    )}
                    {status === "success" && (
                        <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="text-sm text-green-600"
                        >
                            ✅ Bài đăng đã được gửi thành công!
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Nút submit */}
                <motion.button
                    type="submit"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    disabled={status === "uploading" || status === "sending" || status === "success"}
                    className={`w-full py-3 rounded-full font-medium text-white transition-all ${status === "uploading" || status === "sending" || status === "success"
                        ? "bg-zinc-400 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-700"
                        }`}
                >
                    {status === "uploading"
                        ? "Đang tải ảnh..."
                        : status === "sending"
                            ? isEditMode ? "Đang cập nhật..." : "Đang gửi..."
                            : status === "success"
                                ? isEditMode ? "Đã cập nhật thành công!" : "Đã gửi thành công!"
                                : isEditMode ? "Cập nhật" : "Đăng bài"}
                </motion.button>
            </form>
        </section>
    );
}
