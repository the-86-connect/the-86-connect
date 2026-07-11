import type { Metadata } from "next";
import { FileLock } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "Non-Disclosure Agreement",
  description:
    "Non-Disclosure Agreement (NDA) for 86Connect. Learn how we protect confidential information shared during our Study in China and Product Sourcing engagements.",
  alternates: {
    canonical: "/nda",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const LAST_UPDATED = "July 7, 2026";

export default function NonDisclosureAgreementPage() {
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
              <FileLock className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-black uppercase tracking-wider text-primary">
                Legal
              </span>
            </div>
            <h1 className="font-display font-black text-4xl sm:text-5xl md:text-6xl tracking-[-0.04em] mb-3 sm:mb-4">
              Non-Disclosure{" "}
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
              <Section title="1. Parties and Purpose">
                <p>
                  This Non-Disclosure Agreement (&ldquo;NDA&rdquo;) is entered into
                  between 86Connect (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or
                  &ldquo;our&rdquo;) and you (the &ldquo;Client&rdquo; or
                  &ldquo;Disclosing Party&rdquo;/&ldquo;Receiving Party&rdquo; as
                  applicable). This is a mutual agreement intended to protect
                  confidential information that may be exchanged in the course of
                  our Study in China and Product Sourcing engagements.
                </p>
                <p>
                  By engaging with our services or sharing confidential information
                  with us, you acknowledge and agree to the terms of this NDA.
                </p>
              </Section>

              <Section title="2. Definition of Confidential Information">
                <p>
                  &ldquo;Confidential Information&rdquo; means any non-public
                  information disclosed by one party to the other, whether in
                  writing, orally, or in any other form, that is reasonably
                  understood to be confidential, including:
                </p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Business plans, strategies, and financial information</li>
                  <li>Product designs, specifications, and pricing</li>
                  <li>Supplier, manufacturer, and university contacts</li>
                  <li>Customer and student personal data</li>
                  <li>Application documents and supporting materials</li>
                  <li>Source code, technical data, and proprietary processes</li>
                  <li>Any information marked or identified as confidential</li>
                </ul>
              </Section>

              <Section title="3. Obligations of the Receiving Party">
                <p>The Receiving Party agrees to:</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Use Confidential Information solely for the purpose of the engagement</li>
                  <li>Protect it with at least the same degree of care used for its own confidential information</li>
                  <li>Not disclose it to any third party without prior written consent</li>
                  <li>Limit access to employees and authorized agents on a need-to-know basis</li>
                  <li>Not use it for any purpose outside the scope of the engagement</li>
                </ul>
              </Section>

              <Section title="4. Exclusions">
                <p>
                  Confidential Information does not include information that:
                </p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Is or becomes publicly available through no fault of the Receiving Party</li>
                  <li>Was lawfully in the Receiving Party&rsquo;s possession before disclosure</li>
                  <li>Is independently developed without use of or reference to the Confidential Information</li>
                  <li>Is rightfully received from a third party without a breach of confidentiality</li>
                </ul>
              </Section>

              <Section title="5. Permitted Disclosures">
                <p>
                  The Receiving Party may disclose Confidential Information where
                  required by law, regulation, or court order, provided that it
                  gives reasonable prior notice to the Disclosing Party (where
                  legally permitted) and cooperates in seeking protective orders to
                  limit disclosure.
                </p>
              </Section>

              <Section title="6. Data Protection">
                <p>
                  Where Confidential Information includes personal data, both
                  parties agree to handle it in accordance with applicable data
                  protection laws and our{" "}
                  <Link
                    href="/data-processing-agreement"
                    className="text-primary font-bold hover:underline"
                  >
                    Data Processing Agreement
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy-policy"
                    className="text-primary font-bold hover:underline"
                  >
                    Privacy Policy
                  </Link>
                  .
                </p>
              </Section>

              <Section title="7. Term and Survival">
                <p>
                  This NDA is effective from the date Confidential Information is
                  first shared and remains in force for the duration of the
                  engagement. The confidentiality obligations survive termination
                  of the engagement for a period of five (5) years, except for
                  trade secrets, which remain protected for as long as they qualify
                  as trade secrets under applicable law.
                </p>
              </Section>

              <Section title="8. Return or Destruction of Information">
                <p>
                  Upon written request or termination of the engagement, the
                  Receiving Party will, at the Disclosing Party&rsquo;s option,
                  return or destroy all Confidential Information in its possession,
                  including copies, and certify such destruction in writing where
                  requested. Retention required by law, regulation, or automated
                  backup systems is permitted, provided the retained information
                  remains subject to this NDA.
                </p>
              </Section>

              <Section title="9. No License or Warranty">
                <p>
                  No license or ownership rights to Confidential Information are
                  granted under this NDA, express or implied. All Confidential
                  Information is provided &ldquo;as is&rdquo;, and the Disclosing
                  Party makes no warranties regarding its accuracy or completeness.
                </p>
              </Section>

              <Section title="10. Remedies">
                <p>
                  The parties acknowledge that unauthorized disclosure of
                  Confidential Information may cause irreparable harm for which
                  monetary damages may be inadequate. The Disclosing Party may seek
                  injunctive relief and other equitable remedies in addition to any
                  other available remedies.
                </p>
              </Section>

              <Section title="11. Governing Law and Dispute Resolution">
                <p>
                  This NDA is governed by the laws of the People&rsquo;s Republic of
                  China. Disputes shall first be resolved through good-faith
                  negotiation and, if unresolved within 30 days, submitted to
                  arbitration in Beijing, China under the rules of the China
                  International Economic and Trade Arbitration Commission (CIETAC).
                </p>
              </Section>

              <Section title="12. General Provisions">
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>This NDA is governed by our <Link href="/terms-of-service" className="text-primary font-bold hover:underline">Terms of Service</Link>, which are incorporated by reference</li>
                  <li>No waiver of any provision is effective unless in writing</li>
                  <li>If any provision is held unenforceable, the remaining provisions remain in full force</li>
                  <li>This NDA may be updated from time to time; material changes will be posted with an updated &ldquo;Last updated&rdquo; date</li>
                </ul>
              </Section>

              <Section title="13. Contact Us">
                <p>
                  If you have questions about this NDA or wish to request a
                  signed copy for a specific engagement, please contact us:
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
