/**
 * Single Emission API Endpoints
 * GET /api/emissions/[id] - Get single emission
 * PUT /api/emissions/[id] - Update emission
 * DELETE /api/emissions/[id] - Delete emission
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { EmissionUpdateSchema, formatZodErrors } from '@/lib/validations';
import { calculateEmissions } from '@/lib/calculationEngine';
import { getFactorById } from '@/lib/emissionFactors';

// ============================================================================
// GET /api/emissions/[id] - Get single emission record
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Handle params (Promise in Next.js 15+)
    const resolvedParams = await params;
    const emissionId = resolvedParams.id;

    // Get emission
    const emission = await prisma.emission.findUnique({
      where: { id: emissionId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!emission) {
      return NextResponse.json({ error: 'Emission not found' }, { status: 404 });
    }

    // Check if user has access to this emission
    if (emission.userId !== decoded.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ emission });
  } catch (error) {
    console.error('Error fetching emission:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================================================
// PUT /api/emissions/[id] - Update emission record
// ============================================================================

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Handle params (Promise in Next.js 15+)
    const resolvedParams = await params;
    const emissionId = resolvedParams.id;

    // Check if emission exists and user has access
    const existingEmission = await prisma.emission.findUnique({
      where: { id: emissionId },
    });

    if (!existingEmission) {
      return NextResponse.json({ error: 'Emission not found' }, { status: 404 });
    }

    if (existingEmission.userId !== decoded.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    body.id = emissionId;

    // Validate input (partial update allowed)
    const validation = EmissionUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: formatZodErrors(validation.error) },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Prepare update data
    const updateData: any = {};

    // If quantity or emission factor changed, recalculate CO2e
    let shouldRecalculate = false;

    if (data.scope !== undefined) {
      updateData.scope = data.scope;
      shouldRecalculate = true;
    }

    if (data.category !== undefined) {
      updateData.category = data.category;
      shouldRecalculate = true;
    }

    if (data.activity !== undefined) {
      updateData.activity = data.activity;
    }

    if (data.source !== undefined) {
      updateData.source = data.source;
      shouldRecalculate = true;
    }

    if (data.quantity !== undefined) {
      updateData.quantity = data.quantity;
      shouldRecalculate = true;
    }

    if (data.unit !== undefined) {
      updateData.unit = data.unit;
      shouldRecalculate = true;
    }

    if (data.date !== undefined) {
      updateData.date = data.date;
    }

    if (data.notes !== undefined) {
      updateData.notes = data.notes;
    }

    // If emission factor ID is provided, recalculate
    if (data.emissionFactorId !== undefined) {
      const emissionFactor = getFactorById(data.emissionFactorId);
      if (!emissionFactor) {
        return NextResponse.json({ error: 'Invalid emission factor ID' }, { status: 400 });
      }

      const quantity = data.quantity !== undefined ? data.quantity : existingEmission.quantity;

      const calculation = calculateEmissions({
        quantity,
        emissionFactorId: data.emissionFactorId,
      });

      updateData.emissionFactor = emissionFactor.factor;
      updateData.co2e = calculation.co2e;
      updateData.scope = emissionFactor.scope;
      updateData.category = emissionFactor.category;
      updateData.source = emissionFactor.source;
      updateData.unit = emissionFactor.unit;
    } else if (shouldRecalculate) {
      // Recalculate using existing emission factor if relevant fields changed
      const quantity = data.quantity !== undefined ? data.quantity : existingEmission.quantity;
      const factor = existingEmission.emissionFactor;

      updateData.co2e = Math.round(quantity * factor * 1000) / 1000;
    }

    // Update emission
    const updatedEmission = await prisma.emission.update({
      where: { id: emissionId },
      data: updateData,
    });

    return NextResponse.json({
      message: 'Emission updated successfully',
      emission: updatedEmission,
    });
  } catch (error) {
    console.error('Error updating emission:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================================================
// DELETE /api/emissions/[id] - Delete emission record
// ============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Handle params (Promise in Next.js 15+)
    const resolvedParams = await params;
    const emissionId = resolvedParams.id;

    // Check if emission exists and user has access
    const emission = await prisma.emission.findUnique({
      where: { id: emissionId },
    });

    if (!emission) {
      return NextResponse.json({ error: 'Emission not found' }, { status: 404 });
    }

    if (emission.userId !== decoded.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete emission
    await prisma.emission.delete({
      where: { id: emissionId },
    });

    return NextResponse.json({
      message: 'Emission deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting emission:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
