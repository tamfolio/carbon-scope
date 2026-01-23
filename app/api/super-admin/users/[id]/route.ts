import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { requireSuperAdmin, isErrorResponse, createActivityLog } from "@/lib/apiHelpers";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireSuperAdmin(request);
    if (isErrorResponse(authResult)) {
      return authResult;
    }

    const { id } = await params;

    // Fetch user details with organization
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
        organization: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
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

    // Get recent activities by this user
    const recentActivities = await prisma.activityLog.findMany({
      where: { userId: id },
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
    const authResult = await requireSuperAdmin(request);
    if (isErrorResponse(authResult)) {
      return authResult;
    }

    const { user: adminUser } = authResult;
    const { id } = await params;

    // Parse request body
    const body = await request.json();
    const { role, isActive, name, organizationId } = body;

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

    // Prevent super admin from modifying their own account
    if (id === adminUser.id && isActive === false) {
      return NextResponse.json(
        { error: "You cannot deactivate your own account" },
        { status: 400 }
      );
    }

    // Validate role if provided
    if (role && !["USER", "ADMIN", "SUPER_ADMIN"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be one of: USER, ADMIN, SUPER_ADMIN" },
        { status: 400 }
      );
    }

    // Validate organization transfer
    if (organizationId !== undefined && organizationId !== currentUser.organizationId) {
      // Prevent transferring SUPER_ADMIN users to organizations
      if (currentUser.role === "SUPER_ADMIN" && organizationId !== null) {
        return NextResponse.json(
          { error: "Super admin users cannot belong to organizations" },
          { status: 400 }
        );
      }

      // Validate target organization exists
      if (organizationId !== null) {
        const targetOrg = await prisma.organization.findUnique({
          where: { id: organizationId },
        });

        if (!targetOrg) {
          return NextResponse.json(
            { error: "Target organization not found" },
            { status: 404 }
          );
        }
      }
    }

    // Build update data
    const updateData: Prisma.UserUpdateInput = {};
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (name !== undefined) updateData.name = name;
    if (organizationId !== undefined) updateData.organizationId = organizationId;

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
        organizationId: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Log activities
    const changes = [];

    if (role !== undefined && role !== currentUser.role) {
      changes.push(`role from ${currentUser.role} to ${role}`);
      await createActivityLog({
        userId: adminUser.id,
        organizationId: currentUser.organizationId,
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
        organizationId: currentUser.organizationId,
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
        organizationId: currentUser.organizationId,
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

    // Log organization transfer
    if (organizationId !== undefined && organizationId !== currentUser.organizationId) {
      changes.push(`organization transfer`);

      // Log in source organization (if exists)
      if (currentUser.organizationId) {
        await createActivityLog({
          userId: adminUser.id,
          organizationId: currentUser.organizationId,
          action: "USER_TRANSFERRED",
          entityType: "User",
          entityId: id,
          description: `Transferred ${currentUser.email} out of organization`,
          metadata: {
            previousOrganizationId: currentUser.organizationId,
            newOrganizationId: organizationId,
            transferredBy: adminUser.email,
          },
        });
      }

      // Log in target organization (if exists)
      if (organizationId) {
        await createActivityLog({
          userId: adminUser.id,
          organizationId: organizationId,
          action: "USER_TRANSFERRED",
          entityType: "User",
          entityId: id,
          description: `Transferred ${currentUser.email} into organization`,
          metadata: {
            previousOrganizationId: currentUser.organizationId,
            newOrganizationId: organizationId,
            transferredBy: adminUser.email,
          },
        });
      }
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
    const authResult = await requireSuperAdmin(request);
    if (isErrorResponse(authResult)) {
      return authResult;
    }

    const { user: adminUser } = authResult;
    const { id } = await params;

    // Fetch user to delete
    const userToDelete = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        organizationId: true,
      },
    });

    if (!userToDelete) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Prevent admin from deleting themselves
    if (id === adminUser.id) {
      return NextResponse.json(
        { error: "You cannot delete your own account" },
        { status: 400 }
      );
    }

    // Soft delete - remove from organization and deactivate
    await prisma.user.update({
      where: { id },
      data: {
        organizationId: null,
        isActive: false,
      },
    });

    // Log activity
    await createActivityLog({
      userId: adminUser.id,
      organizationId: userToDelete.organizationId,
      action: "USER_DELETED",
      entityType: "User",
      entityId: id,
      description: `Soft deleted user ${userToDelete.email}`,
      metadata: {
        userEmail: userToDelete.email,
        userName: userToDelete.name,
        deletedBy: adminUser.email,
        previousOrganizationId: userToDelete.organizationId,
      },
    });

    return NextResponse.json({
      message: `User ${userToDelete.email} has been soft deleted (deactivated and removed from organization)`,
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
