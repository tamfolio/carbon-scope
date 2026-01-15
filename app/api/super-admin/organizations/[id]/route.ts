import { NextResponse } from "next/server";
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

    const organization = await prisma.organization.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            isActive: true,
            lastLoginAt: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
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

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // Get emissions stats
    const emissionsStats = await prisma.emission.aggregate({
      where: { organizationId: id },
      _sum: { co2e: true },
      _count: true,
    });

    const emissionsByScope = await prisma.emission.groupBy({
      by: ["scope"],
      where: { organizationId: id },
      _sum: { co2e: true },
    });

    // Count active users
    const activeUsersCount = await prisma.user.count({
      where: { organizationId: id, isActive: true },
    });

    return NextResponse.json({
      organization: {
        ...organization,
        totalEmissions: emissionsStats._sum.co2e || 0,
        activeUsers: activeUsersCount,
        emissionsByScope: emissionsByScope.map((s) => ({
          scope: s.scope,
          total: s._sum.co2e || 0,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching organization:", error);
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

    const { id } = await params;
    const body = await request.json();
    const { name, description } = body;

    const organization = await prisma.organization.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
      },
    });

    return NextResponse.json({ organization });
  } catch (error) {
    console.error("Error updating organization:", error);
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

    // Fetch organization details before deletion
    const organization = await prisma.organization.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
      },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // Check if organization has users
    const userCount = await prisma.user.count({
      where: { organizationId: id },
    });

    if (userCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete organization with active users. Please remove all users first." },
        { status: 400 }
      );
    }

    // Log activity before deletion
    await createActivityLog({
      userId: adminUser.id,
      organizationId: null, // Organization will be deleted
      action: "ORGANIZATION_DELETED",
      entityType: "Organization",
      entityId: id,
      description: `Deleted organization ${organization.name}`,
      metadata: {
        organizationName: organization.name,
        organizationDescription: organization.description,
        deletedBy: adminUser.email,
      },
    });

    // Delete organization (cascade will delete related settings, emissions, etc.)
    await prisma.organization.delete({
      where: { id },
    });

    return NextResponse.json({
      message: `Organization "${organization.name}" deleted successfully`,
    });
  } catch (error) {
    console.error("Error deleting organization:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
