"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import {
  FileText,
  Download,
  FileSpreadsheet,
  Calendar,
  TrendingUp,
  BarChart3,
  PieChart,
  Users,
  Leaf,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend as RechartsLegend,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface ReportData {
  reportType: string;
  period: string;
  startDate: string;
  endDate: string;
  organization: {
    name: string;
    description: string | null;
  };
  summary: {
    totalCO2e: number;
    scope1: number;
    scope2: number;
    scope3: number;
    totalEntries: number;
    totalFinancedEmissionsTonnes: number;
    totalFinancedEmissionsKg: number;
    grandTotalKg: number;
    grandTotalTonnes: number;
    reportingPeriod: string;
  };
  emissions: {
    byScope: Array<{
      scope: string;
      total: number;
      count: number;
      percentage: number;
    }>;
    byCategory: Array<{
      category: string;
      scope: string;
      total: number;
      count: number;
      percentage: number;
    }>;
    bySource: Array<{
      source: string;
      total: number;
      count: number;
      percentage: number;
    }>;
    trend: Array<{
      month: string;
      scope1: number;
      scope2: number;
      scope3: number;
      total: number;
      count: number;
    }>;
  };
  financedEmissions: {
    summary: {
      total: number;
      scope1: number;
      scope2: number;
      scope3: number;
      count: number;
    };
    bySector: Array<{
      sector: string;
      total: number;
      scope1: number;
      scope2: number;
      scope3: number;
      investmentAmount: number;
      count: number;
    }>;
    byType: Array<{
      type: string;
      total: number;
      investmentAmount: number;
      count: number;
    }>;
    dataQuality: Array<{ score: number; count: number }>;
  };
  waste: {
    totalWaste: number;
    categories: Array<{ category: string; total: number; count: number }>;
  };
  compliance: {
    completenessScore: number;
    dataQualityScore: number;
    totalDataPoints: number;
  };
  users: Array<{
    userId: string;
    userName: string;
    userEmail: string;
    role: string;
    totalCo2e: number;
    entriesCount: number;
    financedEntriesCount: number;
  }>;
}

const SCOPE_COLORS = {
  "Scope 1": "rgb(37, 99, 235)",
  "Scope 2": "rgb(234, 88, 12)",
  "Scope 3": "rgb(147, 51, 234)",
};

const PIE_COLORS = [
  "#2563eb",
  "#ea580c",
  "#9333ea",
  "#10b981",
  "#f59e0b",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
];

// Chart configurations
const scopeChartConfig = {
  "Scope 1": {
    label: "Scope 1",
    color: "rgb(37, 99, 235)",
  },
  "Scope 2": {
    label: "Scope 2",
    color: "rgb(234, 88, 12)",
  },
  "Scope 3": {
    label: "Scope 3",
    color: "rgb(147, 51, 234)",
  },
} satisfies ChartConfig;

const trendChartConfig = {
  scope1: {
    label: "Scope 1",
    color: "rgb(37, 99, 235)",
  },
  scope2: {
    label: "Scope 2",
    color: "rgb(234, 88, 12)",
  },
  scope3: {
    label: "Scope 3",
    color: "rgb(147, 51, 234)",
  },
} satisfies ChartConfig;

