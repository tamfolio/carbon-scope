"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Building2,
  DollarSign,
  Factory,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

interface FinancedEmission {
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

export default function AddFinancedEmissionPage() {
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

  // Sectors
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

  // Calculation methods
  const calculationMethods = [
    { value: "pcaf_method", label: "PCAF Standard Method" },
    { value: "reported_emissions", label: "Reported Emissions" },
    { value: "estimated", label: "Estimated (Sector Average)" },
    { value: "modeled", label: "Modeled Approach" },
  ];

  // Calculate total emissions when scope values change
  useEffect(() => {
    const s1 = parseFloat(formData.scope1) || 0;
    const s2 = parseFloat(formData.scope2) || 0;
    const s3 = parseFloat(formData.scope3) || 0;
    const total = s1 + s2 + s3;
    setFormData((prev) => ({ ...prev, totalEmissions: total }));
  }, [formData.scope1, formData.scope2, formData.scope3]);

  const handleInputChange = (field: keyof FinancedEmission, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
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
    if (
      !formData.investmentAmount ||
      parseFloat(formData.investmentAmount) <= 0
    ) {
      newErrors.investmentAmount = "Investment amount must be greater than 0";
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
      parseFloat(formData.attributionFactor) <= 0 ||
      parseFloat(formData.attributionFactor) > 100
    ) {
      newErrors.attributionFactor = "Attribution factor must be between 0 and 100";
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
          investmentName: formData.investmentName,
          investmentType: formData.investmentType,
          investmentAmount: parseFloat(formData.investmentAmount),
          currency: formData.currency,
          companyName: formData.companyName,
          sector: formData.sector,
          country: formData.country,
          attributionFactor: parseFloat(formData.attributionFactor),
          scope1: parseFloat(formData.scope1) || 0,
          scope2: parseFloat(formData.scope2) || 0,
          scope3: parseFloat(formData.scope3) || 0,
          totalEmissions: formData.totalEmissions,
          calculationMethod: formData.calculationMethod,
          dataQualityScore: parseFloat(formData.dataQualityScore),
          reportingYear: parseInt(formData.reportingYear),
          reportingPeriod: formData.reportingPeriod,
          dataSource: formData.dataSource,
          description: formData.description,
        }),
      });

      if (response.ok) {
        showAlert("success", "Financed emissions data saved successfully");
        // Redirect back to emissions page after 1 second
        setTimeout(() => {
          router.push("/dashboard/emissions?tab=financed");
        }, 1000);
      } else {
        const error = await response.json();
        showAlert("error", error.error || "Failed to save financed emissions data");
      }
    } catch (error) {
      console.error("Error saving financed emissions:", error);
      showAlert("error", "Failed to save financed emissions data");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/dashboard/emissions?tab=financed")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Add Financed Emission Record
            </h2>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Track emissions from your investment and loan portfolios (PCAF)
            </p>
          </div>
        </div>

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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Investment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Investment Information
              </CardTitle>
              <CardDescription>
                Details about the investment or loan portfolio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="investmentName">Investment Name *</Label>
                  <Input
                    id="investmentName"
                    placeholder="e.g., ABC Corp Equity Investment"
                    value={formData.investmentName}
                    onChange={(e) =>
                      handleInputChange("investmentName", e.target.value)
                    }
                  />
                  {errors.investmentName && (
                    <p className="text-sm text-red-500">{errors.investmentName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="investmentType">Investment Type *</Label>
                  <Select
                    value={formData.investmentType}
                    onValueChange={(value) =>
                      handleInputChange("investmentType", value)
                    }
                  >
                    <SelectTrigger id="investmentType">
                      <SelectValue placeholder="Select investment type" />
                    </SelectTrigger>
                    <SelectContent>
                      {investmentTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.investmentType && (
                    <p className="text-sm text-red-500">{errors.investmentType}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="investmentAmount">Investment Amount *</Label>
                  <Input
                    id="investmentAmount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.investmentAmount}
                    onChange={(e) =>
                      handleInputChange("investmentAmount", e.target.value)
                    }
                  />
                  {errors.investmentAmount && (
                    <p className="text-sm text-red-500">
                      {errors.investmentAmount}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency *</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => handleInputChange("currency", value)}
                  >
                    <SelectTrigger id="currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                      <SelectItem value="CNY">CNY - Chinese Yuan</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.currency && (
                    <p className="text-sm text-red-500">{errors.currency}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Portfolio Company Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Portfolio Company Information
              </CardTitle>
              <CardDescription>
                Information about the company receiving the investment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    placeholder="e.g., ABC Corporation"
                    value={formData.companyName}
                    onChange={(e) =>
                      handleInputChange("companyName", e.target.value)
                    }
                  />
                  {errors.companyName && (
                    <p className="text-sm text-red-500">{errors.companyName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sector">Sector *</Label>
                  <Select
                    value={formData.sector}
                    onValueChange={(value) => handleInputChange("sector", value)}
                  >
                    <SelectTrigger id="sector">
                      <SelectValue placeholder="Select sector" />
                    </SelectTrigger>
                    <SelectContent>
                      {sectors.map((sector) => (
                        <SelectItem key={sector} value={sector}>
                          {sector}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.sector && (
                    <p className="text-sm text-red-500">{errors.sector}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    placeholder="e.g., United States"
                    value={formData.country}
                    onChange={(e) => handleInputChange("country", e.target.value)}
                  />
                  {errors.country && (
                    <p className="text-sm text-red-500">{errors.country}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="attributionFactor">Attribution Factor (%) *</Label>
                  <Input
                    id="attributionFactor"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.attributionFactor}
                    onChange={(e) =>
                      handleInputChange("attributionFactor", e.target.value)
                    }
                  />
                  {errors.attributionFactor && (
                    <p className="text-sm text-red-500">
                      {errors.attributionFactor}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Percentage of company emissions attributable to this investment
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Company Emissions Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Factory className="h-5 w-5 text-primary" />
                Company Emissions Data
              </CardTitle>
              <CardDescription>
                Greenhouse gas emissions for the portfolio company (in tCO₂e)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="scope1">Scope 1 Emissions</Label>
                  <Input
                    id="scope1"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.scope1}
                    onChange={(e) => handleInputChange("scope1", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Direct emissions</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scope2">Scope 2 Emissions</Label>
                  <Input
                    id="scope2"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.scope2}
                    onChange={(e) => handleInputChange("scope2", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Indirect energy emissions
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scope3">Scope 3 Emissions</Label>
                  <Input
                    id="scope3"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.scope3}
                    onChange={(e) => handleInputChange("scope3", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Other indirect emissions
                  </p>
                </div>
              </div>

              {errors.scope1 && (
                <p className="text-sm text-red-500">{errors.scope1}</p>
              )}

              {/* Total Emissions Display */}
              {formData.totalEmissions > 0 && (
                <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Total Company Emissions</p>
                      <p className="text-2xl font-bold text-primary">
                        {formData.totalEmissions.toFixed(2)} tCO₂e
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Methodology & Reporting */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Methodology & Reporting
              </CardTitle>
              <CardDescription>
                Calculation methodology and data quality information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="calculationMethod">Calculation Method *</Label>
                  <Select
                    value={formData.calculationMethod}
                    onValueChange={(value) =>
                      handleInputChange("calculationMethod", value)
                    }
                  >
                    <SelectTrigger id="calculationMethod">
                      <SelectValue placeholder="Select calculation method" />
                    </SelectTrigger>
                    <SelectContent>
                      {calculationMethods.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.calculationMethod && (
                    <p className="text-sm text-red-500">
                      {errors.calculationMethod}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dataQualityScore">
                    Data Quality Score (1-5) *
                  </Label>
                  <Input
                    id="dataQualityScore"
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    placeholder="1.0"
                    value={formData.dataQualityScore}
                    onChange={(e) =>
                      handleInputChange("dataQualityScore", e.target.value)
                    }
                  />
                  {errors.dataQualityScore && (
                    <p className="text-sm text-red-500">
                      {errors.dataQualityScore}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    1 = Highest quality, 5 = Lowest quality
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reportingYear">Reporting Year *</Label>
                  <Input
                    id="reportingYear"
                    type="number"
                    placeholder="2024"
                    value={formData.reportingYear}
                    onChange={(e) =>
                      handleInputChange("reportingYear", e.target.value)
                    }
                  />
                  {errors.reportingYear && (
                    <p className="text-sm text-red-500">{errors.reportingYear}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reportingPeriod">Reporting Period *</Label>
                  <Select
                    value={formData.reportingPeriod}
                    onValueChange={(value) =>
                      handleInputChange("reportingPeriod", value)
                    }
                  >
                    <SelectTrigger id="reportingPeriod">
                      <SelectValue placeholder="Select reporting period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="q1">Q1 (Jan-Mar)</SelectItem>
                      <SelectItem value="q2">Q2 (Apr-Jun)</SelectItem>
                      <SelectItem value="q3">Q3 (Jul-Sep)</SelectItem>
                      <SelectItem value="q4">Q4 (Oct-Dec)</SelectItem>
                      <SelectItem value="annual">Annual</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.reportingPeriod && (
                    <p className="text-sm text-red-500">{errors.reportingPeriod}</p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="dataSource">Data Source *</Label>
                  <Input
                    id="dataSource"
                    placeholder="e.g., Company sustainability report, CDP disclosure"
                    value={formData.dataSource}
                    onChange={(e) =>
                      handleInputChange("dataSource", e.target.value)
                    }
                  />
                  {errors.dataSource && (
                    <p className="text-sm text-red-500">{errors.dataSource}</p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Additional Notes (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Any additional information, assumptions, or context..."
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/emissions?tab=financed")}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Save Financed Emissions Data
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
