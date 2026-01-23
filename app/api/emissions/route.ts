/**
 * Emissions API Endpoints
 * GET /api/emissions - List emissions with filtering/pagination
 * POST /api/emissions - Create new emission record
 */

import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { EmissionInputSchema, EmissionFilterSchema, formatZodErrors } from '@/lib/validations';
import { calculateEmissions } from '@/lib/calculationEngine';
import { getFactorById } from '@/lib/emissionFactors';

// ============================================================================
// GET /api/emissions - List emissions with filtering and pagination
// ============================================================================

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

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { organization: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const filterParams = {
      scope: searchParams.get('scope') || undefined,
      category: searchParams.get('category') || undefined,
      source: searchParams.get('source') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      minCO2e: searchParams.get('minCO2e') ? parseFloat(searchParams.get('minCO2e')!) : undefined,
      maxCO2e: searchParams.get('maxCO2e') ? parseFloat(searchParams.get('maxCO2e')!) : undefined,
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
      sortBy: searchParams.get('sortBy') || 'date',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    };

    // Validate filter parameters
    const validation = EmissionFilterSchema.safeParse(filterParams);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid filter parameters', details: formatZodErrors(validation.error) },
        { status: 400 }
      );
    }

    const filters = validation.data;

    // Build where clause
    const where: Prisma.EmissionWhereInput = {
      userId: user.id,
    };

    // Add organization filter if user belongs to an org
    if (user.organizationId) {
      where.organizationId = user.organizationId;
    }

    if (filters.scope) {
      where.scope = filters.scope;
    }

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.source) {
      where.source = filters.source;
    }

    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) {
        where.date.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.date.lte = filters.endDate;
      }
    }

    if (filters.minCO2e || filters.maxCO2e) {
      where.co2e = {};
      if (filters.minCO2e) {
        where.co2e.gte = filters.minCO2e;
      }
      if (filters.maxCO2e) {
        where.co2e.lte = filters.maxCO2e;
      }
    }

    if (filters.search) {
      where.OR = [
        { activity: { contains: filters.search, mode: 'insensitive' } },
        { source: { contains: filters.search, mode: 'insensitive' } },
        { notes: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // Get total count for pagination
    const totalCount = await prisma.emission.count({ where });

    // Get emissions with pagination
    const emissions = await prisma.emission.findMany({
      where,
      orderBy: {
        [filters.sortBy]: filters.sortOrder,
      },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
    });

    return NextResponse.json({
      emissions,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        totalCount,
        totalPages: Math.ceil(totalCount / filters.limit),
      },
    });
  } catch (error) {
    console.error('Error fetching emissions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================================================
// POST /api/emissions - Create new emission record
// ============================================================================

export async function POST(request: NextRequest) {
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

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { organization: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Parse request body
    const body = await request.json();

    // Validate input
    const validation = EmissionInputSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: formatZodErrors(validation.error) },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Get emission factor and validate
    const emissionFactor = getFactorById(data.emissionFactorId);
    if (!emissionFactor) {
      return NextResponse.json({ error: 'Invalid emission factor ID' }, { status: 400 });
    }

    // Verify scope, category, and source match the emission factor
    if (
      emissionFactor.scope !== data.scope ||
      emissionFactor.category !== data.category ||
      emissionFactor.source !== data.source
    ) {
      return NextResponse.json(
        { error: 'Emission factor does not match selected scope, category, and source' },
        { status: 400 }
      );
    }

    // Verify unit matches
    if (emissionFactor.unit !== data.unit) {
      return NextResponse.json(
        { error: `Unit must be ${emissionFactor.unit} for the selected source` },
        { status: 400 }
      );
    }

    // Calculate CO2e
    const calculation = calculateEmissions({
      quantity: data.quantity,
      emissionFactorId: data.emissionFactorId,
    });

    // Create emission record
    const emission = await prisma.emission.create({
      data: {
        scope: data.scope,
        category: data.category,
        activity: data.activity,
        source: data.source,
        quantity: data.quantity,
        unit: data.unit,
        emissionFactor: emissionFactor.factor,
        co2e: calculation.co2e,
        date: data.date,
        notes: data.notes || null,
        userId: user.id,
        organizationId: user.organizationId || null,
      },
    });

    return NextResponse.json(
      {
        message: 'Emission record created successfully',
        emission,
        calculation: {
          co2e: calculation.co2e,
          factor: emissionFactor.factor,
          factorDescription: emissionFactor.description,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating emission:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
