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
  { href: "#eligibility", label: "Eligibility" },
  { href: "#accounts", label: "Accounts" },
  { href: "#usage", label: "Acceptable Use" },
  { href: "#data", label: "Data & Privacy" },
  { href: "#fees", label: "Fees & Billing" },
  { href: "#ip", label: "Intellectual Property" },
  { href: "#confidentiality", label: "Confidentiality" },
  { href: "#disclaimer", label: "Disclaimers" },
  { href: "#liability", label: "Limitation of Liability" },
  { href: "#termination", label: "Termination" },
  { href: "#law", label: "Governing Law" },
  { href: "#contact", label: "Contact" },
];

const highlights = [
  {
    icon: BookOpen,
    title: "Plain-language summary",
    description:
      "We use clear sections so teams can find what matters fast.",
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
    description:
      "Designed with sustainability reporting workflows in mind.",
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
                        <p className="font-semibold text-foreground">{item.title}</p>
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
                    By accessing or using CarbonScope 360, you agree to these
                    Terms. If you are using the platform on behalf of an
                    organization, you confirm that you have authority to bind
                    that organization to these Terms.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    We may update these Terms to reflect platform improvements,
                    regulatory changes, or operational needs. When we do, we will
                    update the effective date above and, if the changes are
                    material, provide a reasonable notice.
                  </p>
                </section>

                <section id="eligibility" className="space-y-4">
                  <h2 className="text-2xl font-semibold text-foreground">
                    2. Eligibility
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    You must be at least 18 years old and able to enter into a
                    binding agreement to use the platform. Certain services may
                    require additional verification or regulatory checks.
                  </p>
                </section>

                <section id="accounts" className="space-y-4">
                  <h2 className="text-2xl font-semibold text-foreground">
                    3. Accounts
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    You are responsible for safeguarding login credentials and
                    for all activity that occurs under your account. Please
                    notify us immediately of any unauthorized access.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    We may suspend or restrict access if we detect unusual
                    activity, suspected compromise, or violations of these
                    Terms.
                  </p>
                </section>

                <section id="usage" className="space-y-4">
                  <h2 className="text-2xl font-semibold text-foreground">
                    4. Acceptable Use
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    You agree not to misuse the platform, including attempting
                    to disrupt service, access data you do not own, or reverse
                    engineer the software. Use of the platform must comply with
                    applicable laws and environmental reporting standards.
                  </p>
                </section>

                <section id="data" className="space-y-4">
                  <h2 className="text-2xl font-semibold text-foreground">
                    5. Data & Privacy
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    You retain ownership of your data. We process your data to
                    provide analytics, dashboards, and reporting features. Our
                    Privacy Policy explains how data is collected, used, and
                    protected.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    You are responsible for ensuring you have rights to upload
                    any data, including supplier or employee information, and
                    for complying with your own legal obligations.
                  </p>
                </section>

                <section id="fees" className="space-y-4">
                  <h2 className="text-2xl font-semibold text-foreground">
                    6. Fees & Billing
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Paid plans are billed in advance on a subscription basis.
                    Taxes may apply. You can cancel at any time, and your plan
                    remains active until the end of the billing period.
                  </p>
                </section>

                <section id="ip" className="space-y-4">
                  <h2 className="text-2xl font-semibold text-foreground">
                    7. Intellectual Property
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    CarbonScope 360, including its software, branding, and
                    content, is protected by intellectual property laws. These
                    Terms grant you a limited, non-exclusive license to use the
                    platform for your internal business purposes.
                  </p>
                </section>

                <section id="confidentiality" className="space-y-4">
                  <h2 className="text-2xl font-semibold text-foreground">
                    8. Confidentiality
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Each party agrees to protect the other party&apos;s
                    confidential information and use it only to perform under
                    these Terms. Confidential information does not include
                    information that is publicly available or independently
                    developed without access to the other party&apos;s data.
                  </p>
                </section>

                <section id="disclaimer" className="space-y-4">
                  <h2 className="text-2xl font-semibold text-foreground">
                    9. Disclaimers
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    The platform is provided on an &quot;as is&quot; and
                    &quot;as available&quot; basis. We do not warrant that the
                    service will be uninterrupted or error-free, or that output
                    will meet specific regulatory approvals.
                  </p>
                </section>

                <section id="liability" className="space-y-4">
                  <h2 className="text-2xl font-semibold text-foreground">
                    10. Limitation of Liability
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    To the maximum extent permitted by law, CarbonScope 360 will
                    not be liable for any indirect, incidental, or consequential
                    damages, including loss of profits, revenue, or data.
                  </p>
                </section>

                <section id="termination" className="space-y-4">
                  <h2 className="text-2xl font-semibold text-foreground">
                    11. Termination
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    You may stop using the platform at any time. We may suspend
                    or terminate access if you violate these Terms or if
                    continued service would create legal or security risk.
                  </p>
                </section>

                <section id="law" className="space-y-4">
                  <h2 className="text-2xl font-semibold text-foreground">
                    12. Governing Law
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    These Terms are governed by the laws of your primary place
                    of business, unless otherwise required by local regulation.
                  </p>
                </section>

                <section id="contact" className="space-y-4">
                  <h2 className="text-2xl font-semibold text-foreground">
                    13. Contact
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Questions about these Terms? Reach out to our legal team at
                    legal@carbonscope360.com or via the contact form.
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
