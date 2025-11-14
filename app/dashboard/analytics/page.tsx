"use client";

import DashboardLayout from "@/components/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ReportsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
          <p className="text-muted-foreground mt-1">Analytics</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>
              Data presentation and user experience and analysis would be done
              in week 4
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              • Emissions overview displays • Data visualization components •
              Activity history tables • Filtering and sorting capabilities •
              Summary statistics • Performance optimization
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
