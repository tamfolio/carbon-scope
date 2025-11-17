"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Calculator, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function QuickCalculator() {
  const [open, setOpen] = useState(false);
  const [employees, setEmployees] = useState("");
  const [electricity, setElectricity] = useState("");
  const [transport, setTransport] = useState("");
  const [result, setResult] = useState<number | null>(null);

  useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener('openCalculator', handleOpen);
    return () => window.removeEventListener('openCalculator', handleOpen);
  }, []);

  const calculateEmissions = () => {
    // Simple calculation formula (realistic approximation)
    const employeesFactor = parseFloat(employees) || 0;
    const electricityFactor = parseFloat(electricity) || 0;
    const transportFactor = parseFloat(transport) || 0;

    // Rough estimates:
    // - 0.5 kg CO2e per employee per month (office equipment, etc.)
    // - 0.5 kg CO2e per kWh (varies by region)
    // - 0.2 kg CO2e per km (average vehicle)
    const totalEmissions =
      (employeesFactor * 0.5) +
      (electricityFactor * 0.5) +
      (transportFactor * 0.2);

    setResult(totalEmissions);
  };

  const resetForm = () => {
    setEmployees("");
    setElectricity("");
    setTransport("");
    setResult(null);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Calculator className="h-6 w-6 text-primary" />
            Quick Emissions Calculator
          </DialogTitle>
          <DialogDescription>
            Get an instant estimate of your company's monthly carbon footprint
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="employees">Number of Employees</Label>
            <Input
              id="employees"
              type="number"
              placeholder="e.g., 50"
              value={employees}
              onChange={(e) => setEmployees(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="electricity">Monthly Electricity (kWh)</Label>
            <Input
              id="electricity"
              type="number"
              placeholder="e.g., 1000"
              value={electricity}
              onChange={(e) => setElectricity(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="transport">Monthly Transport (km)</Label>
            <Input
              id="transport"
              type="number"
              placeholder="e.g., 5000"
              value={transport}
              onChange={(e) => setTransport(e.target.value)}
            />
          </div>

          <Button
            onClick={calculateEmissions}
            className="w-full"
            disabled={!employees && !electricity && !transport}
          >
            Calculate Emissions
          </Button>

          {result !== null && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 text-center space-y-4">
              <div>
                <div className="text-4xl font-bold text-primary">
                  {result.toFixed(1)} kg
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  CO₂e estimated monthly emissions
                </div>
              </div>

              <Button asChild className="w-full group">
                <Link href="/register?tab=signup">
                  Get Detailed Analysis
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
