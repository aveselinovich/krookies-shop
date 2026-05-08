import crypto from "crypto";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

function validatePassword(password: string) {
  if (password.trim().length < 8) {
    throw new Error("password_too_short");
  }
}

function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, passwordHash: string) {
  const [salt, storedHash] = passwordHash.split(":");
  if (!salt || !storedHash) return false;
  const computedHash = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(storedHash, "hex"), Buffer.from(computedHash, "hex"));
}

async function setPasswordHash(userId: string, password: string) {
  validatePassword(password);
  return prisma.user.update({
    where: { id: userId },
    data: { passwordHash: hashPassword(password) },
  });
}

export async function assignAdminPassword(userId: string, password: string) {
  await setPasswordHash(userId, password);
}

export async function removeAdminPassword(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: null },
  });
}

export async function authenticateAdminByEmail(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) throw new Error("email_required");
  if (!password) throw new Error("password_required");

  const user = await prisma.user.findFirst({
    where: {
      email: normalizedEmail,
      role: UserRole.admin,
    },
    orderBy: { createdAt: "asc" },
  });

  if (!user || user.role !== UserRole.admin) {
    throw new Error("invalid_staff_credentials");
  }

  if (!user.passwordHash || !verifyPassword(password, user.passwordHash)) {
    throw new Error("invalid_staff_credentials");
  }

  return user;
}

export async function changeAdminPassword(userId: string, currentPassword: string, nextPassword: string) {
  if (!currentPassword) throw new Error("password_required");
  validatePassword(nextPassword);

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || user.role !== UserRole.admin) {
    throw new Error("forbidden");
  }

  if (!user.passwordHash || !verifyPassword(currentPassword, user.passwordHash)) {
    throw new Error("invalid_current_password");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: hashPassword(nextPassword) },
  });
}
