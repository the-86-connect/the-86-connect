const SITE_URL = "https://the86connects.com";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "86 Connect",
  url: SITE_URL,
  logo: `${SITE_URL}/og-image.jpg`,
  description:
    "Professional services for Study in China assistance and Product Sourcing from China.",
  foundingDate: "2015",
  areaServed: "Worldwide",
  address: {
    "@type": "PostalAddress",
    addressCountry: "CN",
    addressLocality: "Beijing",
  },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    email: "beijingbridgepath@gmail.com",
    telephone: "+86 176 1153 3296",
    availableLanguage: ["English", "Chinese"],
  },
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "86 Connect Services",
  itemListElement: [
    {
      "@type": "Service",
      name: "Study in China",
      description:
        "Scholarship applications, university admissions, and study abroad guidance for international students.",
      provider: {
        "@type": "Organization",
        name: "86 Connect",
      },
      areaServed: "China",
      serviceType: "Education Consultancy",
    },
    {
      "@type": "Service",
      name: "Product Sourcing",
      description:
        "Supplier finding, procurement assistance, and logistics support for businesses sourcing from China.",
      provider: {
        "@type": "Organization",
        name: "86 Connect",
      },
      areaServed: "China",
      serviceType: "Procurement Services",
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
      item: `${SITE_URL}/#study-in-china`,
    },
    {
      "@type": "ListItem",
      position: 3,
      name: "Product Sourcing",
      item: `${SITE_URL}/#product-sourcing`,
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}