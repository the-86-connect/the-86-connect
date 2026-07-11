import type { Metadata } from "next";
import { Shield } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy Policy for 86Connect. Learn how we collect, use, and protect your personal information when you use our Study in China and Product Sourcing services.",
  alternates: {
    canonical: "/privacy-policy",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const LAST_UPDATED = "June 23, 2026";

export default function PrivacyPolicyPage() {
  return (
    <>
      <Navbar />
      {/* Dark backdrop behind navbar for white logo/text visibility */}
      <div aria-hidden="true" className="fixed top-0 inset-x-0 h-24 bg-gradient-to-b from-slate-900 to-transparent z-40 pointer-events-none" />
      <main className="flex-1 px-4 sm:px-6 lg:px-8 bg-section-warm relative overflow-hidden">
        {/* Decorative background */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-[28rem] h-[28rem] bg-primary/5 rounded-full blur-3xl animate-pulse-soft" />
          <div className="absolute bottom-20 right-1/4 w-[24rem] h-[24rem] bg-primary/5 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: "2s" }} />
        </div>

        <article className="relative container mx-auto max-w-3xl py-20 sm:py-24 md:py-28">
          <header className="mb-10 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 shadow-3d-xs mb-4 sm:mb-5">
              <Shield className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-black uppercase tracking-wider text-primary">
                Legal
              </span>
            </div>
            <h1 className="font-display font-black text-4xl sm:text-5xl md:text-6xl tracking-[-0.04em] mb-3 sm:mb-4">
              Privacy <span className="text-gradient-red-animated">Policy</span>
            </h1>
            <p className="text-sm text-muted-foreground font-semibold">
              Last updated: {LAST_UPDATED}
            </p>
          </header>

          <div className="relative p-6 sm:p-8 lg:p-10 rounded-3xl bg-card border border-border/60 shadow-3d-xl overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-70" />
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />

            <div className="relative space-y-7 sm:space-y-8 text-muted-foreground leading-relaxed text-sm sm:text-base">
              <Section title="1. Introduction">
                <p>
                  86Connect (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or
                  &ldquo;our&rdquo;) is committed to protecting your privacy. This
                  Privacy Policy explains how we collect, use, disclose, and
                  safeguard your information when you visit our website
                  the86connects.com or use our Study in China and Product Sourcing
                  services.
                </p>
                <p>
                  By using our website and services, you consent to the practices
                  described in this policy.
                </p>
              </Section>

              <Section title="2. Information We Collect" subTitle="2.1 Information You Provide">
                <p>
                  When you submit an inquiry through our contact forms, we may
                  collect:
                </p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Full name</li>
                  <li>Email address</li>
                  <li>Phone number</li>
                  <li>Nationality and country of residence</li>
                  <li>Education level or company information</li>
                  <li>Service interest and inquiry details</li>
                  <li>Product category and order quantity (for sourcing inquiries)</li>
                </ul>
              </Section>

              <Section title="2.2 Automatically Collected Information">
                <p>
                  When you visit our website, we automatically collect certain
                  technical information:
                </p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>IP address and browser type</li>
                  <li>Pages visited and time spent on each page</li>
                  <li>Referring website and exit pages</li>
                  <li>Aggregate usage statistics (via privacy-friendly analytics)</li>
                </ul>
              </Section>

              <Section title="3. How We Use Your Information">
                <p>We use the information we collect to:</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Respond to your inquiries and provide requested services</li>
                  <li>Process study in China applications and sourcing requests</li>
                  <li>Communicate with you about your inquiry status</li>
                  <li>Improve our website, services, and user experience</li>
                  <li>Monitor and analyze usage patterns and trends</li>
                  <li>Detect, prevent, and address technical issues or fraud</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </Section>

              <Section title="4. Data Storage and Security">
                <p>
                  Your information is stored on secure servers hosted by
                  third-party service providers located in the United States. We
                  use industry-standard security measures including:
                </p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Encrypted data transmission (HTTPS/TLS)</li>
                  <li>Secure password storage and authentication</li>
                  <li>Regular security audits and updates</li>
                  <li>Restricted access to authorized personnel only</li>
                  <li>Automated database backups with encryption</li>
                </ul>
                <p className="mt-3">
                  Despite these measures, no method of transmission over the
                  Internet or electronic storage is 100% secure. We cannot
                  guarantee absolute security.
                </p>
              </Section>

              <Section title="5. Data Retention">
                <p>
                  We retain your personal information for as long as necessary to
                  fulfill the purposes outlined in this Privacy Policy, unless a
                  longer retention period is required by law. Specifically:
                </p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Active inquiry data: Retained for 2 years after last contact</li>
                  <li>Completed service records: Retained for 7 years</li>
                  <li>Anonymous analytics data: Retained indefinitely</li>
                </ul>
              </Section>

              <Section title="6. Sharing of Information">
                <p>
                  We do not sell, trade, or rent your personal information to
                  third parties. We may share your information in the following
                  circumstances:
                </p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>
                    <strong className="text-foreground">Service Providers:</strong> Trusted partners who assist
                    us in operating our website and conducting business (e.g.,
                    hosting providers, analytics services), subject to
                    confidentiality obligations.
                  </li>
                  <li>
                    <strong className="text-foreground">Universities and Suppliers:</strong> With your
                    consent, we share relevant information with Chinese
                    universities, suppliers, or logistics partners to process your
                    inquiry.
                  </li>
                  <li>
                    <strong className="text-foreground">Legal Compliance:</strong> When required by law, court
                    order, or to protect our rights and safety.
                  </li>
                  <li>
                    <strong className="text-foreground">Business Transfer:</strong> In connection with a merger,
                    acquisition, or sale of assets.
                  </li>
                </ul>
              </Section>

              <Section title="7. Cookies and Tracking Technologies">
                <p>
                  We use cookies and similar tracking technologies to enhance your
                  browsing experience and analyze website traffic:
                </p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>
                    <strong className="text-foreground">Essential cookies:</strong> Required for core website
                    functionality (e.g., admin authentication).
                  </li>
                  <li>
                    <strong className="text-foreground">Analytics cookies:</strong> Help us understand how
                    visitors interact with our website (only enabled with your
                    consent).
                  </li>
                </ul>
                <p className="mt-3">
                  You can control cookies through your browser settings. Disabling
                  cookies may affect website functionality.
                </p>
              </Section>

              <Section title="8. Your Rights">
                <p>
                  Depending on your location, you may have the following rights
                  regarding your personal information:
                </p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>
                    <strong className="text-foreground">Access:</strong> Request a copy of the personal data we
                    hold about you.
                  </li>
                  <li>
                    <strong className="text-foreground">Rectification:</strong> Request correction of
                    inaccurate or incomplete data.
                  </li>
                  <li>
                    <strong className="text-foreground">Erasure:</strong> Request deletion of your personal
                    data (subject to legal exceptions).
                  </li>
                  <li>
                    <strong className="text-foreground">Restriction:</strong> Request limitation of processing
                    in certain circumstances.
                  </li>
                  <li>
                    <strong className="text-foreground">Portability:</strong> Receive your data in a
                    structured, machine-readable format.
                  </li>
                  <li>
                    <strong className="text-foreground">Objection:</strong> Object to processing based on
                    legitimate interests.
                  </li>
                  <li>
                    <strong className="text-foreground">Withdraw Consent:</strong> Withdraw consent at any time
                    where processing is based on consent.
                  </li>
                </ul>
                <p className="mt-3">
                  To exercise these rights, contact us at{" "}
                  <a
                    href="mailto:beijingbridgepath@gmail.com"
                    className="text-primary font-bold hover:underline"
                  >
                    beijingbridgepath@gmail.com
                  </a>
                  .
                </p>
              </Section>

              <Section title="9. GDPR Compliance (EU Users)">
                <p>
                  If you are a resident of the European Economic Area (EEA), you
                  have the rights listed above under the General Data Protection
                  Regulation (GDPR). Our lawful bases for processing your data
                  include:
                </p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Consent (for cookies and marketing)</li>
                  <li>Contract performance (to deliver requested services)</li>
                  <li>Legal obligation (tax and regulatory compliance)</li>
                  <li>Legitimate interests (website security and improvement)</li>
                </ul>
                <p className="mt-3">
                  You may lodge a complaint with your local data protection
                  authority if you believe we have not handled your data
                  appropriately.
                </p>
              </Section>

              <Section title="10. CCPA Compliance (California Users)">
                <p>
                  If you are a California resident, the California Consumer
                  Privacy Act (CCPA) grants you additional rights:
                </p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>
                    <strong className="text-foreground">Know:</strong> The categories of personal information
                    collected and the right to request deletion.
                  </li>
                  <li>
                    <strong className="text-foreground">Delete:</strong> Request deletion of your personal
                    information.
                  </li>
                  <li>
                    <strong className="text-foreground">Opt-Out:</strong> Opt-out of the sale of personal
                    information. We do not sell your personal information.
                  </li>
                  <li>
                    <strong className="text-foreground">Non-Discrimination:</strong> Equal service and pricing
                    regardless of rights exercised.
                  </li>
                </ul>
              </Section>

              <Section title="11. Third-Party Links">
                <p>
                  Our website may contain links to third-party websites (e.g.,
                  Chinese universities, supplier directories). We are not
                  responsible for the privacy practices or content of these
                  external sites. We encourage you to review their privacy
                  policies.
                </p>
              </Section>

              <Section title="12. Children&rsquo;s Privacy">
                <p>
                  Our services are not directed to individuals under 16 years of
                  age. We do not knowingly collect personal information from
                  children. If you believe we have collected information from a
                  child, please contact us immediately for deletion.
                </p>
              </Section>

              <Section title="13. Changes to This Privacy Policy">
                <p>
                  We may update this Privacy Policy from time to time. We will
                  notify you of significant changes by posting the new policy on
                  this page and updating the &ldquo;Last updated&rdquo; date. We
                  encourage you to review this policy periodically.
                </p>
              </Section>

              <Section title="14. Contact Us">
                <p>
                  If you have questions, concerns, or requests regarding this
                  Privacy Policy or your personal data, please contact us:
                </p>
                <ul className="list-none pl-0 space-y-2 mt-3">
                  <li>
                    <strong className="text-foreground">Email:</strong>{" "}
                    <a
                      href="mailto:beijingbridgepath@gmail.com"
                      className="text-primary font-bold hover:underline"
                    >
                      beijingbridgepath@gmail.com
                    </a>
                  </li>
                  <li>
                    <strong className="text-foreground">Phone:</strong>{" "}
                    <a
                      href="tel:+8617611533296"
                      className="text-primary font-bold hover:underline"
                    >
                      +86 176 1153 3296
                    </a>
                  </li>
                </ul>
              </Section>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}

function Section({
  title,
  subTitle,
  children,
}: {
  title?: string;
  subTitle?: string;
  children: React.ReactNode;
}) {
  if (subTitle) {
    return (
      <section>
        <h2 className="font-display font-black text-2xl sm:text-3xl text-foreground mb-3 sm:mb-4">
          {title}
        </h2>
        <h3 className="text-base sm:text-lg font-bold text-foreground mb-2">
          {subTitle}
        </h3>
        {children}
      </section>
    );
  }
  return (
    <section>
      <h2 className="font-display font-black text-2xl sm:text-3xl text-foreground mb-3 sm:mb-4">
        {title}
      </h2>
      {children}
    </section>
  );
}
