/**
 * Financed Emissions API Endpoints
 * GET /api/financed-emissions - List financed emissions with filtering/pagination
 * POST /api/financed-emissions - Create new financed emission record
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// ============================================================================
// GET /api/financed-emissions - List financed emissions with filtering
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
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20;

    // Build where clause
    const where: any = {
      userId: user.id,
    };

    // Add organization filter if user belongs to an org
    if (user.organizationId) {
      where.organizationId = user.organizationId;
    }

    // Get total count for pagination
    const totalCount = await prisma.financedEmission.count({ where });

    // Get financed emissions with pagination
    const financedEmissions = await prisma.financedEmission.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({
      financedEmissions,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching financed emissions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================================================
// POST /api/financed-emissions - Create new financed emission record
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

    // Basic validation
    if (!body.investmentName || body.investmentName.length < 3) {
      return NextResponse.json(
        { error: 'Investment name is required (min 3 characters)' },
        { status: 400 }
      );
    }

    if (!body.investmentType) {
      return NextResponse.json(
        { error: 'Investment type is required' },
        { status: 400 }
      );
    }

    if (!body.investmentAmount || body.investmentAmount <= 0) {
      return NextResponse.json(
        { error: 'Investment amount must be greater than 0' },
        { status: 400 }
      );
    }

    if (!body.companyName || body.companyName.length < 2) {
      return NextResponse.json(
        { error: 'Company name is required (min 2 characters)' },
        { status: 400 }
      );
    }

    if (!body.sector) {
      return NextResponse.json(
        { error: 'Sector is required' },
        { status: 400 }
      );
    }

    if (!body.country || body.country.length < 2) {
      return NextResponse.json(
        { error: 'Country is required' },
        { status: 400 }
      );
    }

    if (body.attributionFactor < 0 || body.attributionFactor > 100) {
      return NextResponse.json(
        { error: 'Attribution factor must be between 0 and 100' },
        { status: 400 }
      );
    }

    if (!body.calculationMethod) {
      return NextResponse.json(
        { error: 'Calculation method is required' },
        { status: 400 }
      );
    }

    if (body.dataQualityScore < 1 || body.dataQualityScore > 5) {
      return NextResponse.json(
        { error: 'Data quality score must be between 1 and 5' },
        { status: 400 }
      );
    }

    if (!body.reportingYear) {
      return NextResponse.json(
        { error: 'Reporting year is required' },
        { status: 400 }
      );
    }

    if (!body.reportingPeriod) {
      return NextResponse.json(
        { error: 'Reporting period is required' },
        { status: 400 }
      );
    }

    if (!body.dataSource || body.dataSource.length < 3) {
      return NextResponse.json(
        { error: 'Data source is required (min 3 characters)' },
        { status: 400 }
      );
    }

    // Validate at least one scope has emissions
    if (!body.scope1 && !body.scope2 && !body.scope3) {
      return NextResponse.json(
        { error: 'At least one scope must have emissions data' },
        { status: 400 }
      );
    }

    // Calculate total emissions
    const totalEmissions = (body.scope1 || 0) + (body.scope2 || 0) + (body.scope3 || 0);

    // Create financed emission record
    const financedEmission = await prisma.financedEmission.create({
      data: {
        investmentName: body.investmentName,
        investmentType: body.investmentType,
        investmentAmount: body.investmentAmount,
        currency: body.currency,
        companyName: body.companyName,
        sector: body.sector,
        country: body.country,
        attributionFactor: body.attributionFactor,
        scope1: body.scope1 || 0,
        scope2: body.scope2 || 0,
        scope3: body.scope3 || 0,
        totalEmissions,
        calculationMethod: body.calculationMethod,
        dataQualityScore: body.dataQualityScore,
        reportingYear: body.reportingYear,
        reportingPeriod: body.reportingPeriod,
        dataSource: body.dataSource,
        description: body.description || null,
        userId: user.id,
        organizationId: user.organizationId || null,
      },
    });

    return NextResponse.json(
      {
        message: 'Financed emission record created successfully',
        financedEmission,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating financed emission:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
