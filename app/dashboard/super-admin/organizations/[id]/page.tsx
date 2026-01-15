"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Users,
  Activity,
  Settings,
  Leaf,
  ChevronRight,
  Edit2,
  Trash2,
  UserPlus,
  Download,
  Save,
  ArrowLeft,
  Power,
  PowerOff,
  AlertTriangle,
} from "lucide-react";

interface Organization {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  totalEmissions: number;
  activeUsers: number;
  _count: {
    users: number;
    emissions: number;
    financedEmissions: number;
    activityLogs: number;
  };
}

interface OrganizationSettings {
  id: string;
  organizationId: string;
  userLimit: number | null;
  emissionLimit: number | null;
  enableFinancedEmissions: boolean;
  enableAdvancedAnalytics: boolean;
  enableAPIAccess: boolean;
  enableCustomReports: boolean;
  customSettings: any;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  _count: {
    emissions: number;
    financedEmissions: number;
  };
}

interface Emission {
  id: string;
  scope: string;
  category: string;
  activity: string;
  source: string;
  quantity: number;
  unit: string;
  co2e: number;
  date: string;
  createdAt: string;
  user: {
    name: string | null;
    email: string;
  };
}

interface ActivityLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  description: string | null;
  metadata: any;
  createdAt: string;
  user: {
    name: string | null;
    email: string;
  } | null;
}

