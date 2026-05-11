import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { normalizePhone, validatePhone } from "@/lib/phone";
import { assignAdminPassword, removeAdminPassword } from "@/lib/admin-passwords";

type CreateOrPromoteAdminInput = {
  name?: string;
  phone: string;
  email?: string | null;
  password: string;
};

export type AdminUserListItem = Awaited<ReturnType<typeof toAdminListItem>>;

function getPrimaryAdminPhone() {
  return normalizePhone(process.env.ADMIN_PHONE || "+79959178862");
}

function isPrimaryAdminPhone(phone: string) {
  return normalizePhone(phone) === getPrimaryAdminPhone();
}

function requireUserPhone(phone: string | null) {
  if (!phone) {
    throw new Error("invalid_phone");
  }

  return phone;
}

function toAdminListItem(user: {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}) {
  const phone = requireUserPhone(user.phone);

  return {
    ...user,
    phone,
    isPrimary: isPrimaryAdminPhone(phone),
  };
}

export async function getAdminUsers() {
  const admins = await prisma.user.findMany({
    where: { role: UserRole.admin },
    orderBy: { createdAt: "asc" },
  });

  return admins.map(toAdminListItem);
}

export async function createOrPromoteAdmin(input: CreateOrPromoteAdminInput) {
  const phone = normalizePhone(input.phone);
  const name = input.name?.trim() || null;
  const email = input.email?.trim().toLowerCase() || null;
  const password = String(input.password || "");

  if (!validatePhone(phone)) {
    throw new Error("invalid_phone");
  }

  if (!email) {
    throw new Error("email_required");
  }

  if (email && !/^\S+@\S+\.\S+$/.test(email)) {
    throw new Error("invalid_email");
  }

  const existingUser = await prisma.user.findUnique({
    where: { phone },
  });

  if (email) {
    const emailOwner = await prisma.user.findFirst({
      where: {
        email,
        role: UserRole.admin,
      },
      orderBy: { createdAt: "asc" },
    });

    if (emailOwner && emailOwner.id !== existingUser?.id) {
      throw new Error("email_already_used");
    }
  }

  if (existingUser) {
    const user = await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        role: UserRole.admin,
        name: name || existingUser.name,
        email: email || existingUser.email,
      },
    });

    await assignAdminPassword(user.id, password);
    return { user: toAdminListItem(user), created: false };
  }

  const user = await prisma.user.create({
    data: {
      role: UserRole.admin,
      phone,
      name,
      email,
    },
  });

  await assignAdminPassword(user.id, password);
  return { user: toAdminListItem(user), created: true };
}

export async function deleteAdminUser(userId: string) {
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!existingUser) {
    throw new Error("admin_not_found");
  }

  if (existingUser.role !== UserRole.admin) {
    throw new Error("admin_not_found");
  }

  if (isPrimaryAdminPhone(requireUserPhone(existingUser.phone))) {
    throw new Error("protected_admin");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { role: UserRole.customer },
  });

  await removeAdminPassword(userId);
  return toAdminListItem(updatedUser);
}
