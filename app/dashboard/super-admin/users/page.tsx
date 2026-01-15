"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Badge } from "@/components/ui/badge";
import {
  Search,
  UserPlus,
  Edit2,
  Power,
  PowerOff,
  Trash2,
  ArrowLeftRight,
  CheckSquare,
  Square,
  AlertTriangle,
} from "lucide-react";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  organizationId: string | null;
  organization?: {
    id: string;
    name: string;
  } | null;
  _count: {
    emissions: number;
    financedEmissions: number;
    activityLogs: number;
  };
}

interface Organization {
  id: string;
  name: string;
  _count?: {
    users: number;
  };
}

export default function SuperAdminUsersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);

  // Filters
  const [filters, setFilters] = useState({
    search: "",
    organizationId: "all",
    role: "all",
    status: "all",
  });

  // Selection state
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());

  // Invite Dialog
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: "",
    name: "",
    role: "USER",
    organizationId: "__NONE__",
  });
  const [inviting, setInviting] = useState(false);
  const [tempPassword, setTempPassword] = useState("");

  // Edit Dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    role: "",
    isActive: true,
    organizationId: "",
  });
  const [updating, setUpdating] = useState(false);

  // Transfer Dialog
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [transferTargetOrgId, setTransferTargetOrgId] = useState("");
  const [transferring, setTransferring] = useState(false);

  // Delete Confirmation Dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
    fetchData();
  }, [router]);

  useEffect(() => {
    filterUsers();
  }, [users, filters]);

  const fetchData = async () => {
    await Promise.all([fetchUsers(), fetchOrganizations()]);
    setLoading(false);
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("cs_token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch("/api/super-admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401 || response.status === 403) {
        router.push("/dashboard");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const token = localStorage.getItem("cs_token");
      if (!token) return;

      const response = await fetch("/api/super-admin/organizations", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch organizations");
      }

      const data = await response.json();
      setOrganizations(data.organizations || []);
    } catch (err) {
      console.error(err);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (filters.search) {
      filtered = filtered.filter(
        (user) =>
          user.email.toLowerCase().includes(filters.search.toLowerCase()) ||
          user.name?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.organizationId !== "all") {
      if (filters.organizationId === "none") {
        filtered = filtered.filter((user) => !user.organizationId);
      } else {
        filtered = filtered.filter(
          (user) => user.organizationId === filters.organizationId
        );
      }
    }

    if (filters.role !== "all") {
      filtered = filtered.filter((user) => user.role === filters.role);
    }

    if (filters.status === "active") {
      filtered = filtered.filter((user) => user.isActive);
    } else if (filters.status === "inactive") {
      filtered = filtered.filter((user) => !user.isActive);
    }

    setFilteredUsers(filtered);
  };

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedUserIds.size === filteredUsers.length) {
      setSelectedUserIds(new Set());
    } else {
      setSelectedUserIds(new Set(filteredUsers.map((u) => u.id)));
    }
  };

  const toggleSelectUser = (userId: string) => {
    const newSet = new Set(selectedUserIds);
    if (newSet.has(userId)) {
      newSet.delete(userId);
    } else {
      newSet.add(userId);
    }
    setSelectedUserIds(newSet);
  };

  const clearSelection = () => {
    setSelectedUserIds(new Set());
  };

  // Bulk operations
  const handleBulkActivate = async () => {
    if (selectedUserIds.size === 0) return;
    if (!confirm(`Activate ${selectedUserIds.size} user(s)?`)) return;

    await executeBulkOperation("activate");
  };

  const handleBulkDeactivate = async () => {
    if (selectedUserIds.size === 0) return;
    if (!confirm(`Deactivate ${selectedUserIds.size} user(s)?`)) return;

    await executeBulkOperation("deactivate");
  };

  const handleBulkTransfer = () => {
    if (selectedUserIds.size === 0) return;
    setTransferTargetOrgId("__NONE__");
    setTransferDialogOpen(true);
  };

  const handleBulkDelete = () => {
    if (selectedUserIds.size === 0) return;
    setDeleteDialogOpen(true);
  };

  const executeBulkOperation = async (
    operation: "activate" | "deactivate" | "delete" | "transfer",
    organizationId?: string
  ) => {
    try {
      const token = localStorage.getItem("cs_token");
      const response = await fetch("/api/super-admin/users/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userIds: Array.from(selectedUserIds),
          operation,
          organizationId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || `Failed to ${operation} users`);
        return false;
      }

      const data = await response.json();
      alert(
        `Success: ${data.success}, Failed: ${data.failed}${
          data.errors && data.errors.length > 0
            ? "\n\nErrors:\n" + data.errors.join("\n")
            : ""
        }`
      );

      clearSelection();
      await fetchUsers();
      return true;
    } catch (err) {
      console.error(err);
      alert(`Failed to ${operation} users`);
      return false;
    }
  };

  const confirmBulkTransfer = async () => {
    if (!transferTargetOrgId) {
      alert("Please select a target organization");
      return;
    }

    setTransferring(true);
    // Convert "__NONE__" to undefined for the API
    const orgId = transferTargetOrgId === "__NONE__" ? undefined : transferTargetOrgId;
    const success = await executeBulkOperation("transfer", orgId);
    setTransferring(false);

    if (success) {
      setTransferDialogOpen(false);
    }
  };

  const confirmBulkDelete = async () => {
    setDeleting(true);
    const success = await executeBulkOperation("delete");
    setDeleting(false);

    if (success) {
      setDeleteDialogOpen(false);
    }
  };

  // Individual user operations
  const handleInvite = async () => {
    if (!inviteForm.email) return;

    setInviting(true);
    try {
      const token = localStorage.getItem("cs_token");
      // Convert "__NONE__" to null for the API
      const payload = {
        ...inviteForm,
        organizationId: inviteForm.organizationId === "__NONE__" ? null : inviteForm.organizationId,
      };
      const response = await fetch("/api/super-admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || "Failed to invite user");
        return;
      }

      const data = await response.json();
      setTempPassword(data.temporaryPassword || "");
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Failed to invite user");
    } finally {
      setInviting(false);
    }
  };

  const closeInviteDialog = () => {
    setInviteDialogOpen(false);
    setInviteForm({ email: "", name: "", role: "USER", organizationId: "__NONE__" });
    setTempPassword("");
  };

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setEditForm({
      name: user.name || "",
      role: user.role,
      isActive: user.isActive,
      organizationId: user.organizationId || "__NONE__",
    });
    setEditDialogOpen(true);
  };

  const handleEdit = async () => {
    if (!editingUser) return;

    setUpdating(true);
    try {
      const token = localStorage.getItem("cs_token");
      // Convert "__NONE__" to null for the API
      const payload = {
        ...editForm,
        organizationId: editForm.organizationId === "__NONE__" ? null : editForm.organizationId,
      };
      const response = await fetch(`/api/super-admin/users/${editingUser.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || "Failed to update user");
        return;
      }

      const data = await response.json();
      alert(data.message);

      setEditDialogOpen(false);
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Failed to update user");
    } finally {
      setUpdating(false);
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
    } catch (err) {
      console.error(err);
      alert(`Failed to ${action} user`);
    }
  };

  const handleTransferUser = (user: User) => {
    setSelectedUserIds(new Set([user.id]));
    setTransferTargetOrgId(user.organizationId || "__NONE__");
    setTransferDialogOpen(true);
  };

  const handleDeleteUser = async (user: User) => {
    if (
      !confirm(
        `Are you sure you want to soft-delete ${user.email}?\n\nThis will:\n- Set user as inactive\n- Remove organization association\n- Keep all emission data for audit trail`
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("cs_token");
      const response = await fetch(`/api/super-admin/users/${user.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || "Failed to delete user");
        return;
      }

      alert("User deleted successfully");
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Failed to delete user");
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString();
  };

  const getRoleBadgeColor = (role: string) => {
    if (role === "SUPER_ADMIN") return "bg-purple-600";
    if (role === "ADMIN") return "";
    return "bg-gray-600";
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading users...</div>
        </div>
      </DashboardLayout>
    );
  }

  const selectedUsers = filteredUsers.filter((u) => selectedUserIds.has(u.id));

  return (
    <DashboardLayout>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Super Admin - User Management</h1>
          <p className="text-gray-600 mt-2">
            Manage all users across all organizations
          </p>
        </div>
        <Button onClick={() => setInviteDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite User
        </Button>
      </div>

      {/* Bulk Actions Bar */}
      {selectedUserIds.size > 0 && (
        <Card className="mb-6 border-purple-200 bg-purple-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-purple-600" />
                <span className="font-medium text-purple-900">
                  {selectedUserIds.size} user(s) selected
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkActivate}
                >
                  <Power className="mr-2 h-4 w-4" />
                  Activate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkDeactivate}
                >
                  <PowerOff className="mr-2 h-4 w-4" />
                  Deactivate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkTransfer}
                >
                  <ArrowLeftRight className="mr-2 h-4 w-4" />
                  Transfer
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
                <Button variant="ghost" size="sm" onClick={clearSelection}>
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={filters.organizationId}
              onValueChange={(value) =>
                setFilters({ ...filters, organizationId: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by organization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Organizations</SelectItem>
                <SelectItem value="none">No Organization</SelectItem>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.role}
              onValueChange={(value) => setFilters({ ...filters, role: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="USER">User</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.status}
              onValueChange={(value) =>
                setFilters({ ...filters, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <button onClick={toggleSelectAll} className="p-1">
                    {selectedUserIds.size === filteredUsers.length &&
                    filteredUsers.length > 0 ? (
                      <CheckSquare className="h-4 w-4" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </button>
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Entries</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <button
                      onClick={() => toggleSelectUser(user.id)}
                      className="p-1"
                    >
                      {selectedUserIds.has(user.id) ? (
                        <CheckSquare className="h-4 w-4 text-purple-600" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </button>
                  </TableCell>
                  <TableCell className="font-medium">
                    {user.name || "—"}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {user.organization ? (
                      <Badge variant="outline">{user.organization.name}</Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm italic">
                        No organization
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="default"
                      className={getRoleBadgeColor(user.role)}
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? "default" : "destructive"}>
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(user.lastLoginAt)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {user._count.emissions + user._count.financedEmissions}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(user)}
                        title="Edit user"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTransferUser(user)}
                        title="Transfer to organization"
                      >
                        <ArrowLeftRight className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleUserStatus(user)}
                        title={user.isActive ? "Deactivate" : "Activate"}
                      >
                        {user.isActive ? (
                          <PowerOff className="h-3 w-3" />
                        ) : (
                          <Power className="h-3 w-3" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteUser(user)}
                        title="Delete user"
                      >
                        <Trash2 className="h-3 w-3 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No users found
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invite User Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={closeInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite User</DialogTitle>
            <DialogDescription>
              {tempPassword
                ? "User invited successfully! Share these credentials securely."
                : "Create a new user account"}
            </DialogDescription>
          </DialogHeader>

          {!tempPassword ? (
            <>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={inviteForm.email}
                    onChange={(e) =>
                      setInviteForm({ ...inviteForm, email: e.target.value })
                    }
                    placeholder="user@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="name">Name (Optional)</Label>
                  <Input
                    id="name"
                    value={inviteForm.name}
                    onChange={(e) =>
                      setInviteForm({ ...inviteForm, name: e.target.value })
                    }
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={inviteForm.role}
                    onValueChange={(value) =>
                      setInviteForm({ ...inviteForm, role: value })
                    }
                  >
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USER">User</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="organization">Organization (Optional)</Label>
                  <Select
                    value={inviteForm.organizationId}
                    onValueChange={(value) =>
                      setInviteForm({ ...inviteForm, organizationId: value })
                    }
                  >
                    <SelectTrigger id="organization">
                      <SelectValue placeholder="No organization" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__NONE__">No Organization</SelectItem>
                      {organizations.map((org) => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={closeInviteDialog}>
                  Cancel
                </Button>
                <Button onClick={handleInvite} disabled={inviting}>
                  {inviting ? "Inviting..." : "Invite User"}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-medium text-green-900 mb-3">
                    User has been invited successfully
                  </p>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-xs text-green-800">Email</Label>
                      <p className="text-sm font-medium">{inviteForm.email}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-green-800">
                        Temporary Password
                      </Label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="flex-1 text-sm bg-white px-3 py-2 rounded border border-green-300 font-mono">
                          {tempPassword}
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            navigator.clipboard.writeText(tempPassword);
                            alert("Password copied to clipboard");
                          }}
                        >
                          Copy
                        </Button>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-green-700 mt-3">
                    Make sure to share this password securely with the user.
                    They will need to change it on first login.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={closeInviteDialog}>Done</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and permissions
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div>
                <Label>Email</Label>
                <Input value={editingUser.email} disabled />
              </div>
              <div>
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label htmlFor="edit-role">Role</Label>
                <Select
                  value={editForm.role}
                  onValueChange={(value) =>
                    setEditForm({ ...editForm, role: value })
                  }
                >
                  <SelectTrigger id="edit-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">User</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-organization">Organization</Label>
                <Select
                  value={editForm.organizationId}
                  onValueChange={(value) =>
                    setEditForm({ ...editForm, organizationId: value })
                  }
                >
                  <SelectTrigger id="edit-organization">
                    <SelectValue placeholder="No organization" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__NONE__">No Organization</SelectItem>
                    {organizations.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-active"
                  checked={editForm.isActive}
                  onChange={(e) =>
                    setEditForm({ ...editForm, isActive: e.target.checked })
                  }
                  className="rounded"
                />
                <Label htmlFor="edit-active" className="cursor-pointer">
                  Active
                </Label>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>
                  Total Entries:{" "}
                  {editingUser._count.emissions +
                    editingUser._count.financedEmissions}
                </p>
                <p>Activity Count: {editingUser._count.activityLogs}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={updating}>
              {updating ? "Updating..." : "Update User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transfer Users Dialog */}
      <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer Users</DialogTitle>
            <DialogDescription>
              Transfer {selectedUserIds.size} user(s) to a different organization
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                Selected users will be moved to the target organization while
                keeping all their emission data.
              </p>
            </div>
            <div>
              <Label htmlFor="target-org">Target Organization *</Label>
              <Select
                value={transferTargetOrgId}
                onValueChange={setTransferTargetOrgId}
              >
                <SelectTrigger id="target-org">
                  <SelectValue placeholder="Select organization" />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="__NONE__">No Organization</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {selectedUsers.length > 0 && (
              <div>
                <Label className="text-sm text-muted-foreground mb-2">
                  Users to transfer:
                </Label>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {selectedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="text-sm px-3 py-2 bg-gray-50 rounded"
                    >
                      {user.name || user.email}
                      {user.organization && (
                        <span className="text-muted-foreground ml-2">
                          (from {user.organization.name})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setTransferDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={confirmBulkTransfer} disabled={transferring}>
              {transferring ? "Transferring..." : "Transfer Users"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Confirm Bulk Delete
            </DialogTitle>
            <DialogDescription>
              You are about to soft-delete {selectedUserIds.size} user(s)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm font-medium text-orange-900 mb-2">
                This action will:
              </p>
              <ul className="text-sm text-orange-800 space-y-1 list-disc list-inside">
                <li>Set users as inactive</li>
                <li>Remove organization associations</li>
                <li>Keep all emission data for audit trail</li>
                <li>Users can be restored by super admin</li>
              </ul>
            </div>
            {selectedUsers.length > 0 && (
              <div>
                <Label className="text-sm text-muted-foreground mb-2">
                  Users to delete:
                </Label>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {selectedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="text-sm px-3 py-2 bg-gray-50 rounded"
                    >
                      {user.name || user.email}
                      <span className="text-muted-foreground ml-2">
                        ({user._count.emissions + user._count.financedEmissions}{" "}
                        entries)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmBulkDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete Users"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
