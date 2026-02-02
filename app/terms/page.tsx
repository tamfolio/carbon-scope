import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  Shield,
  FileCheck,
  Globe,
  Scale,
  Mail,
  ArrowRight,
} from "lucide-react";

const toc = [
  { href: "#overview", label: "Overview" },
  { href: "#description", label: "Description of the Services" },
  { href: "#accounts", label: "Account Registration and Use" },
  { href: "#usage", label: "Acceptable Use" },
  { href: "#data", label: "Customer Data and Responsibilities" },
  { href: "#ip", label: "Intellectual Property" },
  { href: "#fees", label: "Fees and Payment" },
  { href: "#confidentiality", label: "Confidentiality" },
  { href: "#disclaimer", label: "Disclaimers" },
  { href: "limitation", label: "Limitation of Liability"},
  { href: "#termination", label: "Suspension and Termination" },
  { href: "#law", label: "Governing Law" },
  { href: "#changes", label: "Changes to These Terms" },
  { href: "#contact", label: "Contact Information" },
];

const highlights = [
  {
    icon: BookOpen,
    title: "Plain-language summary",
    description: "We use clear sections so teams can find what matters fast.",
  },
  {
    icon: Shield,
    title: "Security first",
    description:
      "We explain how data is handled and your responsibilities too.",
  },
  {
    icon: FileCheck,
    title: "Compliance ready",
    description: "Designed with sustainability reporting workflows in mind.",
  },
];

