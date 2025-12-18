import { NextResponse } from "next/server";
import { requireOrganization, isErrorResponse } from "@/lib/apiHelpers";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

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

    // Create PDF document
    const doc = new jsPDF();
    let yPosition = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Helper function to check if new page is needed
    const checkNewPage = (requiredSpace: number) => {
      if (yPosition + requiredSpace > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
        return true;
      }
      return false;
    };

    // Get template name
    const templateNames: Record<string, string> = {
      "comprehensive": "Comprehensive Sustainability Report",
      "ghg-protocol": "GHG Protocol Corporate Standard Report",
      "iso-14064": "ISO 14064-1:2018 GHG Report",
      "issb": "IFRS S2 Climate Disclosure Report",
      "tcfd": "TCFD Climate-Related Financial Disclosure"
    };
    const templateName = templateNames[template] || "Sustainability Report";

    // Title
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("CarbonScope", pageWidth / 2, yPosition, { align: "center" });
    yPosition += 10;

    doc.setFontSize(16);
    doc.text(templateName, pageWidth / 2, yPosition, { align: "center" });
    yPosition += 15;

    // Organization Info
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Organization: ${reportData.organization?.name || "N/A"}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Reporting Period: ${reportData.summary?.reportingPeriod || "N/A"}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, yPosition);
    yPosition += 10;

    // Note about charts
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100, 100, 100);
    doc.text("Note: Visual charts are available in the web interface. This PDF contains tabular data.", 20, yPosition);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    yPosition += 15;

    // Executive Summary Section
    checkNewPage(50);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Executive Summary", 20, yPosition);
    yPosition += 10;

    // Overall Summary Table
    autoTable(doc, {
      startY: yPosition,
      head: [["Metric", "Value", "Unit"]],
      body: [
        ["Grand Total (Combined)", (reportData.summary?.grandTotalTonnes || 0).toFixed(2), "tCO2e"],
        ["Operations Emissions", (reportData.summary?.totalCO2e || 0).toFixed(2), "kg CO2e"],
        ["Financed Emissions", (reportData.summary?.totalFinancedEmissionsTonnes || 0).toFixed(2), "tCO2e"],
      ],
      theme: "grid",
      headStyles: { fillColor: [37, 99, 235] },
    });
    yPosition = (doc as any).lastAutoTable.finalY + 15;

    // Operations Emissions Breakdown
    checkNewPage(50);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Operations Emissions Breakdown", 20, yPosition);
    yPosition += 10;

    autoTable(doc, {
      startY: yPosition,
      head: [["Metric", "Value", "Unit"]],
      body: [
        ["Scope 1 Emissions", (reportData.summary?.scope1 || 0).toFixed(2), "kg CO2e"],
        ["Scope 2 Emissions", (reportData.summary?.scope2 || 0).toFixed(2), "kg CO2e"],
        ["Scope 3 Emissions", (reportData.summary?.scope3 || 0).toFixed(2), "kg CO2e"],
        ["Total Data Points", reportData.summary?.totalEntries || 0, "entries"],
      ],
      theme: "striped",
      headStyles: { fillColor: [37, 99, 235] },
    });
    yPosition = (doc as any).lastAutoTable.finalY + 15;

    // Template-specific compliance statement
    checkNewPage(40);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");

    if (template === "ghg-protocol") {
      doc.text("GHG Protocol Compliance Statement", 20, yPosition);
      yPosition += 8;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("This report follows the GHG Protocol Corporate Accounting and Reporting Standard", 20, yPosition);
      yPosition += 6;
      doc.text("developed by the World Resources Institute (WRI) and World Business Council for", 20, yPosition);
      yPosition += 6;
      doc.text("Sustainable Development (WBCSD). Emissions are categorized by Scope 1, 2, and 3.", 20, yPosition);
      yPosition += 15;
    } else if (template === "iso-14064") {
      doc.text("ISO 14064-1:2018 Compliance Statement", 20, yPosition);
      yPosition += 8;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("This report aligns with ISO 14064-1:2018 specification for quantification and", 20, yPosition);
      yPosition += 6;
      doc.text("reporting of greenhouse gas emissions and removals at the organization level.", 20, yPosition);
      yPosition += 15;
    } else if (template === "issb") {
      doc.text("IFRS S2 Climate Disclosure", 20, yPosition);
      yPosition += 8;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("This report provides climate-related disclosures following IFRS Sustainability", 20, yPosition);
      yPosition += 6;
      doc.text("Disclosure Standard S2, enabling stakeholders to understand climate-related risks", 20, yPosition);
      yPosition += 6;
      doc.text("and opportunities affecting the organization's prospects.", 20, yPosition);
      yPosition += 15;
    } else if (template === "tcfd") {
      doc.text("TCFD Framework Alignment", 20, yPosition);
      yPosition += 8;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("This report addresses the Task Force on Climate-related Financial Disclosures", 20, yPosition);
      yPosition += 6;
      doc.text("(TCFD) recommendations across four pillars: Governance, Strategy, Risk Management,", 20, yPosition);
      yPosition += 6;
      doc.text("and Metrics & Targets.", 20, yPosition);
      yPosition += 15;
    }

    // Emissions by Scope Section
    checkNewPage(50);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Emissions by Scope", 20, yPosition);
    yPosition += 10;

    autoTable(doc, {
      startY: yPosition,
      head: [["Scope", "Total CO2e (kg)", "Count", "Percentage (%)"]],
      body: (reportData.emissions?.byScope || []).map((item: any) => [
        item.scope,
        (item.total || 0).toFixed(2),
        item.count,
        (item.percentage || 0).toFixed(2),
      ]),
      theme: "striped",
      headStyles: { fillColor: [37, 99, 235] },
    });
    yPosition = (doc as any).lastAutoTable.finalY + 15;

    // Emissions by Category Section
    checkNewPage(50);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Emissions by Category", 20, yPosition);
    yPosition += 10;

    autoTable(doc, {
      startY: yPosition,
      head: [["Category", "Scope", "Total CO2e (kg)", "Percentage (%)"]],
      body: (reportData.emissions?.byCategory || [])
        .slice(0, 15) // Top 15 categories
        .map((item: any) => [
          item.category,
          item.scope,
          (item.total || 0).toFixed(2),
          (item.percentage || 0).toFixed(2),
        ]),
      theme: "striped",
      headStyles: { fillColor: [37, 99, 235] },
    });
    yPosition = (doc as any).lastAutoTable.finalY + 15;

    // Top Emissions Sources Section
    checkNewPage(50);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Top Emissions Sources", 20, yPosition);
    yPosition += 10;

    autoTable(doc, {
      startY: yPosition,
      head: [["Source", "Total CO2e (kg)", "Count", "Percentage (%)"]],
      body: (reportData.emissions?.bySource || []).map((item: any) => [
        item.source,
        (item.total || 0).toFixed(2),
        item.count,
        (item.percentage || 0).toFixed(2),
      ]),
      theme: "striped",
      headStyles: { fillColor: [37, 99, 235] },
    });
    yPosition = (doc as any).lastAutoTable.finalY + 15;

    // Financed Emissions Section
    if (reportData.financedEmissions?.summary?.count > 0) {
      checkNewPage(60);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Financed Emissions Summary (in tonnes)", 20, yPosition);
      yPosition += 10;

      autoTable(doc, {
        startY: yPosition,
        head: [["Metric", "Value", "Unit"]],
        body: [
          ["Total Financed Emissions", (reportData.financedEmissions.summary.total || 0).toFixed(2), "tCO2e"],
          ["Scope 1", (reportData.financedEmissions.summary.scope1 || 0).toFixed(2), "tCO2e"],
          ["Scope 2", (reportData.financedEmissions.summary.scope2 || 0).toFixed(2), "tCO2e"],
          ["Scope 3", (reportData.financedEmissions.summary.scope3 || 0).toFixed(2), "tCO2e"],
          ["Total Investments", reportData.financedEmissions.summary.count || 0, "entries"],
        ],
        theme: "grid",
        headStyles: { fillColor: [147, 51, 234] },
      });
      yPosition = (doc as any).lastAutoTable.finalY + 15;

      // Financed Emissions by Sector
      if (reportData.financedEmissions?.bySector?.length > 0) {
        checkNewPage(50);
        doc.setFontSize(13);
        doc.setFont("helvetica", "bold");
        doc.text("Financed Emissions by Sector", 20, yPosition);
        yPosition += 10;

        autoTable(doc, {
          startY: yPosition,
          head: [["Sector", "Total CO2e (tonnes)", "Investment Amount", "Count"]],
          body: (reportData.financedEmissions.bySector || [])
            .slice(0, 10)
            .map((item: any) => [
              item.sector,
              (item.total || 0).toFixed(2),
              (item.investmentAmount || 0).toFixed(2),
              item.count,
            ]),
          theme: "striped",
          headStyles: { fillColor: [147, 51, 234] },
        });
        yPosition = (doc as any).lastAutoTable.finalY + 15;
      }
    }

    // Compliance & Data Quality Section
    checkNewPage(50);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Compliance & Data Quality", 20, yPosition);
    yPosition += 10;

    autoTable(doc, {
      startY: yPosition,
      head: [["Metric", "Score", "Unit"]],
      body: [
        ["Completeness Score", (reportData.compliance?.completenessScore || 0).toFixed(1), "%"],
        ["Data Quality Score", (reportData.compliance?.dataQualityScore || 0).toFixed(2), "PCAF Score"],
        ["Total Data Points", reportData.compliance?.totalDataPoints || 0, "entries"],
      ],
      theme: "grid",
      headStyles: { fillColor: [34, 197, 94] },
    });
    yPosition = (doc as any).lastAutoTable.finalY + 15;

    // User Activity Section
    if (reportData.users && reportData.users.length > 0) {
      checkNewPage(50);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("User Activity Summary", 20, yPosition);
      yPosition += 10;

      autoTable(doc, {
        startY: yPosition,
        head: [["User", "Role", "Total CO2e (kg)", "Entries"]],
        body: (reportData.users || [])
          .slice(0, 10)
          .map((item: any) => [
            item.userName || "Unknown",
            item.role,
            (item.totalCo2e || 0).toFixed(2),
            item.entriesCount + item.financedEntriesCount,
          ]),
        theme: "striped",
        headStyles: { fillColor: [37, 99, 235] },
      });
      yPosition = (doc as any).lastAutoTable.finalY + 15;
    }

    // Footer on last page
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Page ${i} of ${totalPages} | CarbonScope Report`,
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" }
      );
    }

    // Generate PDF buffer
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    // Return file as download
    const filename = `CarbonScope_Report_${new Date().toISOString().split('T')[0]}.pdf`;

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error generating PDF report:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF report" },
      { status: 500 }
    );
  }
}
