"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TrendingUp, TrendingDown } from "lucide-react";

interface AnalyticsData {
  period: string;
  startDate: string;
  endDate: string;
  totalEmissions: {
    co2e: number;
    count: number;
    financedTonnes: number;
    financedKg: number;
    grandTotalKg: number;
    grandTotalTonnes: number;
  };
  topContributors: Array<{
    user: {
      id: string;
      name: string | null;
      email: string;
      role: string;
    } | null;
    totalCo2e: number;
    entryCount: number;
    averageCo2e: number;
  }>;
  emissionsByCategory: Array<{
    category: string;
    total: number;
    count: number;
    percentage: number;
  }>;
  emissionsByScope: Array<{
    scope: string;
    total: number;
    count: number;
    percentage: number;
  }>;
  userComparison: Array<{
    user: {
      id: string;
      name: string | null;
      email: string;
      role: string;
    };
    totalCo2e: number;
    entriesCount: number;
    financedEntriesCount: number;
    averageCo2e: number;
  }>;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("month");
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("cs_token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(`/api/admin/analytics?period=${period}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401 || response.status === 403) {
        router.push("/dashboard");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch analytics");
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(Math.round(num));
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading analytics...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Organization Analytics</h1>
          <p className="text-gray-600 mt-2">
            Organization-wide performance and insights
          </p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Last Week</SelectItem>
            <SelectItem value="month">Last Month</SelectItem>
            <SelectItem value="quarter">Last Quarter</SelectItem>
            <SelectItem value="year">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Emissions (Combined)</CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const grandTotal = data.totalEmissions.grandTotalKg;
              const formatted = grandTotal >= 1000
                ? { value: (grandTotal / 1000).toFixed(2), unit: "tCO₂e" }
                : { value: grandTotal.toFixed(2), unit: "kg CO₂e" };
              return (
                <>
                  <div className="text-2xl font-bold">{formatted.value} {formatted.unit}</div>
                  <div className="text-xs text-muted-foreground mt-2">
                    <div>Operations: {formatNumber(data.totalEmissions.co2e)} kg</div>
                    <div>Financed: {data.totalEmissions.financedTonnes.toFixed(2)} tCO₂e</div>
                  </div>
                </>
              );
            })()}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Average per Entry</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.totalEmissions.count > 0
                ? formatNumber(data.totalEmissions.co2e / data.totalEmissions.count)
                : "0"} kg
            </div>
            <p className="text-xs text-muted-foreground mt-1">CO2e per entry</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Top Contributor</CardTitle>
          </CardHeader>
          <CardContent>
            {Array.isArray(data.topContributors) && data.topContributors.length > 0 && data.topContributors[0].user ? (
              <>
                <div className="text-xl font-bold">
                  {data.topContributors[0].user.name || data.topContributors[0].user.email || "Unknown"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatNumber(data.topContributors[0].totalCo2e)} kg CO2e
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Emissions by Scope */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Emissions by Scope</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Scope</TableHead>
                <TableHead>Total CO2e</TableHead>
                <TableHead>Entries</TableHead>
                <TableHead>Percentage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.isArray(data.emissionsByScope) && data.emissionsByScope.map((scope) => (
                <TableRow key={scope.scope}>
                  <TableCell className="font-medium">{scope.scope}</TableCell>
                  <TableCell>{formatNumber(scope.total)} kg</TableCell>
                  <TableCell>{scope.count}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="w-full max-w-[200px] bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${scope.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm">{scope.percentage.toFixed(1)}%</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Emissions by Category */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Emissions by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Total CO2e</TableHead>
                <TableHead>Entries</TableHead>
                <TableHead>Percentage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.isArray(data.emissionsByCategory) && data.emissionsByCategory.slice(0, 10).map((category) => (
                <TableRow key={category.category}>
                  <TableCell className="font-medium">{category.category}</TableCell>
                  <TableCell>{formatNumber(category.total)} kg</TableCell>
                  <TableCell>{category.count}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="w-full max-w-[200px] bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${category.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm">{category.percentage.toFixed(1)}%</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Top Contributors */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Top Contributors</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Total CO2e</TableHead>
                <TableHead>Entries</TableHead>
                <TableHead>Avg per Entry</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.isArray(data.topContributors) && data.topContributors.map((contributor, index) => {
                if (!contributor || typeof contributor !== 'object') return null;
                return (
                  <TableRow key={contributor.user?.id || index}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {contributor.user?.name || contributor.user?.email || "Unknown"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {contributor.user?.email || "—"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatNumber(contributor.totalCo2e || 0)} kg
                    </TableCell>
                    <TableCell>{contributor.entryCount || 0}</TableCell>
                    <TableCell>
                      {formatNumber(contributor.averageCo2e || 0)} kg
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* User Performance Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>User Performance Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Total CO2e</TableHead>
                <TableHead>Entries</TableHead>
                <TableHead>Avg per Entry</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.isArray(data.userComparison) && data.userComparison.slice(0, 20).map((user, index) => {
                if (!user || typeof user !== 'object' || !user.user) return null;
                return (
                  <TableRow key={user.user.id || index}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {user.user.name || user.user.email || "Unknown"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {user.user.email || "—"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{user.user.role || "—"}</span>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatNumber(user.totalCo2e || 0)} kg
                    </TableCell>
                    <TableCell>
                      {(user.entriesCount || 0) + (user.financedEntriesCount || 0)}
                    </TableCell>
                    <TableCell>
                      {(user.entriesCount || 0) > 0 ? `${formatNumber(user.averageCo2e || 0)} kg` : "— kg"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {(!Array.isArray(data.userComparison) || data.userComparison.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              No data available
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
