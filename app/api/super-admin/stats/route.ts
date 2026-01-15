import { NextResponse } from "next/server";
import { requireSuperAdmin, isErrorResponse } from "@/lib/apiHelpers";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const authResult = await requireSuperAdmin(request);
    if (isErrorResponse(authResult)) {
      return authResult;
    }

    // Get system-wide statistics
    const [
      totalOrganizations,
      totalUsers,
      activeUsers,
      superAdmins,
      totalEmissions,
      totalFinancedEmissions,
    ] = await Promise.all([
      prisma.organization.count(),
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { role: "SUPER_ADMIN" } }),
      prisma.emission.aggregate({ _sum: { co2e: true }, _count: true }),
      prisma.financedEmission.aggregate({
        _sum: { totalEmissions: true },
        _count: true,
      }),
    ]);

    // Get top organizations by emissions
    const orgEmissions = await prisma.emission.groupBy({
      by: ["organizationId"],
      _sum: { co2e: true },
      _count: true,
      orderBy: { _sum: { co2e: "desc" } },
      take: 5,
    });

    const topOrgIds = orgEmissions
      .map((e) => e.organizationId)
      .filter((id): id is string => id !== null);

    const topOrgs = await prisma.organization.findMany({
      where: { id: { in: topOrgIds } },
      select: { id: true, name: true },
    });

    const topOrganizations = orgEmissions.map((emission) => {
      const org = topOrgs.find((o) => o.id === emission.organizationId);
      return {
        organizationId: emission.organizationId,
        organizationName: org?.name || "Unknown",
        totalEmissions: emission._sum.co2e || 0,
        entryCount: emission._count,
      };
    });

    // Get recent organizations
    const recentOrganizations = await prisma.organization.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        createdAt: true,
        _count: { select: { users: true } },
      },
    });

    // Get user growth (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentUsers = await prisma.user.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    });

    const previousUsers = totalUsers - recentUsers;
    const userGrowth = previousUsers > 0
      ? ((recentUsers / previousUsers) * 100)
      : 0;

    return NextResponse.json({
      overview: {
        totalOrganizations,
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        superAdmins,
        totalEmissions: totalEmissions._sum.co2e || 0,
        emissionsCount: totalEmissions._count,
        totalFinancedEmissions: totalFinancedEmissions._sum.totalEmissions || 0,
        financedEmissionsCount: totalFinancedEmissions._count,
        userGrowth,
        recentUsers,
      },
      topOrganizations,
      recentOrganizations,
    });
  } catch (error) {
    console.error("Error fetching super admin stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
