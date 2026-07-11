import type { Metadata } from "next";
import { AdminLayoutClient } from "@/components/layout/admin-layout-client";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "86Connect admin dashboard for managing submissions and users.",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
