import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

loadEnvConfig(process.cwd());

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seed...");

  // Check if super admin already exists
  const existingSuperAdmin = await prisma.user.findFirst({
    where: { role: "SUPER_ADMIN" },
  });

  if (existingSuperAdmin) {
    console.log("Super admin already exists. Skipping seed.");
    console.log(`Super admin email: ${existingSuperAdmin.email}`);
    return;
  }

  // Create super admin account
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || "admin@carbonscope.com";
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || "SuperAdmin123!";
  const superAdminName = process.env.SUPER_ADMIN_NAME || "Super Admin";

  const hashedPassword = await bcrypt.hash(superAdminPassword, 12);

  const superAdmin = await prisma.user.create({
    data: {
      email: superAdminEmail,
      name: superAdminName,
      password: hashedPassword,
      role: "SUPER_ADMIN",
      isActive: true,
      organizationId: null, // Super admin is organization-independent
    },
  });

  console.log("✓ Super admin created successfully!");
  console.log(`Email:    ${superAdmin.email}`);
  console.log(`Password: ${superAdminPassword}`);
  console.log(`Name:     ${superAdmin.name}`);
  console.log(`Role:     ${superAdmin.role}`);
  console.log("\n  IMPORTANT: Please change the password after first login!");
  console.log("\n TIP: You can customize credentials by setting environment variables:");
  console.log("   SUPER_ADMIN_EMAIL");
  console.log("   SUPER_ADMIN_PASSWORD");
  console.log("   SUPER_ADMIN_NAME");
}

main()
  .catch((e) => {
    console.error("Error during seed:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
