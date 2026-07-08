"use client";

import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { useAuth } from "@/context/auth-context";

export function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoginPage) {
    return <>{children}</>;
  }

  // Don't show sidebar until auth is confirmed
  if (isLoading || !isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="admin-bg min-h-screen flex">
      <AdminSidebar />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
