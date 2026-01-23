import { NextRequest, NextResponse } from "next/server";
import type { z } from "zod";
import { verifyToken } from "@/lib/auth";
import { EmissionInputSchema } from "@/lib/validations";

type EmissionInput = z.infer<typeof EmissionInputSchema>;

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
    const preview: EmissionInput[] = [];
    const errors: Array<{ row: number; message: string }> = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim());
      if (values.length === 0 || values.every((v) => !v)) continue;

      const record: Record<string, string> = {};
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
      } catch (error: unknown) {
        const message =
          error &&
          typeof error === "object" &&
          "errors" in error &&
          Array.isArray((error as { errors?: Array<{ message?: string }> }).errors) &&
          (error as { errors: Array<{ message?: string }> }).errors[0]?.message
            ? (error as { errors: Array<{ message?: string }> }).errors[0]?.message
            : "Validation error";
        errors.push({
          row: i + 1,
          message,
        });
      }
    }

    return NextResponse.json({ preview, errors });
  } catch (error: unknown) {
    console.error("Error parsing file:", error);
    const message = error instanceof Error ? error.message : "Failed to parse file";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

