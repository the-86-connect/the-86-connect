import type { Metadata, Viewport } from "next";
import { Nunito, DM_Sans } from "next/font/google";
import { ContactProvider } from "@/context/contact-context";
import { AuthProvider } from "@/context/auth-context";
import { UserAuthProvider } from "@/context/user-auth-context";
import { Toaster } from "@/components/ui/toaster";
import { StructuredData } from "@/components/structured-data";
import { CookieConsent } from "@/components/layout/cookie-consent";
import { WhatsAppButton } from "@/components/layout/whatsapp-button";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const SITE_URL = "https://the86connects.com";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#DC2626",
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
    icon: "/favicon.ico",
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
    >
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider>
          <UserAuthProvider>
            <ContactProvider>
              <StructuredData />
              {children}
              <Toaster />
              <CookieConsent />
              <WhatsAppButton />
            </ContactProvider>
          </UserAuthProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
