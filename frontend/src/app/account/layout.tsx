import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Account",
  description: "Manage your 86Connect account, track applications, and view your submissions.",
  robots: { index: false, follow: false },
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