export default function TermsOfServicePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <section className="relative overflow-hidden border-b border-border/50">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-emerald-100 dark:from-emerald-950/30 dark:via-background dark:to-emerald-900/20" />
          <div className="absolute -top-28 right-0 h-64 w-64 rounded-full bg-emerald-200/40 blur-3xl dark:bg-emerald-400/10" />
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
            <div className="max-w-3xl space-y-6">
              <Badge variant="secondary">Legal</Badge>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
                Terms of Service
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                These Terms of Service outline how CarbonScope 360 is offered to
                you, what you can expect from us, and what we expect from you.
                Please read carefully before using the platform.
              </p>
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span className="rounded-full border border-border/60 bg-background/80 px-3 py-1">
                  Effective date: January 31, 2026
                </span>
                <span className="rounded-full border border-border/60 bg-background/80 px-3 py-1">
                  Last updated: January 31, 2026
                </span>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild>
                  <Link href="/register">
                    Start a free trial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="#contact">Contact legal</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
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
                <section id="overview" className="space-y-4">
                  <h2 className="text-2xl font-semibold text-foreground">
                    1. Overview
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    These Terms and Conditions (“Terms”) govern access to and
                    use of the CarbonScope360 website, online platform,
                    software, tools, and related services (collectively, the
                    “Services”) operated by CarbonScope360 and its affiliates
                    (“CarbonScope360,” “we,” “us,” or “our”).
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    These Terms apply to all visitors, users, and organisations
                    that access or use the Services. By accessing the Services,
                    creating an account, or using any part of the platform, you
                    confirm that you have read, understood, and agreed to be
                    bound by these Terms. If you are using the Services on
                    behalf of an organisation, you confirm that you have the
                    authority to accept these Terms on behalf of that
                    organisation. If you do not agree to these Terms, you must
                    not access or use the Services.
                  </p>
                </section>

                <section id="description" className="space-y-4">
                  <h2 className="text-2xl font-semibold text-foreground">
                    2. Description of the Services
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    CarbonScope360 is an online carbon accounting and emissions
                    management platform designed to support organisations in
                    measuring, tracking, managing, and reporting greenhouse gas
                    emissions and related sustainability information. The
                    Services may include emissions calculations, analytics,
                    dashboards, reporting tools, data visualisation features,
                    gap analysis, improvement insights, and other
                    sustainability-related functionalities, as well as platform
                    communications and customer support. CarbonScope360 may
                    update, improve, modify, suspend, or discontinue any part of
                    the Services from time to time. We do not guarantee that
                    every feature or functionality will always be available.
                  </p>
                </section>

                <section id="accounts" className="space-y-4">
                  <h2 className="text-2xl font-semibold text-foreground">
                    3. Account Registration and Use
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Certain features of the Services require account
                    registration. When creating an account, you agree to provide
                    accurate, current, and complete information and to keep your
                    account information up to date.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    You are responsible for maintaining the confidentiality of
                    your login credentials and for all activities carried out
                    through your account. You must notify CarbonScope360
                    promptly if you believe your account has been accessed or
                    used without authorisation. CarbonScope360 is not
                    responsible for any loss or damage arising from unauthorised
                    use of your account where such use results from your failure
                    to safeguard your login information.
                  </p>
                </section>

                <section id="usage" className="space-y-4">
                  <h2 className="text-2xl font-semibold text-foreground">
                    4. Acceptable Use
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    You agree to use the Services only for lawful purposes and
                    in accordance with these Terms. You must not misuse the
                    platform, interfere with its operation, attempt to gain
                    unauthorised access to systems or data, upload harmful or
                    malicious code, or use the Services in a way that could
                    damage, disable, or impair CarbonScope360 or other users.
                    You must not copy, modify, reverse engineer, decompile, or
                    otherwise attempt to access the source code or technical
                    components of the Services, except where such actions are
                    permitted by applicable law.
                  </p>
                </section>

                <section id="data" className="space-y-4">
                  <h2 className="text-2xl font-semibold text-foreground">
                    5. Customer Data and Responsibilities
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Any data uploaded, entered, or processed through the
                    platform by you, including emissions data, sustainability
                    data, operational data, or related information (“Customer
                    Data”), remains your responsibility.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    You confirm that you have the legal right and authority to
                    provide Customer Data to CarbonScope360 and that such data
                    does not violate any applicable law or third-party rights.
                    CarbonScope360 processes Customer Data only to provide the
                    Services. Customers are responsible for ensuring that the
                    data they upload or use within the platform is accurate and
                    complete. CarbonScope360 does not independently verify
                    Customer Data and is not responsible for decisions,
                    disclosures, reports, or outcomes based on such data.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    CarbonScope360 processes Customer Data only to provide the
                    Services. Customers are responsible for ensuring that the
                    data they upload or use within the platform is accurate and
                    complete. CarbonScope360 does not independently verify
                    Customer Data and is not responsible for decisions,
                    disclosures, reports, or outcomes based on such data.
                  </p>
                </section>

                <section id="ip" className="space-y-4">
                  <h2 className="text-2xl font-semibold text-foreground">
                    6. Intellectual Property
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    All intellectual property rights in and to the Services,
                    including the platform, software, interfaces, designs,
                    logos, trademarks, content, and documentation, are owned by
                    or licensed to CarbonScope360. You are granted a limited,
                    non-exclusive, non-transferable, and revocable right to
                    access and use the Services solely for your internal
                    business purposes. You may not copy, distribute, sell,
                    sublicense, or otherwise exploit any part of the Services
                    without prior authorisation from CarbonScope360.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    You are granted a limited, non-exclusive, non-transferable,
                    and revocable right to access and use the Services solely
                    for your internal business purposes. You may not copy,
                    distribute, sell, sublicense, or otherwise exploit any part
                    of the Services without prior authorisation from
                    CarbonScope360.
                  </p>
                </section>

                <section id="fees" className="space-y-4">
                  <h2 className="text-2xl font-semibold text-foreground">
                    7. Fees and Payment
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Certain parts of the Services may be offered for a fee.
                    Pricing, billing terms, and any applicable charges will be
                    clearly displayed on the platform or otherwise communicated
                    to you before payment is required. By selecting a paid plan,
                    submitting payment details, making payment through the
                    platform, or continuing to use paid Services after being
                    informed of applicable fees, you agree to pay the stated
                    fees in accordance with the applicable billing terms. Unless
                    otherwise stated, all fees are non-refundable.
                    CarbonScope360 may suspend or restrict access to paid
                    Services if payment is not received when due.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    By selecting a paid plan, submitting payment details, making
                    payment through the platform, or continuing to use paid
                    Services after being informed of applicable fees, you agree
                    to pay the stated fees in accordance with the applicable
                    billing terms. Unless otherwise stated, all fees are
                    non-refundable. CarbonScope360 may suspend or restrict
                    access to paid Services if payment is not received when due.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    Unless otherwise stated, all fees are non-refundable.
                    CarbonScope360 may suspend or restrict access to paid
                    Services if payment is not received when due.
                  </p>
                </section>

                <section id="confidentiality" className="space-y-4">
                  <h2 className="text-2xl font-semibold text-foreground">
                    8. Confidentiality
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    During your use of the Services, you may have access to
                    information relating to CarbonScope360 that is not publicly
                    available, meaning it is not openly published or accessible
                    to the general public and is shared only with users through
                    controlled access such as accounts, communications, or
                    support interactions. This information may include details
                    about the platform’s features, functionality, pricing,
                    technical processes, or internal operations (“Confidential
                    Information”). You agree to keep such Confidential
                    Information confidential and to use it only in connection
                    with your use of the Services, unless disclosure is required
                    by law.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    You agree to keep such Confidential Information confidential
                    and to use it only in connection with your use of the
                    Services, unless disclosure is required by law.
                  </p>
                </section>

                <section id="disclaimer" className="space-y-4">
                  <h2 className="text-2xl font-semibold text-foreground">
                    9. Disclaimers
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    CarbonScope360 is designed to actively support organisations
                    in understanding their sustainability performance,
                    identifying gaps, and improving emissions management and
                    reporting practices. We take reasonable steps to ensure that
                    the Services operate reliably and that calculations and
                    insights are generated using recognised methodologies and
                    industry practices.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    The accuracy and usefulness of outputs depend on the
                    quality, completeness, and correctness of the data provided
                    by users, as well as applicable standards, assumptions, and
                    regulatory requirements, which may vary by jurisdiction and
                    change over time.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    The Services provide tools, insights, and guidance to inform
                    decision-making. Organisations remain responsible for how
                    outputs are applied in practice and for meeting applicable
                    regulatory, reporting, or disclosure requirements.
                    CarbonScope360 supports organisations in understanding,
                    managing, and improving sustainability and emissions
                    performance, but actual outcomes depend on how the Services
                    are used, the quality of data provided, and external factors
                    beyond CarbonScope360’s control.
                  </p>
                </section>

                <section id="liability" className="space-y-4">
                  <h2 className="text-2xl font-semibold text-foreground">
                    10. Limitation of Liability
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    To the maximum extent permitted by law, CarbonScope360 shall
                    not be liable for any indirect, incidental, consequential,
                    special, or punitive damages, including loss of profits,
                    revenue, data, or business opportunities, arising from or
                    related to your use of, or inability to use, the Services.
                    CarbonScope360’s total liability for any claim arising out
                    of or related to these Terms or the Services shall not
                    exceed the total amount paid by you to CarbonScope360 for
                    the Services during the twelve (12) months preceding the
                    event giving rise to the claim.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    CarbonScope360’s total liability for any claim arising out
                    of or related to these Terms or the Services shall not
                    exceed the total amount paid by you to CarbonScope360 for
                    the Services during the twelve (12) months preceding the
                    event giving rise to the claim.
                  </p>
                </section>

                <section id="termination" className="space-y-4">
                  <h2 className="text-2xl font-semibold text-foreground">
                    11. Suspension and Termination
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    You may stop using the Services at any time. CarbonScope360
                    may suspend or terminate access to the Services if you
                    breach these Terms, misuse the platform, fail to make
                    required payments, or pose a legal or security risk. Upon
                    termination, your right to access and use the Services will
                    end immediately. Provisions that by their nature should
                    survive termination will continue to apply.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    Upon termination, your right to access and use the Services
                    will end immediately. Provisions that by their nature should
                    survive termination will continue to apply.
                  </p>
                </section>

                <section id="law" className="space-y-4">
                  <h2 className="text-2xl font-semibold text-foreground">
                    12. Governing Law
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    These Terms are governed by and interpreted in accordance
                    with the laws of the Federal Republic of Nigeria, without
                    regard to conflict of law principles.
                  </p>
                </section>

                <section id="changes" className="space-y-4">
                  <h2 className="text-2xl font-semibold text-foreground">
                    13. Changes to These Terms
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    CarbonScope360 may update these Terms from time to time.
                    When updates are made, the “Last Updated” date will be
                    revised. Continued use of the Services after such updates
                    constitutes acceptance of the updated Terms.
                  </p>
                </section>
                <section id="contact" className="space-y-4">
                  <h2 className="text-2xl font-semibold text-foreground">
                    14. Contact Information
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    If you have any questions or concerns regarding these Terms
                    or the Services, you may contact us at:
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    Email: legal@carbonscope360.com <br/>
                    Address: 7th Floor, Plot 634, Adeyemo Alakija, Victoria
                    Island, Lagos.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    
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
                    <Globe className="h-5 w-5 text-primary" />
                    <p className="text-sm font-semibold text-foreground">
                      Global-ready terms
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Use this draft as a starting point, then tailor it to your
                    jurisdiction, company name, and billing model.
                  </p>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <Scale className="h-5 w-5 text-primary" />
                    <p className="text-sm text-muted-foreground">
                      Consider adding a separate data processing agreement if
                      required.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-border/60 bg-card/80">
                <CardContent className="space-y-4 p-6">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-primary" />
                    <p className="text-sm font-semibold text-foreground">
                      Need adjustments?
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Share your jurisdiction, company entity name, and preferred
                    legal contact and we can personalize this page.
                  </p>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/contact">Send details</Link>
                  </Button>
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
