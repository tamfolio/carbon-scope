import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { requireAdmin, isErrorResponse, createActivityLog } from "@/lib/apiHelpers";
import { hashPassword, generateTemporaryPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const authResult = await requireAdmin(request);
    if (isErrorResponse(authResult)) {
      return authResult;
    }

    const { user } = authResult;
    const isSuperAdmin = user.role === "SUPER_ADMIN";

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";
    const status = searchParams.get("status") || "";

    // Build where clause
    const where: Prisma.UserWhereInput = isSuperAdmin
      ? {}
      : { organizationId: user.organizationId! };

    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
      ];
    }

    if (role && ["USER", "ADMIN", "SUPER_ADMIN"].includes(role)) {
      where.role = role;
    }

    if (status === "active") {
      where.isActive = true;
    } else if (status === "inactive") {
      where.isActive = false;
    }

    // Fetch users
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        invitedBy: true,
        organizationId: true,
        organization: isSuperAdmin ? {
          select: {
            id: true,
            name: true,
          },
        } : false,
        _count: {
          select: {
            emissions: true,
            financedEmissions: true,
            activityLogs: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const authResult = await requireAdmin(request);
    if (isErrorResponse(authResult)) {
      return authResult;
    }

    const { user: adminUser } = authResult;
    const isSuperAdmin = adminUser.role === "SUPER_ADMIN";

    // Parse request body
    const body = await request.json();
    const { email, name, role = "USER", sendEmail = false, organizationId: targetOrgId } = body;

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Determine organization ID
    let organizationId: string | null;
    if (isSuperAdmin) {
      // Super admin can create users for any organization or no organization (for SUPER_ADMIN users)
      organizationId = role === "SUPER_ADMIN" ? null : (targetOrgId || null);

      // If creating a regular user/admin, organizationId is required
      if (role !== "SUPER_ADMIN" && !organizationId) {
        return NextResponse.json(
          { error: "organizationId is required when creating USER or ADMIN" },
          { status: 400 }
        );
      }
    } else {
      // Regular admin can only create users in their own organization
      organizationId = adminUser.organizationId!;
    }

    // Validate role
    const allowedRoles = isSuperAdmin ? ["USER", "ADMIN", "SUPER_ADMIN"] : ["USER", "ADMIN"];
    if (!allowedRoles.includes(role)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${allowedRoles.join(", ")}` },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Generate temporary password
    const temporaryPassword = generateTemporaryPassword();
    const hashedPassword = await hashPassword(temporaryPassword);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email,
        name: name || null,
        password: hashedPassword,
        role,
        organizationId,
        invitedBy: adminUser.id,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    // Log activity
    await createActivityLog({
      userId: adminUser.id,
      organizationId: isSuperAdmin ? adminUser.organizationId : organizationId,
      action: "USER_INVITED",
      entityType: "User",
      entityId: newUser.id,
      description: `Invited user ${newUser.email} with role ${role}`,
      metadata: {
        email: newUser.email,
        role: newUser.role,
        invitedBy: adminUser.email,
      },
    });

    // TODO: Send email with credentials if sendEmail is true
    // This would require an email service integration

    return NextResponse.json({
      user: newUser,
      temporaryPassword: sendEmail ? undefined : temporaryPassword,
      message: sendEmail
        ? "User invited successfully. Credentials sent via email."
        : "User invited successfully. Please share the temporary password securely.",
    });
  } catch (error) {
    console.error("Error inviting user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
