import { NextResponse } from "next/server";
import { requireAdmin, isErrorResponse, createActivityLog } from "@/lib/apiHelpers";
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
    const type = searchParams.get("type") || "emissions";
    const format = searchParams.get("format") || "json";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Validate format
    if (!["json", "csv"].includes(format)) {
      return NextResponse.json(
        { error: "Invalid format. Must be json or csv" },
        { status: 400 }
      );
    }

    // Build date filter
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate);
    }

    let reportData: any = null;
    let reportName = "";

    switch (type) {
      case "emissions":
        reportName = "Emissions Summary Report";
        const emissions = await prisma.emission.findMany({
          where: {
            ...orgFilter,
            ...(Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {}),
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { date: "desc" },
        });

        const emissionsSummary = {
          totalEmissions: emissions.reduce((sum, e) => sum + e.co2e, 0),
          totalEntries: emissions.length,
          byScope: {
            scope1: emissions.filter(e => e.scope === "Scope 1").reduce((sum, e) => sum + e.co2e, 0),
            scope2: emissions.filter(e => e.scope === "Scope 2").reduce((sum, e) => sum + e.co2e, 0),
            scope3: emissions.filter(e => e.scope === "Scope 3").reduce((sum, e) => sum + e.co2e, 0),
          },
        };

        reportData = {
          summary: emissionsSummary,
          details: emissions,
        };
        break;

      case "users":
        reportName = "User Activity Report";
        const users = await prisma.user.findMany({
          where: orgFilter,
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            lastLoginAt: true,
            createdAt: true,
            _count: {
              select: {
                emissions: true,
                financedEmissions: true,
                activityLogs: true,
              },
            },
          },
        });

        const usersWithStats = await Promise.all(
          users.map(async (u) => {
            const emissionsSum = await prisma.emission.aggregate({
              where: {
                userId: u.id,
                ...(Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {}),
              },
              _sum: { co2e: true },
            });

            return {
              ...u,
              totalCo2e: emissionsSum._sum.co2e || 0,
            };
          })
        );

        reportData = usersWithStats;
        break;

      case "compliance":
        reportName = "Compliance Report";
        // For super admin, we'll get all organizations, for regular admin just their org
        const organization = isSuperAdmin
          ? null
          : await prisma.organization.findUnique({
              where: { id: organizationId },
              include: {
                users: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    isActive: true,
                  },
                },
              },
            });

        const allEmissions = await prisma.emission.findMany({
          where: {
            ...orgFilter,
            ...(Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {}),
          },
        });

        const complianceData = {
          organization,
          period: {
            start: startDate || "All time",
            end: endDate || "Present",
          },
          emissions: {
            total: allEmissions.reduce((sum, e) => sum + e.co2e, 0),
            byScope: {
              scope1: allEmissions.filter(e => e.scope === "Scope 1").reduce((sum, e) => sum + e.co2e, 0),
              scope2: allEmissions.filter(e => e.scope === "Scope 2").reduce((sum, e) => sum + e.co2e, 0),
              scope3: allEmissions.filter(e => e.scope === "Scope 3").reduce((sum, e) => sum + e.co2e, 0),
            },
            categories: Array.from(
              new Set(allEmissions.map(e => e.category))
            ).map(category => ({
              name: category,
              total: allEmissions
                .filter(e => e.category === category)
                .reduce((sum, e) => sum + e.co2e, 0),
            })),
          },
          dataQuality: {
            totalEntries: allEmissions.length,
            entriesWithNotes: allEmissions.filter(e => e.notes).length,
          },
        };

        reportData = complianceData;
        break;

      case "audit":
        reportName = "Audit Trail Report";
        const activityLogs = await prisma.activityLog.findMany({
          where: {
            ...orgFilter,
            ...(Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {}),
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        });

        reportData = activityLogs;
        break;

      default:
        return NextResponse.json(
          { error: "Invalid report type. Must be emissions, users, compliance, or audit" },
          { status: 400 }
        );
    }

    // Log activity
    await createActivityLog({
      userId: user.id,
      organizationId: isSuperAdmin ? user.organizationId : organizationId,
      action: "REPORT_GENERATED",
      entityType: "Report",
      description: `Generated ${reportName} in ${format.toUpperCase()} format`,
      metadata: {
        reportType: type,
        format,
        startDate,
        endDate,
      },
    });

    // Return JSON format
    if (format === "json") {
      return NextResponse.json({
        reportName,
        generatedAt: new Date().toISOString(),
        generatedBy: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        parameters: {
          type,
          startDate,
          endDate,
        },
        data: reportData,
      });
    }

    // Return CSV format
    if (format === "csv") {
      let csv = "";

      // Convert to CSV based on type
      switch (type) {
        case "emissions":
          csv = "Date,Scope,Category,Activity,Source,Quantity,Unit,Emission Factor,CO2e,User Name,User Email,Notes\n";
          reportData.details.forEach((e: any) => {
            csv += `${e.date},${e.scope},${e.category},${e.activity},${e.source},${e.quantity},${e.unit},${e.emissionFactor},${e.co2e},"${e.user?.name || ""}","${e.user?.email || ""}","${e.notes || ""}"\n`;
          });
          break;

        case "users":
          csv = "Name,Email,Role,Active,Last Login,Created At,Emissions Count,Financed Emissions Count,Activity Count,Total CO2e\n";
          reportData.forEach((u: any) => {
            csv += `"${u.name || ""}","${u.email}","${u.role}","${u.isActive}","${u.lastLoginAt || ""}","${u.createdAt}",${u._count.emissions},${u._count.financedEmissions},${u._count.activityLogs},${u.totalCo2e}\n`;
          });
          break;

        case "audit":
          csv = "Date,Action,Entity Type,Entity ID,Description,User Name,User Email\n";
          reportData.forEach((a: any) => {
            csv += `${a.createdAt},"${a.action}","${a.entityType}","${a.entityId || ""}","${a.description}","${a.user?.name || ""}","${a.user?.email || ""}"\n`;
          });
          break;

        case "compliance":
          csv = `Compliance Report\n`;
          if (reportData.organization) {
            csv += `Organization: ${reportData.organization.name}\n`;
          } else {
            csv += `Organization: All Organizations (Super Admin View)\n`;
          }
          csv += `Period: ${reportData.period.start} to ${reportData.period.end}\n\n`;
          csv += `Total Emissions: ${reportData.emissions.total} kg CO2e\n`;
          csv += `Scope 1: ${reportData.emissions.byScope.scope1} kg CO2e\n`;
          csv += `Scope 2: ${reportData.emissions.byScope.scope2} kg CO2e\n`;
          csv += `Scope 3: ${reportData.emissions.byScope.scope3} kg CO2e\n\n`;
          csv += "Category,Total CO2e\n";
          reportData.emissions.categories.forEach((c: any) => {
            csv += `"${c.name}",${c.total}\n`;
          });
          break;
      }

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${reportName.replace(/ /g, "_")}_${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
