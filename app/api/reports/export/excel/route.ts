import { NextResponse } from "next/server";
import { requireOrganization, isErrorResponse } from "@/lib/apiHelpers";
import * as XLSX from "xlsx";

export async function GET(request: Request) {
  try {
    const authResult = await requireOrganization(request);
    if (isErrorResponse(authResult)) {
      return authResult;
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "month";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const template = searchParams.get("template") || "comprehensive";

    // Fetch report data from the main reports endpoint
    const baseUrl = new URL(request.url).origin;
    const reportUrl = new URL(`${baseUrl}/api/reports`);
    reportUrl.searchParams.set("period", period);
    if (startDate) reportUrl.searchParams.set("startDate", startDate);
    if (endDate) reportUrl.searchParams.set("endDate", endDate);

    const reportResponse = await fetch(reportUrl.toString(), {
      headers: {
        Authorization: request.headers.get("Authorization") || "",
      },
    });

    if (!reportResponse.ok) {
      throw new Error("Failed to fetch report data");
    }

    const reportData = await reportResponse.json();

    // Get template name
    const templateNames: Record<string, string> = {
      "comprehensive": "Comprehensive Report",
      "ghg-protocol": "GHG Protocol Report",
      "iso-14064": "ISO 14064-1:2018 Report",
      "issb": "IFRS S2 Report",
      "tcfd": "TCFD Report"
    };
    const templateName = templateNames[template] || "Sustainability Report";

    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Sheet 1: Summary
    const summaryData = [
      ["CarbonScope Sustainability Report"],
      ["Report Type", templateName],
      ["Organization", reportData.organization?.name || ""],
      ["Reporting Period", reportData.summary?.reportingPeriod || ""],
      ["Generated On", new Date().toLocaleString()],
      [],
      ["Overall Emissions Summary"],
      ["Metric", "Value", "Unit"],
      ["Grand Total (Combined)", reportData.summary?.grandTotalKg?.toFixed(2) || "0", "kg CO2e"],
      ["Grand Total (Combined)", reportData.summary?.grandTotalTonnes?.toFixed(2) || "0", "kg CO₂e"],
      [],
      ["Operations Emissions (Scope 1, 2, 3)"],
      ["Metric", "Value", "Unit"],
      ["Total Operations", reportData.summary?.totalCO2e?.toFixed(2) || "0", "kg CO2e"],
      ["Scope 1 Emissions", reportData.summary?.scope1?.toFixed(2) || "0", "kg CO2e"],
      ["Scope 2 Emissions", reportData.summary?.scope2?.toFixed(2) || "0", "kg CO2e"],
      ["Scope 3 Emissions", reportData.summary?.scope3?.toFixed(2) || "0", "kg CO2e"],
      [],
      ["Financed Emissions"],
      ["Total Financed", reportData.summary?.totalFinancedEmissionsTonnes?.toFixed(2) || "0", "kg CO₂e"],
      ["Total Financed", reportData.summary?.totalFinancedEmissionsKg?.toFixed(2) || "0", "kg CO2e"],
      [],
      ["Data Points"],
      ["Total Data Points", reportData.summary?.totalEntries || "0", "entries"],
      [],
      ["Compliance Metrics"],
      ["Metric", "Score", "Unit"],
      ["Completeness Score", reportData.compliance?.completenessScore?.toFixed(1) || "0", "%"],
      ["Data Quality Score", reportData.compliance?.dataQualityScore?.toFixed(2) || "0", "PCAF Score"],
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

    // Sheet 2: Emissions by Scope
    const scopeData = [
      ["Emissions by Scope"],
      ["Scope", "Total CO2e (kg)", "Count", "Percentage (%)"],
      ...(reportData.emissions?.byScope || []).map((item: any) => [
        item.scope,
        item.total?.toFixed(2) || "0",
        item.count,
        item.percentage?.toFixed(2) || "0",
      ]),
    ];
    const scopeSheet = XLSX.utils.aoa_to_sheet(scopeData);
    XLSX.utils.book_append_sheet(workbook, scopeSheet, "By Scope");

    // Sheet 3: Emissions by Category
    const categoryData = [
      ["Emissions by Category"],
      ["Category", "Scope", "Total CO2e (kg)", "Count", "Percentage (%)"],
      ...(reportData.emissions?.byCategory || []).map((item: any) => [
        item.category,
        item.scope,
        item.total?.toFixed(2) || "0",
        item.count,
        item.percentage?.toFixed(2) || "0",
      ]),
    ];
    const categorySheet = XLSX.utils.aoa_to_sheet(categoryData);
    XLSX.utils.book_append_sheet(workbook, categorySheet, "By Category");

    // Sheet 4: Emissions by Source
    const sourceData = [
      ["Top Emissions Sources"],
      ["Source", "Total CO2e (kg)", "Count", "Percentage (%)"],
      ...(reportData.emissions?.bySource || []).map((item: any) => [
        item.source,
        item.total?.toFixed(2) || "0",
        item.count,
        item.percentage?.toFixed(2) || "0",
      ]),
    ];
    const sourceSheet = XLSX.utils.aoa_to_sheet(sourceData);
    XLSX.utils.book_append_sheet(workbook, sourceSheet, "By Source");

    // Sheet 5: Emissions Trend
    const trendData = [
      ["Emissions Trend Over Time"],
      ["Month", "Scope 1 (kg)", "Scope 2 (kg)", "Scope 3 (kg)", "Total (kg)", "Count"],
      ...(reportData.emissions?.trend || []).map((item: any) => [
        item.month,
        Number(item.scope1)?.toFixed(2) || "0",
        Number(item.scope2)?.toFixed(2) || "0",
        Number(item.scope3)?.toFixed(2) || "0",
        Number(item.total)?.toFixed(2) || "0",
        item.count,
      ]),
    ];
    const trendSheet = XLSX.utils.aoa_to_sheet(trendData);
    XLSX.utils.book_append_sheet(workbook, trendSheet, "Trend");

    // Sheet 6: Financed Emissions Summary
    const financedSummaryData = [
      ["Financed Emissions Summary"],
      ["Note: Financed emissions are measured in kg (kg CO₂e)"],
      [],
      ["Metric", "Value", "Unit"],
      ["Total Financed Emissions", reportData.financedEmissions?.summary?.total?.toFixed(2) || "0", "kg CO₂e"],
      ["Scope 1", reportData.financedEmissions?.summary?.scope1?.toFixed(2) || "0", "kg CO₂e"],
      ["Scope 2", reportData.financedEmissions?.summary?.scope2?.toFixed(2) || "0", "kg CO₂e"],
      ["Scope 3", reportData.financedEmissions?.summary?.scope3?.toFixed(2) || "0", "kg CO₂e"],
      ["Total Investments", reportData.financedEmissions?.summary?.count || "0", "entries"],
      [],
      ["By Sector"],
      ["Sector", "Total CO2e (kg)", "Scope 1", "Scope 2", "Scope 3", "Investment Amount", "Count"],
      ...(reportData.financedEmissions?.bySector || []).map((item: any) => [
        item.sector,
        item.total?.toFixed(2) || "0",
        item.scope1?.toFixed(2) || "0",
        item.scope2?.toFixed(2) || "0",
        item.scope3?.toFixed(2) || "0",
        item.investmentAmount?.toFixed(2) || "0",
        item.count,
      ]),
    ];
    const financedSummarySheet = XLSX.utils.aoa_to_sheet(financedSummaryData);
    XLSX.utils.book_append_sheet(workbook, financedSummarySheet, "Financed Emissions");

    // Sheet 7: Financed Emissions by Type
    const financedTypeData = [
      ["Financed Emissions by Investment Type"],
      ["Investment Type", "Total CO2e (kg)", "Investment Amount", "Count"],
      ...(reportData.financedEmissions?.byType || []).map((item: any) => [
        item.type,
        item.total?.toFixed(2) || "0",
        item.investmentAmount?.toFixed(2) || "0",
        item.count,
      ]),
    ];
    const financedTypeSheet = XLSX.utils.aoa_to_sheet(financedTypeData);
    XLSX.utils.book_append_sheet(workbook, financedTypeSheet, "By Investment Type");

    // Sheet 8: User Activity
    const userData = [
      ["User Activity Summary"],
      ["User Name", "Email", "Role", "Total CO2e (kg)", "Entries", "Financed Entries"],
      ...(reportData.users || []).map((item: any) => [
        item.userName,
        item.userEmail,
        item.role,
        item.totalCo2e?.toFixed(2) || "0",
        item.entriesCount,
        item.financedEntriesCount,
      ]),
    ];
    const userSheet = XLSX.utils.aoa_to_sheet(userData);
    XLSX.utils.book_append_sheet(workbook, userSheet, "User Activity");

    // Sheet 9: Waste Data
    if (reportData.waste && reportData.waste.categories && reportData.waste.categories.length > 0) {
      const wasteData = [
        ["Waste Data"],
        ["Total Waste Emissions", reportData.waste.totalWaste?.toFixed(2) || "0", "kg CO2e"],
        [],
        ["Category", "Total CO2e (kg)", "Count"],
        ...(reportData.waste.categories || []).map((item: any) => [
          item.category,
          item.total?.toFixed(2) || "0",
          item.count,
        ]),
      ];
      const wasteSheet = XLSX.utils.aoa_to_sheet(wasteData);
      XLSX.utils.book_append_sheet(workbook, wasteSheet, "Waste Data");
    }

    // Sheet 10: Data Quality
    const dataQualityData = [
      ["Data Quality Metrics (PCAF Scores)"],
      ["PCAF Score", "Count", "Description"],
      ...(reportData.financedEmissions?.dataQuality || []).map((item: any) => {
        let description = "";
        switch (item.score) {
          case 1:
            description = "Highest quality - Verified data";
            break;
          case 2:
            description = "High quality - Primary data";
            break;
          case 3:
            description = "Medium quality - Average data";
            break;
          case 4:
            description = "Low quality - Proxy data";
            break;
          case 5:
            description = "Lowest quality - Estimated data";
            break;
        }
        return [item.score, item.count, description];
      }),
    ];
    const dataQualitySheet = XLSX.utils.aoa_to_sheet(dataQualityData);
    XLSX.utils.book_append_sheet(workbook, dataQualitySheet, "Data Quality");

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    // Return file as download
    const filename = `CarbonScope_Report_${new Date().toISOString().split('T')[0]}.xlsx`;

    return new NextResponse(excelBuffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error generating Excel report:", error);
    return NextResponse.json(
      { error: "Failed to generate Excel report" },
      { status: 500 }
    );
  }
}
