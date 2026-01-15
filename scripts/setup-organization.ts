import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function setupOrganization(email: string, orgName?: string) {
  try {
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email },
      include: { organization: true },
    });

    if (!user) {
      console.error(`❌ User with email ${email} not found`);
      process.exit(1);
    }

    // Check if user already has an organization
    if (user.organizationId && user.organization) {
      console.log(`✓ User already belongs to organization: ${user.organization.name}`);
      console.log(`  Organization ID: ${user.organizationId}`);
      return;
    }

    // Check if there are any existing organizations
    const existingOrgs = await prisma.organization.findMany();

    if (existingOrgs.length > 0) {
      console.log(`\n📋 Found ${existingOrgs.length} existing organization(s):`);
      existingOrgs.forEach((org, index) => {
        console.log(`  ${index + 1}. ${org.name} (ID: ${org.id})`);
      });

      // Assign user to the first organization
      const org = existingOrgs[0];
      await prisma.user.update({
        where: { email },
        data: { organizationId: org.id },
      });

      console.log(`\n✓ Assigned ${email} to organization: ${org.name}`);
      return;
    }

    // Create a new organization
    const organizationName = orgName || `${user.name || user.email.split("@")[0]}'s Organization`;

    const organization = await prisma.organization.create({
      data: {
        name: organizationName,
        description: "Main organization",
      },
    });

    // Assign user to the organization
    await prisma.user.update({
      where: { email },
      data: { organizationId: organization.id },
    });

    console.log(`\n✓ Created new organization: ${organization.name}`);
    console.log(`✓ Assigned ${email} to this organization`);
    console.log(`  Organization ID: ${organization.id}`);
    console.log(`\n🎉 Setup complete! You can now access the admin dashboard.`);
  } catch (error) {
    console.error("❌ Error setting up organization:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

const email = process.argv[2];
const orgName = process.argv[3];

if (!email) {
  console.error("Usage: npm run setup-org <email> [organization-name]");
  console.error("Example: npm run setup-org user@example.com \"My Company\"");
  process.exit(1);
}

setupOrganization(email, orgName);
