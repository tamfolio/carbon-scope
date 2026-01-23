import { NextResponse } from "next/server";
import { requireAdmin, isErrorResponse, createActivityLog } from "@/lib/apiHelpers";
import { prisma } from "@/lib/prisma";

type UserUpdateData = {
  role?: string;
  isActive?: boolean;
  name?: string | null;
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdmin(request);
    if (isErrorResponse(authResult)) {
      return authResult;
    }

    const { user: adminUser } = authResult;
    const isSuperAdmin = adminUser.role === "SUPER_ADMIN";
    const { id } = await params;

    // Fetch user details
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        invitedBy: true,
        organizationId: true,
        _count: {
          select: {
            emissions: true,
            financedEmissions: true,
            activityLogs: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Verify user belongs to same organization (unless super admin)
    if (!isSuperAdmin && user.organizationId !== adminUser.organizationId) {
      return NextResponse.json(
        { error: "Forbidden - User belongs to a different organization" },
        { status: 403 }
      );
    }

    // Get recent activities by this user
    const activityFilter = isSuperAdmin
      ? { userId: id }
      : { userId: id, organizationId: adminUser.organizationId };

    const recentActivities = await prisma.activityLog.findMany({
      where: activityFilter,
      take: 10,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      user,
      recentActivities,
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdmin(request);
    if (isErrorResponse(authResult)) {
      return authResult;
    }

    const { user: adminUser } = authResult;
    const isSuperAdmin = adminUser.role === "SUPER_ADMIN";
    const { id } = await params;

    // Parse request body
    const body = await request.json();
    const { role, isActive, name } = body;

    // Fetch current user
    const currentUser = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        organizationId: true,
        role: true,
        isActive: true,
        name: true,
        email: true,
      },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Verify user belongs to same organization (unless super admin)
    if (!isSuperAdmin && currentUser.organizationId !== adminUser.organizationId) {
      return NextResponse.json(
        { error: "Forbidden - User belongs to a different organization" },
        { status: 403 }
      );
    }

    // Prevent admin from deactivating themselves
    if (id === adminUser.id && isActive === false) {
      return NextResponse.json(
        { error: "You cannot deactivate your own account" },
        { status: 400 }
      );
    }

    // Validate role if provided
    const allowedRoles = isSuperAdmin ? ["USER", "ADMIN", "SUPER_ADMIN"] : ["USER", "ADMIN"];
    if (role && !allowedRoles.includes(role)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${allowedRoles.join(", ")}` },
        { status: 400 }
      );
    }

    // Build update data
    const updateData: UserUpdateData = {};
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (name !== undefined) updateData.name = name;

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Log activity
    const logOrgId = isSuperAdmin ? adminUser.organizationId : currentUser.organizationId!;
    const changes = [];
    if (role !== undefined && role !== currentUser.role) {
      changes.push(`role from ${currentUser.role} to ${role}`);
      await createActivityLog({
        userId: adminUser.id,
        organizationId: logOrgId,
        action: "ROLE_CHANGED",
        entityType: "User",
        entityId: id,
        description: `Changed ${currentUser.email}'s role from ${currentUser.role} to ${role}`,
        metadata: {
          previousRole: currentUser.role,
          newRole: role,
          updatedBy: adminUser.email,
        },
      });
    }

    if (isActive !== undefined && isActive !== currentUser.isActive) {
      changes.push(`status to ${isActive ? "active" : "inactive"}`);
      await createActivityLog({
        userId: adminUser.id,
        organizationId: logOrgId,
        action: isActive ? "USER_ACTIVATED" : "USER_DEACTIVATED",
        entityType: "User",
        entityId: id,
        description: `${isActive ? "Activated" : "Deactivated"} user ${currentUser.email}`,
        metadata: {
          previousStatus: currentUser.isActive,
          newStatus: isActive,
          updatedBy: adminUser.email,
        },
      });
    }

    if (name !== undefined && name !== currentUser.name) {
      changes.push(`name from ${currentUser.name || "null"} to ${name}`);
      await createActivityLog({
        userId: adminUser.id,
        organizationId: logOrgId,
        action: "USER_UPDATED",
        entityType: "User",
        entityId: id,
        description: `Updated ${currentUser.email}'s name`,
        metadata: {
          previousName: currentUser.name,
          newName: name,
          updatedBy: adminUser.email,
        },
      });
    }

    return NextResponse.json({
      user: updatedUser,
      message: `User updated successfully${changes.length > 0 ? ": " + changes.join(", ") : ""}`,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdmin(request);
    if (isErrorResponse(authResult)) {
      return authResult;
    }

    const { user: adminUser } = authResult;
    const isSuperAdmin = adminUser.role === "SUPER_ADMIN";
    const { id } = await params;

    // Fetch user to delete
    const userToDelete = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        organizationId: true,
      },
    });

    if (!userToDelete) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Verify user belongs to same organization (unless super admin)
    if (!isSuperAdmin && userToDelete.organizationId !== adminUser.organizationId) {
      return NextResponse.json(
        { error: "Forbidden - User belongs to a different organization" },
        { status: 403 }
      );
    }

    // Prevent admin from deleting themselves
    if (id === adminUser.id) {
      return NextResponse.json(
        { error: "You cannot delete your own account" },
        { status: 400 }
      );
    }

    // Remove user from organization (soft delete - keep data but remove organization link)
    await prisma.user.update({
      where: { id },
      data: {
        organizationId: null,
        isActive: false,
      },
    });

    // Log activity
    const logOrgId = isSuperAdmin ? adminUser.organizationId : userToDelete.organizationId;
    await createActivityLog({
      userId: adminUser.id,
      organizationId: logOrgId,
      action: "USER_REMOVED",
      entityType: "User",
      entityId: id,
      description: `Removed user ${userToDelete.email} from organization`,
      metadata: {
        email: userToDelete.email,
        removedBy: adminUser.email,
      },
    });

    return NextResponse.json({
      message: "User removed from organization successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
