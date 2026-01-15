import { NextResponse } from "next/server";
import { requireSuperAdmin, isErrorResponse } from "@/lib/apiHelpers";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const authResult = await requireSuperAdmin(request);
    if (isErrorResponse(authResult)) {
      return authResult;
    }

    // Get all organizations with user counts and emission stats
    const organizations = await prisma.organization.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            users: true,
            emissions: true,
            financedEmissions: true,
            activityLogs: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Get emissions totals for each organization
    const orgsWithStats = await Promise.all(
      organizations.map(async (org) => {
        const emissionsTotal = await prisma.emission.aggregate({
          where: { organizationId: org.id },
          _sum: { co2e: true },
        });

        const activeUsers = await prisma.user.count({
          where: { organizationId: org.id, isActive: true },
        });

        return {
          ...org,
          totalEmissions: emissionsTotal._sum.co2e || 0,
          activeUsers,
        };
      })
    );

    return NextResponse.json({ organizations: orgsWithStats });
  } catch (error) {
    console.error("Error fetching organizations:", error);
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

    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Organization name is required" },
        { status: 400 }
      );
    }

    // Check if organization already exists
    const existing = await prisma.organization.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Organization with this name already exists" },
        { status: 409 }
      );
    }

    const organization = await prisma.organization.create({
      data: {
        name,
        description: description || null,
      },
    });

    return NextResponse.json({ organization });
  } catch (error) {
    console.error("Error creating organization:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
