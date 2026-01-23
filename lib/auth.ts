import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error(
    "JWT_SECRET environment variable is not set. " +
    "Please set JWT_SECRET in your environment variables for security."
  );
}

export type Role = "USER" | "ADMIN" | "SUPER_ADMIN";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Gets the role of a user
 * @param userId The user ID
 * @returns The user's role or null if user not found
 */
export async function getUserRole(userId: string): Promise<Role | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    return user?.role || null;
  } catch (error) {
    console.error("Error getting user role:", error);
    return null;
  }
}

/**
 * Checks if a user has admin privileges (ADMIN or SUPER_ADMIN)
 * @param userId The user ID
 * @returns True if user is an admin
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const role = await getUserRole(userId);
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

/**
 * Checks if a user has super admin privileges
 * @param userId The user ID
 * @returns True if user is a super admin
 */
export async function isSuperAdmin(userId: string): Promise<boolean> {
  const role = await getUserRole(userId);
  return role === "SUPER_ADMIN";
}

/**
 * Checks if a user belongs to a specific organization
 * @param userId The user ID
 * @param organizationId The organization ID
 * @returns True if user belongs to the organization
 */
export async function checkOrganizationAccess(
  userId: string,
  organizationId: string
): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true },
    });
    return user?.organizationId === organizationId;
  } catch (error) {
    console.error("Error checking organization access:", error);
    return false;
  }
}

/**
 * Updates user's last login timestamp
 * @param userId The user ID
 */
export async function updateLastLogin(userId: string): Promise<void> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  } catch (error) {
    console.error("Error updating last login:", error);
  }
}

/**
 * Generates a random temporary password
 * @returns A random password string
 */
export function generateTemporaryPassword(): string {
  const length = 12;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

