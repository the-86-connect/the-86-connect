import type { MetadataRoute } from "next";

const SITE_URL = "https://the86connects.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/account/", "/login", "/signup", "/forgot-password", "/reset-password", "/set-password"],
      },
      {
        userAgent: "Baiduspider",
        allow: "/",
        disallow: ["/admin/", "/api/", "/account/", "/login", "/signup", "/forgot-password", "/reset-password", "/set-password"],
        crawlDelay: 1,
      },
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: ["/admin/", "/api/", "/account/", "/login", "/signup", "/forgot-password", "/reset-password", "/set-password"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/admin/", "/api/", "/account/", "/login", "/signup", "/forgot-password", "/reset-password", "/set-password"],
      },
      {
        userAgent: "YandexBot",
        allow: "/",
        disallow: ["/admin/", "/api/", "/account/", "/login", "/signup", "/forgot-password", "/reset-password", "/set-password"],
      },
      {
        userAgent: "GPTBot",
        disallow: "/",
      },
    ],
    sitemap: [
      `${SITE_URL}/sitemap.xml`,
    ],
  };
}