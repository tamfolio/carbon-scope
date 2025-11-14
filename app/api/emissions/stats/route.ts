/**
 * Emissions Statistics API
 * GET /api/emissions/stats - Get aggregated emissions statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { aggregateEmissions } from '@/lib/calculationEngine';

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

// Helper function to aggregate emissions by time period with scope breakdown
function aggregateByPeriod(
  emissions: Array<{ co2e: number; scope: string; date: Date }>,
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
  emissions.forEach((emission) => {
    const date = new Date(emission.date);
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
      if (emission.scope === 'Scope 1') {
        periodData[periodKey].scope1 += emission.co2e;
      } else if (emission.scope === 'Scope 2') {
        periodData[periodKey].scope2 += emission.co2e;
      } else if (emission.scope === 'Scope 3') {
        periodData[periodKey].scope3 += emission.co2e;
      }
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

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    // Build where clause
    const where: any = {
      userId: user.id,
      date: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (user.organizationId) {
      where.organizationId = user.organizationId;
    }

    // Get all emissions for the user
    const emissions = await prisma.emission.findMany({
      where,
      select: {
        co2e: true,
        scope: true,
        category: true,
        source: true,
        date: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Calculate aggregated statistics
    const aggregated = aggregateEmissions(emissions);

    // Calculate time series data based on period
    const timeSeries = aggregateByPeriod(
      emissions,
      periodType as 'day' | 'week' | 'month',
      startDate,
      endDate
    );

    // Get top categories and sources
    const topCategories = Object.entries(aggregated.byCategory)
      .map(([category, co2e]) => ({ category, co2e }))
      .sort((a, b) => b.co2e - a.co2e)
      .slice(0, 5);

    const topSources = Object.entries(aggregated.bySource)
      .map(([source, co2e]) => ({ source, co2e }))
      .sort((a, b) => b.co2e - a.co2e)
      .slice(0, 5);

    return NextResponse.json({
      summary: {
        totalCO2e: aggregated.totalCO2e,
        scope1: aggregated.scope1,
        scope2: aggregated.scope2,
        scope3: aggregated.scope3,
        count: aggregated.count,
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
    console.error('Error fetching emissions stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
