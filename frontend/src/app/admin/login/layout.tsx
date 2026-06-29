import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Login",
  description: "86 Connect admin login page.",
  robots: { index: false, follow: false },
};

export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
