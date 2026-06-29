import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Set Password",
  description: "Set your password to activate your 86 Connect account.",
  robots: { index: false, follow: false },
};

export default function SetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
