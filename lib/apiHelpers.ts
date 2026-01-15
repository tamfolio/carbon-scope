import { NextResponse } from "next/server";
import { verifyToken } from "./auth";
import { prisma } from "./prisma";

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string | null;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  organizationId: string | null;
}

export interface AuthResult {
  user: AuthenticatedUser;
  token: string;
}

/**
 * Authenticates a request by verifying the JWT token from the Authorization header
 * @param request The incoming request
 * @returns The authenticated user and token, or null if authentication fails
 */
export async function authenticateRequest(
  request: Request
): Promise<AuthResult | null> {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        organizationId: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      return null;
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organizationId: user.organizationId,
      },
      token,
    };
  } catch (error) {
    console.error("Authentication error:", error);
    return null;
  }
}

/**
 * Requires that the user is authenticated and has ADMIN or SUPER_ADMIN role
 * @param request The incoming request
 * @returns The authenticated admin user, or an error response
 */
export async function requireAdmin(
  request: Request
): Promise<{ user: AuthenticatedUser } | NextResponse> {
  const authResult = await authenticateRequest(request);

  if (!authResult) {
    return NextResponse.json(
      { error: "Unauthorized - Invalid or missing token" },
      { status: 401 }
    );
  }

  if (authResult.user.role !== "ADMIN" && authResult.user.role !== "SUPER_ADMIN") {
    return NextResponse.json(
      { error: "Forbidden - Admin access required" },
      { status: 403 }
    );
  }

  // Super admins don't need to belong to an organization
  if (authResult.user.role === "ADMIN" && !authResult.user.organizationId) {
    return NextResponse.json(
      { error: "Forbidden - Admin must belong to an organization" },
      { status: 403 }
    );
  }

  return { user: authResult.user };
}

/**
 * Requires that the user is authenticated and has SUPER_ADMIN role
 * @param request The incoming request
 * @returns The authenticated super admin user, or an error response
 */
export async function requireSuperAdmin(
  request: Request
): Promise<{ user: AuthenticatedUser } | NextResponse> {
  const authResult = await authenticateRequest(request);

  if (!authResult) {
    return NextResponse.json(
      { error: "Unauthorized - Invalid or missing token" },
      { status: 401 }
    );
  }

  if (authResult.user.role !== "SUPER_ADMIN") {
    return NextResponse.json(
      { error: "Forbidden - Super Admin access required" },
      { status: 403 }
    );
  }

  return { user: authResult.user };
}

/**
 * Requires that the user is authenticated and belongs to a specific organization
 * @param request The incoming request
 * @param organizationId Optional organization ID to check. If not provided, uses user's organization
 * @returns The authenticated user, or an error response
 */
export async function requireOrganization(
  request: Request,
  organizationId?: string
): Promise<{ user: AuthenticatedUser } | NextResponse> {
  const authResult = await authenticateRequest(request);

  if (!authResult) {
    return NextResponse.json(
      { error: "Unauthorized - Invalid or missing token" },
      { status: 401 }
    );
  }

  if (!authResult.user.organizationId) {
    return NextResponse.json(
      { error: "Forbidden - User must belong to an organization" },
      { status: 403 }
    );
  }

  if (organizationId && authResult.user.organizationId !== organizationId) {
    return NextResponse.json(
      { error: "Forbidden - Access denied to this organization" },
      { status: 403 }
    );
  }

  return { user: authResult.user };
}

/**
 * Creates an activity log entry for admin actions
 * @param params Activity log parameters
 */
export async function createActivityLog(params: {
  userId: string;
  organizationId: string | null;
  action: string;
  entityType: string;
  entityId?: string;
  description: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        userId: params.userId,
        organizationId: params.organizationId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        description: params.description,
        metadata: params.metadata ? JSON.stringify(params.metadata) : null,
      },
    });
  } catch (error) {
    console.error("Error creating activity log:", error);
  }
}

/**
 * Helper to check if a response is an error (NextResponse)
 * @param result The result from requireAdmin or requireOrganization
 * @returns True if the result is an error response
 */
export function isErrorResponse(
  result: { user: AuthenticatedUser } | NextResponse
): result is NextResponse {
  return result instanceof NextResponse;
}
