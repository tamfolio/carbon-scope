/**
 * Financed Emissions Statistics API
 * GET /api/financed-emissions/stats - Get aggregated financed emissions statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// Helper function to generate all periods in a range
function generateAllPeriods(
  startDate: Date,
  endDate: Date,
  periodType: 'day' | 'week' | 'month'
): string[] {
  const periods: string[] = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    if (periodType === 'day') {
      periods.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    } else if (periodType === 'week') {
      // Get week start (Monday)
      const dayOfWeek = current.getDay();
      const diff = current.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const weekStart = new Date(current);
      weekStart.setDate(diff);
      periods.push(weekStart.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 7);
    } else {
      // month
      periods.push(`${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`);
      current.setMonth(current.getMonth() + 1);
    }
  }

  return periods;
}

// Helper function to aggregate financed emissions by time period with scope breakdown
function aggregateByPeriod(
  financedEmissions: Array<{ scope1: number; scope2: number; scope3: number; createdAt: Date }>,
  period: 'day' | 'week' | 'month',
  startDate: Date,
  endDate: Date
): Array<{ period: string; scope1: number; scope2: number; scope3: number; total: number }> {
  // Generate all periods in the range
  const allPeriods = generateAllPeriods(startDate, endDate, period);

  // Initialize all periods with zero values
  const periodData: Record<string, { scope1: number; scope2: number; scope3: number }> = {};
  allPeriods.forEach(p => {
    periodData[p] = { scope1: 0, scope2: 0, scope3: 0 };
  });

  // Fill in actual emission data
  financedEmissions.forEach((emission) => {
    const date = new Date(emission.createdAt);
    let periodKey: string;

    if (period === 'day') {
      periodKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
    } else if (period === 'week') {
      // Get week start (Monday)
      const dayOfWeek = date.getDay();
      const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const weekStart = new Date(date);
      weekStart.setDate(diff);
      periodKey = weekStart.toISOString().split('T')[0];
    } else {
      // month
      periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }

    // Only add if the period is in our range
    if (periodData[periodKey]) {
      periodData[periodKey].scope1 += emission.scope1;
      periodData[periodKey].scope2 += emission.scope2;
      periodData[periodKey].scope3 += emission.scope3;
    }
  });

  return allPeriods.map(period => ({
    period,
    scope1: Math.round(periodData[period].scope1 * 100) / 100,
    scope2: Math.round(periodData[period].scope2 * 100) / 100,
    scope3: Math.round(periodData[period].scope3 * 100) / 100,
    total: Math.round((periodData[period].scope1 + periodData[period].scope2 + periodData[period].scope3) * 100) / 100,
  }));
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const periodType = searchParams.get('period') || 'month'; // day, week, month
    const daysBack = parseInt(searchParams.get('days') || '30');

    // Build base where clause (without date filter initially)
    const baseWhere: Prisma.FinancedEmissionWhereInput = {
      userId: user.id,
    };

    if (user.organizationId) {
      baseWhere.organizationId = user.organizationId;
    }

    // First, get the actual date range of user's financed emissions
    const dateRange = await prisma.financedEmission.aggregate({
      where: baseWhere,
      _min: { createdAt: true },
      _max: { createdAt: true },
    });

    // If user has no financed emissions, return empty data
    if (!dateRange._min.createdAt || !dateRange._max.createdAt) {
      return NextResponse.json({
        summary: {
          totalCO2e: 0,
          scope1: 0,
          scope2: 0,
          scope3: 0,
          count: 0,
        },
        topSectors: [],
        topInvestmentTypes: [],
        timeSeries: [],
        periodType,
        dateRange: {
          start: new Date().toISOString(),
          end: new Date().toISOString(),
        },
      });
    }

    // Use the actual data range OR the requested period, whichever is more restrictive
    const actualEndDate = new Date(dateRange._max.createdAt);
    const requestedEndDate = new Date();
    const endDate = actualEndDate < requestedEndDate ? actualEndDate : requestedEndDate;

    const requestedStartDate = new Date();
    requestedStartDate.setDate(requestedStartDate.getDate() - daysBack);
    const actualStartDate = new Date(dateRange._min.createdAt);
    const startDate = actualStartDate > requestedStartDate ? actualStartDate : requestedStartDate;

    // Build where clause with date filter
    const where: Prisma.FinancedEmissionWhereInput = {
      ...baseWhere,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    // Get all financed emissions for the user
    const financedEmissions = await prisma.financedEmission.findMany({
      where,
      select: {
        scope1: true,
        scope2: true,
        scope3: true,
        totalEmissions: true,
        sector: true,
        investmentType: true,
        companyName: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Calculate aggregated statistics
    let totalScope1 = 0;
    let totalScope2 = 0;
    let totalScope3 = 0;
    let totalCO2e = 0;
    const bySector: Record<string, number> = {};
    const byInvestmentType: Record<string, number> = {};

    financedEmissions.forEach((emission) => {
      totalScope1 += emission.scope1;
      totalScope2 += emission.scope2;
      totalScope3 += emission.scope3;
      totalCO2e += emission.totalEmissions;

      // Aggregate by sector
      if (emission.sector) {
        bySector[emission.sector] = (bySector[emission.sector] || 0) + emission.totalEmissions;
      }

      // Aggregate by investment type
      if (emission.investmentType) {
        byInvestmentType[emission.investmentType] = (byInvestmentType[emission.investmentType] || 0) + emission.totalEmissions;
      }
    });

    // Calculate time series data based on period
    const timeSeries = aggregateByPeriod(
      financedEmissions,
      periodType as 'day' | 'week' | 'month',
      startDate,
      endDate
    );

    // Get top sectors (equivalent to categories)
    const topCategories = Object.entries(bySector)
      .map(([category, co2e]) => ({ category, co2e }))
      .sort((a, b) => b.co2e - a.co2e)
      .slice(0, 5);

    // Get top investment types (equivalent to sources)
    const topSources = Object.entries(byInvestmentType)
      .map(([source, co2e]) => ({ source, co2e }))
      .sort((a, b) => b.co2e - a.co2e)
      .slice(0, 5);

    return NextResponse.json({
      summary: {
        totalCO2e: Math.round(totalCO2e * 100) / 100,
        scope1: Math.round(totalScope1 * 100) / 100,
        scope2: Math.round(totalScope2 * 100) / 100,
        scope3: Math.round(totalScope3 * 100) / 100,
        count: financedEmissions.length,
      },
      topCategories,
      topSources,
      timeSeries,
      periodType,
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching financed emissions stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
