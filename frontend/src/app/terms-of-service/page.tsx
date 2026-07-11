import type { Metadata } from "next";
import { FileText } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms of Service for 86Connect. Read the terms and conditions that govern your use of our Study in China and Product Sourcing services and website.",
  alternates: {
    canonical: "/terms-of-service",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const LAST_UPDATED = "June 23, 2026";

export default function TermsOfServicePage() {
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
              <FileText className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-black uppercase tracking-wider text-primary">
                Legal
              </span>
            </div>
            <h1 className="font-display font-black text-4xl sm:text-5xl md:text-6xl tracking-[-0.04em] mb-3 sm:mb-4">
              Terms of <span className="text-gradient-red-animated">Service</span>
            </h1>
            <p className="text-sm text-muted-foreground font-semibold">
              Last updated: {LAST_UPDATED}
            </p>
          </header>

          <div className="relative p-6 sm:p-8 lg:p-10 rounded-3xl bg-card border border-border/60 shadow-3d-xl overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-70" />
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />

            <div className="relative space-y-7 sm:space-y-8 text-muted-foreground leading-relaxed text-sm sm:text-base">
              <Section title="1. Acceptance of Terms">
                <p>
                  Welcome to 86Connect. By accessing or using our website at
                  the86connects.com and our services, you agree to be bound by these
                  Terms of Service (&ldquo;Terms&rdquo;). If you do not agree to
                  these Terms, please do not use our website or services.
                </p>
                <p>
                  These Terms constitute a legally binding agreement between you
                  and 86Connect (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or
                  &ldquo;our&rdquo;).
                </p>
              </Section>

              <Section title="2. Description of Services">
                <p>
                  86Connect provides consulting and facilitation services
                  including:
                </p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>
                    <strong className="text-foreground">Study in China:</strong> Scholarship application
                    assistance, university admissions support, and study abroad
                    guidance for international students.
                  </li>
                  <li>
                    <strong className="text-foreground">Product Sourcing:</strong> Supplier identification,
                    procurement assistance, and logistics support for businesses
                    sourcing products from China.
                  </li>
                </ul>
                <p className="mt-3">
                  We act as a facilitator and consultant. We are not the final
                  decision-maker for university admissions, scholarship awards, or
                  supplier agreements.
                </p>
              </Section>

              <Section title="3. Eligibility">
                <p>To use our services, you must:</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Be at least 16 years of age or have parental consent</li>
                  <li>Have the legal capacity to enter into binding agreements</li>
                  <li>Provide accurate and complete information</li>
                  <li>Not be prohibited from using our services under applicable law</li>
                </ul>
              </Section>

              <Section title="4. User Accounts">
                <p>
                  For account access to track your submissions, you may register
                  with your email. You are responsible for:
                </p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Maintaining the confidentiality of login credentials</li>
                  <li>All activities that occur under your account</li>
                  <li>Immediately notifying us of any unauthorized access</li>
                  <li>Ensuring your account information is accurate</li>
                </ul>
              </Section>

              <Section title="5. User Obligations">
                <p>You agree not to:</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>
                    Use our services for any unlawful purpose or in violation of
                    these Terms
                  </li>
                  <li>
                    Submit false, misleading, or fraudulent information in inquiry
                    forms
                  </li>
                  <li>
                    Attempt to gain unauthorized access to our systems, accounts, or
                    data
                  </li>
                  <li>Interfere with or disrupt the website or servers</li>
                  <li>
                    Use automated systems (bots, scrapers) to extract data without
                    permission
                  </li>
                  <li>
                    Reproduce, duplicate, or resell our content without written
                    permission
                  </li>
                  <li>Transmit viruses, malware, or harmful code</li>
                </ul>
              </Section>

              <Section title="6. Inquiries and Service Process" subTitle="6.1 Submission of Inquiries">
                <p>
                  When you submit an inquiry through our forms, you authorize us to
                  process the provided information to deliver our services. You are
                  responsible for the accuracy of all submitted information.
                </p>
              </Section>

              <Section subTitle="6.2 Service Delivery">
                <p>
                  We will use reasonable efforts to facilitate your inquiry with
                  relevant universities, suppliers, or service providers. However,
                  we do not guarantee:
                </p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Admission to any specific university or program</li>
                  <li>Approval of any scholarship application</li>
                  <li>Successful sourcing of specific products or suppliers</li>
                  <li>Specific pricing, timelines, or terms from third parties</li>
                </ul>
              </Section>

              <Section subTitle="6.3 Communication">
                <p>
                  By submitting an inquiry, you consent to receive communications
                  from us regarding your request via email, phone, or other
                  channels. You may opt out of marketing communications at any
                  time.
                </p>
              </Section>

              <Section title="7. Fees and Payment">
                <p>
                  Unless otherwise agreed in writing, our initial consultation and
                  inquiry review are provided at no cost. Additional services may
                  be subject to fees, which will be communicated and agreed upon
                  before work begins.
                </p>
                <p className="mt-3">For paid services:</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Fees are quoted in USD unless otherwise specified</li>
                  <li>Payment terms will be outlined in a separate agreement</li>
                  <li>Refunds, if applicable, are subject to the terms of that agreement</li>
                  <li>You are responsible for any applicable taxes</li>
                </ul>
              </Section>

              <Section title="8. Intellectual Property" subTitle="8.1 Our Content">
                <p>
                  All content on this website, including text, graphics, logos,
                  images, and software, is the property of 86Connect or its
                  licensors and is protected by copyright, trademark, and other
                  intellectual property laws.
                </p>
              </Section>

              <Section subTitle="8.2 Permitted Use">
                <p>
                  You may view and use our website for personal, non-commercial
                  purposes. Any other use, including reproduction, modification,
                  distribution, or republication, requires our prior written
                  consent.
                </p>
              </Section>

              <Section subTitle="8.3 User Content">
                <p>
                  By submitting information through our forms, you grant us a
                  non-exclusive, royalty-free license to use your information for
                  the purpose of providing our services and processing your
                  inquiry.
                </p>
              </Section>

              <Section title="9. Third-Party Services">
                <p>Our services may involve third parties, including:</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Chinese universities and educational institutions</li>
                  <li>Manufacturers, suppliers, and logistics providers</li>
                  <li>Government agencies for visas and documentation</li>
                  <li>Hosting and analytics service providers</li>
                </ul>
                <p className="mt-3">
                  We are not responsible for the actions, omissions, or
                  performance of these third parties. Any agreement with a third
                  party is between you and that party.
                </p>
              </Section>

              <Section title="10. Disclaimers">
                <p>
                  Our website and services are provided on an &ldquo;as is&rdquo;
                  and &ldquo;as available&rdquo; basis. To the fullest extent
                  permitted by law, we disclaim all warranties, express or
                  implied, including:
                </p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Merchantability and fitness for a particular purpose</li>
                  <li>Non-infringement of intellectual property</li>
                  <li>Accuracy, reliability, or completeness of content</li>
                  <li>Uninterrupted or error-free operation</li>
                  <li>That defects will be corrected</li>
                </ul>
                <p className="mt-3">
                  You use our website and services at your own risk.
                </p>
              </Section>

              <Section title="11. Limitation of Liability">
                <p>
                  To the maximum extent permitted by law, 86Connect and its
                  affiliates, officers, employees, agents, and partners shall not
                  be liable for any:
                </p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Indirect, incidental, special, consequential, or punitive damages</li>
                  <li>Loss of profits, data, or business opportunities</li>
                  <li>Delays or failures in service delivery caused by third parties</li>
                  <li>Damages arising from your use of or inability to use our services</li>
                  <li>Outcomes of university applications, scholarship decisions, or supplier transactions</li>
                </ul>
                <p className="mt-3">
                  Our total liability for any claim arising from these Terms shall
                  not exceed the amount you paid us for services in the 12 months
                  preceding the claim.
                </p>
              </Section>

              <Section title="12. Indemnification">
                <p>
                  You agree to indemnify and hold harmless 86Connect and its
                  affiliates from any claims, damages, losses, liabilities, costs,
                  and expenses (including legal fees) arising from:
                </p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Your use of our website or services</li>
                  <li>Your violation of these Terms</li>
                  <li>Your violation of any third-party rights or applicable law</li>
                  <li>Information you submit to us or third parties</li>
                </ul>
              </Section>

              <Section title="13. Privacy">
                <p>
                  Our handling of your personal information is described in our{" "}
                  <Link
                    href="/privacy-policy"
                    className="text-primary font-bold hover:underline"
                  >
                    Privacy Policy
                  </Link>
                  , which is incorporated into these Terms by reference.
                </p>
              </Section>

              <Section title="14. Termination">
                <p>
                  We may suspend or terminate your access to our services at any
                  time, with or without cause or notice, including if we believe
                  you have violated these Terms.
                </p>
                <p className="mt-3">
                  Upon termination, all licenses and rights granted to you will
                  cease immediately. Provisions that by their nature should survive
                  termination (including intellectual property, disclaimers,
                  liability, and indemnification) will remain in effect.
                </p>
              </Section>

              <Section title="15. Governing Law and Dispute Resolution">
                <p>
                  These Terms shall be governed by and construed in accordance with
                  the laws of the People&rsquo;s Republic of China, without regard
                  to conflict of law principles.
                </p>
                <p className="mt-3">
                  Any dispute arising from these Terms shall first be attempted to
                  be resolved through good-faith negotiation. If unresolved within
                  30 days, the dispute shall be submitted to arbitration in
                  Beijing, China, in accordance with the rules of the China
                  International Economic and Trade Arbitration Commission (CIETAC).
                </p>
              </Section>

              <Section title="16. Changes to Terms">
                <p>
                  We reserve the right to modify these Terms at any time. Material
                  changes will be posted on this page with an updated
                  &ldquo;Last updated&rdquo; date. Your continued use of our
                  services after changes take effect constitutes acceptance of the
                  revised Terms.
                </p>
              </Section>

              <Section title="17. Severability">
                <p>
                  If any provision of these Terms is found to be unenforceable or
                  invalid, that provision will be limited or eliminated to the
                  minimum extent necessary, and the remaining provisions will
                  remain in full force and effect.
                </p>
              </Section>

              <Section title="18. Entire Agreement">
                <p>
                  These Terms, together with our Privacy Policy, constitute the
                  entire agreement between you and 86Connect regarding your use
                  of our website and services, superseding any prior agreements.
                </p>
              </Section>

              <Section title="19. Contact Information">
                <p>
                  If you have questions or concerns about these Terms, please
                  contact us:
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
  if (subTitle && !title) {
    return (
      <section>
        <h3 className="text-base sm:text-lg font-bold text-foreground mb-2">
          {subTitle}
        </h3>
        {children}
      </section>
    );
  }
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
