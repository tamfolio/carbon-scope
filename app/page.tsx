"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
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
  Leaf,
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
      icon: BarChart3,
      title: "Scope 1-3 Tracking",
      description:
        "Comprehensive tracking of all emission scopes from direct operations to supply chain with real-time monitoring.",
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      icon: Shield,
      title: "Compliance Ready",
      description:
        "Built-in compliance with GHG Protocol, PCAF, ISSB, ISO 14064, and SOC 2 Type II standards.",
      color: "text-green-600 dark:text-green-400",
    },
    {
      icon: FileText,
      title: "Advanced Reporting",
      description:
        "Generate detailed compliance reports and visualizations for stakeholders and regulators instantly.",
      color: "text-purple-600 dark:text-purple-400",
    },
    {
      icon: Users,
      title: "Enterprise Grade",
      description:
        "Designed for SMEs, corporates, and financial institutions with role-based access control.",
      color: "text-orange-600 dark:text-orange-400",
    },
    {
      icon: Lock,
      title: "Secure & Reliable",
      description:
        "SOC 2 Type II certified with bank-level security standards and encryption at rest.",
      color: "text-red-600 dark:text-red-400",
    },
    {
      icon: Zap,
      title: "Easy Integration",
      description:
        "Connect with your existing systems and data sources seamlessly via REST API.",
      color: "text-yellow-600 dark:text-yellow-400",
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
                <Leaf className="mr-2 h-3 w-3" />
                Trusted by 500+ organizations worldwide
              </Badge>

              {/* Headline */}
              <div className="space-y-4">
                <h1
                  className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight animate-slide-up"
                  style={{ animationDelay: "0.2s" }}
                >
                  Comprehensive{" "}
                  <span className="bg-gradient-to-r from-green-600 to-green-700 dark:from-primary dark:to-green-500 bg-clip-text text-transparent">
                    Carbon Accounting
                  </span>{" "}
                  Platform
                </h1>
                <p
                  className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-fade-in"
                  style={{ animationDelay: "0.4s" }}
                >
                  Track, measure, report, and reduce Scope 1-3 emissions with
                  enterprise-grade accuracy. Ensure compliance with PCAF, ISSB,
                  ISO 14064, GHG Protocol, and SOC 2 Type II.
                </p>
              </div>

              {/* CTAs */}
              <div
                className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in"
                style={{ animationDelay: "0.6s" }}
              >
                <Button asChild size="lg" className="text-base px-8 h-12 group">
                  <Link href="/register">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="text-base px-8 h-12 group"
                >
                  <Link href="/demo">Watch Demo</Link>
                </Button>
              </div>

              {/* Trust Indicators */}
              <div
                className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground pt-8 animate-fade-in"
                style={{ animationDelay: "0.8s" }}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>14-day free trial</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Cancel anytime</span>
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
                Everything you need for carbon accounting
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Powerful features designed for modern sustainability teams
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
                  {/* Large leaf icon */}
                  <Leaf
                    className="h-64 w-64 text-primary/40 dark:text-primary/50 transition-all duration-700 group-hover:scale-110 group-hover:rotate-12 relative z-10"
                    strokeWidth={1}
                  />
                  {/* Smaller decorative leaves */}
                  <Leaf
                    className="absolute top-8 right-8 h-20 w-20 text-primary/20 dark:text-primary/30 transition-all duration-500 group-hover:translate-x-2 group-hover:-translate-y-2"
                    strokeWidth={1.5}
                  />
                  <Leaf
                    className="absolute bottom-12 left-12 h-16 w-16 text-primary/15 dark:text-primary/25 transition-all duration-500 group-hover:-translate-x-2 group-hover:translate-y-2"
                    strokeWidth={1.5}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-3xl mx-auto space-y-6">
              <h2 className="text-4xl font-bold">Ready to Get Started?</h2>
              <p className="text-xl opacity-90">
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
                  className="text-base px-8 h-12 bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
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
