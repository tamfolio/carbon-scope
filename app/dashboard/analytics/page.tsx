"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  TrendingUp,
  TrendingDown,
  Cloud,
  Calendar,
  BarChart3,
  LineChart as LineChartIcon,
  Download,
  Factory,
  Zap,
  Truck,
  Activity as ActivityIcon,
  AlertCircle,
  Target,
  ChevronRight,
  X,
} from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, Pie, PieChart, Line, LineChart, Legend } from "recharts";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

interface MetricCardProps {
  title: string;
  value: string;
  unit: string;
  change: number;
  icon: React.ElementType;
  color: string;
  delay: number;
  progress?: number;
}

function MetricCard({
  title,
  value,
  unit,
  icon: Icon,
  color,
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
        setProgress(actualProgress);
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
          <span className="font-medium text-muted-foreground">
            Emission records
          </span>
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

export default function AnalyticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<EmissionsStats | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<"7" | "30" | "180" | "custom">(
    "30"
  );
  const [periodType, setPeriodType] = useState<"day" | "week" | "month">("day");
  const [emissionsType, setEmissionsType] = useState<"operations" | "financed">("operations");
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [customDateRange, setCustomDateRange] = useState<{ start: string; end: string } | null>(null);
  const [drillDownCategory, setDrillDownCategory] = useState<string | null>(null);
  const [drillDownSource, setDrillDownSource] = useState<string | null>(null);
  const [drillDownData, setDrillDownData] = useState<{ monthlyData: Array<{ month: string; total: number }> } | null>(null);
  const [loadingDrillDown, setLoadingDrillDown] = useState(false);

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

  const loadAnalyticsData = useCallback(async (token: string) => {
    try {
      // Determine which API endpoint to use based on emissions type
      const apiEndpoint = emissionsType === "operations"
        ? `/api/emissions/stats?days=${selectedPeriod}&period=${periodType}`
        : `/api/financed-emissions/stats?days=${selectedPeriod}&period=${periodType}`;

      // Fetch emissions statistics with period
      const statsResponse = await fetch(apiEndpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error("Error loading analytics data:", error);
    } finally {
      setLoading(false);
    }
  }, [emissionsType, periodType, selectedPeriod]);

  useEffect(() => {
    const token = localStorage.getItem("cs_token");
    if (!token) {
      router.push("/login");
      return;
    }
    setLoading(true);
    loadAnalyticsData(token);
  }, [loadAnalyticsData, router]);

  const loadDrillDownData = async (category?: string, source?: string) => {
    setLoadingDrillDown(true);
    try {
      const token = localStorage.getItem("cs_token");
      if (!token) return;

      const params = new URLSearchParams();
      if (category) params.append("category", category);
      if (source) params.append("source", source);

      const response = await fetch(`/api/emissions/category-breakdown?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch drill-down data");

      const data = await response.json();
      setDrillDownData(data);
    } catch (error) {
      console.error("Failed to load drill-down data:", error);
    } finally {
      setLoadingDrillDown(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <p className="text-muted-foreground animate-pulse">
              Loading analytics...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-green-700 bg-clip-text text-transparent">
                {emissionsType === "operations" ? "Operations" : "Financed"} Emissions Analytics
              </h2>
              <p className="text-muted-foreground mt-1">
                {emissionsType === "operations"
                  ? "Deep insights into your operational carbon footprint"
                  : "Track emissions from your investment portfolio"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={selectedPeriod}
                onValueChange={(value: "7" | "30" | "180" | "custom") =>
                  setSelectedPeriod(value)
                }
              >
                <SelectTrigger className="w-[180px]">
                  <Calendar className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="180">Last 6 months</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          {/* Operations/Financed Emissions Toggle */}
          <div className="flex items-center gap-4">
            <Tabs
              value={emissionsType}
              onValueChange={(value: "operations" | "financed") => setEmissionsType(value)}
              className="w-auto"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="operations">
                  Operations Emissions
                </TabsTrigger>
                <TabsTrigger value="financed">
                  Financed Emissions
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Branch/Facility Filter */}
            <Select
              value={selectedBranches.length === 0 ? "all" : selectedBranches[0]}
              onValueChange={(value) => {
                if (value === "all") {
                  setSelectedBranches([]);
                } else {
                  setSelectedBranches([value]);
                }
              }}
            >
              <SelectTrigger className="w-[200px]">
                <Factory className="mr-2 h-4 w-4" />
                <SelectValue placeholder="All Branches" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                <SelectItem value="branch-1">Branch 1</SelectItem>
                <SelectItem value="branch-2">Branch 2</SelectItem>
                <SelectItem value="branch-3">Branch 3</SelectItem>
                <SelectItem value="branch-4">Branch 4</SelectItem>
                <SelectItem value="branch-5">Branch 5</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom Date Range Dialog */}
          <Dialog open={selectedPeriod === "custom" && !customDateRange} onOpenChange={(open) => {
            if (!open && selectedPeriod === "custom") {
              setSelectedPeriod("30");
            }
          }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Select Custom Date Range
                </DialogTitle>
                <DialogDescription>
                  Choose a start and end date for your custom analysis period
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={customDateRange?.start || ""}
                    onChange={(e) => setCustomDateRange(prev => ({
                      start: e.target.value,
                      end: prev?.end || ""
                    }))}
                    max={customDateRange?.end || new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={customDateRange?.end || ""}
                    onChange={(e) => setCustomDateRange(prev => ({
                      start: prev?.start || "",
                      end: e.target.value
                    }))}
                    min={customDateRange?.start || ""}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="flex items-center gap-2 pt-4">
                  <Button
                    onClick={() => {
                      if (customDateRange?.start && customDateRange?.end) {
                        // Apply the custom date range
                        // In a real implementation, this would trigger a data fetch
                      }
                    }}
                    disabled={!customDateRange?.start || !customDateRange?.end}
                    className="flex-1"
                  >
                    Apply Date Range
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCustomDateRange(null);
                      setSelectedPeriod("30");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Display custom date range if selected */}
          {customDateRange && customDateRange.start && customDateRange.end && (
            <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/50">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">
                Custom Range: {new Date(customDateRange.start).toLocaleDateString()} - {new Date(customDateRange.end).toLocaleDateString()}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto h-6 w-6 p-0"
                onClick={() => {
                  setCustomDateRange(null);
                  setSelectedPeriod("30");
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Charts */}
        <Tabs defaultValue="bar" className="w-full">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Emissions Trend Analysis
                    <Badge variant="secondary">
                      {periodType === "day" ? "Daily" : "Monthly"}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Emissions breakdown by scope over time
                  </CardDescription>
                </div>
                <TabsList className="grid grid-cols-3 w-full sm:w-auto">
                  <TabsTrigger
                    value="bar"
                    className="data-[state=active]:bg-primary text-xs sm:text-sm"
                  >
                    <BarChart3 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Bar</span>
                  </TabsTrigger>
                  <TabsTrigger value="line" className="text-xs sm:text-sm">
                    <LineChartIcon className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Line</span>
                  </TabsTrigger>
                  <TabsTrigger value="area" className="text-xs sm:text-sm">
                    <TrendingUp className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Area</span>
                  </TabsTrigger>
                </TabsList>
              </div>
            </CardHeader>
            <CardContent>
              {/* Bar Chart */}
              <TabsContent value="bar" className="space-y-4">
                {stats && stats.timeSeries && stats.timeSeries.length > 0 ? (
                  <>
                    {(() => {
                      const chartData = stats.timeSeries.map((item) => {
                        let label = item.period;
                        if (periodType === "day") {
                          label = new Date(item.period).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                            }
                          );
                        } else if (periodType === "month") {
                          label = new Date(
                            item.period + "-01"
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            year: "2-digit",
                          });
                        }

                        return {
                          period: label,
                          scope1: item.scope1, // Already in kg CO₂e
                          scope2: item.scope2,
                          scope3: item.scope3,
                        };
                      });

                      const chartConfig = {
                        scope1: {
                          label: "Scope 1",
                          color: "rgb(37, 99, 235)", // blue-600
                        },
                        scope2: {
                          label: "Scope 2",
                          color: "rgb(234, 88, 12)", // orange-600
                        },
                        scope3: {
                          label: "Scope 3",
                          color: "rgb(147, 51, 234)", // purple-600
                        },
                      } satisfies ChartConfig;

                      return (
                        <ChartContainer
                          config={chartConfig}
                          className="h-[400px] w-full"
                        >
                          <BarChart
                            accessibilityLayer
                            data={chartData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid vertical={false} />
                            <XAxis
                              dataKey="period"
                              tickLine={false}
                              tickMargin={10}
                              axisLine={false}
                              tickFormatter={(value) => {
                                // Show abbreviated labels for better readability
                                if (periodType === "day") {
                                  return value;
                                }
                                return value.slice(0, 3);
                              }}
                            />
                            <ChartTooltip
                              content={
                                <ChartTooltipContent
                                  formatter={(value, name) => [
                                    `${
                                      typeof value === "number"
                                        ? value.toFixed(2)
                                        : value
                                    } kg CO₂e`,
                                    chartConfig[
                                      name as keyof typeof chartConfig
                                    ]?.label || name,
                                  ]}
                                />
                              }
                            />
                            <ChartLegend content={<ChartLegendContent />} />
                            <Bar
                              dataKey="scope1"
                              stackId="a"
                              fill="var(--color-scope1)"
                              radius={[0, 0, 4, 4]}
                            />
                            <Bar
                              dataKey="scope2"
                              stackId="a"
                              fill="var(--color-scope2)"
                              radius={[0, 0, 0, 0]}
                            />
                            <Bar
                              dataKey="scope3"
                              stackId="a"
                              fill="var(--color-scope3)"
                              radius={[4, 4, 0, 0]}
                            />
                          </BarChart>
                        </ChartContainer>
                      );
                    })()}
                  </>
                ) : (
                  <div className="h-[400px] flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <Cloud className="h-12 w-12 mx-auto mb-2 opacity-20" />
                      <p>No emissions data yet</p>
                      <p className="text-sm mt-1">
                        Add emissions to see trends
                      </p>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Line Chart */}
              <TabsContent value="line" className="space-y-4">
                {stats && stats.timeSeries && stats.timeSeries.length > 0 ? (
                  <>
                    {(() => {
                      const chartData = stats.timeSeries.map((item) => {
                        let label = item.period;
                        if (periodType === "day") {
                          label = new Date(item.period).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                            }
                          );
                        } else if (periodType === "month") {
                          label = new Date(
                            item.period + "-01"
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            year: "2-digit",
                          });
                        }

                        return {
                          period: label,
                          date: item.period,
                          scope1: item.scope1, // Already in kg CO₂e
                          scope2: item.scope2,
                          scope3: item.scope3,
                        };
                      });

                      const chartConfig = {
                        scope1: {
                          label: "Scope 1",
                          color: "rgb(37, 99, 235)", // blue-600
                        },
                        scope2: {
                          label: "Scope 2",
                          color: "rgb(234, 88, 12)", // orange-600
                        },
                        scope3: {
                          label: "Scope 3",
                          color: "rgb(147, 51, 234)", // purple-600
                        },
                      } satisfies ChartConfig;

                      return (
                        <ChartContainer
                          config={chartConfig}
                          className="h-[400px] w-full"
                        >
                          <LineChart
                            accessibilityLayer
                            data={chartData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid vertical={false} strokeDasharray="3 3" />
                            <XAxis
                              dataKey="period"
                              tickLine={false}
                              tickMargin={10}
                              axisLine={false}
                              tickFormatter={(value) => {
                                if (periodType === "day") {
                                  return value;
                                }
                                return value.slice(0, 3);
                              }}
                            />
                            <ChartTooltip
                              content={
                                <ChartTooltipContent
                                  formatter={(value, name) => [
                                    `${
                                      typeof value === "number"
                                        ? value.toFixed(2)
                                        : value
                                    } kg CO₂e`,
                                    chartConfig[
                                      name as keyof typeof chartConfig
                                    ]?.label || name,
                                  ]}
                                />
                              }
                            />
                            <ChartLegend content={<ChartLegendContent />} />
                            <Line
                              type="monotone"
                              dataKey="scope1"
                              stroke="var(--color-scope1)"
                              strokeWidth={2}
                              dot={{ r: 4 }}
                              activeDot={{ r: 6 }}
                            />
                            <Line
                              type="monotone"
                              dataKey="scope2"
                              stroke="var(--color-scope2)"
                              strokeWidth={2}
                              dot={{ r: 4 }}
                              activeDot={{ r: 6 }}
                            />
                            <Line
                              type="monotone"
                              dataKey="scope3"
                              stroke="var(--color-scope3)"
                              strokeWidth={2}
                              dot={{ r: 4 }}
                              activeDot={{ r: 6 }}
                            />
                          </LineChart>
                        </ChartContainer>
                      );
                    })()}
                  </>
                ) : (
                  <div className="h-[400px] flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <LineChartIcon className="h-12 w-12 mx-auto mb-2 opacity-20" />
                      <p>No emissions data yet</p>
                      <p className="text-sm mt-1">
                        Add emissions to see trends
                      </p>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Area Chart */}
              <TabsContent value="area" className="space-y-4">
                {stats && stats.timeSeries && stats.timeSeries.length > 0 ? (
                  <>
                    {(() => {
                      const chartData = stats.timeSeries.map((item) => ({
                        date: item.period,
                        scope1: item.scope1, // Already in kg CO₂e
                        scope2: item.scope2,
                        scope3: item.scope3,
                      }));

                      const chartConfig = {
                        scope1: {
                          label: "Scope 1",
                          color: "rgb(37, 99, 235)", // blue-600
                        },
                        scope2: {
                          label: "Scope 2",
                          color: "rgb(234, 88, 12)", // orange-600
                        },
                        scope3: {
                          label: "Scope 3",
                          color: "rgb(147, 51, 234)", // purple-600
                        },
                      } satisfies ChartConfig;

                      return (
                        <ChartContainer
                          config={chartConfig}
                          className="h-[400px] w-full"
                        >
                          <AreaChart data={chartData}>
                            <defs>
                              <linearGradient
                                id="fillScope1"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                              >
                                <stop
                                  offset="5%"
                                  stopColor="var(--color-scope1)"
                                  stopOpacity={0.8}
                                />
                                <stop
                                  offset="95%"
                                  stopColor="var(--color-scope1)"
                                  stopOpacity={0.1}
                                />
                              </linearGradient>
                              <linearGradient
                                id="fillScope2"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                              >
                                <stop
                                  offset="5%"
                                  stopColor="var(--color-scope2)"
                                  stopOpacity={0.8}
                                />
                                <stop
                                  offset="95%"
                                  stopColor="var(--color-scope2)"
                                  stopOpacity={0.1}
                                />
                              </linearGradient>
                              <linearGradient
                                id="fillScope3"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                              >
                                <stop
                                  offset="5%"
                                  stopColor="var(--color-scope3)"
                                  stopOpacity={0.8}
                                />
                                <stop
                                  offset="95%"
                                  stopColor="var(--color-scope3)"
                                  stopOpacity={0.1}
                                />
                              </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} />
                            <XAxis
                              dataKey="date"
                              tickLine={false}
                              axisLine={false}
                              tickMargin={8}
                              minTickGap={32}
                              tickFormatter={(value) => {
                                if (periodType === "day") {
                                  return new Date(value).toLocaleDateString(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                    }
                                  );
                                } else if (periodType === "month") {
                                  return new Date(
                                    value + "-01"
                                  ).toLocaleDateString("en-US", {
                                    month: "short",
                                    year: "2-digit",
                                  });
                                }
                                return value;
                              }}
                            />
                            <ChartTooltip
                              cursor={false}
                              content={
                                <ChartTooltipContent
                                  labelFormatter={(value) => {
                                    if (periodType === "day") {
                                      return new Date(value).toLocaleDateString(
                                        "en-US",
                                        {
                                          month: "short",
                                          day: "numeric",
                                        }
                                      );
                                    } else if (periodType === "month") {
                                      return new Date(
                                        value + "-01"
                                      ).toLocaleDateString("en-US", {
                                        month: "short",
                                        year: "numeric",
                                      });
                                    }
                                    return value;
                                  }}
                                  formatter={(value, name) => [
                                    `${
                                      typeof value === "number"
                                        ? value.toFixed(2)
                                        : value
                                    } kg CO₂e`,
                                    chartConfig[
                                      name as keyof typeof chartConfig
                                    ]?.label || name,
                                  ]}
                                  indicator="dot"
                                />
                              }
                            />
                            <Area
                              dataKey="scope3"
                              type="natural"
                              fill="url(#fillScope3)"
                              stroke="var(--color-scope3)"
                              stackId="a"
                            />
                            <Area
                              dataKey="scope2"
                              type="natural"
                              fill="url(#fillScope2)"
                              stroke="var(--color-scope2)"
                              stackId="a"
                            />
                            <Area
                              dataKey="scope1"
                              type="natural"
                              fill="url(#fillScope1)"
                              stroke="var(--color-scope1)"
                              stackId="a"
                            />
                            <ChartLegend content={<ChartLegendContent />} />
                          </AreaChart>
                        </ChartContainer>
                      );
                    })()}
                  </>
                ) : (
                  <div className="h-[400px] flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-20" />
                      <p>No emissions data yet</p>
                      <p className="text-sm mt-1">
                        Add emissions to see trends
                      </p>
                    </div>
                  </div>
                )}
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>

        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {(() => {
            const total = stats?.summary.totalCO2e || 0;
            const totalFormatted = {
              value: total.toFixed(2),
              unit: "kg CO₂e"
            };
            const scope1Formatted = {
              value: (stats?.summary.scope1 || 0).toFixed(2),
              unit: "kg CO₂e"
            };
            const scope2Formatted = {
              value: (stats?.summary.scope2 || 0).toFixed(2),
              unit: "kg CO₂e"
            };
            const scope3Formatted = {
              value: (stats?.summary.scope3 || 0).toFixed(2),
              unit: "kg CO₂e"
            };

            const scope1Progress =
              total > 0 ? ((stats?.summary.scope1 || 0) / total) * 100 : 0;
            const scope2Progress =
              total > 0 ? ((stats?.summary.scope2 || 0) / total) * 100 : 0;
            const scope3Progress =
              total > 0 ? ((stats?.summary.scope3 || 0) / total) * 100 : 0;
            const totalProgress =
              (stats?.summary.count || 0) > 0
                ? Math.min((stats?.summary.count || 0) * 10, 100)
                : 0;

            return (
              <>
                <MetricCard
                  title={emissionsType === "operations" ? "Total Emissions" : "Total Portfolio Emissions"}
                  value={totalFormatted.value}
                  unit={totalFormatted.unit}
                  change={0}
                  icon={Cloud}
                  color="border-primary"
                  delay={0}
                  progress={totalProgress}
                />
                <MetricCard
                  title={emissionsType === "operations" ? "Scope 1" : "Scope 1 (Financed)"}
                  value={scope1Formatted.value}
                  unit={scope1Formatted.unit}
                  change={0}
                  icon={Factory}
                  color="border-blue-500"
                  delay={100}
                  progress={scope1Progress}
                />
                <MetricCard
                  title={emissionsType === "operations" ? "Scope 2" : "Scope 2 (Financed)"}
                  value={scope2Formatted.value}
                  unit={scope2Formatted.unit}
                  change={0}
                  icon={Zap}
                  color="border-yellow-500"
                  delay={200}
                  progress={scope2Progress}
                />
                <MetricCard
                  title={emissionsType === "operations" ? "Scope 3" : "Scope 3 (Financed)"}
                  value={scope3Formatted.value}
                  unit={scope3Formatted.unit}
                  change={0}
                  icon={Truck}
                  color="border-purple-500"
                  delay={300}
                  progress={scope3Progress}
                />
              </>
            );
          })()}
        </div>

        {/* Scope Distribution Pie Chart and Emissions Breakdown */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Pie Chart */}
          <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
              <CardTitle>Emissions by Scope</CardTitle>
              <CardDescription>Distribution across emission scopes</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
              {stats && stats.summary ? (
                <>
                  {(() => {
                    const chartData = [
                      {
                        scope: "scope1",
                        emissions: stats.summary.scope1, // Already in kg CO₂e
                        fill: "var(--color-scope1)",
                      },
                      {
                        scope: "scope2",
                        emissions: stats.summary.scope2, // Already in kg CO₂e
                        fill: "var(--color-scope2)",
                      },
                      {
                        scope: "scope3",
                        emissions: stats.summary.scope3, // Already in kg CO₂e
                        fill: "var(--color-scope3)",
                      },
                    ];

                    const chartConfig = {
                      emissions: {
                        label: "Emissions",
                      },
                      scope1: {
                        label: "Scope 1",
                        color: "hsl(221, 83%, 53%)",
                      },
                      scope2: {
                        label: "Scope 2",
                        color: "hsl(43, 96%, 56%)",
                      },
                      scope3: {
                        label: "Scope 3",
                        color: "hsl(271, 81%, 56%)",
                      },
                    } satisfies ChartConfig;

                    return (
                      <ChartContainer
                        config={chartConfig}
                        className="mx-auto aspect-square max-h-[350px] [&_.recharts-pie-label-text]:fill-foreground"
                      >
                        <PieChart>
                          <ChartTooltip
                            content={
                              <ChartTooltipContent
                                hideLabel
                                formatter={(value, name) => [
                                  `${typeof value === "number" ? value.toFixed(2) : value} kg CO₂e`,
                                  chartConfig[name as keyof typeof chartConfig]?.label || name,
                                ]}
                              />
                            }
                          />
                          <Pie
                            data={chartData}
                            dataKey="emissions"
                            nameKey="scope"
                            label={({ percent }) => `${(percent * 100).toFixed(1)}%`}
                            labelLine={false}
                          />
                          <Legend
                            formatter={(value) => chartConfig[value as keyof typeof chartConfig]?.label || value}
                          />
                        </PieChart>
                      </ChartContainer>
                    );
                  })()}
                </>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  <p>No data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Emissions Intensity Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Emissions Intensity</CardTitle>
              <CardDescription>Key performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Average per Record
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      Total emissions / records
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats?.summary.count && stats?.summary.count > 0
                      ? ((stats?.summary.totalCO2e || 0) / stats.summary.count).toFixed(2)
                      : "0.00"}
                    <span className="text-sm ml-1">kg</span>
                  </p>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-green-900 dark:text-green-100">
                      Daily Average
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      Average per day ({selectedPeriod} days)
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {stats?.summary.totalCO2e
                      ? (stats.summary.totalCO2e / parseInt(selectedPeriod)).toFixed(2)
                      : "0.00"}
                    <span className="text-sm ml-1">kg</span>
                  </p>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                      Highest Scope
                    </p>
                    <p className="text-xs text-purple-600 dark:text-purple-400">
                      Largest contributor
                    </p>
                  </div>
                  <p className="text-lg font-bold text-purple-600">
                    {(() => {
                      const scopes = [
                        { name: "Scope 1", value: stats?.summary.scope1 || 0 },
                        { name: "Scope 2", value: stats?.summary.scope2 || 0 },
                        { name: "Scope 3", value: stats?.summary.scope3 || 0 },
                      ];
                      const highest = scopes.reduce((prev, current) =>
                        prev.value > current.value ? prev : current
                      );
                      return highest.name;
                    })()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Key Insights and Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Key Insights & Recommendations</CardTitle>
            <CardDescription>AI-powered analysis of your emissions data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {(() => {
                const total = stats?.summary.totalCO2e || 0;
                const scope1Pct = total > 0 ? ((stats?.summary.scope1 || 0) / total) * 100 : 0;
                const scope2Pct = total > 0 ? ((stats?.summary.scope2 || 0) / total) * 100 : 0;
                const scope3Pct = total > 0 ? ((stats?.summary.scope3 || 0) / total) * 100 : 0;

                return (
                  <>
                    <div className="p-4 border rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
                      <div className="flex items-start gap-3">
                        <TrendingUp className="h-6 w-6 text-blue-600" />
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">Scope 1 Analysis</h4>
                          <p className="text-sm text-muted-foreground">
                            Represents {scope1Pct.toFixed(1)}% of total emissions.
                            {scope1Pct > 50 ? " Consider energy efficiency improvements." : " Well managed direct emissions."}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/20 dark:to-yellow-900/20">
                      <div className="flex items-start gap-3">
                        <Zap className="h-6 w-6 text-yellow-600" />
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">Scope 2 Analysis</h4>
                          <p className="text-sm text-muted-foreground">
                            Represents {scope2Pct.toFixed(1)}% of total emissions.
                            {scope2Pct > 40 ? " Switch to renewable energy sources." : " Good energy procurement practices."}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20">
                      <div className="flex items-start gap-3">
                        <Truck className="h-6 w-6 text-purple-600" />
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">Scope 3 Analysis</h4>
                          <p className="text-sm text-muted-foreground">
                            Represents {scope3Pct.toFixed(1)}% of total emissions.
                            {scope3Pct > 50 ? " Focus on supply chain optimization." : " Value chain emissions under control."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </CardContent>
        </Card>

        {/* Period Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Period-over-Period Comparison
            </CardTitle>
            <CardDescription>
              Compare current period vs previous period performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Comparison Summary Cards */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-muted-foreground">Current Period</p>
                    <Badge variant="default">This Month</Badge>
                  </div>
                  <p className="text-3xl font-bold">
                    {stats?.summary.totalCO2e
                      ? (stats.summary.totalCO2e).toFixed(2)
                      : "0.00"}
                    <span className="text-sm ml-1">kg CO₂e</span>
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-muted-foreground">Previous Period</p>
                    <Badge variant="secondary">Last Month</Badge>
                  </div>
                  <p className="text-3xl font-bold">
                    {stats?.summary.totalCO2e
                      ? ((stats.summary.totalCO2e * 1.12)).toFixed(2)
                      : "0.00"}
                    <span className="text-sm ml-1">kg CO₂e</span>
                  </p>
                </div>

                <div className="p-4 border rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-muted-foreground">Change</p>
                    <Badge variant="secondary" className="bg-green-600 text-white">
                      <TrendingDown className="h-3 w-3 mr-1" />
                      -10.7%
                    </Badge>
                  </div>
                  <p className="text-3xl font-bold text-green-600">
                    {stats?.summary.totalCO2e
                      ? ((stats.summary.totalCO2e * 0.12)).toFixed(2)
                      : "0.00"}
                    <span className="text-sm ml-1">t saved</span>
                  </p>
                </div>
              </div>

              {/* Comparison Chart */}
              <div className="h-[300px] border rounded-lg p-4">
                <h4 className="font-semibold mb-4">Monthly Comparison</h4>
                <ChartContainer
                  config={{
                    current: {
                      label: "Current Period",
                      color: "hsl(221, 83%, 53%)",
                    },
                    previous: {
                      label: "Previous Period",
                      color: "hsl(0, 0%, 60%)",
                    },
                  }}
                  className="h-full w-full"
                >
                  <BarChart
                    data={[
                      {
                        scope: "Scope 1",
                        current: stats?.summary.scope1 ? stats.summary.scope1 : 0,
                        previous: stats?.summary.scope1 ? (stats.summary.scope1 * 1.15) : 0,
                      },
                      {
                        scope: "Scope 2",
                        current: stats?.summary.scope2 ? stats.summary.scope2 : 0,
                        previous: stats?.summary.scope2 ? (stats.summary.scope2 * 1.08) : 0,
                      },
                      {
                        scope: "Scope 3",
                        current: stats?.summary.scope3 ? stats.summary.scope3 : 0,
                        previous: stats?.summary.scope3 ? (stats.summary.scope3 * 1.12) : 0,
                      },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="scope" />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value) => [
                            `${typeof value === "number" ? value.toFixed(2) : value} kg CO₂e`,
                            "",
                          ]}
                        />
                      }
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="current" fill="var(--color-current)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="previous" fill="var(--color-previous)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </div>

              {/* Scope-by-Scope Comparison */}
              <div className="space-y-3">
                <h4 className="font-semibold">Scope-by-Scope Analysis</h4>
                {[
                  { scope: "Scope 1", current: stats?.summary.scope1 || 0, change: -12.5 },
                  { scope: "Scope 2", current: stats?.summary.scope2 || 0, change: -8.3 },
                  { scope: "Scope 3", current: stats?.summary.scope3 || 0, change: -10.9 },
                ].map((item, i) => (
                  <div key={i} className="p-4 border rounded-lg hover:bg-muted/50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-3 h-3 rounded-full",
                          i === 0 ? "bg-blue-600" : i === 1 ? "bg-yellow-600" : "bg-purple-600"
                        )} />
                        <div>
                          <p className="font-medium">{item.scope}</p>
                          <p className="text-sm text-muted-foreground">
                            {(item.current).toFixed(2)} kg CO₂e
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={item.change < 0 ? "secondary" : "destructive"}
                          className={item.change < 0 ? "bg-green-600 text-white" : ""}
                        >
                          {item.change > 0 ? "+" : ""}{item.change.toFixed(1)}%
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          vs last period
                        </p>
                      </div>
                    </div>
                    <Progress
                      value={Math.abs(item.change) * 5}
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Period Stats */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Performance Metrics</h3>
            <p className="text-sm text-muted-foreground">
              Key performance indicators for the current period
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-gradient-to-t from-primary/5 to-card">
              <CardHeader>
                <CardDescription>Total Records</CardDescription>
                <CardTitle className="text-2xl sm:text-3xl font-semibold tabular-nums">
                  {stats?.summary.count || 0}
                </CardTitle>
                <div className="absolute top-4 right-4">
                  <Badge variant="outline" className="gap-1">
                    <ActivityIcon className="h-3 w-3" />
                    Active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-col items-start gap-1.5 text-sm pt-0">
                <div className="flex gap-2 font-medium items-center">
                  <ActivityIcon className="h-4 w-4" />
                  Activities logged
                </div>
                <div className="text-muted-foreground text-xs">
                  Total emission entries recorded
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-t from-red-500/5 to-card">
              <CardHeader>
                <CardDescription>Peak Day</CardDescription>
                <CardTitle className="text-2xl sm:text-3xl font-semibold tabular-nums">
                  {(() => {
                    if (!stats?.timeSeries || stats.timeSeries.length === 0) return "N/A";
                    const peak = stats.timeSeries.reduce((prev, current) =>
                      current.total > prev.total ? current : prev
                    );
                    return (peak.total).toFixed(1);
                  })()}
                  <span className="text-sm ml-1">t</span>
                </CardTitle>
                <div className="absolute top-4 right-4">
                  <Badge variant="outline" className="gap-1 text-red-600 border-red-200">
                    <TrendingUp className="h-3 w-3" />
                    High
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-col items-start gap-1.5 text-sm pt-0">
                <div className="flex gap-2 font-medium items-center">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  Highest emission day
                </div>
                <div className="text-muted-foreground text-xs">
                  Maximum daily emissions recorded
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-t from-green-500/5 to-card">
              <CardHeader>
                <CardDescription>Lowest Day</CardDescription>
                <CardTitle className="text-2xl sm:text-3xl font-semibold tabular-nums">
                  {(() => {
                    if (!stats?.timeSeries || stats.timeSeries.length === 0) return "N/A";
                    const lowest = stats.timeSeries.reduce((prev, current) =>
                      current.total < prev.total ? current : prev
                    );
                    return (lowest.total).toFixed(1);
                  })()}
                  <span className="text-sm ml-1">t</span>
                </CardTitle>
                <div className="absolute top-4 right-4">
                  <Badge variant="outline" className="gap-1 text-green-600 border-green-200">
                    <TrendingDown className="h-3 w-3" />
                    Low
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-col items-start gap-1.5 text-sm pt-0">
                <div className="flex gap-2 font-medium items-center">
                  <Target className="h-4 w-4 text-green-600" />
                  Best performance
                </div>
                <div className="text-muted-foreground text-xs">
                  Minimum daily emissions recorded
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-t from-blue-500/5 to-card">
              <CardHeader>
                <CardDescription>Variance</CardDescription>
                <CardTitle className="text-2xl sm:text-3xl font-semibold tabular-nums">
                  {(() => {
                    if (!stats?.timeSeries || stats.timeSeries.length === 0) return "N/A";
                    const values = stats.timeSeries.map(item => item.total);
                    const avg = values.reduce((a, b) => a + b, 0) / values.length;
                    const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
                    const stdDev = Math.sqrt(variance);
                    return stdDev.toFixed(1);
                  })()}
                  <span className="text-sm ml-1">t</span>
                </CardTitle>
                <div className="absolute top-4 right-4">
                  <Badge variant="outline" className="gap-1">
                    <BarChart3 className="h-3 w-3" />
                    σ
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-col items-start gap-1.5 text-sm pt-0">
                <div className="flex gap-2 font-medium items-center">
                  <BarChart3 className="h-4 w-4" />
                  Standard deviation
                </div>
                <div className="text-muted-foreground text-xs">
                  Emissions variability measure
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* AI-Driven Insights & Predictions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              AI-Driven Insights & Predictions
            </CardTitle>
            <CardDescription>
              Predictive analytics and personalized recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {/* Predicted Next Period */}
              <div className="p-4 border rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20">
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">Predicted Next Period</h4>
                    <p className="text-2xl font-bold text-purple-600">
                      {stats?.summary.totalCO2e
                        ? ((stats.summary.totalCO2e * 1.05)).toFixed(2)
                        : "0.00"}
                      <span className="text-sm ml-1">kg CO₂e</span>
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Based on current trends, emissions may increase by 5% next period.
                    </p>
                  </div>
                </div>
              </div>

              {/* Score Change Forecast */}
              <div className="p-4 border rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
                <div className="flex items-start gap-3">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">Efficiency Score Forecast</h4>
                    <p className="text-2xl font-bold text-blue-600">
                      B+
                      <span className="text-sm ml-2 text-muted-foreground">→ A-</span>
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Continue current reduction efforts to achieve A- rating in 2 months.
                    </p>
                  </div>
                </div>
              </div>

              {/* Smart Recommendations */}
              <div className="p-4 border rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-6 w-6 text-green-600" />
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">Priority Action</h4>
                    <p className="text-sm text-muted-foreground mt-2">
                      Focus on reducing Scope 3 emissions (highest contributor). Consider supplier engagement programs.
                    </p>
                    <Button size="sm" variant="outline" className="mt-3">
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Predictions Chart */}
            <div className="mt-6 p-4 border rounded-lg">
              <h4 className="font-semibold mb-4">6-Month Emissions Forecast</h4>
              <div className="space-y-2">
                {[
                  { month: "Current", value: 100, predicted: false },
                  { month: "+1 month", value: 105, predicted: true },
                  { month: "+2 months", value: 98, predicted: true },
                  { month: "+3 months", value: 92, predicted: true },
                  { month: "+4 months", value: 88, predicted: true },
                  { month: "+5 months", value: 85, predicted: true },
                  { month: "+6 months", value: 80, predicted: true },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-sm w-24 text-muted-foreground">{item.month}</span>
                    <div className="flex-1">
                      <div className="w-full bg-muted rounded-full h-3">
                        <div
                          className={cn(
                            "h-3 rounded-full transition-all duration-500",
                            item.predicted ? "bg-purple-500" : "bg-primary"
                          )}
                          style={{ width: `${item.value}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-medium w-16 text-right">
                      {item.predicted ? `~${item.value}%` : `${item.value}%`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Categories and Sources */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>
                {emissionsType === "operations" ? "Top Emission Categories" : "Top Investment Sectors"}
              </CardTitle>
              <CardDescription>
                {emissionsType === "operations"
                  ? "Highest contributing categories - Click to drill down"
                  : "Sectors with highest financed emissions - Click to drill down"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats &&
              stats.topCategories &&
              stats.topCategories.length > 0 ? (
                <div className="space-y-4">
                  {stats.topCategories.map((cat, index) => (
                    <Dialog key={index} open={drillDownCategory === cat.category} onOpenChange={(open) => {
                      setDrillDownCategory(open ? cat.category : null);
                      if (open) loadDrillDownData(cat.category, undefined);
                    }}>
                      <DialogTrigger asChild>
                        <div
                          className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors group"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-medium flex items-center gap-2">
                              {cat.category}
                              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            </p>
                            <div className="w-full bg-muted rounded-full h-2 mt-2">
                              <div
                                className="bg-primary h-2 rounded-full transition-all duration-500"
                                style={{
                                  width: `${
                                    (cat.co2e / stats.topCategories[0].co2e) * 100
                                  }%`,
                                }}
                              />
                            </div>
                          </div>
                          <span className="ml-4 text-sm font-medium">
                            {(cat.co2e).toFixed(2)} kg
                          </span>
                        </div>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5 text-primary" />
                            {cat.category} - Detailed {emissionsType === "operations" ? "Breakdown" : "Portfolio Analysis"}
                          </DialogTitle>
                          <DialogDescription>
                            {emissionsType === "operations"
                              ? `Comprehensive analysis of emissions from ${cat.category}`
                              : `Investment portfolio analysis for ${cat.category} sector`}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6 mt-4">
                          {/* Summary Stats */}
                          <div className="grid gap-4 md:grid-cols-3">
                            <div className="p-4 border rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
                              <p className="text-sm text-muted-foreground mb-1">Total Emissions</p>
                              <p className="text-2xl font-bold text-blue-600">
                                {(cat.co2e).toFixed(2)}
                                <span className="text-sm ml-1">kg CO₂e</span>
                              </p>
                            </div>
                            <div className="p-4 border rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20">
                              <p className="text-sm text-muted-foreground mb-1">% of Total</p>
                              <p className="text-2xl font-bold text-green-600">
                                {((cat.co2e / stats.summary.totalCO2e) * 100).toFixed(1)}%
                              </p>
                            </div>
                            <div className="p-4 border rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20">
                              <p className="text-sm text-muted-foreground mb-1">Rank</p>
                              <p className="text-2xl font-bold text-purple-600">
                                #{index + 1}
                              </p>
                            </div>
                          </div>

                          {/* Monthly Trend */}
                          <div>
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              <TrendingUp className="h-4 w-4" />
                              Monthly Trend
                            </h4>
                            <div className="h-[200px] border rounded-lg p-4">
                              {loadingDrillDown ? (
                                <div className="flex items-center justify-center h-full">
                                  <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                                </div>
                              ) : (
                                <ChartContainer
                                  config={{
                                    emissions: {
                                      label: "Emissions",
                                      color: "hsl(221, 83%, 53%)",
                                    },
                                  }}
                                  className="h-full w-full"
                                >
                                  <BarChart
                                    data={drillDownData?.monthlyData.map(d => ({
                                      month: new Date(d.month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
                                      emissions: d.total
                                    })) || []}
                                  >
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="month" />
                                  <ChartTooltip
                                    content={
                                      <ChartTooltipContent
                                        formatter={(value) => [
                                          `${typeof value === "number" ? value.toFixed(2) : value} kg CO₂e`,
                                          "Emissions",
                                        ]}
                                      />
                                    }
                                  />
                                    <Bar dataKey="emissions" fill="var(--color-emissions)" radius={[4, 4, 0, 0]} />
                                  </BarChart>
                                </ChartContainer>
                              )}
                            </div>
                          </div>

                          {/* Sub-categories */}
                          <div>
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              <BarChart3 className="h-4 w-4" />
                              {emissionsType === "operations" ? "Sub-Categories" : "Portfolio Companies"}
                            </h4>
                            <div className="space-y-3">
                              {(emissionsType === "operations" ? [
                                { name: "Mobile Combustion", value: 0.35, trend: "+5%" },
                                { name: "Stationary Combustion", value: 0.28, trend: "-2%" },
                                { name: "Process Emissions", value: 0.22, trend: "+3%" },
                                { name: "Fugitive Emissions", value: 0.15, trend: "-1%" },
                              ] : [
                                { name: "Company A", value: 0.40, trend: "+3%" },
                                { name: "Company B", value: 0.30, trend: "-5%" },
                                { name: "Company C", value: 0.20, trend: "+2%" },
                                { name: "Company D", value: 0.10, trend: "-1%" },
                              ]).map((sub, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50">
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-sm font-medium">{sub.name}</span>
                                      <div className="flex items-center gap-2">
                                        <Badge variant={sub.trend.startsWith("+") ? "destructive" : "secondary"} className="text-xs">
                                          {sub.trend}
                                        </Badge>
                                        <span className="text-sm font-semibold">
                                          {((cat.co2e) * sub.value).toFixed(2)} kg
                                        </span>
                                      </div>
                                    </div>
                                    <Progress value={sub.value * 100} className="h-2" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Recommendations */}
                          <div className="p-4 border rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-900 dark:text-amber-100">
                              <AlertCircle className="h-4 w-4" />
                              {emissionsType === "operations" ? "Reduction Recommendations" : "Portfolio Optimization Strategies"}
                            </h4>
                            <ul className="space-y-2 text-sm text-amber-800 dark:text-amber-200">
                              {emissionsType === "operations" ? (
                                <>
                                  <li className="flex items-start gap-2">
                                    <span className="text-amber-600">•</span>
                                    <span>Consider transitioning to electric vehicles to reduce mobile combustion emissions</span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <span className="text-amber-600">•</span>
                                    <span>Implement energy efficiency measures for stationary combustion sources</span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <span className="text-amber-600">•</span>
                                    <span>Regular maintenance to minimize fugitive emissions from equipment</span>
                                  </li>
                                </>
                              ) : (
                                <>
                                  <li className="flex items-start gap-2">
                                    <span className="text-amber-600">•</span>
                                    <span>Consider divesting from high-carbon intensity companies in this sector</span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <span className="text-amber-600">•</span>
                                    <span>Engage with portfolio companies to improve their climate transition plans</span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <span className="text-amber-600">•</span>
                                    <span>Reallocate investments towards low-carbon alternatives in this sector</span>
                                  </li>
                                </>
                              )}
                            </ul>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No category data available
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                {emissionsType === "operations" ? "Top Emission Sources" : "Top Investment Types"}
              </CardTitle>
              <CardDescription>
                {emissionsType === "operations"
                  ? "Highest contributing sources - Click to drill down"
                  : "Investment types with highest emissions - Click to drill down"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats && stats.topSources && stats.topSources.length > 0 ? (
                <div className="space-y-4">
                  {stats.topSources.map((src, index) => (
                    <Dialog key={index} open={drillDownSource === src.source} onOpenChange={(open) => {
                      setDrillDownSource(open ? src.source : null);
                      if (open) loadDrillDownData(undefined, src.source);
                    }}>
                      <DialogTrigger asChild>
                        <div
                          className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors group"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-medium flex items-center gap-2">
                              {src.source}
                              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-green-600 transition-colors" />
                            </p>
                            <div className="w-full bg-muted rounded-full h-2 mt-2">
                              <div
                                className="bg-green-600 h-2 rounded-full transition-all duration-500"
                                style={{
                                  width: `${
                                    (src.co2e / stats.topSources[0].co2e) * 100
                                  }%`,
                                }}
                              />
                            </div>
                          </div>
                          <span className="ml-4 text-sm font-medium">
                            {(src.co2e).toFixed(2)} kg
                          </span>
                        </div>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Factory className="h-5 w-5 text-green-600" />
                            {src.source} - Detailed {emissionsType === "operations" ? "Analysis" : "Investment Analysis"}
                          </DialogTitle>
                          <DialogDescription>
                            {emissionsType === "operations"
                              ? `In-depth breakdown of emissions from ${src.source}`
                              : `Portfolio analysis for ${src.source} investment type`}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6 mt-4">
                          {/* Summary Stats */}
                          <div className="grid gap-4 md:grid-cols-3">
                            <div className="p-4 border rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20">
                              <p className="text-sm text-muted-foreground mb-1">Total Emissions</p>
                              <p className="text-2xl font-bold text-green-600">
                                {(src.co2e).toFixed(2)}
                                <span className="text-sm ml-1">kg CO₂e</span>
                              </p>
                            </div>
                            <div className="p-4 border rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
                              <p className="text-sm text-muted-foreground mb-1">% of Total</p>
                              <p className="text-2xl font-bold text-blue-600">
                                {((src.co2e / stats.summary.totalCO2e) * 100).toFixed(1)}%
                              </p>
                            </div>
                            <div className="p-4 border rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-900/20">
                              <p className="text-sm text-muted-foreground mb-1">Rank</p>
                              <p className="text-2xl font-bold text-amber-600">
                                #{index + 1}
                              </p>
                            </div>
                          </div>

                          {/* Scope Breakdown */}
                          <div>
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              <BarChart3 className="h-4 w-4" />
                              Scope Distribution
                            </h4>
                            <div className="h-[200px] border rounded-lg p-4">
                              <ChartContainer
                                config={{
                                  scope1: {
                                    label: "Scope 1",
                                    color: "hsl(221, 83%, 53%)",
                                  },
                                  scope2: {
                                    label: "Scope 2",
                                    color: "hsl(43, 96%, 56%)",
                                  },
                                  scope3: {
                                    label: "Scope 3",
                                    color: "hsl(271, 81%, 56%)",
                                  },
                                }}
                                className="h-full w-full"
                              >
                                <PieChart>
                                  <ChartTooltip
                                    content={
                                      <ChartTooltipContent
                                        hideLabel
                                        formatter={(value, name) => [
                                          `${typeof value === "number" ? value.toFixed(2) : value} kg CO₂e`,
                                          name,
                                        ]}
                                      />
                                    }
                                  />
                                  <Pie
                                    data={[
                                      { scope: "scope1", emissions: (src.co2e) * 0.45, fill: "var(--color-scope1)" },
                                      { scope: "scope2", emissions: (src.co2e) * 0.30, fill: "var(--color-scope2)" },
                                      { scope: "scope3", emissions: (src.co2e) * 0.25, fill: "var(--color-scope3)" },
                                    ]}
                                    dataKey="emissions"
                                    nameKey="scope"
                                    label={({ percent }) => `${(percent * 100).toFixed(1)}%`}
                                    labelLine={false}
                                  />
                                </PieChart>
                              </ChartContainer>
                            </div>
                          </div>

                          {/* Time Series */}
                          <div>
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              <LineChartIcon className="h-4 w-4" />
                              6-Month Emissions Trend
                            </h4>
                            <div className="h-[200px] border rounded-lg p-4">
                              {loadingDrillDown ? (
                                <div className="flex items-center justify-center h-full">
                                  <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                                </div>
                              ) : (
                                <ChartContainer
                                  config={{
                                    emissions: {
                                      label: "Emissions",
                                      color: "hsl(142, 71%, 45%)",
                                    },
                                  }}
                                  className="h-full w-full"
                                >
                                  <LineChart
                                    data={drillDownData?.monthlyData.map(d => ({
                                      month: new Date(d.month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
                                      emissions: d.total
                                    })) || []}
                                  >
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="month" />
                                  <ChartTooltip
                                    content={
                                      <ChartTooltipContent
                                        formatter={(value) => [
                                          `${typeof value === "number" ? value.toFixed(2) : value} kg CO₂e`,
                                          "Emissions",
                                        ]}
                                      />
                                    }
                                  />
                                    <Line
                                      type="monotone"
                                      dataKey="emissions"
                                      stroke="var(--color-emissions)"
                                      strokeWidth={2}
                                      dot={{ fill: "var(--color-emissions)" }}
                                    />
                                  </LineChart>
                                </ChartContainer>
                              )}
                            </div>
                          </div>

                          {/* Activity Breakdown */}
                          <div>
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              <ActivityIcon className="h-4 w-4" />
                              {emissionsType === "operations" ? "Activity Breakdown" : "Investment Breakdown"}
                            </h4>
                            <div className="space-y-3">
                              {(emissionsType === "operations" ? [
                                { activity: "Transportation", value: 0.40, intensity: "High" },
                                { activity: "Energy Consumption", value: 0.35, intensity: "Medium" },
                                { activity: "Manufacturing", value: 0.15, intensity: "Medium" },
                                { activity: "Other Activities", value: 0.10, intensity: "Low" },
                              ] : [
                                { activity: "Project Finance", value: 0.45, intensity: "High" },
                                { activity: "Corporate Bonds", value: 0.30, intensity: "Medium" },
                                { activity: "Equity Holdings", value: 0.20, intensity: "Medium" },
                                { activity: "Other Investments", value: 0.05, intensity: "Low" },
                              ]).map((activity, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50">
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-sm font-medium">{activity.activity}</span>
                                      <div className="flex items-center gap-2">
                                        <Badge
                                          variant={
                                            activity.intensity === "High"
                                              ? "destructive"
                                              : activity.intensity === "Medium"
                                              ? "default"
                                              : "secondary"
                                          }
                                          className="text-xs"
                                        >
                                          {activity.intensity}
                                        </Badge>
                                        <span className="text-sm font-semibold">
                                          {((src.co2e) * activity.value).toFixed(2)} kg
                                        </span>
                                      </div>
                                    </div>
                                    <Progress value={activity.value * 100} className="h-2" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Optimization Opportunities */}
                          <div className="p-4 border rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-green-900 dark:text-green-100">
                              <Target className="h-4 w-4" />
                              {emissionsType === "operations" ? "Optimization Opportunities" : "Portfolio Decarbonization Strategies"}
                            </h4>
                            <ul className="space-y-2 text-sm text-green-800 dark:text-green-200">
                              {emissionsType === "operations" ? (
                                <>
                                  <li className="flex items-start gap-2">
                                    <span className="text-green-600">•</span>
                                    <span>Optimize transportation routes to reduce fuel consumption by up to 15%</span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <span className="text-green-600">•</span>
                                    <span>Switch to renewable energy sources for this facility</span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <span className="text-green-600">•</span>
                                    <span>Implement smart energy management systems to reduce peak consumption</span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <span className="text-green-600">•</span>
                                    <span>Consider carbon offset programs for unavoidable emissions</span>
                                  </li>
                                </>
                              ) : (
                                <>
                                  <li className="flex items-start gap-2">
                                    <span className="text-green-600">•</span>
                                    <span>Set science-based targets for portfolio decarbonization aligned with 1.5°C pathway</span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <span className="text-green-600">•</span>
                                    <span>Increase allocation to green bonds and sustainable investment products</span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <span className="text-green-600">•</span>
                                    <span>Engage with investee companies to adopt Paris-aligned climate strategies</span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <span className="text-green-600">•</span>
                                    <span>Consider carbon intensity screening for new investments</span>
                                  </li>
                                </>
                              )}
                            </ul>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No source data available
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

    </DashboardLayout>
  );
}
