"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  UserPlus,
  Activity,
  TrendingUp,
  TrendingDown,
  FileText,
  BarChart3,
  AlertCircle
} from "lucide-react";

interface OverviewData {
  users: {
    total: number;
    active: number;
    inactive: number;
    growth: number;
  };
  emissions: {
    total: number;
    byScope: {
      scope1: number;
      scope2: number;
      scope3: number;
    };
    growth: number;
  };
  financedEmissions: {
    total: number;
    count: number;
  };
  recentActivities: Array<{
    id: string;
    action: string;
    description: string;
    createdAt: string;
    user: {
      name: string | null;
      email: string;
    };
  }>;
  mostActiveUsers: Array<{
    user: {
      id: string;
      name: string | null;
      email: string;
      role: string;
    } | null;
    activityCount: number;
  }>;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<OverviewData | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const fetchOverview = useCallback(async () => {
    try {
      const token = localStorage.getItem("cs_token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch("/api/admin/overview", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401 || response.status === 403) {
        router.push("/dashboard");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch overview data");
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError("Failed to load admin dashboard");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    // Check if user is super admin
    const userData = localStorage.getItem("cs_user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setIsSuperAdmin(user.role === "SUPER_ADMIN");
      } catch {
        console.error("Failed to parse user data");
      }
    }
    fetchOverview();
  }, [fetchOverview]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(Math.round(num));
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading admin dashboard...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">{error}</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          {isSuperAdmin ? "System Dashboard" : "Admin Dashboard"}
        </h1>
        <p className="text-gray-600 mt-2">
          {isSuperAdmin
            ? "System-wide overview and management"
            : "Organization overview and management"}
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.users.total}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <span className="text-green-600">{data.users.active} active</span>
              <span className="mx-2">•</span>
              <span className="text-gray-500">{data.users.inactive} inactive</span>
            </div>
            {data.users.growth !== 0 && (
              <div className="flex items-center text-xs mt-2">
                {data.users.growth > 0 ? (
                  <>
                    <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                    <span className="text-green-600">+{data.users.growth.toFixed(1)}%</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                    <span className="text-red-600">{data.users.growth.toFixed(1)}%</span>
                  </>
                )}
                <span className="text-muted-foreground ml-1">vs last month</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Emissions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.emissions.total)} kg</div>
            <p className="text-xs text-muted-foreground mt-1">CO2e equivalents</p>
            {data.emissions.growth !== 0 && (
              <div className="flex items-center text-xs mt-2">
                {data.emissions.growth > 0 ? (
                  <>
                    <TrendingUp className="h-3 w-3 text-red-600 mr-1" />
                    <span className="text-red-600">+{data.emissions.growth.toFixed(1)}%</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-3 w-3 text-green-600 mr-1" />
                    <span className="text-green-600">{data.emissions.growth.toFixed(1)}%</span>
                  </>
                )}
                <span className="text-muted-foreground ml-1">vs last month</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">By Scope</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Scope 1:</span>
                <span className="font-medium">{formatNumber(data.emissions.byScope.scope1)} kg</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Scope 2:</span>
                <span className="font-medium">{formatNumber(data.emissions.byScope.scope2)} kg</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Scope 3:</span>
                <span className="font-medium">{formatNumber(data.emissions.byScope.scope3)} kg</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Financed Emissions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.financedEmissions.total)} kg</div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.financedEmissions.count} {data.financedEmissions.count === 1 ? "entry" : "entries"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/dashboard/admin/users">
              <Button variant="outline" className="w-full">
                <UserPlus className="mr-2 h-4 w-4" />
                Invite User
              </Button>
            </Link>
            <Link href="/dashboard/admin/analytics">
              <Button variant="outline" className="w-full">
                <BarChart3 className="mr-2 h-4 w-4" />
                View Analytics
              </Button>
            </Link>
            <Link href="/dashboard/admin/reports">
              <Button variant="outline" className="w-full">
                <FileText className="mr-2 h-4 w-4" />
                Generate Report
              </Button>
            </Link>
            <Link href="/dashboard/admin/activity">
              <Button variant="outline" className="w-full">
                <Activity className="mr-2 h-4 w-4" />
                Activity Logs
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentActivities.length === 0 ? (
              <p className="text-muted-foreground text-sm">No recent activity</p>
            ) : (
              <div className="space-y-4">
                {data.recentActivities.slice(0, 10).map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 text-sm">
                    <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.user.name || activity.user.email} • {formatDate(activity.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {data.recentActivities.length > 10 && (
              <Link href="/dashboard/admin/activity">
                <Button variant="link" className="mt-4 p-0">
                  View all activity →
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>

        {/* Most Active Users */}
        <Card>
          <CardHeader>
            <CardTitle>Most Active Users (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {data.mostActiveUsers.length === 0 ? (
              <p className="text-muted-foreground text-sm">No activity data</p>
            ) : (
              <div className="space-y-4">
                {data.mostActiveUsers.map((item, index) => (
                  <div key={item.user?.id || index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                        #{index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{item.user?.name || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">{item.user?.email}</p>
                      </div>
                    </div>
                    <div className="text-sm font-medium">
                      {item.activityCount} {item.activityCount === 1 ? "action" : "actions"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
