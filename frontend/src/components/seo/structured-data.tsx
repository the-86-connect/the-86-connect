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
    name: "86Connect",
    url: SITE_URL,
    logo: `${SITE_URL}/icon-512.png`,
    description:
      "86Connect provides end-to-end services for Study in China and Product Sourcing from China. Serving clients in 50+ countries worldwide with 98% success rate.",
    email: "info@the86connect.com",
    telephone: "+86 176 1153 3296",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Beijing",
      addressCountry: "CN",
    },
    sameAs: [
      "https://www.facebook.com/profile.php?id=61575211782325",
      "https://www.tiktok.com/@86connect_",
      "https://www.instagram.com/the86connect",
      "https://www.youtube.com/@BeijingBridgePath86Connect",
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
    name: "86Connect",
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

/** Homepage FAQPage schema — static Q&A for the homepage */
export function HomepageFAQSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is 86Connect?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "86Connect is a Beijing-based consultancy that helps international students secure admission to China's top universities and assists businesses in sourcing products from verified Chinese manufacturers — all through a single, end-to-end managed service. It is the digital subsidiary of Beijing BridgePath International Consulting Co., Ltd, incorporated in Beijing, China.",
        },
      },
      {
        "@type": "Question",
        name: "What services does 86Connect offer?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "86Connect offers two core services: Study in China (scholarship applications, university admissions, visa processing, and accommodation) and Product Sourcing from China (supplier finding and vetting, procurement management, quality control inspections, and logistics coordination).",
        },
      },
      {
        "@type": "Question",
        name: "How does 86Connect help with studying in China?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "86Connect provides end-to-end support for studying in China, including CSC, provincial, and university scholarship applications, admission to 200+ partner universities, X1/X2 student visa processing, accommodation arrangement, and 24/7 local support. We have placed 500+ students with a 98% success rate.",
        },
      },
      {
        "@type": "Question",
        name: "How does 86Connect help with product sourcing from China?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "86Connect manages the entire product sourcing process: finding and vetting suppliers from our network of 50,000+ verified manufacturers, managing procurement and negotiations, conducting quality control inspections, and coordinating freight forwarding and logistics to 150+ countries worldwide.",
        },
      },
      {
        "@type": "Question",
        name: "Where is 86Connect located?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "86Connect is headquartered in Beijing, China, with a strategic presence in West Africa. We serve clients across 50+ countries including Nigeria, Kenya, Ghana, South Africa, India, Pakistan, Bangladesh, UAE, UK, USA, Canada, and Australia.",
        },
      },
      {
        "@type": "Question",
        name: "How can I contact 86Connect?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You can contact 86Connect by email at info@the86connect.com, by phone at +86 176 1153 3296, or via WhatsApp. You can also book a free 15-minute consultation through our website or fill out the contact form on our homepage.",
        },
      },
    ],
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
    name: "About 86Connect",
    description:
      "Learn about 86Connect, your trusted gateway to China for Study in China and Product Sourcing services. Serving clients across 50+ countries worldwide.",
    url: `${SITE_URL}/about`,
    image: `${SITE_URL}/og-image.jpg`,
    publisher: {
      "@type": "Organization",
      name: "86Connect",
      url: SITE_URL,
    },
    mainEntity: {
      "@type": "Organization",
      name: "86Connect",
      description:
        "86Connect provides end-to-end services for Study in China (scholarships, university admissions, visas) and Product Sourcing from China (supplier finding, procurement, quality control, logistics).",
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
        telephone: "+86 176 1153 3296",
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