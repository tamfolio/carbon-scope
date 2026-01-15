"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Upload,
  Download,
  CheckCircle,
  AlertCircle,
  Loader2,
  FileSpreadsheet,
  X,
  AlertTriangle,
  Info,
  FileDown,
  History,
  Copy,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { emissionCategories, emissionFactors } from "@/lib/emissionFactors";
import { assessDataQuality } from "@/lib/activityHelpers";

export default function DataManagementPage() {
  // State for alerts
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // State for bulk import
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<
    Array<{
      scope: string;
      category: string;
      activity: string;
      source: string;
      quantity: number;
      unit: string;
      date: string;
      notes?: string;
    }>
  >([]);
  const [importErrors, setImportErrors] = useState<
    Array<{ row: number; message: string }>
  >([]);
  const [importing, setImporting] = useState(false);
  const [importHistory, setImportHistory] = useState<
    Array<{ filename: string; records: number; date: string; status: string }>
  >([]);

  // State for batch operations
  const [selectedEmissions, setSelectedEmissions] = useState<string[]>([]);
  const [batchMode, setBatchMode] = useState(false);

  // State for data quality
  const [qualityScores, setQualityScores] = useState<
    Record<
      string,
      {
        score: number;
        level: string;
        issues: string[];
        recommendations: string[];
      }
    >
  >({});

  // State for emissions data
  const [emissions, setEmissions] = useState<any[]>([]);
  const [filteredEmissions, setFilteredEmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load emissions on mount
  useEffect(() => {
    loadEmissions();
  }, []);

  // Load emissions from API
  const loadEmissions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("cs_token");
      const response = await fetch("/api/emissions?limit=100", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEmissions(data.emissions);
        setFilteredEmissions(data.emissions);
      } else {
        showAlert("error", "Failed to load emissions data");
      }
    } catch {
      showAlert("error", "Failed to load emissions data");
    } finally {
      setLoading(false);
    }
  };

  // Show alert
  const showAlert = (type: "success" | "error", message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  // Handle file selection for bulk import
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    setImportPreview([]);
    setImportErrors([]);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const token = localStorage.getItem("cs_token");
      const response = await fetch("/api/emissions/import/preview", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setImportPreview(data.preview || []);
        setImportErrors(data.errors || []);
      } else {
        const error = await response.json();
        showAlert("error", error.error || "Failed to parse file");
      }
    } catch (error) {
      console.error("Error parsing file:", error);
      showAlert("error", "Failed to parse file. Please check the format.");
    }
  };

  // Handle bulk import
  const handleBulkImport = async () => {
    if (!importFile || importPreview.length === 0 || importErrors.length > 0) {
      return;
    }

    setImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", importFile);

      const token = localStorage.getItem("cs_token");
      const response = await fetch("/api/emissions/import", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        showAlert(
          "success",
          `Successfully imported ${
            data.imported || importPreview.length
          } records`
        );

        // Add to import history
        setImportHistory([
          {
            filename: importFile.name,
            records: data.imported || importPreview.length,
            date: new Date().toISOString(),
            status: "success",
          },
          ...importHistory,
        ]);

        // Reset import state
        setImportFile(null);
        setImportPreview([]);
        setImportErrors([]);

        // Reload emissions
        loadEmissions();
      } else {
        const error = await response.json();
        showAlert("error", error.error || "Failed to import records");
      }
    } catch (error) {
      console.error("Error importing:", error);
      showAlert("error", "Failed to import records");
    } finally {
      setImporting(false);
    }
  };

  // Download template
  const downloadTemplate = () => {
    const headers = [
      "scope",
      "category",
      "activity",
      "source",
      "quantity",
      "unit",
      "emissionFactorId",
      "date",
      "notes",
    ];
    const csvContent = headers.join(",") + "\n";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "emissions_import_template.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle export
  const handleExport = async () => {
    try {
      const token = localStorage.getItem("cs_token");
      const response = await fetch("/api/emissions/export?format=csv", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `emissions_export_${
          new Date().toISOString().split("T")[0]
        }.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        showAlert("success", "Export completed successfully");
      } else {
        showAlert("error", "Failed to export data");
      }
    } catch (error) {
      console.error("Error exporting:", error);
      showAlert("error", "Failed to export data");
    }
  };

  // Assess all data quality
  const assessAllDataQuality = () => {
    const scores: Record<
      string,
      {
        score: number;
        level: string;
        issues: string[];
        recommendations: string[];
      }
    > = {};
    filteredEmissions.forEach((emission) => {
      const factor = emissionFactors.find(
        (f) =>
          f.scope === emission.scope &&
          f.category === emission.category &&
          f.source === emission.source
      );
      if (factor) {
        const quality = assessDataQuality({
          quantity: emission.quantity,
          emissionFactorId: factor.id,
          date: new Date(emission.date),
          activity: emission.activity,
          notes: emission.notes,
        });
        scores[emission.id] = quality;
      }
    });
    setQualityScores(scores);
    showAlert("success", "Data quality assessment completed");
  };

  // Handle batch delete
  const handleBatchDelete = async () => {
    if (selectedEmissions.length === 0) return;
    if (
      !confirm(
        `Are you sure you want to delete ${selectedEmissions.length} record(s)?`
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("cs_token");
      let successCount = 0;
      let failCount = 0;

      for (const id of selectedEmissions) {
        const response = await fetch(`/api/emissions/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          successCount++;
        } else {
          failCount++;
        }
      }

      if (successCount > 0) {
        showAlert("success", `Successfully deleted ${successCount} record(s)`);
        setSelectedEmissions([]);
        setBatchMode(false);
        loadEmissions();
        // Dispatch event to notify other components (like dashboard)
        window.dispatchEvent(new CustomEvent("emissionsUpdated"));
      }
      if (failCount > 0) {
        showAlert("error", `Failed to delete ${failCount} record(s)`);
      }
    } catch (error) {
      console.error("Error in batch delete:", error);
      showAlert("error", "Failed to delete records");
    }
  };

  // Detect duplicates
  const detectDuplicates = () => {
    const duplicates: { emission: any; matches: any[] }[] = [];
    const checked = new Set<string>();

    filteredEmissions.forEach((emission) => {
      if (checked.has(emission.id)) return;

      const matches = filteredEmissions.filter(
        (e) =>
          e.id !== emission.id &&
          e.scope === emission.scope &&
          e.category === emission.category &&
          e.source === emission.source &&
          Math.abs(e.quantity - emission.quantity) < 0.01 &&
          new Date(e.date).getTime() === new Date(emission.date).getTime()
      );

      if (matches.length > 0) {
        duplicates.push({ emission, matches });
        checked.add(emission.id);
        matches.forEach((m) => checked.add(m.id));
      }
    });

    if (duplicates.length > 0) {
      const message = `Found ${duplicates.length} potential duplicate(s). Check the console for details.`;
      showAlert("error", message);
      console.log("Duplicates found:", duplicates);
    } else {
      showAlert("success", "No duplicates found");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Data Management
          </h2>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Import, export, and manage your emissions data
          </p>
        </div>

        {/* Alert */}
        {alert && (
          <Alert variant={alert.type === "error" ? "destructive" : "default"}>
            {alert.type === "success" ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>{alert.message}</AlertDescription>
          </Alert>
        )}

        {/* Data Management Tabs */}
        <Tabs defaultValue="import" className="w-full">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4">
                <div>
                  <CardTitle>Data Management Tools</CardTitle>
                  <CardDescription>
                    Import, export, and manage your emissions data
                  </CardDescription>
                </div>
                <div className="overflow-x-auto -mx-2 px-2 pb-2">
                  <TabsList className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2 h-auto">
                    <TabsTrigger value="import" className="text-xs sm:text-sm">
                      <Upload className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      Import
                    </TabsTrigger>
                    <TabsTrigger value="export" className="text-xs sm:text-sm">
                      <Download className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      Export
                    </TabsTrigger>
                    <TabsTrigger value="quality" className="text-xs sm:text-sm">
                      <CheckCircle className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Data </span>Quality
                    </TabsTrigger>
                    <TabsTrigger value="batch" className="text-xs sm:text-sm">
                      <Copy className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Batch </span>Operations
                    </TabsTrigger>
                  </TabsList>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Import Tab */}
              <TabsContent value="import" className="space-y-4">
                <div className="space-y-4">
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">
                      Bulk Import Emissions
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Upload a CSV or Excel file to import multiple emission
                      records at once
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                      <Button
                        variant="outline"
                        onClick={() => downloadTemplate()}
                        className="w-full sm:w-auto"
                      >
                        <FileDown className="mr-2 h-4 w-4" />
                        Download Template
                      </Button>
                      <label className="cursor-pointer w-full sm:w-auto">
                        <Button variant="default" asChild className="w-full">
                          <span>
                            <Upload className="mr-2 h-4 w-4" />
                            Choose File
                          </span>
                        </Button>
                        <input
                          type="file"
                          accept=".csv,.xlsx,.xls"
                          className="hidden"
                          onChange={handleFileSelect}
                        />
                      </label>
                    </div>
                    {importFile && (
                      <div className="mt-4 p-4 bg-muted rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileSpreadsheet className="h-5 w-5" />
                            <span className="font-medium">
                              {importFile.name}
                            </span>
                            <Badge variant="secondary">
                              {(importFile.size / 1024).toFixed(2)} KB
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setImportFile(null);
                              setImportPreview([]);
                              setImportErrors([]);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {importPreview.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <h4 className="font-semibold">
                          Preview ({importPreview.length} records)
                        </h4>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setImportFile(null);
                              setImportPreview([]);
                              setImportErrors([]);
                            }}
                            className="flex-1 sm:flex-none"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleBulkImport}
                            disabled={importing || importErrors.length > 0}
                            className="flex-1 sm:flex-none"
                          >
                            {importing ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                <span className="hidden sm:inline">Importing...</span>
                                <span className="sm:hidden">Import</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                <span className="hidden sm:inline">Import {importPreview.length} Records</span>
                                <span className="sm:hidden">Import</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </div>

                      {importErrors.length > 0 && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            {importErrors.length} record(s) have validation
                            errors. Please fix them before importing.
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="border rounded-lg overflow-hidden">
                        <div className="text-xs text-muted-foreground px-3 py-2 bg-muted/50 md:hidden">
                          Scroll horizontally to view all columns →
                        </div>
                        <div className="overflow-x-auto max-h-[400px]">
                          <table className="w-full text-sm">
                            <thead className="bg-muted sticky top-0">
                              <tr>
                                <th className="p-2 text-left text-xs md:text-sm">Row</th>
                                <th className="p-2 text-left text-xs md:text-sm">Scope</th>
                                <th className="p-2 text-left text-xs md:text-sm">Category</th>
                                <th className="p-2 text-left text-xs md:text-sm">Activity</th>
                                <th className="p-2 text-left text-xs md:text-sm">Source</th>
                                <th className="p-2 text-right text-xs md:text-sm">Quantity</th>
                                <th className="p-2 text-left text-xs md:text-sm">Date</th>
                                <th className="p-2 text-left text-xs md:text-sm">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {importPreview.map((record, index) => {
                                const hasError = importErrors.some(
                                  (e) => e.row === index + 1
                                );
                                return (
                                  <tr
                                    key={index}
                                    className={cn(
                                      "border-b",
                                      hasError && "bg-red-50 dark:bg-red-950/20"
                                    )}
                                  >
                                    <td className="p-2">{index + 1}</td>
                                    <td className="p-2">
                                      {String(record.scope)}
                                    </td>
                                    <td className="p-2">
                                      {String(record.category)}
                                    </td>
                                    <td className="p-2">
                                      {String(record.activity)}
                                    </td>
                                    <td className="p-2">
                                      {String(record.source)}
                                    </td>
                                    <td className="p-2 text-right">
                                      {Number(record.quantity)}{" "}
                                      {String(record.unit)}
                                    </td>
                                    <td className="p-2">
                                      {new Date(
                                        String(record.date)
                                      ).toLocaleDateString()}
                                    </td>
                                    <td className="p-2">
                                      {hasError ? (
                                        <Badge variant="destructive">
                                          Error
                                        </Badge>
                                      ) : (
                                        <Badge variant="default">Valid</Badge>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {importErrors.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-semibold text-red-600">
                            Validation Errors:
                          </h4>
                          <div className="space-y-1 max-h-[200px] overflow-y-auto">
                            {importErrors.map((error, idx) => (
                              <div
                                key={idx}
                                className="text-sm text-red-600 p-2 bg-red-50 dark:bg-red-950/20 rounded"
                              >
                                Row {error.row}: {error.message}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Import History */}
                  {importHistory.length > 0 && (
                    <div className="mt-6 space-y-2">
                      <div className="flex items-center gap-2">
                        <History className="h-4 w-4" />
                        <h4 className="font-semibold">Recent Imports</h4>
                      </div>
                      <div className="space-y-2">
                        {importHistory.slice(0, 5).map((history, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 bg-muted rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <p className="font-medium">
                                  {history.filename}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {history.records} records •{" "}
                                  {new Date(history.date).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <Badge
                              variant={
                                history.status === "success"
                                  ? "default"
                                  : "destructive"
                              }
                            >
                              {history.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Export Tab */}
              <TabsContent value="export" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Export Emissions Data
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Export your emissions data in CSV or Excel format
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">
                          Export Options
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Export Format</Label>
                          <Select defaultValue="csv">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="csv">CSV (.csv)</SelectItem>
                              <SelectItem value="excel">
                                Excel (.xlsx)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Date Range (Optional)</Label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <Input type="date" placeholder="Start date" />
                            <Input type="date" placeholder="End date" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Scope Filter (Optional)</Label>
                          <Select defaultValue="all">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Scopes</SelectItem>
                              <SelectItem value="Scope 1">Scope 1</SelectItem>
                              <SelectItem value="Scope 2">Scope 2</SelectItem>
                              <SelectItem value="Scope 3">Scope 3</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <Button className="w-full" onClick={handleExport}>
                          <Download className="mr-2 h-4 w-4" />
                          Export Data
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">
                          Export Preview
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Total Records:
                            </span>
                            <span className="font-medium">
                              {filteredEmissions.length}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Scope 1:
                            </span>
                            <span className="font-medium">
                              {
                                filteredEmissions.filter(
                                  (e) => e.scope === "Scope 1"
                                ).length
                              }
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Scope 2:
                            </span>
                            <span className="font-medium">
                              {
                                filteredEmissions.filter(
                                  (e) => e.scope === "Scope 2"
                                ).length
                              }
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Scope 3:
                            </span>
                            <span className="font-medium">
                              {
                                filteredEmissions.filter(
                                  (e) => e.scope === "Scope 3"
                                ).length
                              }
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              {/* Data Quality Tab */}
              <TabsContent value="quality" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Data Quality Assessment
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Review data quality scores and recommendations for your
                      emissions records
                    </p>
                  </div>

                  <Button variant="outline" onClick={assessAllDataQuality} className="w-full sm:w-auto">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Assess All Records
                  </Button>

                  {Object.keys(qualityScores).length > 0 && (
                    <div className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">
                              High Quality
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                              {
                                Object.values(qualityScores).filter(
                                  (q) => q.level === "High"
                                ).length
                              }
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">
                              Medium Quality
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">
                              {
                                Object.values(qualityScores).filter(
                                  (q) => q.level === "Medium"
                                ).length
                              }
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">
                              Low Quality
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold text-red-600">
                              {
                                Object.values(qualityScores).filter(
                                  (q) => q.level === "Low"
                                ).length
                              }
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-semibold">
                          Quality Issues & Recommendations
                        </h4>
                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                          {filteredEmissions.map((emission) => {
                            const quality = qualityScores[emission.id];
                            if (!quality || quality.level === "High")
                              return null;
                            return (
                              <Card key={emission.id}>
                                <CardContent className="p-4">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <p className="font-medium">
                                        {emission.activity}
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        {emission.scope} •{" "}
                                        {new Date(
                                          emission.date
                                        ).toLocaleDateString()}
                                      </p>
                                      <div className="mt-2 space-y-1">
                                        {quality.issues.map(
                                          (issue: string, idx: number) => (
                                            <div
                                              key={idx}
                                              className="flex items-start gap-2 text-sm"
                                            >
                                              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                                              <span>{issue}</span>
                                            </div>
                                          )
                                        )}
                                        {quality.recommendations.map(
                                          (rec: string, idx: number) => (
                                            <div
                                              key={idx}
                                              className="flex items-start gap-2 text-sm text-muted-foreground"
                                            >
                                              <Info className="h-4 w-4 mt-0.5" />
                                              <span>{rec}</span>
                                            </div>
                                          )
                                        )}
                                      </div>
                                    </div>
                                    <Badge
                                      variant={
                                        quality.level === "High"
                                          ? "default"
                                          : quality.level === "Medium"
                                          ? "secondary"
                                          : "destructive"
                                      }
                                    >
                                      {quality.score}/100
                                    </Badge>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Batch Operations Tab */}
              <TabsContent value="batch" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">
                        Batch Operations
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Select multiple records to perform batch actions
                      </p>
                    </div>
                    <Button
                      variant={batchMode ? "default" : "outline"}
                      onClick={() => {
                        setBatchMode(!batchMode);
                        setSelectedEmissions([]);
                      }}
                      className="w-full sm:w-auto"
                    >
                      {batchMode ? "Cancel Selection" : "Enable Batch Mode"}
                    </Button>
                  </div>

                  {batchMode && (
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <span className="font-medium">
                          {selectedEmissions.length} record(s) selected
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleBatchDelete}
                          disabled={selectedEmissions.length === 0}
                          className="w-full sm:w-auto"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Selected
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Duplicate Detection */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        Duplicate Detection
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button
                        variant="outline"
                        onClick={detectDuplicates}
                        className="w-full"
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Scan for Duplicates
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
