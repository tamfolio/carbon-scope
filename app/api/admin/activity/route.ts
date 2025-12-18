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
    const organizationId = user.organizationId!;

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "";
    const action = searchParams.get("action") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);

    // Build where clause
    const where: any = { organizationId };

    if (userId) {
      where.userId = userId;
    }

    if (action) {
      where.action = action;
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Fetch activity logs with pagination
    const [activityLogs, totalCount] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        take: limit,
        skip,
        orderBy: { createdAt: "desc" },
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
      }),
      prisma.activityLog.count({ where }),
    ]);

    // Get unique action types for filtering
    const actionTypes = await prisma.activityLog.findMany({
      where: { organizationId },
      select: { action: true },
      distinct: ["action"],
      orderBy: { action: "asc" },
    });

    // Get unique users who have activity logs for filtering
    const activeUserIds = await prisma.activityLog.findMany({
      where: { organizationId },
      select: { userId: true },
      distinct: ["userId"],
    });

    const activeUsers = await prisma.user.findMany({
      where: {
        id: { in: activeUserIds.map(a => a.userId) },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return NextResponse.json({
      activityLogs,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrevious: page > 1,
      },
      filters: {
        actionTypes: actionTypes.map(a => a.action),
        users: activeUsers,
      },
    });
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
