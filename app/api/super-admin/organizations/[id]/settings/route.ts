import { NextResponse } from "next/server";
import { requireSuperAdmin, isErrorResponse, createActivityLog } from "@/lib/apiHelpers";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireSuperAdmin(request);
    if (isErrorResponse(authResult)) {
      return authResult;
    }

    const { id } = await params;

    // Verify organization exists
    const organization = await prisma.organization.findUnique({
      where: { id },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // Fetch or create settings
    let settings = await prisma.organizationSettings.findUnique({
      where: { organizationId: id },
    });

    // Create default settings if they don't exist
    if (!settings) {
      settings = await prisma.organizationSettings.create({
        data: {
          organizationId: id,
          userLimit: null,
          emissionLimit: null,
          features: JSON.stringify({
            financedEmissions: true,
            advancedAnalytics: true,
            apiAccess: false,
            customReports: false,
          }),
          customSettings: JSON.stringify({}),
        },
      });
    }

    // Parse JSON fields
    const parsedSettings = {
      ...settings,
      features: settings.features ? JSON.parse(settings.features) : {
        financedEmissions: true,
        advancedAnalytics: true,
        apiAccess: false,
        customReports: false,
      },
      customSettings: settings.customSettings ? JSON.parse(settings.customSettings) : {},
    };

    return NextResponse.json({ settings: parsedSettings });
  } catch (error) {
    console.error("Error fetching organization settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireSuperAdmin(request);
    if (isErrorResponse(authResult)) {
      return authResult;
    }

    const { user: adminUser } = authResult;
    const { id } = await params;

    // Parse request body
    const body = await request.json();
    const { userLimit, emissionLimit, features, customSettings } = body;

    // Verify organization exists
    const organization = await prisma.organization.findUnique({
      where: { id },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // Validate limits
    if (userLimit !== undefined && userLimit !== null && (typeof userLimit !== "number" || userLimit < 0)) {
      return NextResponse.json(
        { error: "userLimit must be a positive number or null" },
        { status: 400 }
      );
    }

    if (emissionLimit !== undefined && emissionLimit !== null && (typeof emissionLimit !== "number" || emissionLimit < 0)) {
      return NextResponse.json(
        { error: "emissionLimit must be a positive number or null" },
        { status: 400 }
      );
    }

    // Validate features if provided
    if (features !== undefined) {
      const validFeatures = ["financedEmissions", "advancedAnalytics", "apiAccess", "customReports"];
      const providedFeatures = Object.keys(features);
      const invalidFeatures = providedFeatures.filter(f => !validFeatures.includes(f));

      if (invalidFeatures.length > 0) {
        return NextResponse.json(
          { error: `Invalid features: ${invalidFeatures.join(", ")}` },
          { status: 400 }
        );
      }
    }

    // Fetch current settings
    let currentSettings = await prisma.organizationSettings.findUnique({
      where: { organizationId: id },
    });

    // Create settings if they don't exist
    if (!currentSettings) {
      currentSettings = await prisma.organizationSettings.create({
        data: {
          organizationId: id,
          userLimit: null,
          emissionLimit: null,
          features: JSON.stringify({
            financedEmissions: true,
            advancedAnalytics: true,
            apiAccess: false,
            customReports: false,
          }),
          customSettings: JSON.stringify({}),
        },
      });
    }

    // Parse current features and customSettings
    const currentFeatures = currentSettings.features ? JSON.parse(currentSettings.features) : {};
    const currentCustomSettings = currentSettings.customSettings ? JSON.parse(currentSettings.customSettings) : {};

    // Build update data
    const updateData: any = {};

    if (userLimit !== undefined) {
      updateData.userLimit = userLimit;
    }

    if (emissionLimit !== undefined) {
      updateData.emissionLimit = emissionLimit;
    }

    if (features !== undefined) {
      // Merge with existing features
      updateData.features = JSON.stringify({
        ...currentFeatures,
        ...features,
      });
    }

    if (customSettings !== undefined) {
      // Merge with existing custom settings
      updateData.customSettings = JSON.stringify({
        ...currentCustomSettings,
        ...customSettings,
      });
    }

    // Update settings
    const updatedSettings = await prisma.organizationSettings.update({
      where: { organizationId: id },
      data: updateData,
    });

    // Log activity
    await createActivityLog({
      userId: adminUser.id,
      organizationId: id,
      action: "ORGANIZATION_SETTINGS_UPDATED",
      entityType: "Organization",
      entityId: id,
      description: `Updated settings for organization ${organization.name}`,
      metadata: {
        updatedBy: adminUser.email,
        changes: {
          userLimit: userLimit !== undefined,
          emissionLimit: emissionLimit !== undefined,
          features: features !== undefined,
          customSettings: customSettings !== undefined,
        },
        newValues: {
          userLimit,
          emissionLimit,
          features,
          customSettings,
        },
      },
    });

    // Parse JSON fields for response
    const parsedSettings = {
      ...updatedSettings,
      features: updatedSettings.features ? JSON.parse(updatedSettings.features) : {},
      customSettings: updatedSettings.customSettings ? JSON.parse(updatedSettings.customSettings) : {},
    };

    return NextResponse.json({
      settings: parsedSettings,
      message: "Organization settings updated successfully",
    });
  } catch (error) {
    console.error("Error updating organization settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
