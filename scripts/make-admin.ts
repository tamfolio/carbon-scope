import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function makeAdmin(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.error(`User with email ${email} not found`);
      process.exit(1);
    }

    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role: "ADMIN" },
    });

    console.log(`✓ Successfully promoted ${updatedUser.email} to ADMIN role`);
    console.log(`  Name: ${updatedUser.name || "N/A"}`);
    console.log(`  Role: ${updatedUser.role}`);
    console.log(`  Organization: ${updatedUser.organizationId || "None"}`);
  } catch (error) {
    console.error("Error promoting user:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

const email = process.argv[2];

if (!email) {
  console.error("Usage: npm run make-admin <email>");
  console.error("Example: npm run make-admin user@example.com");
  process.exit(1);
}

makeAdmin(email);
