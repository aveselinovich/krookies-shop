import { prisma } from "@/lib/prisma";
import { normalizePhone, validatePhone } from "@/lib/phone";

type UpdateAdminCustomerInput = {
  name?: string | null;
  phone?: string;
  email?: string | null;
  telegramUsername?: string | null;
};

function normalizeTelegramUsername(value: string | null | undefined) {
  const username = value?.trim().replace(/^@+/, "") || "";
  return username ? username.toLowerCase() : null;
}

function isValidTelegramUsername(value: string) {
  return /^[a-z0-9_]{5,32}$/i.test(value);
}

export async function getAdminCustomers() {
  return prisma.user.findMany({
    where: { role: "customer" },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAdminCustomerById(userId: string) {
  return prisma.user.findFirst({
    where: {
      id: userId,
      role: "customer",
    },
  });
}

export async function updateAdminCustomerProfile(userId: string, input: UpdateAdminCustomerInput) {
  const user = await getAdminCustomerById(userId);

  if (!user) {
    throw new Error("user_not_found");
  }

  const hasName = Object.prototype.hasOwnProperty.call(input, "name");
  const hasPhone = Object.prototype.hasOwnProperty.call(input, "phone");
  const hasEmail = Object.prototype.hasOwnProperty.call(input, "email");
  const hasTelegramUsername = Object.prototype.hasOwnProperty.call(input, "telegramUsername");

  const data: {
    name?: string | null;
    phone?: string;
    email?: string | null;
    telegramUsername?: string | null;
  } = {};

  if (hasName) {
    const name = input.name?.trim() || null;
    if (!name) {
      throw new Error("name_required");
    }
    data.name = name;
  }

  if (hasPhone) {
    const phone = normalizePhone(input.phone || "");
    if (!validatePhone(phone)) {
      throw new Error("invalid_phone");
    }

    const phoneOwner = await prisma.user.findUnique({
      where: { phone },
      select: { id: true },
    });

    if (phoneOwner && phoneOwner.id !== user.id) {
      throw new Error("phone_already_used");
    }

    data.phone = phone;
  }

  if (hasEmail) {
    const email = input.email?.trim().toLowerCase() || null;

    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      throw new Error("invalid_email");
    }

    data.email = email;
  }

  if (hasTelegramUsername) {
    const telegramUsername = normalizeTelegramUsername(input.telegramUsername);
    if (telegramUsername && !isValidTelegramUsername(telegramUsername)) {
      throw new Error("invalid_telegram_username");
    }

    data.telegramUsername = telegramUsername;
  }

  return prisma.user.update({
    where: { id: user.id },
    data,
  });
}
