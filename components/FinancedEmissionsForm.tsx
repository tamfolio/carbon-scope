"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Alert, AlertDescription } from "./ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import {
  Building2,
  DollarSign,
  Factory,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Plus,
  Settings,
} from "lucide-react";

interface FinancedEmission {
  id?: string;
  investmentName: string;
  investmentType: string;
  investmentAmount: string;
  currency: string;
  companyName: string;
  sector: string;
  country: string;
  attributionFactor: string;
  scope1: string;
  scope2: string;
  scope3: string;
  totalEmissions: number;
  calculationMethod: string;
  dataQualityScore: string;
  reportingYear: string;
  reportingPeriod: string;
  dataSource: string;
  description: string;
}

export default function FinancedEmissionsForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<FinancedEmission>({
    investmentName: "",
    investmentType: "",
    investmentAmount: "",
    currency: "USD",
    companyName: "",
    sector: "",
    country: "",
    attributionFactor: "",
    scope1: "",
    scope2: "",
    scope3: "",
    totalEmissions: 0,
    calculationMethod: "",
    dataQualityScore: "",
    reportingYear: "",
    reportingPeriod: "",
    dataSource: "",
    description: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // State for emissions list
  const [emissions, setEmissions] = useState<any[]>([]);
  const [loadingEmissions, setLoadingEmissions] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Investment types based on PCAF methodology
  const investmentTypes = [
    { value: "listed_equity", label: "Listed Equity" },
    { value: "corporate_bonds", label: "Corporate Bonds" },
    { value: "business_loans", label: "Business Loans" },
    { value: "project_finance", label: "Project Finance" },
    { value: "commercial_real_estate", label: "Commercial Real Estate" },
    { value: "mortgages", label: "Mortgages" },
    { value: "motor_vehicle_loans", label: "Motor Vehicle Loans" },
  ];

  // Calculation methods based on PCAF
  const calculationMethods = [
    { value: "pcaf_option_1", label: "PCAF Option 1: Primary Data" },
    { value: "pcaf_option_2", label: "PCAF Option 2: Production-Based Data" },
    { value: "pcaf_option_3", label: "PCAF Option 3: Economic Activity-Based Data" },
    { value: "pcaf_option_4", label: "PCAF Option 4: Asset-Based Data" },
    { value: "pcaf_option_5", label: "PCAF Option 5: Average Data" },
  ];

  // Major sectors
  const sectors = [
    "Energy",
    "Materials",
    "Industrials",
    "Consumer Discretionary",
    "Consumer Staples",
    "Health Care",
    "Financials",
    "Information Technology",
    "Communication Services",
    "Utilities",
    "Real Estate",
  ];

  // Auto-calculate total emissions when scope values change
  const calculateTotalEmissions = (
    scope1: string,
    scope2: string,
    scope3: string
  ): number => {
    const s1 = parseFloat(scope1) || 0;
    const s2 = parseFloat(scope2) || 0;
    const s3 = parseFloat(scope3) || 0;
    return s1 + s2 + s3;
  };

  const handleInputChange = (field: keyof FinancedEmission, value: string) => {
    const newFormData = { ...formData, [field]: value };

    // Auto-calculate total emissions when any scope value changes
    if (field === "scope1" || field === "scope2" || field === "scope3") {
      newFormData.totalEmissions = calculateTotalEmissions(
        field === "scope1" ? value : formData.scope1,
        field === "scope2" ? value : formData.scope2,
        field === "scope3" ? value : formData.scope3
      );
    }

    setFormData(newFormData);

    // Clear error for this field
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Investment Information validation
    if (!formData.investmentName || formData.investmentName.length < 3) {
      newErrors.investmentName = "Investment name is required (min 3 characters)";
    }
    if (!formData.investmentType) {
      newErrors.investmentType = "Investment type is required";
    }
    if (!formData.investmentAmount || parseFloat(formData.investmentAmount) <= 0) {
      newErrors.investmentAmount = "Investment amount must be greater than 0";
    }
    if (!formData.currency) {
      newErrors.currency = "Currency is required";
    }

    // Portfolio Company Information validation
    if (!formData.companyName || formData.companyName.length < 2) {
      newErrors.companyName = "Company name is required (min 2 characters)";
    }
    if (!formData.sector) {
      newErrors.sector = "Sector is required";
    }
    if (!formData.country || formData.country.length < 2) {
      newErrors.country = "Country is required";
    }
    if (
      !formData.attributionFactor ||
      parseFloat(formData.attributionFactor) < 0 ||
      parseFloat(formData.attributionFactor) > 100
    ) {
      newErrors.attributionFactor =
        "Attribution factor must be between 0 and 100";
    }

    // Company Emissions Data validation
    if (!formData.scope1 && !formData.scope2 && !formData.scope3) {
      newErrors.scope1 = "At least one scope must have emissions data";
    }

    // Methodology & Reporting validation
    if (!formData.calculationMethod) {
      newErrors.calculationMethod = "Calculation method is required";
    }
    if (
      !formData.dataQualityScore ||
      parseFloat(formData.dataQualityScore) < 1 ||
      parseFloat(formData.dataQualityScore) > 5
    ) {
      newErrors.dataQualityScore = "Data quality score must be between 1 and 5";
    }
    if (!formData.reportingYear) {
      newErrors.reportingYear = "Reporting year is required";
    }
    if (!formData.reportingPeriod) {
      newErrors.reportingPeriod = "Reporting period is required";
    }
    if (!formData.dataSource || formData.dataSource.length < 3) {
      newErrors.dataSource = "Data source is required (min 3 characters)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const showAlert = (type: "success" | "error", message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  // Fetch financed emissions
  const fetchEmissions = async () => {
    try {
      const token = localStorage.getItem("cs_token");
      const response = await fetch("/api/financed-emissions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEmissions(data.financedEmissions || []);
      }
    } catch (error) {
      console.error("Error fetching financed emissions:", error);
    } finally {
      setLoadingEmissions(false);
    }
  };

  // Delete financed emission
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this financed emission record?")) {
      return;
    }

    setDeletingId(id);
    try {
      const token = localStorage.getItem("cs_token");
      const response = await fetch(`/api/financed-emissions/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        showAlert("success", "Financed emission record deleted successfully");
        fetchEmissions(); // Refresh the list
      } else {
        showAlert("error", "Failed to delete financed emission record");
      }
    } catch (error) {
      console.error("Error deleting financed emission:", error);
      showAlert("error", "Failed to delete financed emission record");
    } finally {
      setDeletingId(null);
    }
  };

  // Fetch emissions on component mount
  useEffect(() => {
    fetchEmissions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showAlert("error", "Please fix the validation errors");
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem("cs_token");
      const response = await fetch("/api/financed-emissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          investmentAmount: parseFloat(formData.investmentAmount),
          attributionFactor: parseFloat(formData.attributionFactor),
          scope1: parseFloat(formData.scope1) || 0,
          scope2: parseFloat(formData.scope2) || 0,
          scope3: parseFloat(formData.scope3) || 0,
          dataQualityScore: parseFloat(formData.dataQualityScore),
        }),
      });

      if (response.ok) {
        showAlert("success", "Financed emissions data saved successfully");
        // Reset form
        setFormData({
          investmentName: "",
          investmentType: "",
          investmentAmount: "",
          currency: "USD",
          companyName: "",
          sector: "",
          country: "",
          attributionFactor: "",
          scope1: "",
          scope2: "",
          scope3: "",
          totalEmissions: 0,
          calculationMethod: "",
          dataQualityScore: "",
          reportingYear: "",
          reportingPeriod: "",
          dataSource: "",
          description: "",
        });
        setErrors({});
        // Refresh the emissions list
        fetchEmissions();
      } else {
        const data = await response.json();
        showAlert("error", data.error || "Failed to save financed emissions data");
      }
    } catch (error) {
      console.error("Error saving financed emissions:", error);
      showAlert("error", "Failed to save financed emissions data");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert */}
      {alert && (
        <Alert variant={alert.type === "error" ? "destructive" : "default"}>
          {alert.type === "success" ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Financed Emissions (PCAF)</CardTitle>
              <CardDescription>
                Track emissions from your investment and loan portfolios
              </CardDescription>
            </div>
            <Button
              onClick={() => router.push("/dashboard/financed-emissions/add")}
              className="w-full sm:w-auto"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Financed Emission
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Saved Financed Emissions List */}
      <Card>
        <CardHeader>
          <CardTitle>Financed Emissions Records</CardTitle>
          <CardDescription>
            View and manage your financed emissions portfolio
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingEmissions ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading records...</span>
            </div>
          ) : emissions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Factory className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No financed emissions records yet.</p>
              <p className="text-sm">Add your first record using the form below.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Investment Name</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Sector</TableHead>
                    <TableHead className="text-right">Investment Amount</TableHead>
                    <TableHead className="text-right">Total Emissions</TableHead>
                    <TableHead>Reporting Year</TableHead>
                    <TableHead>Data Quality</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {emissions.map((emission) => (
                    <TableRow key={emission.id}>
                      <TableCell className="font-medium">
                        {emission.investmentName}
                      </TableCell>
                      <TableCell>{emission.companyName}</TableCell>
                      <TableCell>{emission.sector}</TableCell>
                      <TableCell className="text-right">
                        {emission.currency} {emission.investmentAmount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {emission.totalEmissions.toFixed(2)} tCO₂e
                      </TableCell>
                      <TableCell>{emission.reportingYear}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          emission.dataQualityScore <= 2
                            ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
                            : emission.dataQualityScore <= 3
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300"
                            : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                        }`}>
                          Score: {emission.dataQualityScore}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(emission.id)}
                          disabled={deletingId === emission.id}
                        >
                          {deletingId === emission.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 text-red-500" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
