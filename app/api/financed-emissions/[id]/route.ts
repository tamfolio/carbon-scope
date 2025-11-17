/**
 * Individual Financed Emission API Endpoints
 * DELETE /api/financed-emissions/[id] - Delete a financed emission record
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// ============================================================================
// DELETE /api/financed-emissions/[id] - Delete financed emission record
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

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id } = await params;

    // Check if the financed emission exists and belongs to the user
    const financedEmission = await prisma.financedEmission.findUnique({
      where: { id },
    });

    if (!financedEmission) {
      return NextResponse.json(
        { error: 'Financed emission not found' },
        { status: 404 }
      );
    }

    // Check ownership - user must own the record or be in the same organization
    if (
      financedEmission.userId !== user.id &&
      (!user.organizationId || financedEmission.organizationId !== user.organizationId)
    ) {
      return NextResponse.json(
        { error: 'Not authorized to delete this record' },
        { status: 403 }
      );
    }

    // Delete the financed emission
    await prisma.financedEmission.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Financed emission record deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting financed emission:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
