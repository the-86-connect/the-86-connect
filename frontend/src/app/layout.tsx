import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { RouteLayout } from "@/components/layout/route-layout";
import { NavigationProgress } from "@/components/layout/navigation-progress";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { OrganizationSchema, WebSiteSchema } from "@/components/seo/structured-data";
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

const SITE_URL = "https://www.the86connect.com";

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
    default: "86Connect — Study in China & Product Sourcing from China",
    template: "%s | 86Connect",
  },
  description:
    "86Connect is your trusted gateway to China. We provide end-to-end services for Study in China (scholarships, university admissions, visas) and Product Sourcing from China (supplier finding, procurement, quality control, logistics). Serving clients in 30+ countries worldwide.",
  keywords: [
    // Core
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
    // African countries
    "Study in China from Nigeria",
    "Study in China for Nigerian students",
    "Study in China for African students",
    "China scholarship for Nigerian students",
    "Study abroad in China from Kenya",
    "Study in China from Ghana",
    "Study in China from South Africa",
    "Study in China from Ethiopia",
    "Study in China from Tanzania",
    "Study in China from Uganda",
    "Study in China from Egypt",
    "Study in China from Morocco",
    "Study in China from Rwanda",
    "Study in China from Cameroon",
    "Study in China from Zambia",
    "Study in China from Zimbabwe",
    "Study in China from Senegal",
    "Product sourcing from China to Nigeria",
    "Import from China to South Africa",
    "Import from China to Kenya",
    "Import from China to Ghana",
    "China suppliers for African businesses",
    "China to Ghana shipping",
    "China to Nigeria shipping",
    "China to Kenya shipping",
    "Scholarship in China for African students",
    "MBBS in China for African students",
    "Study in China for African students scholarship",
    // Asian countries
    "Study in China from India",
    "Study in China from Pakistan",
    "Study in China from Bangladesh",
    "Study in China from Indonesia",
    "Study in China from Philippines",
    "Study in China from Vietnam",
    "Study in China from Thailand",
    "Study in China from Malaysia",
    "Study in China from Nepal",
    "Study in China from Sri Lanka",
    "China scholarship for Indian students",
    "MBBS in China for Pakistani students",
    "China scholarship for Pakistani students",
    "Import from China to India",
    "Import from China to Pakistan",
    "Import from China to Bangladesh",
    "Import from China to Indonesia",
    // Middle East
    "Study in China from UAE",
    "Study in China from Saudi Arabia",
    "Study in China from Qatar",
    "Study in China from Oman",
    "Study in China from Kuwait",
    "Study in China from Jordan",
    "China sourcing for Dubai businesses",
    "Import from China to UAE",
    "Import from China to Saudi Arabia",
    // Europe & Americas
    "Study in China from UK",
    "Study in China from USA",
    "Study in China from Canada",
    "Study in China from Australia",
    "Study in China from Germany",
    "Study in China from France",
    "Import from China to USA",
    "Import from China to UK",
    "Import from China to Canada",
    "Import from China to Australia",
    "Import from China to Germany",
    // CIS
    "Study in China from Russia",
    "Study in China from Kazakhstan",
    "Study in China from Uzbekistan",
    // General
    "China study abroad agency",
    "China sourcing company",
    "China procurement agent",
    "Find Chinese suppliers",
    "China factory sourcing",
    "China supply chain management",
    "China import export",
    "Chinese government scholarship",
    "Study in Beijing",
    "China student visa",
    "China business visa",
    "China trade consulting",
    "China product inspection",
    "China freight forwarding",
    "China to worldwide shipping",
    "Cheap universities in China",
    "China scholarship for international students",
    "Best universities in China for international students",
  ],
  authors: [{ name: "86Connect", url: SITE_URL }],
  creator: "86Connect",
  publisher: "86Connect",
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
    siteName: "86Connect",
    title: "86Connect — Study in China & Product Sourcing from China",
    description:
      "86Connect is your trusted gateway to China. We provide end-to-end services for Study in China (scholarships, university admissions, visas) and Product Sourcing from China (supplier finding, procurement, quality control, logistics).",
    images: [
      {
        url: `${SITE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "86Connect — Your Gateway to China",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@86connect",
    creator: "@86connect",
    title: "86Connect — Study in China & Product Sourcing from China",
    description:
      "86Connect is your trusted gateway to China. End-to-end services for studying in China and sourcing products from China.",
    images: [`${SITE_URL}/og-image.jpg`],
  },
  other: {
    "geo.region": "CN-BJ",
    "geo.placename": "Beijing",
    "geo.position": "39.9042;116.4074",
    "ICBM": "39.9042, 116.4074",
    "fb:page_id": process.env.NEXT_PUBLIC_FACEBOOK_PAGE_ID || "",
    "baidu-site-verification": process.env.NEXT_PUBLIC_BAIDU_VERIFICATION
      ? `code-${process.env.NEXT_PUBLIC_BAIDU_VERIFICATION}`
      : "",
    "renderer": "webkit",
    "applicable-device": "pc,mobile",
    "og:locale:alternate": "zh_CN",
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
        <OrganizationSchema />
        <WebSiteSchema />
        <NavigationProgress />
        <ErrorBoundary>
          <RouteLayout>{children}</RouteLayout>
        </ErrorBoundary>
      </body>
    </html>
  );
}
