"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("cs_token");
    
    if (!token) {
      router.push("/login");
      return;
    }

    // You could fetch user data from an API endpoint here
    // For now, we'll just show the dashboard
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("cs_token");
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-2xl font-bold text-green-600">
                CarbonScope 360
              </Link>
            </div>
            <nav className="flex items-center space-x-6">
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900"
              >
                Logout
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome to your carbon accounting dashboard
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600 mb-2">
              Total Emissions
            </div>
            <div className="text-3xl font-bold text-gray-900">0</div>
            <div className="text-sm text-gray-500 mt-2">tCO₂e</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600 mb-2">
              Scope 1
            </div>
            <div className="text-3xl font-bold text-gray-900">0</div>
            <div className="text-sm text-gray-500 mt-2">tCO₂e</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600 mb-2">
              Scope 2
            </div>
            <div className="text-3xl font-bold text-gray-900">0</div>
            <div className="text-sm text-gray-500 mt-2">tCO₂e</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600 mb-2">
              Scope 3
            </div>
            <div className="text-3xl font-bold text-gray-900">0</div>
            <div className="text-sm text-gray-500 mt-2">tCO₂e</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-600 hover:bg-green-50 transition-colors text-left">
              <div className="text-lg font-medium text-gray-900 mb-1">
                Add Emission Data
              </div>
              <div className="text-sm text-gray-600">
                Record new emission entries
              </div>
            </button>
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-600 hover:bg-green-50 transition-colors text-left">
              <div className="text-lg font-medium text-gray-900 mb-1">
                Generate Report
              </div>
              <div className="text-sm text-gray-600">
                Create compliance reports
              </div>
            </button>
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-600 hover:bg-green-50 transition-colors text-left">
              <div className="text-lg font-medium text-gray-900 mb-1">
                View Analytics
              </div>
              <div className="text-sm text-gray-600">
                Analyze emission trends
              </div>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Recent Activity
          </h2>
          <div className="text-center py-8 text-gray-500">
            No recent activity. Start by adding your first emission data.
          </div>
        </div>
      </main>
    </div>
  );
}

