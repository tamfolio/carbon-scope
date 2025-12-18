"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Download } from "lucide-react";

export default function ReportsPage() {
  const router = useRouter();
  const [reportType, setReportType] = useState("emissions");
  const [format, setFormat] = useState("json");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [generating, setGenerating] = useState(false);

  const handleGenerateReport = async () => {
    setGenerating(true);
    try {
      const token = localStorage.getItem("cs_token");
      if (!token) {
        router.push("/login");
        return;
      }

      const params = new URLSearchParams({
        type: reportType,
        format,
      });

      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const response = await fetch(`/api/admin/reports?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401 || response.status === 403) {
        router.push("/dashboard");
        return;
      }

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || "Failed to generate report");
        return;
      }

      if (format === "csv") {
        // Download CSV file
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `report-${reportType}-${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        // Download JSON file
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: "application/json",
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `report-${reportType}-${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }

      alert("Report generated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to generate report");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Reports & Export</h1>
        <p className="text-gray-600 mt-2">
          Generate and download organization reports
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Generate Report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="report-type">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger id="report-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="emissions">Emissions Summary</SelectItem>
                  <SelectItem value="users">User Activity Report</SelectItem>
                  <SelectItem value="compliance">Compliance Report</SelectItem>
                  <SelectItem value="audit">Audit Trail</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                {reportType === "emissions" && "Detailed breakdown of all emissions data"}
                {reportType === "users" && "User activity and performance metrics"}
                {reportType === "compliance" && "Compliance and regulatory report"}
                {reportType === "audit" && "Complete audit trail of all activities"}
              </p>
            </div>

            <div>
              <Label htmlFor="format">Export Format</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger id="format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="start-date">Start Date (Optional)</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="end-date">End Date (Optional)</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <Button
              onClick={handleGenerateReport}
              disabled={generating}
              className="w-full"
            >
              <Download className="mr-2 h-4 w-4" />
              {generating ? "Generating..." : "Generate & Download Report"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Report Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2 flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Emissions Summary
              </h3>
              <p className="text-sm text-muted-foreground">
                Complete breakdown of all emissions data including scope, category, and source.
                Includes total emissions, entries by user, and time-based analysis.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2 flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                User Activity Report
              </h3>
              <p className="text-sm text-muted-foreground">
                Comprehensive overview of user activities including emissions entries,
                login history, and performance metrics. Useful for team management and tracking.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2 flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Compliance Report
              </h3>
              <p className="text-sm text-muted-foreground">
                Regulatory compliance report with emissions by scope, category breakdowns,
                and data quality metrics. Suitable for external audits and certifications.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2 flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Audit Trail
              </h3>
              <p className="text-sm text-muted-foreground">
                Complete audit log of all administrative actions including user management,
                role changes, and system modifications. Essential for security and compliance.
              </p>
            </div>

            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-2">Export Formats</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li><strong>JSON:</strong> Structured data format, ideal for data processing and integrations</li>
                <li><strong>CSV:</strong> Spreadsheet format, easy to open in Excel or Google Sheets</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
