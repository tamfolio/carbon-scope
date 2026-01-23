import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Get user from database to ensure they exist
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get("format") || "csv";
    const scope = searchParams.get("scope");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build query
    const where: Prisma.EmissionWhereInput = {
      userId: user.id,
    };

    if (scope && scope !== "all") {
      where.scope = scope;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    // Fetch emissions
    const emissions = await prisma.emission.findMany({
      where,
      orderBy: { date: "desc" },
    });

    if (format === "csv") {
      // Generate CSV
      const headers = [
        "ID",
        "Scope",
        "Category",
        "Activity",
        "Source",
        "Quantity",
        "Unit",
        "CO2e (kg)",
        "Date",
        "Notes",
        "Created At",
      ];

      const rows = emissions.map((e) => [
        e.id,
        e.scope,
        e.category,
        e.activity,
        e.source,
        e.quantity.toString(),
        e.unit,
        e.co2e.toString(),
        e.date.toISOString().split("T")[0],
        e.notes || "",
        e.createdAt.toISOString(),
      ]);

      const csvContent = [headers.join(","), ...rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))].join("\n");

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="emissions_export_${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    } else {
      // For Excel, return JSON for now (can be enhanced with xlsx library)
      return NextResponse.json({ emissions }, {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="emissions_export_${new Date().toISOString().split("T")[0]}.json"`,
        },
      });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to export data";
    console.error("Error exporting:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

