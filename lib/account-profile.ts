import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { normalizePhone, validatePhone } from "@/lib/phone";
import { validateEmail } from "@/lib/email";

type UpdateAccountProfileInput = {
  name?: string;
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

export async function updateAccountProfile(
  userId: string,
  input: UpdateAccountProfileInput
) {
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!currentUser) {
    throw new Error("user_not_found");
  }

  const hasName = Object.prototype.hasOwnProperty.call(input, "name");
  const hasPhone = Object.prototype.hasOwnProperty.call(input, "phone");
  const hasEmail = Object.prototype.hasOwnProperty.call(input, "email");
  const hasTelegramUsername = Object.prototype.hasOwnProperty.call(input, "telegramUsername");

  const name = hasName ? input.name?.trim() || null : currentUser.name;
  const normalizedPhone = hasPhone ? normalizePhone(input.phone || "") : null;
  const email = hasEmail ? input.email?.trim().toLowerCase() || null : currentUser.email;
  const telegramUsername = hasTelegramUsername
    ? normalizeTelegramUsername(input.telegramUsername)
    : currentUser.telegramUsername;

  if (currentUser.role !== "admin" && !name?.trim()) {
    throw new Error("name_required");
  }

  if (hasPhone) {
    if (normalizedPhone && !validatePhone(normalizedPhone)) {
      throw new Error("invalid_phone");
    }
  }

  if (email && !validateEmail(email)) {
    throw new Error("invalid_email");
  }

  if (telegramUsername && !isValidTelegramUsername(telegramUsername)) {
    throw new Error("invalid_telegram_username");
  }

  if (email) {
    const emailOwner = await prisma.user.findFirst({
      where: {
        email,
        NOT: { id: currentUser.id },
      },
      select: { id: true },
      orderBy: { createdAt: "asc" },
    });

    if (emailOwner) {
      throw new Error("email_already_used");
    }
  }

  const data: Prisma.UserUpdateInput = {};

  if (hasName) {
    data.name = name;
  }

  if (hasPhone) {
    data.phone = normalizedPhone || null;
  }

  if (hasEmail) {
    data.email = email;
  }

  if (hasTelegramUsername) {
    data.telegramUsername = telegramUsername;
  }

  return prisma.user.update({
    where: { id: userId },
    data,
  });
}
