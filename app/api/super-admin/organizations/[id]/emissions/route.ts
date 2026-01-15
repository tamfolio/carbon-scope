import { NextResponse } from "next/server";
import { requireSuperAdmin, isErrorResponse } from "@/lib/apiHelpers";
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

    const { id: organizationId } = await params;

    // Verify organization exists
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // Fetch emissions with user details
    const emissions = await prisma.emission.findMany({
      where: { organizationId },
      select: {
        id: true,
        scope: true,
        category: true,
        activity: true,
        source: true,
        quantity: true,
        unit: true,
        co2e: true,
        date: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ emissions });
  } catch (error) {
    console.error("Error fetching emissions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
