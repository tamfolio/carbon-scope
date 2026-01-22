import { NextResponse } from "next/server";
import { requireOrganization, isErrorResponse } from "@/lib/apiHelpers";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const authResult = await requireOrganization(request);
    if (isErrorResponse(authResult)) {
      return authResult;
    }

    const { user } = authResult;
    const organizationId = user.organizationId!;

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "month";
    const reportType = searchParams.get("type") || "comprehensive";
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    // Calculate date range
    let startDate: Date;
    let endDate = new Date();

    if (startDateParam && endDateParam) {
      startDate = new Date(startDateParam);
      endDate = new Date(endDateParam);
    } else {
      startDate = new Date();
      switch (period) {
        case "week":
          startDate.setDate(endDate.getDate() - 7);
          break;
        case "month":
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case "quarter":
          startDate.setMonth(endDate.getMonth() - 3);
          break;
        case "year":
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
        default:
          startDate.setMonth(endDate.getMonth() - 1);
      }
    }

    // Get organization details
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        id: true,
        name: true,
        description: true,
      },
    });

    // Get total emissions summary by scope
    const emissionsByScope = await prisma.emission.groupBy({
      by: ["scope"],
      where: {
        organizationId,
        date: { gte: startDate, lte: endDate },
      },
      _sum: {
        co2e: true,
      },
      _count: {
        id: true,
      },
    });

    const scope1 = emissionsByScope.find(e => e.scope === "Scope 1")?._sum.co2e || 0;
    const scope2 = emissionsByScope.find(e => e.scope === "Scope 2")?._sum.co2e || 0;
    const scope3 = emissionsByScope.find(e => e.scope === "Scope 3")?._sum.co2e || 0;
    const totalCO2e = scope1 + scope2 + scope3;

    // Get emissions by category
    const emissionsByCategory = await prisma.emission.groupBy({
      by: ["category", "scope"],
      where: {
        organizationId,
        date: { gte: startDate, lte: endDate },
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

    // Get emissions by source (top 10)
    const emissionsBySource = await prisma.emission.groupBy({
      by: ["source"],
      where: {
        organizationId,
        date: { gte: startDate, lte: endDate },
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

    // Get emissions trend (monthly breakdown)
    const emissionsTrendRaw = await prisma.$queryRaw<Array<{
      month: string;
      scope1: bigint;
      scope2: bigint;
      scope3: bigint;
      total: bigint;
      count: bigint;
    }>>`
      SELECT
        TO_CHAR(date, 'YYYY-MM') as month,
        COALESCE(SUM(CASE WHEN scope = 'Scope 1' THEN co2e ELSE 0 END), 0) as scope1,
        COALESCE(SUM(CASE WHEN scope = 'Scope 2' THEN co2e ELSE 0 END), 0) as scope2,
        COALESCE(SUM(CASE WHEN scope = 'Scope 3' THEN co2e ELSE 0 END), 0) as scope3,
        COALESCE(SUM(co2e), 0) as total,
        COUNT(*) as count
      FROM "Emission"
      WHERE "organizationId" = ${organizationId}
        AND date >= ${startDate.toISOString()}::timestamp
        AND date <= ${endDate.toISOString()}::timestamp
      GROUP BY TO_CHAR(date, 'YYYY-MM')
      ORDER BY month ASC
    `;

    // Convert BigInt to Number
    const emissionsTrend = emissionsTrendRaw.map(row => ({
      month: row.month,
      scope1: Number(row.scope1),
      scope2: Number(row.scope2),
      scope3: Number(row.scope3),
      total: Number(row.total),
      count: Number(row.count),
    }));

    // Get financed emissions summary (no date filter - use all financed emissions)
    const financedEmissionsTotal = await prisma.financedEmission.aggregate({
      where: {
        organizationId,
      },
      _sum: {
        totalEmissions: true,
        scope1: true,
        scope2: true,
        scope3: true,
      },
      _count: {
        id: true,
      },
    });

    // Get financed emissions by sector (no date filter)
    const financedEmissionsBySector = await prisma.financedEmission.groupBy({
      by: ["sector"],
      where: {
        organizationId,
      },
      _sum: {
        totalEmissions: true,
        scope1: true,
        scope2: true,
        scope3: true,
        investmentAmount: true,
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

    // Get financed emissions by investment type (no date filter)
    const financedEmissionsByType = await prisma.financedEmission.groupBy({
      by: ["investmentType"],
      where: {
        organizationId,
      },
      _sum: {
        totalEmissions: true,
        investmentAmount: true,
      },
      _count: {
        id: true,
      },
    });

    // Get data quality metrics for financed emissions (no date filter)
    const dataQualityMetrics = await prisma.financedEmission.groupBy({
      by: ["dataQualityScore"],
      where: {
        organizationId,
      },
      _count: {
        id: true,
      },
      orderBy: {
        dataQualityScore: "asc",
      },
    });

    // Get user activity summary
    const userActivity = await prisma.user.findMany({
      where: {
        organizationId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        _count: {
          select: {
            emissions: {
              where: {
                date: { gte: startDate, lte: endDate },
              },
            },
            financedEmissions: true,
          },
        },
      },
    });

    // Get emissions sum for each user
    const userEmissionsPromises = userActivity.map(async (u) => {
      const emissionsSum = await prisma.emission.aggregate({
        where: {
          userId: u.id,
          date: { gte: startDate, lte: endDate },
        },
        _sum: {
          co2e: true,
        },
      });

      return {
        userId: u.id,
        userName: u.name,
        userEmail: u.email,
        role: u.role,
        totalCo2e: emissionsSum._sum.co2e || 0,
        entriesCount: u._count.emissions,
        financedEntriesCount: u._count.financedEmissions,
      };
    });

    const userSummary = await Promise.all(userEmissionsPromises);

    // Calculate compliance metrics
    const totalEntries = emissionsByScope.reduce((acc, e) => acc + e._count.id, 0);
    const completenessScore = totalEntries > 0 ? 100 : 0; // Simplified - could be enhanced

    // Calculate waste metrics (derived from emissions data)
    const wasteCategories = emissionsByCategory.filter(e =>
      e.category.toLowerCase().includes('waste') ||
      e.category.toLowerCase().includes('disposal')
    );
    const totalWaste = wasteCategories.reduce((acc, e) => acc + (e._sum.co2e || 0), 0);

    // Calculate combined totals (financed emissions now in kg after migration)
    const totalFinancedEmissionsKg = financedEmissionsTotal._sum.totalEmissions || 0; // Already in kg
    const grandTotalKg = totalCO2e + totalFinancedEmissionsKg;

    return NextResponse.json({
      reportType,
      period,
      startDate,
      endDate,
      organization,
      summary: {
        // Operations emissions (in kg)
        totalCO2e,
        scope1,
        scope2,
        scope3,
        totalEntries,
        // Financed emissions (in kg CO₂e)
        totalFinancedEmissionsTonnes: totalFinancedEmissionsKg, // Name kept for compatibility, value in kg
        totalFinancedEmissionsKg,
        // Combined total (in kg)
        grandTotalKg,
        grandTotalTonnes: grandTotalKg, // Name kept for compatibility, value in kg
        reportingPeriod: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
      },
      emissions: {
        byScope: emissionsByScope.map(e => ({
          scope: e.scope,
          total: e._sum.co2e || 0,
          count: e._count.id,
          percentage: totalCO2e > 0 ? ((e._sum.co2e || 0) / totalCO2e) * 100 : 0,
        })),
        byCategory: emissionsByCategory.map(e => ({
          category: e.category,
          scope: e.scope,
          total: e._sum.co2e || 0,
          count: e._count.id,
          percentage: totalCO2e > 0 ? ((e._sum.co2e || 0) / totalCO2e) * 100 : 0,
        })),
        bySource: emissionsBySource.map(e => ({
          source: e.source,
          total: e._sum.co2e || 0,
          count: e._count.id,
          percentage: totalCO2e > 0 ? ((e._sum.co2e || 0) / totalCO2e) * 100 : 0,
        })),
        trend: emissionsTrend,
      },
      financedEmissions: {
        summary: {
          total: financedEmissionsTotal._sum.totalEmissions || 0,
          scope1: financedEmissionsTotal._sum.scope1 || 0,
          scope2: financedEmissionsTotal._sum.scope2 || 0,
          scope3: financedEmissionsTotal._sum.scope3 || 0,
          count: financedEmissionsTotal._count.id,
        },
        bySector: financedEmissionsBySector.map(e => ({
          sector: e.sector,
          total: e._sum.totalEmissions || 0,
          scope1: e._sum.scope1 || 0,
          scope2: e._sum.scope2 || 0,
          scope3: e._sum.scope3 || 0,
          investmentAmount: e._sum.investmentAmount || 0,
          count: e._count.id,
        })),
        byType: financedEmissionsByType.map(e => ({
          type: e.investmentType,
          total: e._sum.totalEmissions || 0,
          investmentAmount: e._sum.investmentAmount || 0,
          count: e._count.id,
        })),
        dataQuality: dataQualityMetrics.map(e => ({
          score: e.dataQualityScore,
          count: e._count.id,
        })),
      },
      waste: {
        totalWaste,
        categories: wasteCategories.map(e => ({
          category: e.category,
          total: e._sum.co2e || 0,
          count: e._count.id,
        })),
      },
      compliance: {
        completenessScore,
        dataQualityScore: dataQualityMetrics.length > 0
          ? dataQualityMetrics.reduce((acc, m) => acc + m.dataQualityScore * m._count.id, 0) /
            dataQualityMetrics.reduce((acc, m) => acc + m._count.id, 0)
          : 0,
        totalDataPoints: totalEntries + (financedEmissionsTotal._count.id || 0),
      },
      users: userSummary.sort((a, b) => b.totalCo2e - a.totalCo2e),
    });
  } catch (error) {
    console.error("Error fetching report data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
