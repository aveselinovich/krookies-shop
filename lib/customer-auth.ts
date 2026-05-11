import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { validateEmail } from "@/lib/email";
import { hashPassword, validatePassword, verifyPassword } from "@/lib/passwords";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function registerCustomerByEmail(name: string, email: string, password: string) {
  const trimmedName = name.trim();
  const normalizedEmail = normalizeEmail(email);

  if (!trimmedName) {
    throw new Error("name_required");
  }

  if (!normalizedEmail) {
    throw new Error("email_required");
  }

  if (!validateEmail(normalizedEmail)) {
    throw new Error("invalid_email");
  }

  validatePassword(password);

  const existingUser = await prisma.user.findFirst({
    where: { email: normalizedEmail },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });

  if (existingUser) {
    throw new Error("email_already_used");
  }

  return prisma.user.create({
    data: {
      name: trimmedName,
      email: normalizedEmail,
      phone: null,
      role: UserRole.customer,
      passwordHash: hashPassword(password),
    },
  });
}

export async function authenticateCustomerByEmail(email: string, password: string) {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    throw new Error("email_required");
  }

  if (!validateEmail(normalizedEmail)) {
    throw new Error("invalid_email");
  }

  if (!password) {
    throw new Error("password_required");
  }

  const user = await prisma.user.findFirst({
    where: {
      email: normalizedEmail,
      role: UserRole.customer,
    },
    orderBy: { createdAt: "asc" },
  });

  if (!user?.passwordHash || !verifyPassword(password, user.passwordHash)) {
    throw new Error("invalid_credentials");
  }

  return user;
}
