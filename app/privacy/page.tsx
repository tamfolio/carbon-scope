import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Shield, Lock, Globe, Mail, FileText, ArrowRight } from "lucide-react";

const toc = [
  { href: "#collection", label: "Collection of Personal Information" },
  { href: "#third-parties", label: "Information from Third Parties" },
  { href: "#use", label: "Use of Personal Information" },
  { href: "#disclosure", label: "Disclosure of Personal Information" },
  { href: "#links", label: "Links to Other Websites" },
  { href: "#security", label: "Security" },
  { href: "#children", label: "Privacy Notice for Children" },
  { href: "#retention", label: "Data Retention" },
  { href: "#rights", label: "Your Privacy Rights and Choices" },
  { href: "#transfers", label: "International Transfers" },
  { href: "#changes", label: "Changes to This Privacy Policy" },
  { href: "#contact", label: "Contact Us" },
];

const highlights = [
  {
    icon: Shield,
    title: "Privacy-first approach",
    description: "Clear details on how we collect, use, and protect data.",
  },
  {
    icon: Lock,
    title: "Reasonable safeguards",
    description: "Administrative, technical, and organizational controls.",
  },
  {
    icon: Globe,
    title: "Global-ready policy",
    description: "Designed for international operations and transfers.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <section className="relative overflow-hidden border-b border-border/50">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-emerald-100 dark:from-emerald-950/30 dark:via-background dark:to-emerald-900/20" />
          <div className="absolute -top-28 right-0 h-64 w-64 rounded-full bg-emerald-200/40 blur-3xl dark:bg-emerald-400/10" />
          <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <div className="max-w-3xl space-y-6">
              <Badge variant="secondary">Privacy</Badge>
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                CarbonScope360 Privacy Policy
              </h1>
              <p className="text-lg leading-relaxed text-muted-foreground">
                CarbonScope360 and its affiliates ("CarbonScope360," "we," "us,"
                or "our") are committed to protecting the privacy and
                confidentiality of personal information entrusted to us. This
                Privacy Policy explains how we collect, use, process, store,
                disclose, and safeguard personal information when individuals
                visit our websites, request information about our platform,
                engage with our communications, request or schedule a product
                demonstration, or otherwise interact with CarbonScope360
                outside of the core platform environment (collectively, the
                "Services").
              </p>
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span className="rounded-full border border-border/60 bg-background/80 px-3 py-1">
                  Date posted and effective: 1/31/2026
                </span>
                <span className="rounded-full border border-border/60 bg-background/80 px-3 py-1">
                  Last updated: 1/31/2026
                </span>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild>
                  <Link href="/register">
                    Get started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="#contact">Contact privacy</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              <Card className="border border-border/60 bg-card/70">
                <CardHeader>
                  <CardTitle className="text-xl">At a glance</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6 sm:grid-cols-3">
                  {highlights.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.title} className="space-y-2">
                        <Icon className="h-6 w-6 text-primary" />
                        <p className="font-semibold text-foreground">
                          {item.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <div className="space-y-10">
                <section id="collection" className="space-y-4">
                  <h2 className="text-2xl font-semibold text-foreground">
                    I. Collection of Personal Information
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    CarbonScope360 collects personal information that
                    individuals voluntarily provide when they interact with us
                    through our Services. This includes situations where you
                    request information about our platform, request or schedule
                    a product demonstration, inquire about our services,
                    communicate with our sales or support teams, subscribe to
                    updates or newsletters, complete forms on our website, or
                    otherwise correspond with CarbonScope360 through email,
                    telephone, video conferencing platforms, chat interfaces,
                    or similar communication tools.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    The personal information collected may include identifying
                    and professional information such as your name, email
                    address, telephone number, company name, job title,
                    business address, country or region of residence, and other
                    contact details. Where applicable, such as for paid
                    services, we may collect billing and payment-related
                    information. If you communicate with us through recorded
                    channels, including video meetings, phone calls, or chat
                    services, those communications may be recorded,
                    transcribed, and retained for business administration,
                    quality assurance, training, security, and compliance
                    purposes, in accordance with applicable law and any
                    required notice or consent.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    In addition to information actively provided, CarbonScope360
                    automatically collects certain technical and usage
                    information when individuals access or interact with our
                    Services. This information may include internet protocol
                    (IP) addresses, browser type and version, device
                    identifiers, operating system details, date and time of
                    access, pages viewed, navigation patterns, referring
                    websites, and other diagnostic or usage data. This
                    information is collected through cookies, server logs,
                    pixels, and similar technologies to enable website
                    functionality, improve user experience, monitor
                    performance, maintain security, and prevent unauthorized
                    access or misuse.
                  </p>
                </section>

                <section id="third-parties" className="space-y-4">
                  <h2 className="text-2xl font-semibold text-foreground">
                    II. Information We Receive from Third Parties
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    CarbonScope360 may obtain personal information from
                    third-party sources, including business partners, service
                    providers, marketing platforms, analytics providers, or
                    publicly available sources such as professional or business
                    directories. Where permitted by law, we may combine
                    information received from third parties with information
                    already in our possession in order to maintain accurate
                    records, enhance our understanding of our users and
                    audiences, improve our Services, tailor communications, and
                    identify potential customer, partnership, or collaboration
                    opportunities.
                  </p>
                </section>

                <section id="use" className="space-y-4">
                  <h2 className="text-2xl font-semibold text-foreground">
                    III. Use of Personal Information
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    CarbonScope360 processes personal information for legitimate
                    business purposes consistent with this Privacy Policy and
                    applicable law. These purposes include providing,
                    operating, and improving our Services; responding to
                    inquiries and requests; managing customer and business
                    relationships; communicating about products, services,
                    platform updates, and educational content; conducting
                    analytics, research, and internal reporting; maintaining
                    the security and integrity of our systems; detecting and
                    preventing fraud, misuse, or unauthorized access; enforcing
                    our policies and agreements; and complying with legal,
                    regulatory, and contractual obligations.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    Personal information may also be used to understand
                    engagement with our Services, evaluate interest in our
                    offerings, and support product development and improvement
                    initiatives. CarbonScope360 does not use personal
                    information for automated decision-making processes that
                    produce legal effects concerning individuals or similarly
                    significant impacts.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    Information that has been aggregated, anonymized, or
                    otherwise de-identified so that it cannot reasonably be
                    linked to an identifiable individual may be used for any
                    lawful business purpose.
                  </p>
                </section>

                <section id="disclosure" className="space-y-4">
                  <h2 className="text-2xl font-semibold text-foreground">
                    IV. Disclosure of Personal Information
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    CarbonScope360 does not sell personal information for
                    monetary consideration in the traditional sense. We may,
                    however, disclose personal information to third parties for
                    legitimate business and commercial purposes consistent with
                    this Privacy Policy and applicable law.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    Such disclosures may include sharing personal information
                    with affiliated entities for internal business operations;
                    with service providers that perform services on our behalf,
                    including cloud hosting, data storage, analytics, customer
                    relationship management, payment processing,
                    communications, marketing support, and professional
                    advisory services; and with business or collaboration
                    partners where such disclosure is appropriate and
                    permitted.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    We may also disclose personal information when required to
                    do so by law, regulation, legal process, or governmental
                    request, or when we believe disclosure is necessary to
                    protect the rights, property, or safety of CarbonScope360,
                    our customers, users, partners, or others. In the event of
                    a merger, acquisition, restructuring, sale of assets, or
                    similar business transaction, personal information may be
                    transferred as part of that transaction, subject to
                    appropriate confidentiality and data protection safeguards.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    CarbonScope360 may disclose aggregated or de-identified
                    information that does not identify individuals for lawful
                    business purposes.
                  </p>
                </section>

                <section id="links" className="space-y-4">
                  <h2 className="text-2xl font-semibold text-foreground">
                    V. Links to Other Websites
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    The Services may contain links to websites or services
                    operated by third parties. This Privacy Policy does not
                    apply to those third-party websites or services, and
                    CarbonScope360 is not responsible for the privacy
                    practices, content, or security of such third parties.
                    Users are encouraged to review the privacy policies of any
                    third-party websites they visit.
                  </p>
                </section>

                <section id="security" className="space-y-4">
                  <h2 className="text-2xl font-semibold text-foreground">
                    VI. Security
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    CarbonScope360 implements reasonable administrative,
                    technical, and organizational safeguards designed to
                    protect personal information against unauthorized access,
                    loss, misuse, alteration, or disclosure. These safeguards
                    are appropriate to the nature of the personal information
                    processed and the risks associated with such processing.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    Despite these measures, no method of data transmission over
                    the internet or electronic storage is completely secure.
                    Accordingly, while CarbonScope360 strives to protect
                    personal information, we cannot guarantee absolute
                    security. Individuals are responsible for maintaining the
                    confidentiality of any account credentials and for
                    notifying us promptly of any suspected unauthorized access
                    or security incidents.
                  </p>
                </section>

                <section id="children" className="space-y-4">
                  <h2 className="text-2xl font-semibold text-foreground">
                    VII. Privacy Notice for Children
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    CarbonScope360's Services are not intended for use by
                    children under the age of Eighteen (18), and we do not
                    knowingly collect personal information from children. If
                    we become aware that personal information has been
                    collected from a child without appropriate authorization,
                    we will take reasonable steps to delete such information
                    promptly.
                  </p>
                </section>

                <section id="retention" className="space-y-4">
                  <h2 className="text-2xl font-semibold text-foreground">
                    VIII. Data Retention
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    CarbonScope360 retains personal information for only as
                    long as necessary to fulfill the purposes for which it was
                    collected, including to satisfy legal, regulatory,
                    accounting, reporting, or contractual requirements,
                    resolve disputes, enforce agreements, or continue providing
                    Services.
                  </p>
                </section>

                <section id="rights" className="space-y-4">
                  <h2 className="text-2xl font-semibold text-foreground">
                    IX. Your Privacy Rights and Choices
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Depending on your jurisdiction and applicable data
                    protection laws, you may have certain rights regarding your
                    personal information. These rights may include the right
                    to request access to personal information we hold about
                    you, request correction of inaccurate or incomplete
                    information, request deletion or restriction of processing
                    in certain circumstances, object to processing for
                    particular purposes, including marketing, and withdraw
                    consent where processing is based on consent.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    Requests to exercise these rights may be submitted by
                    contacting CarbonScope360 using the contact details
                    provided below. We will respond to such requests within a
                    reasonable timeframe and in accordance with applicable
                    law, and we may require verification of identity before
                    fulfilling certain requests.
                  </p>
                </section>

                <section id="transfers" className="space-y-4">
                  <h2 className="text-2xl font-semibold text-foreground">
                    X. International Transfer of Personal Information
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    CarbonScope360 operates on a global basis, and personal
                    information may be transferred to, stored, or processed in
                    countries outside the individual's country of residence.
                    Where such transfers occur, CarbonScope360 takes
                    appropriate measures to ensure that personal information
                    is protected in accordance with applicable data protection
                    requirements.
                  </p>
                </section>

                <section id="changes" className="space-y-4">
                  <h2 className="text-2xl font-semibold text-foreground">
                    XI. Changes to This Privacy Policy
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    CarbonScope360 may update this Privacy Policy from time to
                    time. When material changes are made, we will update the
                    "Last Updated" date and publish the revised Privacy Policy
                    on our website. Continued use of the Services after such
                    updates constitutes acceptance of the revised Privacy
                    Policy.
                  </p>
                </section>

                <section id="contact" className="space-y-4">
                  <h2 className="text-2xl font-semibold text-foreground">
                    XII. Contact Us
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    If you have any questions, concerns, or requests regarding
                    this Privacy Policy or our handling of personal
                    information, you may contact us at:
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    Email: privacy@carbonscope360.com
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    Address: 7th Floor, Plot 634, Adeyemo Alakija, Victoria
                    Island, Lagos
                  </p>
                </section>
              </div>
            </div>

            <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
              <Card className="border border-border/60 bg-card/80">
                <CardHeader>
                  <CardTitle className="text-lg">Table of contents</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {toc.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2 text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
                    >
                      <span>{item.label}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  ))}
                </CardContent>
              </Card>

              <Card className="border border-primary/30 bg-gradient-to-br from-emerald-50 via-white to-transparent dark:from-emerald-900/20 dark:via-background dark:to-transparent">
                <CardContent className="space-y-4 p-6">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <p className="text-sm font-semibold text-foreground">
                      Customer Data notice
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This policy applies to public-facing services and business
                    communications. Customer Data inside the platform is
                    covered by your agreement with CarbonScope360.
                  </p>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-primary" />
                    <p className="text-sm text-muted-foreground">
                      For privacy questions, email
                      privacy@carbonscope360.com.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
