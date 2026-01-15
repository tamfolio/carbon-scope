"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Users,
  UserCheck,
  Crown,
  Activity,
  TrendingUp,
  Leaf,
  ArrowRight,
} from "lucide-react";

interface Stats {
  overview: {
    totalOrganizations: number;
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    superAdmins: number;
    totalEmissions: number;
    emissionsCount: number;
    totalFinancedEmissions: number;
    financedEmissionsCount: number;
    userGrowth: number;
    recentUsers: number;
  };
  topOrganizations: Array<{
    organizationId: string | null;
    organizationName: string;
    totalEmissions: number;
    entryCount: number;
  }>;
  recentOrganizations: Array<{
    id: string;
    name: string;
    createdAt: string;
    _count: { users: number };
  }>;
}

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    // Verify super admin
    const userData = localStorage.getItem("cs_user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user.role !== "SUPER_ADMIN") {
          router.push("/dashboard");
          return;
        }
      } catch (e) {
        router.push("/dashboard");
        return;
      }
    }
    fetchStats();
  }, [router]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("cs_token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch("/api/super-admin/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401 || response.status === 403) {
        router.push("/dashboard");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(Math.round(num));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading system overview...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">
          System-wide overview and management
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organizations</CardTitle>
            <Building2 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.overview.totalOrganizations}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active organizations in system
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.overview.totalUsers}</div>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                +{stats.overview.recentUsers} this month
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.overview.activeUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {((stats.overview.activeUsers / stats.overview.totalUsers) * 100).toFixed(0)}% of total users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Emissions</CardTitle>
            <Leaf className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatNumber(stats.overview.totalEmissions)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              kg CO2e ({stats.overview.emissionsCount} entries)
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Organizations by Emissions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Top Organizations by Emissions</span>
              <Link href="/dashboard/super-admin/organizations">
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.topOrganizations.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">
                No emissions data yet
              </p>
            ) : (
              <div className="space-y-4">
                {stats.topOrganizations.map((org, index) => (
                  <div
                    key={org.organizationId || index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-sm font-bold text-purple-700">
                        #{index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{org.organizationName}</p>
                        <p className="text-xs text-muted-foreground">
                          {org.entryCount} entries
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{formatNumber(org.totalEmissions)}</p>
                      <p className="text-xs text-muted-foreground">kg CO2e</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Organizations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recently Added Organizations</span>
              <Link href="/dashboard/super-admin/organizations">
                <Button variant="ghost" size="sm">
                  Manage <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentOrganizations.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">
                No organizations yet
              </p>
            ) : (
              <div className="space-y-4">
                {stats.recentOrganizations.map((org) => (
                  <div
                    key={org.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Building2 className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-medium">{org.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Created {formatDate(org.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      {org._count.users} users
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/dashboard/super-admin/organizations">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <Building2 className="h-6 w-6" />
                <span>Manage Organizations</span>
              </Button>
            </Link>
            <Link href="/dashboard/super-admin/users">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <Users className="h-6 w-6" />
                <span>Manage All Users</span>
              </Button>
            </Link>
            <Link href="/dashboard/admin/analytics">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <Activity className="h-6 w-6" />
                <span>System Analytics</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
