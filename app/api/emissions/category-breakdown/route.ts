/**
 * Category Breakdown API
 * GET /api/emissions/category-breakdown - Get monthly breakdown for a specific category
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

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
    const category = searchParams.get('category');
    const source = searchParams.get('source');

    if (!category && !source) {
      return NextResponse.json(
        { error: 'Either category or source parameter is required' },
        { status: 400 }
      );
    }

    // Build base where clause
    const baseWhere: any = {
      userId: user.id,
    };

    if (user.organizationId) {
      baseWhere.organizationId = user.organizationId;
    }

    if (category) {
      baseWhere.category = category;
    }

    if (source) {
      baseWhere.source = source;
    }

    // Get the actual date range of user's emissions for this category/source
    const dateRange = await prisma.emission.aggregate({
      where: baseWhere,
      _min: { date: true },
      _max: { date: true },
    });

    if (!dateRange._min.date || !dateRange._max.date) {
      return NextResponse.json({
        monthlyData: [],
        totalEmissions: 0,
        dateRange: {
          start: new Date().toISOString(),
          end: new Date().toISOString(),
        },
      });
    }

    // Get all emissions for this category/source
    const emissions = await prisma.emission.findMany({
      where: baseWhere,
      select: {
        co2e: true,
        scope: true,
        date: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Aggregate by month
    const monthlyData: Record<string, { scope1: number; scope2: number; scope3: number; total: number }> = {};

    emissions.forEach((emission) => {
      const date = new Date(emission.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { scope1: 0, scope2: 0, scope3: 0, total: 0 };
      }

      monthlyData[monthKey].total += emission.co2e;

      if (emission.scope === 'Scope 1') {
        monthlyData[monthKey].scope1 += emission.co2e;
      } else if (emission.scope === 'Scope 2') {
        monthlyData[monthKey].scope2 += emission.co2e;
      } else if (emission.scope === 'Scope 3') {
        monthlyData[monthKey].scope3 += emission.co2e;
      }
    });

    // Convert to array and format
    const monthlyArray = Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        scope1: Math.round(data.scope1 * 100) / 100,
        scope2: Math.round(data.scope2 * 100) / 100,
        scope3: Math.round(data.scope3 * 100) / 100,
        total: Math.round(data.total * 100) / 100,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    const totalEmissions = emissions.reduce((sum, e) => sum + e.co2e, 0);

    return NextResponse.json({
      monthlyData: monthlyArray,
      totalEmissions: Math.round(totalEmissions * 100) / 100,
      dateRange: {
        start: dateRange._min.date,
        end: dateRange._max.date,
      },
    });
  } catch (error) {
    console.error('Error fetching category breakdown:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