// Helper function to format CO2e values (same as dashboard)
const formatEmissionValue = (
  kgCO2e: number
): { value: string; unit: string } => {
  if (kgCO2e >= 1000) {
    // Show in tonnes for values >= 1000 kg
    return {
      value: (kgCO2e / 1000).toFixed(2),
      unit: "tCO₂e",
    };
  } else {
    // Show in kg for values < 1000 kg
    return {
      value: kgCO2e.toFixed(2),
      unit: "kg CO₂e",
    };
  }
};

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState<"excel" | "pdf" | null>(null);
  const [period, setPeriod] = useState("month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportTemplate, setReportTemplate] = useState("comprehensive");

  useEffect(() => {
    // Initialize dates on mount
    const now = new Date();
    const start = new Date();
    start.setMonth(now.getMonth() - 1);
    const startStr = start.toISOString().split("T")[0];
    const endStr = now.toISOString().split("T")[0];
    setStartDate(startStr);
    setEndDate(endStr);

    // Fetch initial data with calculated dates
    fetchReportDataWithDates(startStr, endStr);
  }, []);

  const fetchReportDataWithDates = async (start: string, end: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("cs_token");
      const url = `/api/reports?startDate=${start}&endDate=${end}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setReportData(data);
      }
    } catch (error) {
      console.error("Error fetching report:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReportData = async () => {
    if (startDate && endDate) {
      await fetchReportDataWithDates(startDate, endDate);
    }
  };

  const handleExport = async (format: "excel" | "pdf") => {
    setExporting(format);
    try {
      const token = localStorage.getItem("cs_token");
      let url = `/api/reports/export/${format}?template=${reportTemplate}`;

      if (startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      } else {
        url += `&period=${period}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = `CarbonScope_Report_${
          new Date().toISOString().split("T")[0]
        }.${format === "excel" ? "xlsx" : "pdf"}`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(downloadUrl);
      }
    } catch (error) {
      console.error(`Error exporting ${format}:`, error);
    } finally {
      setExporting(null);
    }
  };

  const handlePeriodChange = (value: string) => {
    setPeriod(value);

    // Calculate and set date range based on period
    const now = new Date();
    let start = new Date();

    switch (value) {
      case "week":
        start.setDate(now.getDate() - 7);
        break;
      case "month":
        start.setMonth(now.getMonth() - 1);
        break;
      case "quarter":
        start.setMonth(now.getMonth() - 3);
        break;
      case "year":
        start.setFullYear(now.getFullYear() - 1);
        break;
      default:
        start.setMonth(now.getMonth() - 1);
    }

    // Set the date inputs
    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(now.toISOString().split("T")[0]);
  };

  const handleGenerateReport = () => {
    fetchReportData();
  };

  if (loading && !reportData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading report data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Reports & Analytics
            </h2>
            <p className="text-muted-foreground mt-1">
              Generate and export detailed sustainability reports
            </p>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Charts and graphs are displayed below. Exports (Excel/PDF) contain
              detailed data tables.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => handleExport("excel")}
              disabled={!reportData || exporting !== null}
              className="gap-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              {exporting === "excel" ? "Exporting..." : "Export Excel"}
            </Button>
            <Button
              onClick={() => handleExport("pdf")}
              disabled={!reportData || exporting !== null}
              variant="outline"
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              {exporting === "pdf" ? "Exporting..." : "Export PDF"}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Report Configuration
            </CardTitle>
            <CardDescription>
              Select reporting period and filters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Report Template
                </label>
                <Select
                  value={reportTemplate}
                  onValueChange={setReportTemplate}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="comprehensive">
                      Comprehensive Report
                    </SelectItem>
                    <SelectItem value="ghg-protocol">GHG Protocol</SelectItem>
                    <SelectItem value="iso-14064">ISO 14064</SelectItem>
                    <SelectItem value="issb">ISSB/IFRS S2</SelectItem>
                    <SelectItem value="tcfd">TCFD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Period</label>
                <Select value={period} onValueChange={handlePeriodChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Last 7 Days</SelectItem>
                    <SelectItem value="month">Last Month</SelectItem>
                    <SelectItem value="quarter">Last Quarter</SelectItem>
                    <SelectItem value="year">Last Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleGenerateReport}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? "Generating..." : "Generate Report"}
                </Button>
              </div>
            </div>

            {/* Report Template Description */}
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                {reportTemplate === "comprehensive" &&
                  "Complete sustainability report with all metrics, emissions data, and compliance scores."}
                {reportTemplate === "ghg-protocol" &&
                  "GHG Protocol-compliant report with Scope 1, 2, and 3 emissions following WBCSD/WRI standards."}
                {reportTemplate === "iso-14064" &&
                  "ISO 14064 standard report for greenhouse gas accounting and verification."}
                {reportTemplate === "issb" &&
                  "IFRS Sustainability Disclosure Standards (ISSB S2) climate-related disclosures report."}
                {reportTemplate === "tcfd" &&
                  "Task Force on Climate-related Financial Disclosures (TCFD) framework report."}
              </p>
            </div>
          </CardContent>
        </Card>

        {reportData && (
          <>
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Emissions
                  </CardTitle>
                  <Leaf className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {(() => {
                    const formatted = formatEmissionValue(
                      reportData.summary.grandTotalKg
                    );
                    return (
                      <>
                        <div className="text-2xl font-bold">
                          {formatted.value}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatted.unit}
                        </p>
                        <div className="mt-2 text-xs text-muted-foreground">
                          <div>
                            Operations:{" "}
                            {
                              formatEmissionValue(reportData.summary.totalCO2e)
                                .value
                            }{" "}
                            {
                              formatEmissionValue(reportData.summary.totalCO2e)
                                .unit
                            }
                          </div>
                          <div>
                            Financed:{" "}
                            {reportData.summary.totalFinancedEmissionsTonnes.toFixed(
                              2
                            )}{" "}
                            tCO₂e
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Data Points
                  </CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {reportData.summary.totalEntries}
                  </div>
                  <p className="text-xs text-muted-foreground">Total entries</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Completeness
                  </CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {reportData.compliance.completenessScore.toFixed(0)}%
                  </div>
                  <Progress
                    value={reportData.compliance.completenessScore}
                    className="mt-2"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Data Quality
                  </CardTitle>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {reportData.compliance.dataQualityScore.toFixed(1)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    PCAF Score (1-5)
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="emissions">Emissions Detail</TabsTrigger>
                <TabsTrigger value="financed">Financed Emissions</TabsTrigger>
                <TabsTrigger value="users">User Activity</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Emissions by Scope */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Emissions by Scope</CardTitle>
                      <CardDescription>GHG Protocol breakdown</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer
                        config={scopeChartConfig}
                        className="h-[300px] w-full"
                      >
                        <RePieChart>
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Pie
                            data={reportData.emissions.byScope}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ scope, percentage }) =>
                              `${scope}: ${percentage.toFixed(1)}%`
                            }
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="total"
                            nameKey="scope"
                          >
                            {reportData.emissions.byScope.map(
                              (entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={
                                    SCOPE_COLORS[
                                      entry.scope as keyof typeof SCOPE_COLORS
                                    ] || PIE_COLORS[index]
                                  }
                                />
                              )
                            )}
                          </Pie>
                        </RePieChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  {/* Scope Summary Table */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Scope Summary</CardTitle>
                      <CardDescription>
                        Detailed breakdown by scope
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Scope</TableHead>
                            <TableHead className="text-right">
                              CO2e (kg)
                            </TableHead>
                            <TableHead className="text-right">%</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {reportData.emissions.byScope.map((item) => (
                            <TableRow key={item.scope}>
                              <TableCell className="font-medium">
                                {item.scope}
                              </TableCell>
                              <TableCell className="text-right">
                                {item.total.toFixed(2)}
                              </TableCell>
                              <TableCell className="text-right">
                                <Badge variant="secondary">
                                  {item.percentage.toFixed(1)}%
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>

                {/* Emissions Trend */}
              </TabsContent>

              {/* Emissions Detail Tab */}
              <TabsContent value="emissions" className="space-y-4">
                {/* By Category */}
                <Card>
                  <CardHeader>
                    <CardTitle>Emissions by Category</CardTitle>
                    <CardDescription>Top emitting categories</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Category</TableHead>
                          <TableHead>Scope</TableHead>
                          <TableHead className="text-right">
                            CO2e (kg)
                          </TableHead>
                          <TableHead className="text-right">Count</TableHead>
                          <TableHead className="text-right">%</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData.emissions.byCategory
                          .slice(0, 10)
                          .map((item, idx) => (
                            <TableRow key={idx}>
                              <TableCell className="font-medium">
                                {item.category}
                              </TableCell>
                              <TableCell>{item.scope}</TableCell>
                              <TableCell className="text-right">
                                {item.total.toFixed(2)}
                              </TableCell>
                              <TableCell className="text-right">
                                {item.count}
                              </TableCell>
                              <TableCell className="text-right">
                                <Badge variant="secondary">
                                  {item.percentage.toFixed(1)}%
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* By Source */}
                <Card>
                  <CardHeader>
                    <CardTitle>Top Emissions Sources</CardTitle>
                    <CardDescription>Largest contributors</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Source</TableHead>
                          <TableHead className="text-right">
                            CO2e (kg)
                          </TableHead>
                          <TableHead className="text-right">Count</TableHead>
                          <TableHead className="text-right">%</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData.emissions.bySource.map((item, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium">
                              {item.source}
                            </TableCell>
                            <TableCell className="text-right">
                              {item.total.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right">
                              {item.count}
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge variant="secondary">
                                {item.percentage.toFixed(1)}%
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Financed Emissions Tab */}
              <TabsContent value="financed" className="space-y-4">
                {/* Financed Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Financed Emissions Summary</CardTitle>
                    <CardDescription>
                      PCAF-based portfolio emissions (in tonnes)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Total
                        </p>
                        <p className="text-2xl font-bold">
                          {reportData.financedEmissions.summary.total.toFixed(
                            2
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">tCO₂e</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Scope 1
                        </p>
                        <p className="text-2xl font-bold">
                          {reportData.financedEmissions.summary.scope1.toFixed(
                            2
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">tCO₂e</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Scope 2
                        </p>
                        <p className="text-2xl font-bold">
                          {reportData.financedEmissions.summary.scope2.toFixed(
                            2
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">tCO₂e</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Scope 3
                        </p>
                        <p className="text-2xl font-bold">
                          {reportData.financedEmissions.summary.scope3.toFixed(
                            2
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">tCO₂e</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* By Sector */}
                <Card>
                  <CardHeader>
                    <CardTitle>Emissions by Sector</CardTitle>
                    <CardDescription>Industry breakdown</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Sector</TableHead>
                          <TableHead className="text-right">
                            Total CO2e (tonnes)
                          </TableHead>
                          <TableHead className="text-right">
                            Investment
                          </TableHead>
                          <TableHead className="text-right">Count</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData.financedEmissions.bySector.map(
                          (item, idx) => (
                            <TableRow key={idx}>
                              <TableCell className="font-medium">
                                {item.sector}
                              </TableCell>
                              <TableCell className="text-right">
                                {item.total.toFixed(2)} tCO₂e
                              </TableCell>
                              <TableCell className="text-right">
                                ${item.investmentAmount.toFixed(2)}
                              </TableCell>
                              <TableCell className="text-right">
                                {item.count}
                              </TableCell>
                            </TableRow>
                          )
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* User Activity Tab */}
              <TabsContent value="users" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      User Activity Summary
                    </CardTitle>
                    <CardDescription>
                      Contributions by team members
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead className="text-right">
                            Total CO2e (kg)
                          </TableHead>
                          <TableHead className="text-right">
                            Operations
                          </TableHead>
                          <TableHead className="text-right">Financed</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData.users.map((user) => (
                          <TableRow key={user.userId}>
                            <TableCell className="font-medium">
                              {user.userName}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{user.role}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {user.totalCo2e.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right">
                              {user.entriesCount}
                            </TableCell>
                            <TableCell className="text-right">
                              {user.financedEntriesCount}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
