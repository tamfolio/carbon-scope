"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Activity,
  Cloud,
  Factory,
  Truck,
  Zap,
  Plus,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EmissionsStats {
  summary: {
    totalCO2e: number;
    scope1: number;
    scope2: number;
    scope3: number;
    count: number;
  };
  topCategories: Array<{ category: string; co2e: number }>;
  topSources: Array<{ source: string; co2e: number }>;
  timeSeries: Array<{
    period: string;
    scope1: number;
    scope2: number;
    scope3: number;
    total: number;
  }>;
  periodType: string;
  dateRange: {
    start: string;
    end: string;
  };
}

interface RecentEmission {
  id: string;
  activity: string;
  scope: string;
  co2e: number;
  createdAt: string | Date;
}

interface FinancedEmissionSummary {
  id: string;
  investmentName: string;
  companyName: string;
  sector: string;
  totalEmissions: number;
  investmentAmount: number;
  currency: string;
}

interface MetricCardProps {
  title: string;
  value: string;
  unit: string;
  change: number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  delay: number;
  progress?: number; // Actual progress percentage
}

function MetricCard({
  title,
  value,
  unit,
  change,
  icon: Icon,
  color,
  bgColor,
  delay,
  progress: actualProgress = 0,
}: MetricCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setProgress(actualProgress); // Use actual progress value
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible, actualProgress]);

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-300 hover:shadow-lg group cursor-pointer border-2",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        color
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon
          className={cn("h-6 w-6", color.replace("border-", "text-"))}
        />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold mb-1">
          {value}
          <span className="text-lg text-muted-foreground ml-1">{unit}</span>
        </div>

        <div className="flex items-center text-xs text-muted-foreground mt-2 mb-3">
          {change > 0 ? (
            <ArrowUpRight className="mr-1 h-4 w-4 text-red-600" />
          ) : (
            <ArrowDownRight className="mr-1 h-4 w-4 text-green-600" />
          )}
          <span
            className={cn(
              "font-medium",
              change > 0 ? "text-red-600" : "text-green-600"
            )}
          >
            {Math.abs(change)}%
          </span>
          <span className="ml-1">from last month</span>
        </div>

        {/* Progress bar */}
        <Progress
          value={progress}
          className="h-2 transition-all duration-1000"
        />
      </CardContent>
    </Card>
  );
}

interface UserData {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  // const [chartHeight, setChartHeight] = useState(300);
  const [stats, setStats] = useState<EmissionsStats | null>(null);
  const [recentEmissions, setRecentEmissions] = useState<RecentEmission[]>([]);
  const [financedEmissions, setFinancedEmissions] = useState<FinancedEmissionSummary[]>([]);
  const [financedEmissionsTotal, setFinancedEmissionsTotal] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState<"7" | "30" | "180">(
    "30"
  );
  const [periodType, setPeriodType] = useState<"day" | "week" | "month">("day");
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("cs_token");
    if (!token) {
      router.push("/login");
      return;
    }
    loadDashboardData(token);

