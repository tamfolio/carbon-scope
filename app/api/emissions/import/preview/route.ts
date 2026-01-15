import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { EmissionInputSchema, BulkEmissionImportSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Read file content
    const text = await file.text();
    const lines = text.split("\n").filter((line) => line.trim());

    if (lines.length < 2) {
      return NextResponse.json({ error: "File must contain at least a header and one data row" }, { status: 400 });
    }

    // Parse CSV
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const preview: any[] = [];
    const errors: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim());
      if (values.length === 0 || values.every((v) => !v)) continue;

      const record: any = {};
      headers.forEach((header, idx) => {
        record[header] = values[idx] || "";
      });

      // Validate record
      try {
        const validated = EmissionInputSchema.parse({
          scope: record.scope || record["emission scope"],
          category: record.category,
          activity: record.activity,
          source: record.source || record["emission source"],
          quantity: parseFloat(record.quantity) || 0,
          unit: record.unit,
          emissionFactorId: record.emissionfactorid || record["emission factor id"] || record.emissionfactorid,
          date: record.date ? new Date(record.date) : new Date(),
          notes: record.notes || "",
        });

        preview.push(validated);
      } catch (error: any) {
        errors.push({
          row: i + 1,
          message: error.errors?.[0]?.message || "Validation error",
        });
      }
    }

    return NextResponse.json({ preview, errors });
  } catch (error: any) {
    console.error("Error parsing file:", error);
    return NextResponse.json({ error: error.message || "Failed to parse file" }, { status: 500 });
  }
}

