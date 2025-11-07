"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Cloud,
  Factory,
  Truck,
  Zap,
  Plus,
  Download,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data for charts
const monthlyEmissions = [
  { month: "Jan", scope1: 45, scope2: 32, scope3: 78 },
  { month: "Feb", scope1: 52, scope2: 35, scope3: 82 },
  { month: "Mar", scope1: 48, scope2: 30, scope3: 75 },
  { month: "Apr", scope1: 61, scope2: 42, scope3: 95 },
  { month: "May", scope1: 55, scope2: 38, scope3: 88 },
  { month: "Jun", scope1: 67, scope2: 48, scope3: 102 },
];

const recentActivities = [
  { id: 1, type: "added", description: "New emission data entry for June 2024", time: "2 hours ago", icon: Plus },
  { id: 2, type: "report", description: "Q2 2024 report generated", time: "5 hours ago", icon: Download },
  { id: 3, type: "alert", description: "Scope 3 emissions exceeded target", time: "1 day ago", icon: AlertTriangle },
  { id: 4, type: "success", description: "Carbon reduction goal achieved", time: "2 days ago", icon: CheckCircle2 },
];

interface MetricCardProps {
  title: string;
  value: string;
  unit: string;
  change: number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  delay: number;
}

function MetricCard({ title, value, unit, change, icon: Icon, color, bgColor, delay }: MetricCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setProgress(Math.random() * 40 + 30); // Random progress between 30-70%
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  return (
    <Card 
      className={cn(
        "relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] group cursor-pointer border-l-2",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        color
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Animated gradient background */}
      <div className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300",
        bgColor
      )} />
      
      {/* Sparkle effect on hover */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
        <Sparkles className="h-4 w-4 text-primary animate-pulse" />
      </div>

      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={cn(
          "h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-12",
          bgColor
        )}>
          <Icon className={cn("h-5 w-5", color.replace("border-l-", "text-"))} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold mb-1 transition-all duration-300 group-hover:scale-105">
          {value}
          <span className="text-lg text-muted-foreground ml-1">{unit}</span>
        </div>
        
        <div className="flex items-center text-xs text-muted-foreground mt-2 mb-3">
          {change > 0 ? (
            <ArrowUpRight className="mr-1 h-4 w-4 text-red-600 animate-bounce" />
          ) : (
            <ArrowDownRight className="mr-1 h-4 w-4 text-green-600 animate-bounce" />
          )}
          <span className={cn(
            "font-medium",
            change > 0 ? "text-red-600" : "text-green-600"
          )}>
            {Math.abs(change)}%
          </span>
          <span className="ml-1">from last month</span>
        </div>
        
        {/* Animated progress bar */}
        <div className="relative">
          <Progress 
            value={progress} 
            className="h-2 transition-all duration-1000" 
          />
          <div className="absolute top-0 left-0 h-2 w-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [chartHeight, setChartHeight] = useState(300);

  useEffect(() => {
    const token = localStorage.getItem("cs_token");
    if (!token) {
      router.push("/login");
      return;
    }
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <p className="text-muted-foreground animate-pulse">Loading your dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with animation */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in">
          <div>
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-green-700 bg-clip-text text-transparent">
              Welcome back!
            </h2>
            <p className="text-muted-foreground mt-1">
              Here's your carbon emissions overview for June 2024
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="hover:scale-105 transition-transform">
              <Calendar className="mr-2 h-4 w-4" />
              Last 30 days
            </Button>
            <Button size="sm" className="hover:scale-105 transition-transform bg-gradient-to-r from-primary to-green-700 hover:from-primary/90 hover:to-green-700/90">
              <Plus className="mr-2 h-4 w-4" />
              Add Data
            </Button>
          </div>
        </div>

        {/* Key Metrics with staggered animation */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Emissions"
            value="217.5"
            unit="tCO₂e"
            change={8.2}
            icon={Cloud}
            color="border-l-primary"
            bgColor="bg-gradient-to-br from-primary/20 to-green-700/20"
            delay={0}
          />
          <MetricCard
            title="Scope 1"
            value="67.0"
            unit="tCO₂e"
            change={3.1}
            icon={Factory}
            color="border-l-blue-500"
            bgColor="bg-gradient-to-br from-blue-500/20 to-blue-700/20"
            delay={100}
          />
          <MetricCard
            title="Scope 2"
            value="48.5"
            unit="tCO₂e"
            change={-2.4}
            icon={Zap}
            color="border-l-yellow-500"
            bgColor="bg-gradient-to-br from-yellow-500/20 to-yellow-700/20"
            delay={200}
          />
          <MetricCard
            title="Scope 3"
            value="102.0"
            unit="tCO₂e"
            change={5.7}
            icon={Truck}
            color="border-l-purple-500"
            bgColor="bg-gradient-to-br from-purple-500/20 to-purple-700/20"
            delay={300}
          />
        </div>

        {/* Charts and Activity with slide-up animation */}
        <div className="grid gap-6 lg:grid-cols-7 animate-slide-up" style={{ animationDelay: '400ms' }}>
          {/* Emissions Chart */}
          <Card className="lg:col-span-4 hover:shadow-xl transition-all duration-300 group">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Emissions Trend
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  </CardTitle>
                  <CardDescription>Monthly carbon emissions by scope</CardDescription>
                </div>
                <Activity className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="bar" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="bar" className="data-[state=active]:bg-primary">Bar Chart</TabsTrigger>
                  <TabsTrigger value="line">Line Chart</TabsTrigger>
                </TabsList>
                <TabsContent value="bar" className="space-y-4">
                  <div className="h-[300px] flex items-end justify-between gap-2 relative">
                    {monthlyEmissions.map((data, index) => {
                      const total = data.scope1 + data.scope2 + data.scope3;
                      const maxTotal = Math.max(...monthlyEmissions.map(d => d.scope1 + d.scope2 + d.scope3));
                      const height = (total / maxTotal) * 100;
                      
                      return (
                        <div 
                          key={index} 
                          className="flex-1 flex flex-col items-center justify-end gap-2 group/bar cursor-pointer h-full"
                        >
                          <div 
                            className="w-full flex flex-col-reverse gap-0.5 transition-all duration-500 hover:scale-105 origin-bottom min-h-[20px]"
                            style={{ 
                              height: `${height}%`,
                              animation: `growUp 0.8s ease-out ${index * 0.1}s both`
                            }}
                          >
                            <div
                              className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-b group-hover/bar:from-blue-600 group-hover/bar:to-blue-500 transition-all duration-300 shadow-lg flex-shrink-0"
                              style={{ height: `${(data.scope1 / total) * 100}%`, minHeight: '8px' }}
                              title={`Scope 1: ${data.scope1}`}
                            />
                            <div
                              className="w-full bg-gradient-to-t from-yellow-500 to-yellow-400 group-hover/bar:from-yellow-600 group-hover/bar:to-yellow-500 transition-all duration-300 shadow-lg flex-shrink-0"
                              style={{ height: `${(data.scope2 / total) * 100}%`, minHeight: '8px' }}
                              title={`Scope 2: ${data.scope2}`}
                            />
                            <div
                              className="w-full bg-gradient-to-t from-purple-500 to-purple-400 rounded-t group-hover/bar:from-purple-600 group-hover/bar:to-purple-500 transition-all duration-300 shadow-lg flex-shrink-0"
                              style={{ height: `${(data.scope3 / total) * 100}%`, minHeight: '8px' }}
                              title={`Scope 3: ${data.scope3}`}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground font-medium group-hover/bar:text-primary transition-colors flex-shrink-0">
                            {data.month}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-center gap-6 text-xs">
                    <div className="flex items-center gap-2 hover:scale-110 transition-transform cursor-pointer">
                      <div className="w-4 h-4 rounded bg-gradient-to-br from-blue-500 to-blue-400 shadow" />
                      <span className="font-medium">Scope 1</span>
                    </div>
                    <div className="flex items-center gap-2 hover:scale-110 transition-transform cursor-pointer">
                      <div className="w-4 h-4 rounded bg-gradient-to-br from-yellow-500 to-yellow-400 shadow" />
                      <span className="font-medium">Scope 2</span>
                    </div>
                    <div className="flex items-center gap-2 hover:scale-110 transition-transform cursor-pointer">
                      <div className="w-4 h-4 rounded bg-gradient-to-br from-purple-500 to-purple-400 shadow" />
                      <span className="font-medium">Scope 3</span>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="line" className="space-y-4">
                  <div className="h-[300px] relative">
                    {/* Grid lines */}
                    <div className="absolute inset-0 flex flex-col justify-between py-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="border-b border-dashed border-muted opacity-30" />
                      ))}
                    </div>
                    
                    {/* SVG Line Chart */}
                    <svg className="w-full h-full" viewBox="0 0 600 300" preserveAspectRatio="none">
                      <defs>
                        {/* Gradients for each scope */}
                        <linearGradient id="scope1Gradient" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="scope2Gradient" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="rgb(234, 179, 8)" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="rgb(234, 179, 8)" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="scope3Gradient" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="rgb(168, 85, 247)" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="rgb(168, 85, 247)" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      
                      {/* Scope 1 Area */}
                      <path
                        d="M 0 230 L 100 210 L 200 220 L 300 190 L 400 200 L 500 180 L 600 180 L 600 300 L 0 300 Z"
                        fill="url(#scope1Gradient)"
                        className="animate-draw-area"
                        style={{ animationDelay: '0.2s' }}
                      />
                      
                      {/* Scope 2 Area */}
                      <path
                        d="M 0 200 L 100 185 L 200 190 L 300 165 L 400 175 L 500 160 L 600 155 L 600 300 L 0 300 Z"
                        fill="url(#scope2Gradient)"
                        className="animate-draw-area"
                        style={{ animationDelay: '0.4s' }}
                      />
                      
                      {/* Scope 3 Area */}
                      <path
                        d="M 0 150 L 100 135 L 200 145 L 300 110 L 400 125 L 500 100 L 600 95 L 600 300 L 0 300 Z"
                        fill="url(#scope3Gradient)"
                        className="animate-draw-area"
                        style={{ animationDelay: '0.6s' }}
                      />
                      
                      {/* Scope 1 Line */}
                      <path
                        d="M 0 230 L 100 210 L 200 220 L 300 190 L 400 200 L 500 180 L 600 180"
                        fill="none"
                        stroke="rgb(59, 130, 246)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="animate-draw-line"
                        style={{ animationDelay: '0.2s' }}
                      />
                      
                      {/* Scope 2 Line */}
                      <path
                        d="M 0 200 L 100 185 L 200 190 L 300 165 L 400 175 L 500 160 L 600 155"
                        fill="none"
                        stroke="rgb(234, 179, 8)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="animate-draw-line"
                        style={{ animationDelay: '0.4s' }}
                      />
                      
                      {/* Scope 3 Line */}
                      <path
                        d="M 0 150 L 100 135 L 200 145 L 300 110 L 400 125 L 500 100 L 600 95"
                        fill="none"
                        stroke="rgb(168, 85, 247)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="animate-draw-line"
                        style={{ animationDelay: '0.6s' }}
                      />
                      
                      {/* Data points */}
                      {monthlyEmissions.map((_, index) => {
                        const x = (index * 100) + 100;
                        const points = [
                          { y: [230, 210, 220, 190, 200, 180][index], color: 'rgb(59, 130, 246)' },
                          { y: [200, 185, 190, 165, 175, 160][index], color: 'rgb(234, 179, 8)' },
                          { y: [150, 135, 145, 110, 125, 100][index], color: 'rgb(168, 85, 247)' },
                        ];
                        
                        return points.map((point, i) => (
                          <g key={`${index}-${i}`}>
                            <circle
                              cx={x}
                              cy={point.y}
                              r="6"
                              fill="white"
                              stroke={point.color}
                              strokeWidth="3"
                              className="animate-scale-in hover:r-8 transition-all cursor-pointer"
                              style={{ animationDelay: `${0.8 + index * 0.1}s` }}
                            />
                            <circle
                              cx={x}
                              cy={point.y}
                              r="3"
                              fill={point.color}
                              className="animate-scale-in opacity-0 hover:opacity-100 transition-opacity"
                              style={{ animationDelay: `${0.8 + index * 0.1}s` }}
                            />
                          </g>
                        ));
                      })}
                    </svg>
                    
                    {/* X-axis labels */}
                    <div className="absolute bottom-0 left-0 right-0 flex justify-between px-12 text-xs text-muted-foreground">
                      {monthlyEmissions.map((data, index) => (
                        <span 
                          key={index}
                          className="animate-fade-in font-medium"
                          style={{ animationDelay: `${1 + index * 0.1}s` }}
                        >
                          {data.month}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center gap-6 text-xs">
                    <div className="flex items-center gap-2 hover:scale-110 transition-transform cursor-pointer">
                      <div className="w-4 h-4 rounded bg-gradient-to-br from-blue-500 to-blue-400 shadow" />
                      <span className="font-medium">Scope 1</span>
                    </div>
                    <div className="flex items-center gap-2 hover:scale-110 transition-transform cursor-pointer">
                      <div className="w-4 h-4 rounded bg-gradient-to-br from-yellow-500 to-yellow-400 shadow" />
                      <span className="font-medium">Scope 2</span>
                    </div>
                    <div className="flex items-center gap-2 hover:scale-110 transition-transform cursor-pointer">
                      <div className="w-4 h-4 rounded bg-gradient-to-br from-purple-500 to-purple-400 shadow" />
                      <span className="font-medium">Scope 3</span>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="lg:col-span-3 hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Recent Activity
                <Badge variant="secondary" className="animate-pulse">Live</Badge>
              </CardTitle>
              <CardDescription>Latest updates and notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div 
                    key={activity.id} 
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent transition-all duration-300 cursor-pointer group/activity animate-fade-in-right"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div
                      className={cn(
                        "rounded-full p-2 transition-all duration-300 group-hover/activity:scale-110 group-hover/activity:rotate-12",
                        activity.type === "alert" && "bg-destructive/10 text-destructive",
                        activity.type === "success" && "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
                        activity.type === "added" && "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
                        activity.type === "report" && "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
                      )}
                    >
                      <activity.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none group-hover/activity:text-primary transition-colors">
                        {activity.description}
                      </p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover/activity:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions with scale animation */}
        <Card className="hover:shadow-xl transition-all duration-300 animate-slide-up" style={{ animationDelay: '600ms' }}>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: Plus, label: "Add Emission Data", color: "hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950 dark:hover:text-blue-300" },
                { icon: Download, label: "Generate Report", color: "hover:border-purple-500 hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-950 dark:hover:text-purple-300" },
                { icon: Activity, label: "View Analytics", color: "hover:border-green-500 hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-950 dark:hover:text-green-300" },
                { icon: TrendingUp, label: "Set Goals", color: "hover:border-orange-500 hover:bg-orange-50 hover:text-orange-700 dark:hover:bg-orange-950 dark:hover:text-orange-300" },
              ].map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className={cn(
                    "h-28 flex flex-col items-center justify-center gap-3 group relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg",
                    action.color
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  <action.icon className="h-6 w-6 transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12" />
                  <span className="text-sm font-medium">{action.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-right {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes growUp {
          from {
            transform: scaleY(0);
          }
          to {
            transform: scaleY(1);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes draw-line {
          from {
            stroke-dasharray: 1000;
            stroke-dashoffset: 1000;
          }
          to {
            stroke-dasharray: 1000;
            stroke-dashoffset: 0;
          }
        }

        @keyframes draw-area {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scale-in {
          from {
            transform: scale(0);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
          animation-fill-mode: both;
        }

        .animate-fade-in-right {
          animation: fade-in-right 0.5s ease-out;
          animation-fill-mode: both;
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }

        .animate-draw-line {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: draw-line 1.5s ease-out forwards;
        }

        .animate-draw-area {
          opacity: 0;
          animation: draw-area 1s ease-out forwards;
        }

        .animate-scale-in {
          transform-origin: center;
          animation: scale-in 0.4s ease-out forwards;
        }
      `}</style>
    </DashboardLayout>
  );
}
