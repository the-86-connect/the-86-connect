import type { FAQSection } from "@/components/sections/faq-accordion";

/* ======================================================================
   JSON-LD Structured Data Components
   Used for Google Rich Results, Baidu, Bing, and other search engines
   ====================================================================== */

// ── Types ────────────────────────────────────────────────────────────

interface BreadcrumbItem {
  name: string;
  href: string;
}

// ── Constants ────────────────────────────────────────────────────────

const SITE_URL = "https://www.the86connect.com";

const COUNTRIES_SERVED = [
  // Africa
  "Nigeria", "Kenya", "Ghana", "South Africa", "Ethiopia", "Tanzania",
  "Uganda", "Egypt", "Morocco", "Rwanda", "Cameroon", "Zambia",
  "Zimbabwe", "Senegal", "Ivory Coast", "Botswana", "Namibia",
  "Mauritius", "Sudan", "Algeria", "Tunisia", "Libya",
  // Asia
  "India", "Pakistan", "Bangladesh", "Indonesia", "Philippines",
  "Vietnam", "Thailand", "Malaysia", "Nepal", "Sri Lanka",
  "Cambodia", "Myanmar", "Mongolia",
  // Middle East
  "United Arab Emirates", "Saudi Arabia", "Qatar", "Oman", "Kuwait",
  "Jordan", "Bahrain", "Turkey", "Iran", "Iraq",
  // Europe & Americas
  "United Kingdom", "United States", "Canada", "Australia",
  "Germany", "France", "Italy", "Spain", "Netherlands", "Brazil",
  "Mexico", "Argentina", "Colombia",
  // CIS
  "Russia", "Kazakhstan", "Uzbekistan",
];

// ── Schema Components ─────────────────────────────────────────────────

/** Organization schema — site-wide, used in root layout */
export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "86 Connect",
    url: SITE_URL,
    logo: `${SITE_URL}/icon-512.png`,
    description:
      "86 Connect provides end-to-end services for Study in China and Product Sourcing from China. Serving clients in 50+ countries worldwide with 98% success rate.",
    email: "info@the86connect.com",
    telephone: "+86-138-0000-0000",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Beijing",
      addressCountry: "CN",
    },
    sameAs: [
      "https://linkedin.com/company/86connect",
      "https://facebook.com/86connects",
    ],
    areaServed: COUNTRIES_SERVED.map((name) => ({
      "@type": "Country",
      name,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/** WebSite schema — enables Sitelinks Searchbox in Google */
export function WebSiteSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "86 Connect",
    url: SITE_URL,
    description:
      "Study in China and Product Sourcing from China. Expert guidance for international students and businesses worldwide.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/** BreadcrumbList schema — for inner pages */
export function BreadcrumbSchema({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.href}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/** FAQPage schema — for the FAQ page */
export function FAQPageSchema({ sections }: { sections: FAQSection[] }) {
  const mainEntity = sections.flatMap((section) =>
    section.items.map((item) => ({
      "@type": "Question" as const,
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer" as const,
        text: item.answer,
      },
    }))
  );

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/** AboutPage schema — for the about page */
export function AboutPageSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About 86 Connect",
    description:
      "Learn about 86 Connect, your trusted gateway to China for Study in China and Product Sourcing services. Serving clients across 50+ countries worldwide.",
    url: `${SITE_URL}/about`,
    image: `${SITE_URL}/og-image.jpg`,
    publisher: {
      "@type": "Organization",
      name: "86 Connect",
      url: SITE_URL,
    },
    mainEntity: {
      "@type": "Organization",
      name: "86 Connect",
      description:
        "86 Connect provides end-to-end services for Study in China (scholarships, university admissions, visas) and Product Sourcing from China (supplier finding, procurement, quality control, logistics).",
      foundingDate: "2023-11-23",
      location: {
        "@type": "Place",
        name: "Beijing",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Beijing",
          addressCountry: "CN",
        },
      },
      contactPoint: {
        "@type": "ContactPoint",
        email: "info@the86connect.com",
        telephone: "+86-138-0000-0000",
        contactType: "customer service",
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/** Service schema — for study-in-china and product-sourcing pages */
export function ServiceSchema({
  name,
  description,
  url,
  providerName,
  areaServed,
  serviceType,
  offers,
}: {
  name: string;
  description: string;
  url: string;
  providerName: string;
  areaServed: string[];
  serviceType: string;
  offers?: { name: string; description: string }[];
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    url: `${SITE_URL}${url}`,
    provider: {
      "@type": "Organization",
      name: providerName,
      url: SITE_URL,
    },
    serviceType,
    areaServed: areaServed.map((name) => ({
      "@type": "Country",
      name,
    })),
    ...(offers && {
      offers: offers.map((offer) => ({
        "@type": "Offer",
        name: offer.name,
        description: offer.description,
      })),
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}