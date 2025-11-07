"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function EmissionsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Emissions Data</h2>
            <p className="text-muted-foreground mt-1">
              Track and manage your carbon emissions data
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Entry
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>
              Emissions data management interface will be available in Week 3
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This page will include emission data entry forms, bulk import, and data visualization.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

