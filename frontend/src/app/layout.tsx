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
    default: "86 Connect — Study in China & Product Sourcing from China",
    template: "%s | 86 Connect",
  },
  description:
    "86 Connect is your trusted gateway to China. We provide end-to-end services for Study in China (scholarships, university admissions, visas) and Product Sourcing from China (supplier finding, procurement, quality control, logistics). Serving clients in 30+ countries worldwide.",
  keywords: [
    "Study in China",
    "Product Sourcing from China",
    "Scholarship Applications China",
    "University Admissions China",
    "China Supplier Finding",
    "China Procurement Services",
    "China education consultancy",
    "China sourcing agent",
    "Study abroad China",
    "China product sourcing",
    "China manufacturer sourcing",
    "Chinese university application",
    "CSC scholarship",
    "China logistics",
    "China quality control",
    "China business consulting",
    "International students China",
    "Import from China",
    "China wholesale sourcing",
    "Beijing education consultancy",
  ],
  authors: [{ name: "86 Connect", url: SITE_URL }],
  creator: "86 Connect",
  publisher: "86 Connect",
  category: "Business",
  alternates: {
    canonical: "/",
    languages: {
      "en": SITE_URL,
      "zh": `${SITE_URL}/zh`,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
    other: {
      "baidu-site-verification": [process.env.NEXT_PUBLIC_BAIDU_VERIFICATION || ""],
      "msvalidate.01": [process.env.NEXT_PUBLIC_BING_VERIFICATION || ""],
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "86 Connect",
    title: "86 Connect — Study in China & Product Sourcing from China",
    description:
      "86 Connect is your trusted gateway to China. We provide end-to-end services for Study in China (scholarships, university admissions, visas) and Product Sourcing from China (supplier finding, procurement, quality control, logistics).",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "86 Connect — Your Gateway to China",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@86connect",
    creator: "@86connect",
    title: "86 Connect — Study in China & Product Sourcing from China",
    description:
      "86 Connect is your trusted gateway to China. End-to-end services for studying in China and sourcing products from China.",
    images: ["/og-image.jpg"],
  },
  other: {
    "geo.region": "CN-BJ",
    "geo.placename": "Beijing",
    "geo.position": "39.9042;116.4074",
    "ICBM": "39.9042, 116.4074",
    "fb:page_id": process.env.NEXT_PUBLIC_FACEBOOK_PAGE_ID || "",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
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
