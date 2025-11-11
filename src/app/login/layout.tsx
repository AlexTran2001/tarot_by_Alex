import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng nhập",
  description: "Đăng nhập vào tài khoản Tarot by Alex để truy cập các tính năng VIP và quản trị.",
  robots: {
    index: false, // Login pages typically shouldn't be indexed
    follow: false,
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

