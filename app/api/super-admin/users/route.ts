import { NextResponse } from "next/server";
import { requireSuperAdmin, isErrorResponse, createActivityLog } from "@/lib/apiHelpers";
import { hashPassword, generateTemporaryPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const authResult = await requireSuperAdmin(request);
    if (isErrorResponse(authResult)) {
      return authResult;
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const organizationId = searchParams.get("organizationId") || "";
    const role = searchParams.get("role") || "";
    const status = searchParams.get("status") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
      ];
    }

    if (organizationId && organizationId !== "all") {
      where.organizationId = organizationId;
    }

    if (role && ["USER", "ADMIN", "SUPER_ADMIN"].includes(role)) {
      where.role = role;
    }

    if (status === "active") {
      where.isActive = true;
    } else if (status === "inactive") {
      where.isActive = false;
    }

    // Determine sort field and order
    const orderBy: any = {};
    if (["name", "email", "createdAt", "lastLoginAt"].includes(sortBy)) {
      orderBy[sortBy] = sortOrder === "asc" ? "asc" : "desc";
    } else {
      orderBy.createdAt = "desc";
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch total count
    const total = await prisma.user.count({ where });

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
        updatedAt: true,
        invitedBy: true,
        organizationId: true,
        organization: {
          select: {
            id: true,
            name: true,
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
      orderBy,
      skip,
      take: limit,
    });

    // Calculate summary stats
    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({ where: { isActive: true } });

    // Get users by organization
    const byOrganization = await prisma.user.groupBy({
      by: ['organizationId'],
      _count: {
        id: true,
      },
    });

    return NextResponse.json({
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      summary: {
        totalUsers,
        activeUsers,
        byOrganization: byOrganization.map(org => ({
          organizationId: org.organizationId,
          count: org._count.id,
        })),
      },
    });
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
    const authResult = await requireSuperAdmin(request);
    if (isErrorResponse(authResult)) {
      return authResult;
    }

    const { user: adminUser } = authResult;

    // Parse request body
    const body = await request.json();
    const { email, name, role = "USER", organizationId } = body;

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Validate role
    if (!["USER", "ADMIN", "SUPER_ADMIN"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be one of: USER, ADMIN, SUPER_ADMIN" },
        { status: 400 }
      );
    }

    // Validate organization
    if (role === "SUPER_ADMIN" && organizationId !== null) {
      return NextResponse.json(
        { error: "Super admin users cannot belong to an organization" },
        { status: 400 }
      );
    }

    if (role !== "SUPER_ADMIN" && !organizationId) {
      return NextResponse.json(
        { error: "Organization is required for USER and ADMIN roles" },
        { status: 400 }
      );
    }

    // Validate organization exists
    if (organizationId) {
      const organization = await prisma.organization.findUnique({
        where: { id: organizationId },
      });

      if (!organization) {
        return NextResponse.json(
          { error: "Organization not found" },
          { status: 404 }
        );
      }
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
        organizationId: true,
        createdAt: true,
      },
    });

    // Log activity
    await createActivityLog({
      userId: adminUser.id,
      organizationId: organizationId,
      action: "USER_INVITED",
      entityType: "User",
      entityId: newUser.id,
      description: `Invited user ${newUser.email} with role ${role}`,
      metadata: {
        email: newUser.email,
        role: newUser.role,
        organizationId: organizationId,
        invitedBy: adminUser.email,
      },
    });

    return NextResponse.json({
      user: newUser,
      temporaryPassword,
      message: "User invited successfully. Please share the temporary password securely.",
    });
  } catch (error) {
    console.error("Error inviting user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
