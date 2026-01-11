import { NextResponse } from "next/server";
import { requireSuperAdmin, isErrorResponse, createActivityLog } from "@/lib/apiHelpers";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const authResult = await requireSuperAdmin(request);
    if (isErrorResponse(authResult)) {
      return authResult;
    }

    const { user: adminUser } = authResult;

    // Parse request body
    const body = await request.json();
    const { userIds, operation, organizationId } = body;

    // Validate input
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: "userIds must be a non-empty array" },
        { status: 400 }
      );
    }

    if (!["activate", "deactivate", "delete", "transfer"].includes(operation)) {
      return NextResponse.json(
        { error: "Invalid operation. Must be one of: activate, deactivate, delete, transfer" },
        { status: 400 }
      );
    }

    if (operation === "transfer" && organizationId === undefined) {
      return NextResponse.json(
        { error: "organizationId is required for transfer operation (can be null)" },
        { status: 400 }
      );
    }

    // Validate target organization for transfer (only if not null)
    if (operation === "transfer" && organizationId !== null) {
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

    // Prevent admin from operating on themselves
    if (userIds.includes(adminUser.id)) {
      return NextResponse.json(
        { error: "You cannot perform bulk operations on your own account" },
        { status: 400 }
      );
    }

    // Process each user
    const results = await Promise.allSettled(
      userIds.map(async (userId) => {
        // Fetch user
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            email: true,
            role: true,
            isActive: true,
            organizationId: true,
          },
        });

        if (!user) {
          throw new Error(`User ${userId} not found`);
        }

        // Perform operation
        switch (operation) {
          case "activate":
            await prisma.user.update({
              where: { id: userId },
              data: { isActive: true },
            });
            await createActivityLog({
              userId: adminUser.id,
              organizationId: user.organizationId,
              action: "USER_ACTIVATED",
              entityType: "User",
              entityId: userId,
              description: `Bulk activated user ${user.email}`,
              metadata: {
                updatedBy: adminUser.email,
                bulkOperation: true,
              },
            });
            break;

          case "deactivate":
            await prisma.user.update({
              where: { id: userId },
              data: { isActive: false },
            });
            await createActivityLog({
              userId: adminUser.id,
              organizationId: user.organizationId,
              action: "USER_DEACTIVATED",
              entityType: "User",
              entityId: userId,
              description: `Bulk deactivated user ${user.email}`,
              metadata: {
                updatedBy: adminUser.email,
                bulkOperation: true,
              },
            });
            break;

          case "delete":
            await prisma.user.update({
              where: { id: userId },
              data: {
                isActive: false,
                organizationId: null,
              },
            });
            await createActivityLog({
              userId: adminUser.id,
              organizationId: user.organizationId,
              action: "USER_DELETED",
              entityType: "User",
              entityId: userId,
              description: `Bulk soft deleted user ${user.email}`,
              metadata: {
                userEmail: user.email,
                deletedBy: adminUser.email,
                previousOrganizationId: user.organizationId,
                bulkOperation: true,
              },
            });
            break;

          case "transfer":
            // Prevent transferring SUPER_ADMIN users to organizations
            if (user.role === "SUPER_ADMIN" && organizationId !== null) {
              throw new Error(`Cannot transfer SUPER_ADMIN user ${user.email} to an organization`);
            }

            await prisma.user.update({
              where: { id: userId },
              data: { organizationId },
            });

            // Log in source organization (if exists)
            if (user.organizationId) {
              await createActivityLog({
                userId: adminUser.id,
                organizationId: user.organizationId,
                action: "USER_TRANSFERRED",
                entityType: "User",
                entityId: userId,
                description: `Bulk transferred ${user.email} out of organization`,
                metadata: {
                  previousOrganizationId: user.organizationId,
                  newOrganizationId: organizationId,
                  transferredBy: adminUser.email,
                  bulkOperation: true,
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
                entityId: userId,
                description: `Bulk transferred ${user.email} into organization`,
                metadata: {
                  previousOrganizationId: user.organizationId,
                  newOrganizationId: organizationId,
                  transferredBy: adminUser.email,
                  bulkOperation: true,
                },
              });
            }
            break;
        }

        return { userId, status: "success" };
      })
    );

    // Aggregate results
    const success = results.filter(r => r.status === "fulfilled").length;
    const failed = results.filter(r => r.status === "rejected").length;
    const errors = results
      .filter((r): r is PromiseRejectedResult => r.status === "rejected")
      .map((r, index) => ({
        userId: userIds[index],
        error: r.reason.message || "Unknown error",
      }));

    // Create summary activity log
    await createActivityLog({
      userId: adminUser.id,
      organizationId: adminUser.organizationId,
      action: `BULK_${operation.toUpperCase()}`,
      entityType: "User",
      entityId: userIds.join(","),
      description: `Bulk ${operation} operation: ${success} succeeded, ${failed} failed`,
      metadata: {
        operation,
        totalUsers: userIds.length,
        successCount: success,
        failedCount: failed,
        errors,
        performedBy: adminUser.email,
      },
    });

    return NextResponse.json({
      success,
      failed,
      errors,
      message: `Bulk ${operation} completed: ${success} succeeded, ${failed} failed`,
    });
  } catch (error) {
    console.error("Error performing bulk operation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