    // Refresh data when page becomes visible (user returns from emissions page)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const currentToken = localStorage.getItem("cs_token");
        if (currentToken) {
          loadDashboardData(currentToken);
        }
      }
    };

    // Refresh data when window gains focus (handles navigation between pages)
    const handleFocus = () => {
      const currentToken = localStorage.getItem("cs_token");
      if (currentToken) {
        loadDashboardData(currentToken);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [router]);

  // Determine period type based on selected period
  useEffect(() => {
    if (selectedPeriod === "7") {
      setPeriodType("day");
    } else if (selectedPeriod === "30") {
      setPeriodType("day");
    } else {
      setPeriodType("month");
    }
  }, [selectedPeriod]);

  // Reload data when period changes
  useEffect(() => {
    const token = localStorage.getItem("cs_token");
    if (token && !loading) {
      setLoading(true);
      loadDashboardData(token);
    }
  }, [selectedPeriod, periodType]);

  const loadDashboardData = async (token: string) => {
    try {
      // Fetch user data
      const userResponse = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUserData(userData.user);

        // Redirect super admins to their dashboard
        if (userData.user.role === "SUPER_ADMIN") {
          router.push("/dashboard/super-admin");
          return;
        }
      }

      // Fetch emissions statistics with period
      const statsResponse = await fetch(
        `/api/emissions/stats?days=${selectedPeriod}&period=${periodType}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Fetch recent emissions
      const emissionsResponse = await fetch(
        "/api/emissions?limit=5&sortBy=createdAt&sortOrder=desc",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (emissionsResponse.ok) {
        const emissionsData = await emissionsResponse.json();
        setRecentEmissions(emissionsData.emissions);
      }

      // Fetch financed emissions
      const financedResponse = await fetch("/api/financed-emissions?limit=5", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (financedResponse.ok) {
        const financedData = await financedResponse.json();
        setFinancedEmissions(financedData.financedEmissions || []);
        // Calculate total financed emissions
        const total = (financedData.financedEmissions || []).reduce(
          (sum: number, item: FinancedEmissionSummary) => sum + (item.totalEmissions || 0),
          0
        );
        setFinancedEmissionsTotal(total);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <p className="text-muted-foreground animate-pulse">
              Loading your dashboard...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with animation */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in">
          <div>
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-green-700 bg-clip-text text-transparent">
              Welcome back{userData?.name ? `, ${userData.name.split(' ')[0]}` : ''}!
            </h2>
            <p className="text-muted-foreground mt-1">
              Here&apos;s your carbon emissions overview for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="hover:scale-105 transition-transform bg-gradient-to-r from-primary to-green-700 hover:from-primary/90 hover:to-green-700/90"
              onClick={() => router.push("/dashboard/emissions")}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Data
            </Button>
          </div>
        </div>

        {/* Key Metrics with staggered animation */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {(() => {
            // Add financed emissions to total (both already in kg CO₂e)
            const totalOperationsEmissions = stats?.summary.totalCO2e || 0;
            const totalFinancedEmissions = financedEmissionsTotal; // Already in kg CO₂e
            const grandTotal = totalOperationsEmissions + totalFinancedEmissions;

            // Format values in kg CO₂e
            const totalValue = grandTotal.toFixed(2);
            const scope1Value = (stats?.summary.scope1 || 0).toFixed(2);
            const scope2Value = (stats?.summary.scope2 || 0).toFixed(2);
            const scope3Value = (stats?.summary.scope3 || 0).toFixed(2);

            const total = grandTotal;
            const scope1Progress =
              total > 0 ? (stats!.summary.scope1 / total) * 100 : 0;
            const scope2Progress =
              total > 0 ? (stats!.summary.scope2 / total) * 100 : 0;
            const scope3Progress =
              total > 0 ? (stats!.summary.scope3 / total) * 100 : 0;
            const totalProgress =
              stats?.summary.count || 0 > 0
                ? Math.min((stats?.summary.count || 0) * 10, 100)
                : 0;

            return (
              <>
                <MetricCard
                  title="Total Emissions"
                  value={totalValue}
                  unit="kg CO₂e"
                  change={8.2}
                  icon={Cloud}
                  color="border-primary"
                  bgColor=""
                  delay={0}
                  progress={totalProgress}
                />
                <MetricCard
                  title="Scope 1"
                  value={scope1Value}
                  unit="kg CO₂e"
                  change={3.1}
                  icon={Factory}
                  color="border-blue-500"
                  bgColor=""
                  delay={100}
                  progress={scope1Progress}
                />
                <MetricCard
                  title="Scope 2"
                  value={scope2Value}
                  unit="kg CO₂e"
                  change={-2.4}
                  icon={Zap}
                  color="border-yellow-500"
                  bgColor=""
                  delay={200}
                  progress={scope2Progress}
                />
                <MetricCard
                  title="Scope 3"
                  value={scope3Value}
                  unit="kg CO₂e"
                  change={5.7}
                  icon={Truck}
                  color="border-purple-500"
                  bgColor=""
                  delay={300}
                  progress={scope3Progress}
                />
              </>
            );
          })()}
        </div>

        {/* Financed Emissions Section */}
        {financedEmissionsTotal > 0 && (
          <div className="animate-slide-up" style={{ animationDelay: "400ms" }}>
            <Card className="hover:shadow-xl transition-all duration-300 border-2 border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      Financed Emissions (PCAF)
                      <Badge variant="secondary">Portfolio</Badge>
                    </CardTitle>
                    <CardDescription>
                      Emissions from your investment and loan portfolios
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary">
                      {financedEmissionsTotal.toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground">kg CO₂e</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {financedEmissions.slice(0, 5).map((emission, index: number) => (
                    <div
                      key={emission.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-all duration-300 cursor-pointer group animate-fade-in-right"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="rounded-full p-2 bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium truncate">
                            {emission.investmentName}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground truncate">
                              {emission.companyName}
                            </span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <Badge variant="outline" className="text-xs">
                              {emission.sector}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-primary">
                          {emission.totalEmissions.toFixed(2)} kg CO₂e
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {emission.currency} {emission.investmentAmount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                {financedEmissions.length > 5 && (
                  <div className="mt-4 text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push("/dashboard/emissions")}
                    >
                      View All {financedEmissions.length} Records
                      <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recent Emissions and Quick Actions in one row */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Emissions with slide-up animation */}
          <div className="animate-slide-up" style={{ animationDelay: "400ms" }}>
            <Card className="hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Recent Emissions
                  <Badge variant="secondary" className="animate-pulse">
                    Live
                  </Badge>
                </CardTitle>
                <CardDescription>Latest emission entries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentEmissions && recentEmissions.length > 0 ? (
                    recentEmissions.map((emission, index: number) => {
                      const daysAgo = Math.floor(
                        (new Date().getTime() -
                          new Date(emission.createdAt).getTime()) /
                          (1000 * 60 * 60 * 24)
                      );
                      const timeAgo =
                        daysAgo === 0
                          ? "Today"
                          : daysAgo === 1
                          ? "Yesterday"
                          : `${daysAgo} days ago`;

                      return (
                        <div
                          key={emission.id}
                          className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent transition-all duration-300 cursor-pointer group/activity animate-fade-in-right"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <div
                            className={cn(
                              "rounded-full p-2 transition-all duration-300 group-hover/activity:scale-110",
                              emission.scope === "Scope 1" &&
                                "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
                              emission.scope === "Scope 2" &&
                                "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300",
                              emission.scope === "Scope 3" &&
                                "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
                            )}
                          >
                            <Plus className="h-4 w-4" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium leading-none group-hover/activity:text-primary transition-colors truncate">
                              {emission.activity}
                            </p>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {emission.scope}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {emission.co2e.toFixed(2)} kg CO₂e
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {timeAgo}
                            </p>
                          </div>
                          <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover/activity:opacity-100 transition-opacity" />
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Activity className="h-12 w-12 mx-auto mb-2 opacity-20" />
                      <p className="text-sm">No recent emissions</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions with scale animation */}
          <Card
            className="hover:shadow-xl transition-all duration-300 animate-slide-up"
            style={{ animationDelay: "600ms" }}
          >
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 grid-cols-2">
                {[
                  {
                    icon: Plus,
                    label: "Add Emission Data",
                    color:
                      "hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950 dark:hover:text-blue-300",
                    onClick: () => router.push("/dashboard/emissions"),
                  },
                  {
                    icon: Download,
                    label: "Generate Report",
                    color:
                      "hover:border-purple-500 hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-950 dark:hover:text-purple-300",
                    onClick: () => router.push("/dashboard/reports"),
                  },
                  {
                    icon: Activity,
                    label: "View Analytics",
                    color:
                      "hover:border-cyan-500 hover:bg-cyan-50 hover:text-cyan-700 dark:hover:bg-cyan-950 dark:hover:text-cyan-300",
                    onClick: () => router.push("/dashboard/analytics"),
                  },
                  {
                    icon: TrendingUp,
                    label: "Data Management",
                    color:
                      "hover:border-orange-500 hover:bg-orange-50 hover:text-orange-700 dark:hover:bg-orange-950 dark:hover:text-orange-300",
                    onClick: () => router.push("/dashboard/data-management"),
                  },
                ].map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    onClick={action.onClick}
                    className={cn(
                      "h-28 flex flex-col items-center justify-center gap-3 group relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg",
                      action.color
                    )}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    <action.icon className="h-6 w-6 transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12" />
                    <span className="text-sm font-medium">{action.label}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-up {
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
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes growUp {
          from {
            transform: scaleY(0);
          }
          to {
            transform: scaleY(1);
          }
        }

        @keyframes draw-line {
          from {
            stroke-dasharray: 1000;
            stroke-dashoffset: 1000;
          }
          to {
            stroke-dasharray: 1000;
            stroke-dashoffset: 0;
          }
        }

        @keyframes draw-area {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scale-in {
          from {
            transform: scale(0);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
          animation-fill-mode: both;
        }

        .animate-fade-in-right {
          animation: fade-in-right 0.5s ease-out;
          animation-fill-mode: both;
        }

        .animate-draw-line {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: draw-line 1.5s ease-out forwards;
        }

        .animate-draw-area {
          opacity: 0;
          animation: draw-area 1s ease-out forwards;
        }

        .animate-scale-in {
          transform-origin: center;
          animation: scale-in 0.4s ease-out forwards;
        }
      `}</style>
    </DashboardLayout>
  );
}
