import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { hashPassword, validatePassword, verifyPassword } from "@/lib/passwords";

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
    console.error("staff-login: admin user not found", {
      email: normalizedEmail,
    });
    throw new Error("invalid_staff_credentials");
  }

  if (!user.passwordHash) {
    console.error("staff-login: admin user has no password hash", {
      userId: user.id,
      email: normalizedEmail,
    });
    throw new Error("invalid_staff_credentials");
  }

  if (!verifyPassword(password, user.passwordHash)) {
    console.error("staff-login: password mismatch", {
      userId: user.id,
      email: normalizedEmail,
    });
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
