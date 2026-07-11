const SITE_URL = "https://the86connects.com";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "86Connect",
  alternateName: "86Connect China Consultancy",
  url: SITE_URL,
  logo: {
    "@type": "ImageObject",
    url: `${SITE_URL}/logo-white-nav.png`,
    width: 512,
    height: 512,
  },
  image: `${SITE_URL}/og-image.jpg`,
  description:
    "Professional services for Study in China assistance and Product Sourcing from China. End-to-end support for international students and businesses.",
  foundingDate: "2023-11-23",
  areaServed: "Worldwide",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Beijing Chaoyang District",
    addressCountry: "CN",
    addressLocality: "Beijing",
  },
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "customer service",
      telephone: "+86 176 1153 3296",
      email: "beijingbridgepath@gmail.com",
      availableLanguage: ["English", "Chinese"],
      contactOption: ["TollFree", "WhatsApp"],
    },
    {
      "@type": "ContactPoint",
      contactType: "sales",
      telephone: "+86 176 1153 3296",
      email: "beijingbridgepath@gmail.com",
      availableLanguage: ["English", "Chinese"],
    },
  ],
  sameAs: [
    "https://www.linkedin.com/company/86-connect",
    "https://www.facebook.com/86connect",
    "https://www.instagram.com/86connect",
  ],
  knowsAbout: [
    "Study in China",
    "Product Sourcing from China",
    "China Education Consultancy",
    "China University Admissions",
    "China Scholarship Applications",
    "China Supplier Finding",
    "China Procurement",
    "China Logistics",
    "China Quality Control",
    "China Business Consulting",
  ],
};

const webSiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: "86Connect",
  description:
    "86Connect is your trusted gateway to China. End-to-end services for studying in China and sourcing products from China.",
  publisher: {
    "@id": `${SITE_URL}/#organization`,
  },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
  inLanguage: ["en", "zh"],
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": `${SITE_URL}/#localbusiness`,
  name: "86Connect",
  image: `${SITE_URL}/og-image.jpg`,
  url: SITE_URL,
  telephone: "+86 176 1153 3296",
  email: "beijingbridgepath@gmail.com",
  address: {
    "@type": "PostalAddress",
    addressCountry: "CN",
    addressLocality: "Beijing",
    addressRegion: "Beijing",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: "39.9042",
    longitude: "116.4074",
  },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    opens: "09:00",
    closes: "18:00",
    timeZone: "Asia/Shanghai",
  },
  priceRange: "$$",
  areaServed: "Worldwide",
  sameAs: [
    "https://www.linkedin.com/company/86-connect",
    "https://www.facebook.com/86connect",
    "https://www.instagram.com/86connect",
  ],
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "86Connect Services",
  itemListElement: [
    {
      "@type": "Service",
      "@id": `${SITE_URL}/study-in-china#service`,
      name: "Study in China",
      description:
        "Complete study abroad assistance: scholarship applications, university admissions, visa processing, and ongoing support for international students in China.",
      provider: {
        "@id": `${SITE_URL}/#organization`,
      },
      areaServed: "Worldwide",
      serviceType: "Education Consultancy",
      category: "Study Abroad",
      offers: {
        "@type": "Offer",
        description: "Free initial consultation available",
      },
    },
    {
      "@type": "Service",
      "@id": `${SITE_URL}/product-sourcing#service`,
      name: "Product Sourcing from China",
      description:
        "End-to-end procurement services: supplier finding and vetting, quality control inspections, logistics management, and shipping coordination.",
      provider: {
        "@id": `${SITE_URL}/#organization`,
      },
      areaServed: "Worldwide",
      serviceType: "Procurement Services",
      category: "Sourcing",
      offers: {
        "@type": "Offer",
        description: "Free initial consultation available",
      },
    },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How can I study in China as an international student?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "86Connect helps international students apply to Chinese universities, secure scholarships (including CSC), handle visa applications, and find accommodation. We provide end-to-end guidance through the entire process.",
      },
    },
    {
      "@type": "Question",
      name: "What scholarships are available for studying in China?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Available scholarships include the Chinese Government Scholarship (CSC), provincial scholarships, university-specific scholarships, and Confucius Institute scholarships. 86Connect helps you identify and apply for the best options.",
      },
    },
    {
      "@type": "Question",
      name: "How do I source products from China?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "86Connect helps you find verified Chinese suppliers, manage procurement, arrange quality control inspections, and handle logistics and shipping. We work with 50,000+ verified suppliers across all industries.",
      },
    },
    {
      "@type": "Question",
      name: "How much does it cost to use 86Connect's services?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We offer free initial consultations. Our pricing is transparent and flat-rate for full-service arrangements. We also offer partial-service options to fit your budget. Contact us for a personalized quote.",
      },
    },
    {
      "@type": "Question",
      name: "Is 86Connect a registered company in China?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, 86Connect is the digital subsidiary of Beijing BridgePath International Consulting Co., Ltd, a registered consulting firm incorporated in Beijing, China on November 23, 2023. All payments are handled through our registered corporate account.",
      },
    },
  ],
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: SITE_URL,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Study in China",
      item: `${SITE_URL}/study-in-china`,
    },
    {
      "@type": "ListItem",
      position: 3,
      name: "Product Sourcing",
      item: `${SITE_URL}/product-sourcing`,
    },
    {
      "@type": "ListItem",
      position: 4,
      name: "About Us",
      item: `${SITE_URL}/#about-us`,
    },
    {
      "@type": "ListItem",
      position: 5,
      name: "Contact",
      item: `${SITE_URL}/#contact`,
    },
  ],
};

export function StructuredData() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}