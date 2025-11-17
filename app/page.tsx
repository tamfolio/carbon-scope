"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuickCalculator from "@/components/QuickCalculator";
import ChatAssistant from "@/components/ChatAssistant";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Shield,
  FileText,
  Users,
  Zap,
  CheckCircle,
  ArrowRight,
  BarChart3,
  Globe,
  Lock,
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useState, useEffect } from "react";

export default function Home() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const features = [
    {
      icon: Zap,
      title: "Scope 1 Tracking",
      description:
        "Direct emissions from fuel combustion, vehicles, and refrigerants with automated calculations.",
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      icon: BarChart3,
      title: "Scope 2 Energy",
      description:
        "Purchased electricity tracking with both location-based and market-based methodologies.",
      color: "text-green-600 dark:text-green-400",
    },
    {
      icon: Globe,
      title: "Scope 3 Value Chain",
      description:
        "Complete value chain emissions including purchased goods, transport, and business travel.",
      color: "text-purple-600 dark:text-purple-400",
    },
    {
      icon: TrendingUp,
      title: "Waste Management",
      description:
        "Comprehensive waste tracking with disposal routes and avoided emissions calculations.",
      color: "text-orange-600 dark:text-orange-400",
    },
    {
      icon: BarChart3,
      title: "PCAF Banking",
      description:
        "Financed emissions calculation for loan portfolios with sector-specific methodologies.",
      color: "text-red-600 dark:text-red-400",
    },
    {
      icon: TrendingUp,
      title: "Advanced Analytics",
      description:
        "Real-time dashboards, scenario modeling, and hotspot analysis for strategic insights.",
      color: "text-yellow-600 dark:text-yellow-400",
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description:
        "Multi-user organization with role-based access and approval workflows.",
      color: "text-cyan-600 dark:text-cyan-400",
    },
    {
      icon: FileText,
      title: "Compliance Reports",
      description:
        "TCFD, ISSB, and custom report formats with automated generation and export.",
      color: "text-pink-600 dark:text-pink-400",
    },
    {
      icon: Lock,
      title: "Enterprise Security",
      description:
        "SOC 2 Type II compliance with SSO, 2FA, and audit trails for peace of mind.",
      color: "text-indigo-600 dark:text-indigo-400",
    },
  ];

  const benefits = [
    "Automated data collection and calculation",
    "Real-time carbon footprint monitoring",
    "Customizable dashboards and reports",
    "Multi-organization support",
    "Advanced analytics and forecasting",
    "Compliance automation",
  ];

  return (
    <>
      <Header />
      <QuickCalculator />
      <ChatAssistant />
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section
          className="relative overflow-hidden py-20 lg:py-32"
          style={{
            background:
              mounted && theme === "dark"
                ? "hsl(222, 47%, 3%)"
                : "linear-gradient(to bottom right, #f0fdf4, #ffffff, #f0fdf4)",
          }}
        >
          {/* Background Pattern - light mode only */}
          {(!mounted || theme === "light") && (
            <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
          )}

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-8">
              {/* Badge */}
              <Badge
                variant="secondary"
                className="px-4 py-1.5 animate-fade-in"
                style={{ animationDelay: "0.1s" }}
              >
                <Image src="/carbon.png" alt="CarbonScope" width={12} height={12} className="mr-2 h-3 w-3 dark:invert" />
                Trusted by 10,000+ Organizations
              </Badge>

              {/* Headline */}
              <div className="space-y-4">
                <h1
                  className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight animate-slide-up"
                  style={{ animationDelay: "0.2s" }}
                >
                  <span className="bg-gradient-to-r from-green-600 to-green-700 dark:from-primary dark:to-green-500 bg-clip-text text-transparent">
                    Scope 1–3 Emissions
                  </span>{" "}
                  Simplified
                </h1>
                <p
                  className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-fade-in"
                  style={{ animationDelay: "0.4s" }}
                >
                  Complete carbon accounting platform for SMEs and financial institutions. Track, measure, and report emissions across your entire value chain with enterprise-grade accuracy.
                </p>
              </div>

              {/* CTAs */}
              <div
                className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in"
                style={{ animationDelay: "0.6s" }}
              >
                <Button asChild size="lg" className="text-base px-8 h-12 group">
                  <Link href="/register?tab=signup">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="text-base px-8 h-12 group"
                  onClick={() => {
                    const event = new CustomEvent('openCalculator');
                    window.dispatchEvent(event);
                  }}
                >
                  Quick Calculator
                </Button>
              </div>

              {/* Certifications */}
              <div
                className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground pt-4 animate-fade-in"
                style={{ animationDelay: "0.7s" }}
              >
                <Badge variant="outline" className="px-3 py-1">
                  PCAF Compliant
                </Badge>
                <span className="text-muted-foreground">·</span>
                <Badge variant="outline" className="px-3 py-1">
                  ISSB Ready
                </Badge>
                <span className="text-muted-foreground">·</span>
                <Badge variant="outline" className="px-3 py-1">
                  ISO 14064
                </Badge>
                <span className="text-muted-foreground">·</span>
                <Badge variant="outline" className="px-3 py-1">
                  SOC 2 Type II
                </Badge>
              </div>

              {/* Dashboard Visual with Metrics */}
              <div
                className="relative max-w-4xl mx-auto mt-12 animate-fade-in"
                style={{ animationDelay: "0.8s" }}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Metric 1 */}
                  <Card className="border-none shadow-lg hover:shadow-xl transition-all bg-card">
                    <CardContent className="p-6 text-center">
                      <div className="text-5xl font-bold text-primary mb-2">94%</div>
                      <div className="text-base font-semibold text-foreground mb-1">Data Quality</div>
                      <div className="text-sm text-muted-foreground">Enterprise-grade accuracy</div>
                    </CardContent>
                  </Card>

                  {/* Metric 2 */}
                  <Card className="border-none shadow-lg hover:shadow-xl transition-all bg-card">
                    <CardContent className="p-6 text-center">
                      <div className="text-5xl font-bold text-primary mb-2">–23%</div>
                      <div className="text-base font-semibold text-foreground mb-1">Emissions Reduced</div>
                      <div className="text-sm text-muted-foreground">Average client reduction</div>
                    </CardContent>
                  </Card>

                  {/* Metric 3 */}
                  <Card className="border-none shadow-lg hover:shadow-xl transition-all bg-card">
                    <CardContent className="p-6 text-center">
                      <TrendingUp className="h-12 w-12 text-primary mx-auto mb-2" />
                      <div className="text-base font-semibold text-foreground mb-1">Real-time Tracking</div>
                      <div className="text-sm text-muted-foreground">Scope 1-3 monitoring</div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Impact Stats */}
              <div
                className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12 max-w-4xl mx-auto animate-fade-in"
                style={{ animationDelay: "1s" }}
              >
                <div className="text-center">
                  <div className="text-3xl font-bold text-foreground">50M+</div>
                  <div className="text-sm text-muted-foreground mt-1">Tons CO₂ Tracked</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-foreground">10,000+</div>
                  <div className="text-sm text-muted-foreground mt-1">Organizations</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-foreground">99.9%</div>
                  <div className="text-sm text-muted-foreground mt-1">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-foreground">150+</div>
                  <div className="text-sm text-muted-foreground mt-1">Countries</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4 mb-16">
              <Badge variant="secondary" className="mb-4">
                Features
              </Badge>
              <h2 className="text-4xl font-bold text-foreground">
                Complete Carbon Accounting Platform
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Everything you need to measure, track, and report emissions across all scopes with enterprise-grade accuracy and compliance standards.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="border border-border/40 hover:border-primary/50 transition-all duration-500 hover:shadow-xl hover:scale-105 bg-card/50 backdrop-blur-sm group"
                  style={{
                    animation: `fade-in-up 0.5s ease-out ${index * 0.1}s both`,
                  }}
                >
                  <CardHeader>
                    <feature.icon
                      className={`h-12 w-12 mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 ${feature.color}`}
                      strokeWidth={1.5}
                    />
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Solutions Section */}
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4 mb-16">
              <Badge variant="secondary" className="mb-4">
                Solutions
              </Badge>
              <h2 className="text-4xl font-bold text-foreground">
                Solutions for Every Organization
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Whether you're measuring your own emissions or managing climate risk across portfolios, we have the right solution for your needs.
              </p>
            </div>

            {/* Solution Cards */}
            <div className="grid md:grid-cols-2 gap-8 mb-20">
              {/* For SMEs & Corporates */}
              <Card className="relative border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl">
                <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground">
                  Most Popular
                </Badge>
                <CardHeader>
                  <CardTitle className="text-2xl">For SMEs & Corporates</CardTitle>
                  <CardDescription className="text-base">
                    Complete emissions tracking for your organization
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Scope 1–3 emissions tracking</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Multi-facility management</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Team collaboration tools</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Compliance reporting</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Scenario modeling</span>
                    </li>
                  </ul>
                  <Button asChild className="w-full mt-6" size="lg">
                    <Link href="/register?tab=signup">
                      Start Free Trial
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* For Financial Institutions */}
              <Card className="relative border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl">
                <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground">
                  Enterprise
                </Badge>
                <CardHeader>
                  <CardTitle className="text-2xl">For Financial Institutions</CardTitle>
                  <CardDescription className="text-base">
                    Portfolio-wide climate risk management
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Loan book analysis</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Portfolio emissions tracking</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Data quality scoring</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Sector benchmarking</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Regulatory reporting</span>
                    </li>
                  </ul>
                  <Button asChild variant="outline" className="w-full mt-6" size="lg">
                    <Link href="/contact">
                      Request Demo
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Powering Global Sustainability */}
            <div className="text-center space-y-8 pt-12">
              <div className="space-y-2">
                <h3 className="text-3xl font-bold text-foreground">
                  Powering Global Sustainability
                </h3>
                <p className="text-lg text-muted-foreground">
                  Join the leading organizations already making a difference with CarbonScope.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
                <div className="text-center">
                  <div className="text-4xl font-bold text-foreground mb-2">10,000+</div>
                  <div className="text-muted-foreground">Organizations Trust Us</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-foreground mb-2">50M+</div>
                  <div className="text-muted-foreground">Tons CO₂ Tracked</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-foreground mb-2">99.9%</div>
                  <div className="text-muted-foreground">Uptime Guarantee</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-foreground mb-2">24/7</div>
                  <div className="text-muted-foreground">Expert Support</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div
                className="space-y-6 animate-fade-in-right"
                style={{ animationDelay: "0.2s" }}
              >
                <Badge variant="secondary">Why CarbonScope 360?</Badge>
                <h2 className="text-4xl font-bold text-foreground">
                  Built for modern sustainability teams
                </h2>
                <p className="text-lg text-muted-foreground">
                  CarbonScope 360 provides everything you need to manage, track,
                  and reduce your organization's carbon footprint with
                  confidence and accuracy.
                </p>
                <div className="grid gap-3">
                  {benefits.map((benefit, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 group"
                      style={{
                        animation: `fade-in-left 0.5s ease-out ${
                          0.4 + index * 0.1
                        }s both`,
                      }}
                    >
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110">
                        <CheckCircle className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-base text-foreground">
                        {benefit}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="pt-4">
                  <Button asChild size="lg" className="group">
                    <Link href="/register">
                      Get Started Now
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </div>
              </div>
              <div
                className="relative animate-fade-in"
                style={{ animationDelay: "0.3s" }}
              >
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/10 via-green-500/5 to-primary/10 dark:from-primary/20 dark:via-green-500/10 dark:to-primary/20 border border-primary/20 flex items-center justify-center shadow-2xl overflow-hidden group">
                  {/* Animated background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-green-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  {/* Large carbon icon */}
                  <Image
                    src="/carbon.png"
                    alt="CarbonScope"
                    width={256}
                    height={256}
                    className="h-64 w-64 opacity-40 dark:opacity-50 dark:invert transition-all duration-700 group-hover:scale-110 group-hover:rotate-12 relative z-10"
                  />
                  {/* Smaller decorative icons */}
                  <Image
                    src="/carbon.png"
                    alt="CarbonScope"
                    width={80}
                    height={80}
                    className="absolute top-8 right-8 h-20 w-20 opacity-20 dark:opacity-30 dark:invert transition-all duration-500 group-hover:translate-x-2 group-hover:-translate-y-2"
                  />
                  <Image
                    src="/carbon.png"
                    alt="CarbonScope"
                    width={64}
                    height={64}
                    className="absolute bottom-12 left-12 h-16 w-16 opacity-15 dark:opacity-25 dark:invert transition-all duration-500 group-hover:-translate-x-2 group-hover:translate-y-2"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials & Case Studies Section */}
        <section className="py-20 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4 mb-16">
              <Badge variant="secondary" className="mb-4">
                Customer Success Stories
              </Badge>
              <h2 className="text-4xl font-bold text-foreground">
                Trusted by Leading Organizations
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                See how organizations like yours are achieving their sustainability goals
              </p>
            </div>

            {/* Tabs */}
            <div className="flex justify-center gap-4 mb-12">
              <Button
                variant="default"
                className="px-8"
              >
                Testimonials
              </Button>
              <Button
                variant="outline"
                className="px-8"
              >
                Case Studies
              </Button>
            </div>

            {/* Featured Testimonial */}
            <Card className="max-w-4xl mx-auto mb-12 border-none shadow-lg">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-yellow-500 text-xl">★</span>
                      ))}
                    </div>
                    <p className="text-lg italic text-muted-foreground">
                      "CarbonScope 360 transformed how we track and reduce our emissions. The platform is intuitive, powerful, and has helped us achieve a 23% reduction in just 12 months."
                    </p>
                    <div className="pt-4 border-t">
                      <p className="font-semibold text-foreground">Sarah Johnson</p>
                      <p className="text-sm text-muted-foreground">Head of Sustainability, TechCorp Global</p>
                      <p className="text-xs text-muted-foreground mt-1">500-1000 employees · Technology</p>
                    </div>
                    <Card className="bg-primary/10 border-none mt-4">
                      <CardContent className="p-4">
                        <p className="font-semibold text-primary">Key Results:</p>
                        <ul className="mt-2 space-y-1 text-sm">
                          <li>• 23% emissions reduction in 12 months</li>
                          <li>• 75% time saved on reporting</li>
                          <li>• $150K annual cost savings</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Testimonials Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card className="border-none shadow-lg">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-500">★</span>
                    ))}
                  </div>
                  <p className="text-sm italic mb-4">"Outstanding platform for comprehensive emissions tracking."</p>
                  <p className="font-semibold text-sm">Michael Chen</p>
                  <p className="text-xs text-muted-foreground">CFO, GreenBank</p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-lg">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-500">★</span>
                    ))}
                  </div>
                  <p className="text-sm italic mb-4">"Best-in-class support and incredibly accurate calculations."</p>
                  <p className="font-semibold text-sm">Amara Okafor</p>
                  <p className="text-xs text-muted-foreground">ESG Manager, AfricaEnergy</p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-lg">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-500">★</span>
                    ))}
                  </div>
                  <p className="text-sm italic mb-4">"The PCAF compliance features are absolutely essential for us."</p>
                  <p className="font-semibold text-sm">James Wright</p>
                  <p className="text-xs text-muted-foreground">Director, FirstBank</p>
                </CardContent>
              </Card>
            </div>

          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4 mb-16">
              <Badge variant="secondary" className="mb-4">
                Pricing
              </Badge>
              <h2 className="text-4xl font-bold text-foreground">
                Simple, Transparent Pricing
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Choose the perfect plan for your sustainability journey
              </p>
            </div>

            {/* Pricing Cards */}
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              {/* Starter Plan */}
              <Card className="border-2 hover:border-primary/50 transition-all">
                <CardHeader>
                  <CardTitle className="text-2xl">Starter</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">Free</span>
                    <span className="text-muted-foreground"> / forever</span>
                  </div>
                  <CardDescription className="mt-2">
                    Perfect for small teams getting started
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Up to 50 data points/month</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Basic emissions calculations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Standard reporting templates</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Email support</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">1 user account</span>
                    </li>
                  </ul>
                  <Button asChild variant="outline" className="w-full mt-6">
                    <Link href="/register?tab=signup">Start Free</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Professional Plan */}
              <Card className="border-2 border-primary relative hover:border-primary transition-all shadow-xl">
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                  Most Popular
                </Badge>
                <CardHeader>
                  <CardTitle className="text-2xl">Professional</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">$99</span>
                    <span className="text-muted-foreground"> / per month</span>
                  </div>
                  <CardDescription className="mt-2">
                    For growing organizations with advanced needs
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Unlimited data points</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">PCAF compliant calculations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Custom reporting templates</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Priority support</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Up to 10 user accounts</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">API access</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Advanced analytics</span>
                    </li>
                  </ul>
                  <Button asChild className="w-full mt-6">
                    <Link href="/register?tab=signup">Start Trial</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Enterprise Plan */}
              <Card className="border-2 hover:border-primary/50 transition-all">
                <CardHeader>
                  <CardTitle className="text-2xl">Enterprise</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">Custom</span>
                  </div>
                  <CardDescription className="mt-2">
                    For large organizations with complex needs
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Everything in Professional</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Unlimited user accounts</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Custom integrations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Dedicated support manager</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">White-label options</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Advanced security</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Training & onboarding</span>
                    </li>
                  </ul>
                  <Button asChild variant="outline" className="w-full mt-6">
                    <Link href="/contact">Contact Sales</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Footer Note */}
            <p className="text-center text-muted-foreground">
              All plans include 30 day free trial • No setup fees • Cancel anytime
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section
          className="py-20 text-primary-foreground dark:text-foreground"
          style={{
            background:
              mounted && theme === "dark"
                ? "hsl(222, 47%, 3%)"
                : "hsl(142, 76%, 36%)",
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-3xl mx-auto space-y-6">
              <h2 className="text-4xl font-bold">Ready to Get Started?</h2>
              <p className="text-xl opacity-90 dark:text-muted-foreground dark:opacity-100">
                Join leading organizations in their sustainability journey.
                Start tracking your carbon footprint today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button
                  asChild
                  size="lg"
                  variant="secondary"
                  className="text-base px-8 h-12"
                >
                  <Link href="/register">Start Your Free Trial</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="text-base px-8 h-12 bg-transparent border-primary-foreground dark:border-border text-primary-foreground dark:text-foreground hover:bg-primary-foreground hover:text-primary dark:hover:bg-accent dark:hover:text-foreground"
                >
                  <Link href="/login">Sign In</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />

      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-right {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fade-in-left {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out both;
        }

        .animate-slide-up {
          animation: slide-up 0.8s ease-out both;
        }

        .animate-fade-in-right {
          animation: fade-in-right 0.8s ease-out both;
        }
      `}</style>
    </>
  );
}
