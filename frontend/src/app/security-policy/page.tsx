import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "Security Policy",
  description:
    "Security Policy for 86Connect. Learn about the technical and organizational measures we use to protect your data.",
  alternates: {
    canonical: "/security-policy",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const LAST_UPDATED = "July 7, 2026";

export default function SecurityPolicyPage() {
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
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-black uppercase tracking-wider text-primary">
                Legal
              </span>
            </div>
            <h1 className="font-display font-black text-4xl sm:text-5xl md:text-6xl tracking-[-0.04em] mb-3 sm:mb-4">
              Security <span className="text-gradient-red-animated">Policy</span>
            </h1>
            <p className="text-sm text-muted-foreground font-semibold">
              Last updated: {LAST_UPDATED}
            </p>
          </header>

          <div className="relative p-6 sm:p-8 lg:p-10 rounded-3xl bg-card border border-border/60 shadow-3d-xl overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-70" />
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />

            <div className="relative space-y-7 sm:space-y-8 text-muted-foreground leading-relaxed text-sm sm:text-base">
              <Section title="1. Overview">
                <p>
                  At 86Connect, the security of your data is a top priority. This
                  Security Policy outlines the technical and organizational measures
                  we implement to protect personal and business information across
                  our Study in China and Product Sourcing services, our website
                  (the86connects.com), and supporting systems.
                </p>
                <p>
                  This policy should be read alongside our{" "}
                  <Link
                    href="/privacy-policy"
                    className="text-primary font-bold hover:underline"
                  >
                    Privacy Policy
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/data-processing-agreement"
                    className="text-primary font-bold hover:underline"
                  >
                    Data Processing Agreement
                  </Link>
                  .
                </p>
              </Section>

              <Section title="2. Scope">
                <p>
                  This policy applies to all systems, applications, networks, and
                  personnel involved in storing, processing, or transmitting data on
                  behalf of 86Connect and our clients, including:
                </p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Our public website and client-facing applications</li>
                  <li>Admin and internal management systems</li>
                  <li>Databases storing inquiry, account, and service records</li>
                  <li>Communication channels (email, messaging, support tools)</li>
                </ul>
              </Section>

              <Section title="3. Security Governance">
                <p>
                  86Connect maintains a security governance framework that
                  defines roles, responsibilities, and accountability for
                  information security. Security ownership is assigned to designated
                  personnel responsible for:
                </p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Maintaining and reviewing security controls</li>
                  <li>Coordinating incident response</li>
                  <li>Managing vendor and third-party risk</li>
                  <li>Ensuring compliance with applicable laws and standards</li>
                </ul>
              </Section>

              <Section title="4. Data Encryption">
                <p>
                  We protect data using industry-standard encryption:
                </p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>
                    <strong className="text-foreground">In transit:</strong> All
                    data transmitted between users and our systems is encrypted
                    using TLS (HTTPS).
                  </li>
                  <li>
                    <strong className="text-foreground">At rest:</strong> Sensitive
                    data stored in databases and backups is encrypted.
                  </li>
                  <li>
                    <strong className="text-foreground">Passwords:</strong> User
                    passwords are stored using strong, salted hashing algorithms.
                  </li>
                </ul>
              </Section>

              <Section title="5. Access Control">
                <p>
                  Access to systems and data is governed by the principle of least
                  privilege:
                </p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Role-based access controls limit data access to authorized personnel only</li>
                  <li>Multi-factor authentication is required for administrative systems</li>
                  <li>Access rights are reviewed regularly and revoked upon role change or departure</li>
                  <li>Audit logs record access to sensitive systems and data</li>
                </ul>
              </Section>

              <Section title="6. Infrastructure and Network Security">
                <p>
                  Our infrastructure is hosted with reputable cloud providers that
                  maintain robust physical and network security. Measures include:
                </p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Firewalls and network segmentation</li>
                  <li>DDoS protection and rate limiting</li>
                  <li>Regular patching and update management</li>
                  <li>Secure configuration baselines for all servers and services</li>
                  <li>Automated, encrypted database backups with tested restore procedures</li>
                </ul>
              </Section>

              <Section title="7. Application Security">
                <p>
                  We build and maintain our applications with security in mind:
                </p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Input validation and output encoding to prevent injection attacks</li>
                  <li>Protection against cross-site scripting (XSS) and CSRF</li>
                  <li>Secure session management and token handling</li>
                  <li>Regular dependency scanning for known vulnerabilities</li>
                  <li>Security review of code changes before deployment</li>
                </ul>
              </Section>

              <Section title="8. Incident Response">
                <p>
                  We maintain an incident response plan to detect, contain, and
                  remediate security incidents. In the event of a data breach
                  affecting your information, we will:
                </p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Investigate and contain the incident promptly</li>
                  <li>Notify affected parties without undue delay</li>
                  <li>Take corrective action to prevent recurrence</li>
                  <li>Cooperate with regulators and law enforcement as required</li>
                </ul>
              </Section>

              <Section title="9. Business Continuity and Disaster Recovery">
                <p>
                  To ensure resilience and availability, we maintain:
                </p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Regular, encrypted backups of critical data</li>
                  <li>Documented disaster recovery procedures</li>
                  <li>Redundancy for key services to minimize downtime</li>
                  <li>Periodic testing of backup restoration and recovery plans</li>
                </ul>
              </Section>

              <Section title="10. Personnel Security">
                <p>
                  Our team is an essential part of our security posture:
                </p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Employees and contractors sign confidentiality agreements</li>
                  <li>Security and data protection training is provided</li>
                  <li>Access is revoked promptly upon termination or role change</li>
                  <li>Background checks are conducted where appropriate</li>
                </ul>
              </Section>

              <Section title="11. Third-Party and Vendor Security">
                <p>
                  We assess the security practices of third-party service providers
                  before engaging them and require them to maintain appropriate
                  safeguards. Vendors handling personal data are bound by data
                  processing terms consistent with our{" "}
                  <Link
                    href="/data-processing-agreement"
                    className="text-primary font-bold hover:underline"
                  >
                    Data Processing Agreement
                  </Link>
                  .
                </p>
              </Section>

              <Section title="12. Vulnerability Management">
                <p>
                  We actively monitor and address security vulnerabilities:
                </p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Regular vulnerability scanning of infrastructure and applications</li>
                  <li>Prompt patching of identified vulnerabilities, prioritized by severity</li>
                  <li>Periodic security assessments and penetration testing</li>
                  <li>Responsible disclosure handling for reported issues</li>
                </ul>
              </Section>

              <Section title="13. Compliance and Audits">
                <p>
                  We align our practices with applicable laws and frameworks,
                  including the GDPR, CCPA, and China&rsquo;s PIPL. Internal reviews
                  and external assessments are conducted periodically to verify the
                  effectiveness of our security controls.
                </p>
              </Section>

              <Section title="14. Reporting a Security Issue">
                <p>
                  If you believe you have discovered a security vulnerability in
                  our systems, please report it responsibly to{" "}
                  <a
                    href="mailto:beijingbridgepath@gmail.com"
                    className="text-primary font-bold hover:underline"
                  >
                    beijingbridgepath@gmail.com
                  </a>
                  . We ask that you avoid exploiting the issue and provide sufficient
                  detail for us to investigate and remediate.
                </p>
              </Section>

              <Section title="15. Changes to This Security Policy">
                <p>
                  We may update this Security Policy as our systems and practices
                  evolve. Material changes will be posted on this page with an
                  updated &ldquo;Last updated&rdquo; date.
                </p>
              </Section>

              <Section title="16. Contact Us">
                <p>
                  For security-related questions or concerns, please contact us:
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
