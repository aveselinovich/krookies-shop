import crypto from "crypto";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/lib/phone";
import { findOrCreateUserByPhone } from "@/lib/auth";
const PRIMARY_ADMIN_PHONE = normalizePhone(process.env.ADMIN_PHONE || "+79959178862");
const PRIMARY_ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "mackacrvena@gmail.com").trim().toLowerCase();
const PRIMARY_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "krookiesadmin";

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

async function ensurePrimaryAdminCredential(user: {
  id: string;
  phone: string;
  role: UserRole;
  passwordHash: string | null;
}) {
  if (user.role !== UserRole.admin) return;
  if (normalizePhone(user.phone) !== PRIMARY_ADMIN_PHONE) return;
  if (
    user.passwordHash &&
    verifyPassword(PRIMARY_ADMIN_PASSWORD, user.passwordHash)
  ) {
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: hashPassword(PRIMARY_ADMIN_PASSWORD) },
  });
}

async function findAdminForStaffLogin(normalizedEmail: string) {
  if (normalizedEmail === PRIMARY_ADMIN_EMAIL) {
    const { user } = await findOrCreateUserByPhone(PRIMARY_ADMIN_PHONE);
    if (user.role === UserRole.admin) {
      return user;
    }
  }

  return prisma.user.findFirst({
    where: {
      email: normalizedEmail,
      role: UserRole.admin,
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function authenticateAdminByEmail(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) throw new Error("email_required");
  if (!password) throw new Error("password_required");

  const user = await findAdminForStaffLogin(normalizedEmail);

  if (!user || user.role !== UserRole.admin) {
    throw new Error("invalid_staff_credentials");
  }

  await ensurePrimaryAdminCredential(user);
  const adminUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!adminUser?.passwordHash || !verifyPassword(password, adminUser.passwordHash)) {
    throw new Error("invalid_staff_credentials");
  }

  return adminUser;
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

  await ensurePrimaryAdminCredential(user);
  const adminUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!adminUser?.passwordHash || !verifyPassword(currentPassword, adminUser.passwordHash)) {
    throw new Error("invalid_current_password");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: hashPassword(nextPassword) },
  });
}
