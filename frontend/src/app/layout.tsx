import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { RouteLayout } from "@/components/layout/route-layout";
import { NavigationProgress } from "@/components/layout/navigation-progress";
import "./globals.css";

const nunito = localFont({
  variable: "--font-nunito",
  src: [
    { path: "../../public/fonts/nunito-400.ttf", weight: "400", style: "normal" },
    { path: "../../public/fonts/nunito-500.ttf", weight: "500", style: "normal" },
    { path: "../../public/fonts/nunito-600.ttf", weight: "600", style: "normal" },
    { path: "../../public/fonts/nunito-700.ttf", weight: "700", style: "normal" },
    { path: "../../public/fonts/nunito-800.ttf", weight: "800", style: "normal" },
    { path: "../../public/fonts/nunito-900.ttf", weight: "900", style: "normal" },
  ],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
});

const dmSans = localFont({
  variable: "--font-dm-sans",
  src: [
    { path: "../../public/fonts/dmsans-400.ttf", weight: "400", style: "normal" },
    { path: "../../public/fonts/dmsans-500.ttf", weight: "500", style: "normal" },
    { path: "../../public/fonts/dmsans-600.ttf", weight: "600", style: "normal" },
    { path: "../../public/fonts/dmsans-700.ttf", weight: "700", style: "normal" },
  ],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
});

const SITE_URL = "https://the86connects.com";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#DC2626",
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "86 Connect - Study in China & Product Sourcing Services",
    template: "%s | 86 Connect",
  },
  description:
    "Professional services for Study in China assistance and Product Sourcing from China. Scholarships, university admissions, supplier finding, procurement, and logistics support.",
  keywords: [
    "Study in China",
    "Product Sourcing from China",
    "Scholarship Applications China",
    "University Admissions China",
    "China Supplier Finding",
    "China Procurement Services",
    "China education consultancy",
    "China sourcing agent",
  ],
  authors: [{ name: "86 Connect" }],
  creator: "86 Connect",
  publisher: "86 Connect",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "86 Connect",
    title: "86 Connect - Study in China & Product Sourcing Services",
    description:
      "Professional services for Study in China assistance and Product Sourcing from China. Scholarships, university admissions, supplier finding, procurement, and logistics support.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "86 Connect - Your Gateway to China",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "86 Connect - Study in China & Product Sourcing Services",
    description:
      "Professional services for Study in China assistance and Product Sourcing from China.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${nunito.variable} ${dmSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans">
        <NavigationProgress />
        <RouteLayout>{children}</RouteLayout>
      </body>
    </html>
  );
}
