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
    const organizationId = user.organizationId || "";
    const orgFilter = isSuperAdmin ? {} : { organizationId };

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "month";

    // Calculate date range based on period
    const now = new Date();
    const startDate = new Date();

    switch (period) {
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "quarter":
        startDate.setMonth(now.getMonth() - 3);
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }

    // Get emissions by user (top contributors)
    const emissionsByUser = await prisma.emission.groupBy({
      by: ["userId"],
      where: {
        ...orgFilter,
        createdAt: { gte: startDate },
      },
      _sum: {
        co2e: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          co2e: "desc",
        },
      },
      take: 10,
    });

    // Get user details for top contributors
    const userIds = emissionsByUser.map((e: { userId: string }) => e.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    const topContributors = emissionsByUser.map(
      (emission: {
        userId: string;
        _sum: { co2e: number | null };
        _count: { id: number };
      }) => {
        const user = users.find((u: { id: string }) => u.id === emission.userId);
      return {
        user,
        totalCo2e: emission._sum.co2e || 0,
        entryCount: emission._count.id,
        averageCo2e: (emission._sum.co2e || 0) / emission._count.id,
      };
      }
    );

    // Get emissions by category
    const emissionsByCategory = await prisma.emission.groupBy({
      by: ["category"],
      where: {
        ...orgFilter,
        createdAt: { gte: startDate },
      },
      _sum: {
        co2e: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          co2e: "desc",
        },
      },
    });

    // Get emissions by scope
    const emissionsByScope = await prisma.emission.groupBy({
      by: ["scope"],
      where: {
        ...orgFilter,
        createdAt: { gte: startDate },
      },
      _sum: {
        co2e: true,
      },
      _count: {
        id: true,
      },
    });

    // Get emissions trend over time (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(now.getMonth() - 12);

    const emissionsTrend = isSuperAdmin
      ? await prisma.$queryRaw<Array<{
          month: string;
          total: number;
          count: number;
        }>>`
          SELECT
            strftime('%Y-%m', date) as month,
            SUM(co2e) as total,
            COUNT(*) as count
          FROM Emission
          WHERE createdAt >= ${twelveMonthsAgo.toISOString()}
          GROUP BY strftime('%Y-%m', date)
          ORDER BY month ASC
        `
      : await prisma.$queryRaw<Array<{
          month: string;
          total: number;
          count: number;
        }>>`
          SELECT
            strftime('%Y-%m', date) as month,
            SUM(co2e) as total,
            COUNT(*) as count
          FROM Emission
          WHERE organizationId = ${organizationId}
            AND createdAt >= ${twelveMonthsAgo.toISOString()}
          GROUP BY strftime('%Y-%m', date)
          ORDER BY month ASC
        `;

    // Get financed emissions by sector (no date filter)
    const financedEmissionsBySector = await prisma.financedEmission.groupBy({
      by: ["sector"],
      where: orgFilter,
      _sum: {
        totalEmissions: true,
        scope1: true,
        scope2: true,
        scope3: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          totalEmissions: "desc",
        },
      },
    });

    // Get financed emissions by country (no date filter)
    const financedEmissionsByCountry = await prisma.financedEmission.groupBy({
      by: ["country"],
      where: orgFilter,
      _sum: {
        totalEmissions: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          totalEmissions: "desc",
        },
      },
      take: 10,
    });

    // Get user performance comparison
    const userPerformance = await prisma.user.findMany({
      where: {
        ...orgFilter,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        _count: {
          select: {
            emissions: true,
            financedEmissions: true,
          },
        },
      },
      take: 20,
    });

    // Get emissions sum for each user
    const userEmissionsPromises = userPerformance.map(
      async (u: {
        id: string;
        name: string | null;
        email: string;
        role: string;
        _count: { emissions: number; financedEmissions: number };
      }) => {
      const emissionsSum = await prisma.emission.aggregate({
        where: {
          userId: u.id,
          createdAt: { gte: startDate },
        },
        _sum: {
          co2e: true,
        },
      });

      return {
        user: {
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
        },
        totalCo2e: emissionsSum._sum.co2e || 0,
        entriesCount: u._count.emissions,
        financedEntriesCount: u._count.financedEmissions,
        averageCo2e: u._count.emissions > 0 ? (emissionsSum._sum.co2e || 0) / u._count.emissions : 0,
      };
      }
    );

    const userComparison = await Promise.all(userEmissionsPromises);

    // Calculate total organization emissions for the period
    const totalEmissions = await prisma.emission.aggregate({
      where: {
        ...orgFilter,
        createdAt: { gte: startDate },
      },
      _sum: {
        co2e: true,
      },
      _count: {
        id: true,
      },
    });

    // Calculate total financed emissions (no date filter)
    const totalFinancedEmissions = await prisma.financedEmission.aggregate({
      where: orgFilter,
      _sum: {
        totalEmissions: true,
      },
      _count: {
        id: true,
      },
    });

    // Calculate combined totals (financed emissions now in kg after migration)
    const operationsEmissionsKg = totalEmissions._sum.co2e || 0;
    const financedEmissionsKg = totalFinancedEmissions._sum.totalEmissions || 0; // Already in kg
    const grandTotalKg = operationsEmissionsKg + financedEmissionsKg;

    return NextResponse.json({
      period,
      startDate,
      endDate: now,
      totalEmissions: {
        // Operations only (for backward compatibility)
        co2e: operationsEmissionsKg,
        count: totalEmissions._count.id,
        // Combined totals (all in kg CO₂e)
        financedTonnes: financedEmissionsKg, // Name kept for compatibility, but value is in kg
        financedKg: financedEmissionsKg,
        grandTotalKg,
        grandTotalTonnes: grandTotalKg, // Name kept for compatibility, but value is in kg
      },
      topContributors,
      emissionsByCategory: emissionsByCategory.map(
        (e: {
          category: string;
          _sum: { co2e: number | null };
          _count: { id: number };
        }) => ({
          category: e.category,
          total: e._sum.co2e || 0,
          count: e._count.id,
          percentage: totalEmissions._sum.co2e
            ? ((e._sum.co2e || 0) / totalEmissions._sum.co2e) * 100
            : 0,
        })
      ),
      emissionsByScope: emissionsByScope.map(
        (e: {
          scope: string;
          _sum: { co2e: number | null };
          _count: { id: number };
        }) => ({
          scope: e.scope,
          total: e._sum.co2e || 0,
          count: e._count.id,
          percentage: totalEmissions._sum.co2e
            ? ((e._sum.co2e || 0) / totalEmissions._sum.co2e) * 100
            : 0,
        })
      ),
      emissionsTrend,
      financedEmissions: {
        bySector: financedEmissionsBySector.map(
          (e: {
            sector: string;
            _sum: {
              totalEmissions: number | null;
              scope1: number | null;
              scope2: number | null;
              scope3: number | null;
            };
            _count: { id: number };
          }) => ({
            sector: e.sector,
            total: e._sum.totalEmissions || 0,
            scope1: e._sum.scope1 || 0,
            scope2: e._sum.scope2 || 0,
            scope3: e._sum.scope3 || 0,
            count: e._count.id,
          })
        ),
        byCountry: financedEmissionsByCountry.map(
          (e: {
            country: string;
            _sum: { totalEmissions: number | null };
            _count: { id: number };
          }) => ({
            country: e.country,
            total: e._sum.totalEmissions || 0,
            count: e._count.id,
          })
        ),
      },
      userComparison: userComparison.sort(
        (a: { totalCo2e: number }, b: { totalCo2e: number }) =>
          b.totalCo2e - a.totalCo2e
      ),
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
