import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create your 86 Connect account to track study applications and product sourcing inquiries.",
  robots: { index: false, follow: false },
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
