import type { Metadata } from "next";
import { Database } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "Data Processing Agreement",
  description:
    "Data Processing Agreement (DPA) for 86 Connect. Learn how we process, protect, and manage personal data as part of our Study in China and Product Sourcing services.",
  alternates: {
    canonical: "/data-processing-agreement",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const LAST_UPDATED = "July 7, 2026";

export default function DataProcessingAgreementPage() {
  return (
    <>
      <Navbar />
      {/* Dark backdrop behind navbar for white logo/text visibility */}
      <div aria-hidden="true" className="fixed top-0 inset-x-0 h-24 bg-gradient-to-b from-slate-900 to-transparent z-40 pointer-events-none" />
      <main className="flex-1 px-4 sm:px-6 lg:px-8 bg-section-warm relative overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-[28rem] h-[28rem] bg-primary/5 rounded-full blur-3xl animate-pulse-soft" />
          <div className="absolute bottom-20 right-1/4 w-[24rem] h-[24rem] bg-primary/5 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: "2s" }} />
        </div>

        <article className="relative container mx-auto max-w-3xl py-20 sm:py-24 md:py-28">
          <header className="mb-10 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 shadow-3d-xs mb-4 sm:mb-5">
              <Database className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-black uppercase tracking-wider text-primary">
                Legal
              </span>
            </div>
            <h1 className="font-display font-black text-4xl sm:text-5xl md:text-6xl tracking-[-0.04em] mb-3 sm:mb-4">
              Data Processing{" "}
              <span className="text-gradient-red-animated">Agreement</span>
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
                  This Data Processing Agreement (&ldquo;DPA&rdquo;) forms part of
                  the Terms of Service between you (the &ldquo;Data Subject&rdquo;
                  or &ldquo;Client&rdquo;) and 86 Connect (&ldquo;we&rdquo;,
                  &ldquo;us&rdquo;, &ldquo;our&rdquo;, or the &ldquo;Data
                  Processor&rdquo;) and is incorporated by reference. It describes
                  how we collect, process, store, and protect personal data in the
                  course of delivering our Study in China and Product Sourcing
                  services.
                </p>
                <p>
                  This DPA applies to the extent that 86 Connect acts as a
                  processor or controller of personal data as defined under
                  applicable data protection laws, including the GDPR, CCPA, and
                  the Personal Information Protection Law (PIPL) of the
                  People&rsquo;s Republic of China.
                </p>
              </Section>

              <Section title="2. Definitions">
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>
                    <strong className="text-foreground">Personal Data:</strong> Any
                    information relating to an identified or identifiable natural
                    person.
                  </li>
                  <li>
                    <strong className="text-foreground">Processing:</strong> Any
                    operation performed on Personal Data, such as collection,
                    storage, use, disclosure, or deletion.
                  </li>
                  <li>
                    <strong className="text-foreground">Data Subject:</strong> The
                    individual to whom the Personal Data relates.
                  </li>
                  <li>
                    <strong className="text-foreground">Sub-processor:</strong> A
                    third party engaged by 86 Connect to assist in processing
                    Personal Data on our behalf.
                  </li>
                  <li>
                    <strong className="text-foreground">Personal Data Breach:</strong>{" "}
                    A breach of security leading to accidental or unlawful
                    destruction, loss, alteration, or disclosure of Personal Data.
                  </li>
                </ul>
              </Section>

              <Section title="3. Roles and Scope of Processing">
                <p>
                  86 Connect acts as a data controller for personal data collected
                  directly through our website (e.g., inquiry forms, account
                  registration). We act as a data processor when handling personal
                  data shared by a Client for the purpose of delivering a specific
                  contracted service.
                </p>
                <p>We process Personal Data only for the following purposes:</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Facilitating study abroad and university applications</li>
                  <li>Processing product sourcing and supplier inquiries</li>
                  <li>Communicating regarding your inquiry or service status</li>
                  <li>Complying with legal and regulatory obligations</li>
                </ul>
              </Section>

              <Section title="4. Categories of Data and Data Subjects">
                <p className="mb-2">
                  <strong className="text-foreground">Categories of Personal Data:</strong>
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Identity data (name, date of birth, nationality)</li>
                  <li>Contact data (email, phone, address)</li>
                  <li>Education and professional data</li>
                  <li>Company and business data (for sourcing clients)</li>
                  <li>Technical data (IP address, browser, usage logs)</li>
                </ul>
                <p className="mb-2 mt-3">
                  <strong className="text-foreground">Categories of Data Subjects:</strong>
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Prospective and current students</li>
                  <li>Business clients seeking sourcing services</li>
                  <li>Website visitors and inquiry submitters</li>
                </ul>
              </Section>

              <Section title="5. Data Subject Rights">
                <p>
                  We support the rights of data subjects under applicable law. You
                  may exercise any of the following rights by contacting us at{" "}
                  <a
                    href="mailto:beijingbridgepath@gmail.com"
                    className="text-primary font-bold hover:underline"
                  >
                    beijingbridgepath@gmail.com
                  </a>
                  :
                </p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Access, rectify, or erase your Personal Data</li>
                  <li>Restrict or object to processing</li>
                  <li>Request data portability</li>
                  <li>Withdraw consent at any time</li>
                  <li>Lodge a complaint with a supervisory authority</li>
                </ul>
                <p className="mt-3">
                  We respond to valid requests within 30 days, extending where
                  necessary for complex requests.
                </p>
              </Section>

              <Section title="6. Confidentiality and Security Measures">
                <p>
                  We implement appropriate technical and organizational measures
                  to ensure a level of security appropriate to the risk, including:
                </p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Encryption of data in transit (HTTPS/TLS) and at rest</li>
                  <li>Role-based access controls and least-privilege principles</li>
                  <li>Secure password hashing and multi-factor authentication for admin systems</li>
                  <li>Regular security reviews and vulnerability assessments</li>
                  <li>Staff confidentiality obligations and data protection training</li>
                  <li>Encrypted, automated database backups</li>
                </ul>
                <p className="mt-3">
                  Further details are available in our{" "}
                  <Link
                    href="/security-policy"
                    className="text-primary font-bold hover:underline"
                  >
                    Security Policy
                  </Link>
                  .
                </p>
              </Section>

              <Section title="7. Sub-Processors">
                <p>
                  We engage trusted third-party service providers (e.g., hosting,
                  analytics, email delivery) to assist in processing Personal Data.
                  All sub-processors are bound by written agreements requiring
                  confidentiality and a level of data protection consistent with
                  this DPA.
                </p>
                <p className="mt-3">
                  We notify Clients of any intended changes concerning the addition
                  or replacement of sub-processors, giving you the opportunity to
                  object.
                </p>
              </Section>

              <Section title="8. International Data Transfers">
                <p>
                  Personal Data may be transferred to, stored in, or processed in
                  countries other than your country of residence, including China
                  and the United States. Where such transfers occur, we ensure
                  appropriate safeguards are in place, such as:
                </p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Standard Contractual Clauses (SCCs) approved by relevant authorities</li>
                  <li>Binding corporate rules where applicable</li>
                  <li>Adequacy decisions or other lawful transfer mechanisms</li>
                </ul>
              </Section>

              <Section title="9. Personal Data Breach Notification">
                <p>
                  In the event of a Personal Data Breach, we will:
                </p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Take reasonable steps to contain and remediate the breach</li>
                  <li>Assess the risk to affected data subjects</li>
                  <li>Notify affected Clients without undue delay (and in any case within 72 hours of becoming aware of a notifiable breach)</li>
                  <li>Cooperate with authorities and data subjects as required by law</li>
                </ul>
              </Section>

              <Section title="10. Data Return and Deletion">
                <p>
                  Upon termination of services or at your request, and subject to
                  applicable law, we will return or delete all Personal Data in our
                  possession, except where retention is required by law, regulation,
                  or legitimate business records. Retained data will remain subject
                  to the confidentiality and security protections of this DPA.
                </p>
              </Section>

              <Section title="11. Audit Rights">
                <p>
                  Upon reasonable notice and no more than once per calendar year, a
                  Client may request information to verify our compliance with this
                  DPA. We will provide reasonable cooperation and, where available,
                  third-party audit reports or certifications demonstrating our
                  security controls.
                </p>
              </Section>

              <Section title="12. Liability and Indemnification">
                <p>
                  Our liability under this DPA is subject to the limitations set
                  out in our{" "}
                  <Link
                    href="/terms-of-service"
                    className="text-primary font-bold hover:underline"
                  >
                    Terms of Service
                  </Link>
                  . Each party is responsible for its own compliance with applicable
                  data protection laws.
                </p>
              </Section>

              <Section title="13. Term and Termination">
                <p>
                  This DPA remains in effect for the duration of our processing of
                  Personal Data on your behalf and survives termination of the
                  underlying services until all Personal Data is returned or
                  deleted in accordance with Section 10.
                </p>
              </Section>

              <Section title="14. Governing Law">
                <p>
                  This DPA is governed by and construed in accordance with the laws
                  of the People&rsquo;s Republic of China. Disputes shall first be
                  resolved through good-faith negotiation and, if unresolved,
                  submitted to arbitration in Beijing, China under CIETAC rules.
                </p>
              </Section>

              <Section title="15. Changes to This DPA">
                <p>
                  We may update this DPA from time to time. Material changes will
                  be posted on this page with an updated &ldquo;Last updated&rdquo;
                  date. We encourage you to review this DPA periodically.
                </p>
              </Section>

              <Section title="16. Contact Us">
                <p>
                  If you have questions about this DPA or our data processing
                  practices, please contact us:
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
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="font-display font-black text-2xl sm:text-3xl text-foreground mb-3 sm:mb-4">
        {title}
      </h2>
      {children}
    </section>
  );
}
