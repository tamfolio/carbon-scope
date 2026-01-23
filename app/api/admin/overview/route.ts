import { NextResponse } from "next/server";
import { requireAdmin, isErrorResponse } from "@/lib/apiHelpers";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const authResult = await requireAdmin(request);
    if (isErrorResponse(authResult)) {
      return authResult;
    }

    const { user } = authResult;
    const isSuperAdmin = user.role === "SUPER_ADMIN";

    // Super admin sees all data, regular admin sees only their organization
    const orgFilter = isSuperAdmin ? {} : { organizationId: user.organizationId! };

    // Get date 30 days ago for comparison
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get total users and active users count
    const [totalUsers, activeUsers, inactiveUsers] = await Promise.all([
      prisma.user.count({
        where: orgFilter,
      }),
      prisma.user.count({
        where: { ...orgFilter, isActive: true },
      }),
      prisma.user.count({
        where: { ...orgFilter, isActive: false },
      }),
    ]);

    // Get previous month user counts for comparison
    const previousMonthUsers = await prisma.user.count({
      where: {
        ...orgFilter,
        createdAt: { lt: thirtyDaysAgo },
      },
    });

    const userGrowth = previousMonthUsers > 0
      ? ((totalUsers - previousMonthUsers) / previousMonthUsers) * 100
      : 0;

    // Get emissions statistics by scope
    const [scope1Emissions, scope2Emissions, scope3Emissions] = await Promise.all([
      prisma.emission.aggregate({
        where: { ...orgFilter, scope: "Scope 1" },
        _sum: { co2e: true },
        _count: true,
      }),
      prisma.emission.aggregate({
        where: { ...orgFilter, scope: "Scope 2" },
        _sum: { co2e: true },
        _count: true,
      }),
      prisma.emission.aggregate({
        where: { ...orgFilter, scope: "Scope 3" },
        _sum: { co2e: true },
        _count: true,
      }),
    ]);

    const totalEmissions = (scope1Emissions._sum.co2e || 0) +
      (scope2Emissions._sum.co2e || 0) +
      (scope3Emissions._sum.co2e || 0);

    // Get previous month emissions for comparison
    const previousMonthEmissions = await prisma.emission.aggregate({
      where: {
        ...orgFilter,
        createdAt: { lt: thirtyDaysAgo },
      },
      _sum: { co2e: true },
    });

    const currentMonthEmissions = await prisma.emission.aggregate({
      where: {
        ...orgFilter,
        createdAt: { gte: thirtyDaysAgo },
      },
      _sum: { co2e: true },
    });

    const emissionsGrowth = (previousMonthEmissions._sum.co2e || 0) > 0
      ? (((currentMonthEmissions._sum.co2e || 0) - (previousMonthEmissions._sum.co2e || 0)) / (previousMonthEmissions._sum.co2e || 0)) * 100
      : 0;

    // Get financed emissions statistics
    const financedEmissionsStats = await prisma.financedEmission.aggregate({
      where: orgFilter,
      _sum: { totalEmissions: true },
      _count: true,
    });

    // Get recent activity logs (last 20)
    const recentActivities = await prisma.activityLog.findMany({
      where: orgFilter,
      take: 20,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Get most active users (by activity count in last 30 days)
    const mostActiveUsers = await prisma.activityLog.groupBy({
      by: ["userId"],
      where: {
        ...orgFilter,
        createdAt: { gte: thirtyDaysAgo },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
      take: 5,
    });

    // Get user details for most active users
    const userIds = mostActiveUsers.map((u: { userId: string }) => u.userId);
    const userDetails = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    const mostActiveUsersWithDetails = mostActiveUsers.map(
      (activity: { userId: string; _count: { id: number } }) => {
        const user = userDetails.find((u: { id: string }) => u.id === activity.userId);
      return {
        user,
        activityCount: activity._count.id,
      };
      }
    );

    // Return overview data
    return NextResponse.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        inactive: inactiveUsers,
        growth: userGrowth,
      },
      emissions: {
        total: totalEmissions,
        byScope: {
          scope1: scope1Emissions._sum.co2e || 0,
          scope2: scope2Emissions._sum.co2e || 0,
          scope3: scope3Emissions._sum.co2e || 0,
        },
        counts: {
          scope1: scope1Emissions._count,
          scope2: scope2Emissions._count,
          scope3: scope3Emissions._count,
        },
        growth: emissionsGrowth,
      },
      financedEmissions: {
        total: financedEmissionsStats._sum.totalEmissions || 0,
        count: financedEmissionsStats._count,
      },
      recentActivities,
      mostActiveUsers: mostActiveUsersWithDetails,
    });
  } catch (error) {
    console.error("Error fetching admin overview:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