export default function OrganizationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orgId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [settings, setSettings] = useState<OrganizationSettings | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [emissions, setEmissions] = useState<Emission[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  // Edit organization dialog
  const [editOrgDialogOpen, setEditOrgDialogOpen] = useState(false);
  const [editOrgForm, setEditOrgForm] = useState({ name: "", description: "" });
  const [updatingOrg, setUpdatingOrg] = useState(false);

  // Delete organization dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Settings form
  const [settingsForm, setSettingsForm] = useState({
    userLimit: "",
    emissionLimit: "",
    enableFinancedEmissions: false,
    enableAdvancedAnalytics: false,
    enableAPIAccess: false,
    enableCustomReports: false,
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalEmissions: 0,
    totalActivities: 0,
    scope1: 0,
    scope2: 0,
    scope3: 0,
  });

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
    fetchAllData();
  }, [router, orgId]);

  const fetchAllData = async () => {
    await Promise.all([
      fetchOrganization(),
      fetchSettings(),
      fetchUsers(),
      fetchEmissions(),
      fetchActivityLogs(),
    ]);
    setLoading(false);
  };

  const fetchOrganization = async () => {
    try {
      const token = localStorage.getItem("cs_token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(`/api/super-admin/organizations/${orgId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401 || response.status === 403) {
        router.push("/dashboard");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch organization");
      }

      const data = await response.json();
      setOrganization(data.organization);
      setEditOrgForm({
        name: data.organization.name,
        description: data.organization.description || "",
      });

      // Calculate stats from emissionsByScope
      const emissionsByScope = data.organization.emissionsByScope || [];
      const scope1 = emissionsByScope.find((s: any) => s.scope === "Scope 1")?.total || 0;
      const scope2 = emissionsByScope.find((s: any) => s.scope === "Scope 2")?.total || 0;
      const scope3 = emissionsByScope.find((s: any) => s.scope === "Scope 3")?.total || 0;

      setStats({
        totalUsers: data.organization._count.users,
        activeUsers: data.organization.activeUsers,
        totalEmissions: data.organization.totalEmissions,
        totalActivities: data.organization._count.activityLogs,
        scope1: scope1,
        scope2: scope2,
        scope3: scope3,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem("cs_token");
      const response = await fetch(
        `/api/super-admin/organizations/${orgId}/settings`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch settings");
      }

      const data = await response.json();
      setSettings(data.settings);

      if (data.settings) {
        setSettingsForm({
          userLimit: data.settings.userLimit?.toString() || "",
          emissionLimit: data.settings.emissionLimit?.toString() || "",
          enableFinancedEmissions: data.settings.enableFinancedEmissions,
          enableAdvancedAnalytics: data.settings.enableAdvancedAnalytics,
          enableAPIAccess: data.settings.enableAPIAccess,
          enableCustomReports: data.settings.enableCustomReports,
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("cs_token");
      const response = await fetch(
        `/api/super-admin/users?organizationId=${orgId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEmissions = async () => {
    try {
      const token = localStorage.getItem("cs_token");
      // Fetch emissions for this organization
      const response = await fetch(`/api/super-admin/organizations/${orgId}/emissions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch emissions");
      }

      const data = await response.json();
      const emissionsData = data.emissions || [];
      setEmissions(emissionsData);

      // Calculate scope totals
      const scope1Total = emissionsData
        .filter((e: Emission) => e.scope === "Scope 1")
        .reduce((sum: number, e: Emission) => sum + e.co2e, 0);
      const scope2Total = emissionsData
        .filter((e: Emission) => e.scope === "Scope 2")
        .reduce((sum: number, e: Emission) => sum + e.co2e, 0);
      const scope3Total = emissionsData
        .filter((e: Emission) => e.scope === "Scope 3")
        .reduce((sum: number, e: Emission) => sum + e.co2e, 0);

      setStats((prev) => ({
        ...prev,
        scope1: scope1Total,
        scope2: scope2Total,
        scope3: scope3Total,
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchActivityLogs = async () => {
    try {
      const token = localStorage.getItem("cs_token");
      const response = await fetch(
        `/api/admin/activity?organizationId=${orgId}&limit=50`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch activity logs");
      }

      const data = await response.json();
      setActivityLogs(data.logs || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateOrganization = async () => {
    if (!editOrgForm.name) return;

    setUpdatingOrg(true);
    try {
      const token = localStorage.getItem("cs_token");
      const response = await fetch(`/api/super-admin/organizations/${orgId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editOrgForm),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || "Failed to update organization");
        return;
      }

      alert("Organization updated successfully");
      setEditOrgDialogOpen(false);
      fetchOrganization();
    } catch (err) {
      console.error(err);
      alert("Failed to update organization");
    } finally {
      setUpdatingOrg(false);
    }
  };

  const handleDeleteOrganization = async () => {
    if (users.length > 0) {
      alert(
        `Cannot delete organization with ${users.length} active users. Please transfer or remove users first.`
      );
      return;
    }

    setDeleting(true);
    try {
      const token = localStorage.getItem("cs_token");
      const response = await fetch(`/api/super-admin/organizations/${orgId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || "Failed to delete organization");
        return;
      }

      alert("Organization deleted successfully");
      router.push("/dashboard/super-admin/organizations");
    } catch (err) {
      console.error(err);
      alert("Failed to delete organization");
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      const token = localStorage.getItem("cs_token");
      const response = await fetch(
        `/api/super-admin/organizations/${orgId}/settings`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userLimit: settingsForm.userLimit
              ? parseInt(settingsForm.userLimit)
              : null,
            emissionLimit: settingsForm.emissionLimit
              ? parseInt(settingsForm.emissionLimit)
              : null,
            enableFinancedEmissions: settingsForm.enableFinancedEmissions,
            enableAdvancedAnalytics: settingsForm.enableAdvancedAnalytics,
            enableAPIAccess: settingsForm.enableAPIAccess,
            enableCustomReports: settingsForm.enableCustomReports,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || "Failed to save settings");
        return;
      }

      alert("Settings saved successfully");
      fetchSettings();
    } catch (err) {
      console.error(err);
      alert("Failed to save settings");
    } finally {
      setSavingSettings(false);
    }
  };

  const toggleUserStatus = async (user: User) => {
    const action = user.isActive ? "deactivate" : "activate";
    if (!confirm(`Are you sure you want to ${action} ${user.email}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("cs_token");
      const response = await fetch(`/api/super-admin/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !user.isActive }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || `Failed to ${action} user`);
        return;
      }

      fetchUsers();
      fetchOrganization();
    } catch (err) {
      console.error(err);
      alert(`Failed to ${action} user`);
    }
  };

  const exportActivityLogs = () => {
    const csvContent = [
      ["Date", "User", "Action", "Entity Type", "Description"].join(","),
      ...activityLogs.map((log) =>
        [
          new Date(log.createdAt).toLocaleString(),
          log.user?.name || log.user?.email || "System",
          log.action,
          log.entityType,
          `"${log.description || ""}"`,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `activity-logs-${organization?.name}-${new Date().toISOString()}.csv`;
    a.click();
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(Math.round(num));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading || !organization) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading organization details...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Breadcrumb */}
      <div className="mb-4 flex items-center text-sm text-muted-foreground">
        <Link
          href="/dashboard/super-admin"
          className="hover:text-foreground transition-colors"
        >
          Super Admin
        </Link>
        <ChevronRight className="h-4 w-4 mx-1" />
        <Link
          href="/dashboard/super-admin/organizations"
          className="hover:text-foreground transition-colors"
        >
          Organizations
        </Link>
        <ChevronRight className="h-4 w-4 mx-1" />
        <span className="text-foreground">{organization.name}</span>
      </div>

      {/* Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard/super-admin/organizations")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Building2 className="h-8 w-8" />
            {organization.name}
          </h1>
          {organization.description && (
            <p className="text-gray-600 mt-2">{organization.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEditOrgDialogOpen(true)}>
            <Edit2 className="mr-2 h-4 w-4" />
            Edit Details
          </Button>
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Organization
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.activeUsers} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Power className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalUsers > 0
                ? Math.round((stats.activeUsers / stats.totalUsers) * 100)
                : 0}
              % of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Emissions
            </CardTitle>
            <Leaf className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(stats.totalEmissions)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">kg CO2e</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Activities
            </CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalActivities}</div>
            <p className="text-xs text-muted-foreground mt-1">log entries</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="emissions">Emissions</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="activity">Activity Logs</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Organization Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      Organization Name
                    </Label>
                    <p className="text-lg font-medium">{organization.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      Created Date
                    </Label>
                    <p className="text-lg font-medium">
                      {formatDate(organization.createdAt)}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-sm text-muted-foreground">
                      Description
                    </Label>
                    <p className="text-lg">
                      {organization.description || "No description provided"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Emissions Summary by Scope</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium text-red-900">Scope 1</p>
                      <p className="text-sm text-red-700">
                        Direct emissions from owned sources
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-red-900">
                        {formatNumber(stats.scope1)}
                      </p>
                      <p className="text-sm text-red-700">kg CO2e</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                    <div>
                      <p className="font-medium text-orange-900">Scope 2</p>
                      <p className="text-sm text-orange-700">
                        Indirect emissions from purchased energy
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-orange-900">
                        {formatNumber(stats.scope2)}
                      </p>
                      <p className="text-sm text-orange-700">kg CO2e</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
                    <div>
                      <p className="font-medium text-amber-900">Scope 3</p>
                      <p className="text-sm text-amber-700">
                        Indirect emissions from value chain
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-amber-900">
                        {formatNumber(stats.scope3)}
                      </p>
                      <p className="text-sm text-amber-700">kg CO2e</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                {activityLogs.slice(0, 10).length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No recent activity
                  </p>
                ) : (
                  <div className="space-y-3">
                    {activityLogs.slice(0, 10).map((log) => (
                      <div
                        key={log.id}
                        className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <Activity className="h-4 w-4 text-muted-foreground mt-1" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {log.action.replace(/_/g, " ")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {log.description || `${log.entityType} - ${log.entityId}`}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {log.user?.name || log.user?.email || "System"} •{" "}
                            {formatDateTime(log.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Organization Users ({users.length})</CardTitle>
                <Link href={`/dashboard/super-admin/users?org=${orgId}`}>
                  <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add User
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Entries</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.name || "—"}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{user.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.isActive ? "default" : "destructive"}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(user.lastLoginAt || "")}
                      </TableCell>
                      <TableCell className="text-sm">
                        {user._count.emissions + user._count.financedEmissions}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleUserStatus(user)}
                        >
                          {user.isActive ? (
                            <PowerOff className="h-3 w-3" />
                          ) : (
                            <Power className="h-3 w-3" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {users.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No users in this organization</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Emissions Tab */}
        <TabsContent value="emissions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Emissions Entries</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Scope</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead>Emissions</TableHead>
                    <TableHead>User</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {emissions.slice(0, 20).map((emission) => (
                    <TableRow key={emission.id}>
                      <TableCell className="text-sm">
                        {formatDate(emission.date)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            emission.scope === "Scope 1"
                              ? "destructive"
                              : emission.scope === "Scope 2"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {emission.scope}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {emission.category}
                      </TableCell>
                      <TableCell className="text-sm">
                        {emission.quantity} {emission.unit}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatNumber(emission.co2e)} kg
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {emission.user.name || emission.user.email}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {emissions.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Leaf className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No emissions data yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Organization Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="userLimit">
                    User Limit (leave empty for unlimited)
                  </Label>
                  <Input
                    id="userLimit"
                    type="number"
                    min="0"
                    value={settingsForm.userLimit}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        userLimit: e.target.value,
                      })
                    }
                    placeholder="Unlimited"
                  />
                </div>
                <div>
                  <Label htmlFor="emissionLimit">
                    Emission Limit in kg (leave empty for unlimited)
                  </Label>
                  <Input
                    id="emissionLimit"
                    type="number"
                    min="0"
                    value={settingsForm.emissionLimit}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        emissionLimit: e.target.value,
                      })
                    }
                    placeholder="Unlimited"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-base font-semibold">
                  Feature Toggles
                </Label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="enableFinancedEmissions"
                      checked={settingsForm.enableFinancedEmissions}
                      onCheckedChange={(checked) =>
                        setSettingsForm({
                          ...settingsForm,
                          enableFinancedEmissions: checked as boolean,
                        })
                      }
                    />
                    <Label
                      htmlFor="enableFinancedEmissions"
                      className="cursor-pointer font-normal"
                    >
                      Enable Financed Emissions
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="enableAdvancedAnalytics"
                      checked={settingsForm.enableAdvancedAnalytics}
                      onCheckedChange={(checked) =>
                        setSettingsForm({
                          ...settingsForm,
                          enableAdvancedAnalytics: checked as boolean,
                        })
                      }
                    />
                    <Label
                      htmlFor="enableAdvancedAnalytics"
                      className="cursor-pointer font-normal"
                    >
                      Enable Advanced Analytics
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="enableAPIAccess"
                      checked={settingsForm.enableAPIAccess}
                      onCheckedChange={(checked) =>
                        setSettingsForm({
                          ...settingsForm,
                          enableAPIAccess: checked as boolean,
                        })
                      }
                    />
                    <Label
                      htmlFor="enableAPIAccess"
                      className="cursor-pointer font-normal"
                    >
                      Enable API Access
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="enableCustomReports"
                      checked={settingsForm.enableCustomReports}
                      onCheckedChange={(checked) =>
                        setSettingsForm({
                          ...settingsForm,
                          enableCustomReports: checked as boolean,
                        })
                      }
                    />
                    <Label
                      htmlFor="enableCustomReports"
                      className="cursor-pointer font-normal"
                    >
                      Enable Custom Reports
                    </Label>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button onClick={handleSaveSettings} disabled={savingSettings}>
                  <Save className="mr-2 h-4 w-4" />
                  {savingSettings ? "Saving..." : "Save Settings"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Logs Tab */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Activity Logs ({activityLogs.length})</CardTitle>
                <Button variant="outline" onClick={exportActivityLogs}>
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity Type</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activityLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm">
                        {formatDateTime(log.createdAt)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {log.user?.name || log.user?.email || "System"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {log.action.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{log.entityType}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {log.description || "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {activityLogs.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No activity logs yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Organization Dialog */}
      <Dialog open={editOrgDialogOpen} onOpenChange={setEditOrgDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Organization</DialogTitle>
            <DialogDescription>
              Update organization information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Organization Name *</Label>
              <Input
                id="edit-name"
                value={editOrgForm.name}
                onChange={(e) =>
                  setEditOrgForm({ ...editOrgForm, name: e.target.value })
                }
                placeholder="Acme Corporation"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editOrgForm.description}
                onChange={(e) =>
                  setEditOrgForm({
                    ...editOrgForm,
                    description: e.target.value,
                  })
                }
                placeholder="Brief description..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditOrgDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateOrganization} disabled={updatingOrg}>
              {updatingOrg ? "Updating..." : "Update Organization"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Organization Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Delete Organization
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the
              organization.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {users.length > 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-medium text-red-900">
                  Cannot delete organization
                </p>
                <p className="text-sm text-red-700 mt-1">
                  This organization has {users.length} active user(s). Please
                  transfer or remove all users before deleting the organization.
                </p>
              </div>
            )}
            {users.length === 0 && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm font-medium text-orange-900 mb-2">
                  This will delete:
                </p>
                <ul className="text-sm text-orange-800 space-y-1 list-disc list-inside">
                  <li>Organization settings and configuration</li>
                  <li>All emission data ({emissions.length} entries)</li>
                  <li>All activity logs ({activityLogs.length} entries)</li>
                </ul>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteOrganization}
              disabled={deleting || users.length > 0}
            >
              {deleting ? "Deleting..." : "Delete Organization"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
