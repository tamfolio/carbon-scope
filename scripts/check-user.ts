import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkUser(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { organization: true },
    });

    if (!user) {
      console.error(`❌ User with email ${email} not found`);
      process.exit(1);
    }

    console.log("\n📋 User Information:");
    console.log("==================");
    console.log(`Email: ${user.email}`);
    console.log(`Name: ${user.name || "N/A"}`);
    console.log(`Role: ${user.role}`);
    console.log(`Active: ${user.isActive ? "✓ Yes" : "❌ No"}`);
    console.log(`Created: ${user.createdAt}`);
    console.log(`Last Login: ${user.lastLoginAt || "Never"}`);

    console.log("\n🏢 Organization:");
    console.log("==================");
    if (user.organizationId && user.organization) {
      console.log(`✓ Belongs to: ${user.organization.name}`);
      console.log(`  ID: ${user.organizationId}`);
      console.log(`  Description: ${user.organization.description || "N/A"}`);
    } else {
      console.log("❌ No organization assigned");
    }

    console.log("\n🔍 Admin Access Check:");
    console.log("==================");

    const checks = [
      { name: "Has ADMIN role", pass: user.role === "ADMIN" || user.role === "SUPER_ADMIN" },
      { name: "Is active", pass: user.isActive },
      { name: "Has organization", pass: !!user.organizationId },
    ];

    checks.forEach(check => {
      console.log(`${check.pass ? "✓" : "❌"} ${check.name}`);
    });

    const canAccessAdmin = checks.every(c => c.pass);

    console.log(`\n${canAccessAdmin ? "✓" : "❌"} Admin Dashboard Access: ${canAccessAdmin ? "ALLOWED" : "BLOCKED"}`);

    if (!canAccessAdmin) {
      console.log("\n🔧 Issues to fix:");
      checks.filter(c => !c.pass).forEach(c => {
        console.log(`  - ${c.name}`);
      });
    }
  } catch (error) {
    console.error("❌ Error checking user:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

const email = process.argv[2];

if (!email) {
  console.error("Usage: npm run check-user <email>");
  console.error("Example: npm run check-user user@example.com");
  process.exit(1);
}

checkUser(email);
