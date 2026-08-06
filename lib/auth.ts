import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/lib/phone";
import { getSession, setSessionCookie, clearSessionCookie } from "@/lib/session";

function getAdminPhone() {
  return normalizePhone(process.env.ADMIN_PHONE || "+79959178862");
}

function getAdminEmail() {
  const configuredEmail = process.env.ADMIN_EMAIL || "veselinovich.a@gmail.com";
  const withoutWrappingQuotes = configuredEmail.trim().replace(/^(['"])(.*)\1$/, "$2");

  return withoutWrappingQuotes.trim().toLowerCase();
}

export async function findOrCreateUserByPhone(phone: string) {
  const normalizedPhone = normalizePhone(phone);
  const isEnvAdmin = normalizedPhone === getAdminPhone();
  const existingUser = await prisma.user.findUnique({
    where: { phone: normalizedPhone },
  });

  if (existingUser) {
    const shouldStayAdmin =
      existingUser.role === UserRole.admin || isEnvAdmin;

    const user = await prisma.user.update({
      where: { phone: normalizedPhone },
      data: {
        role: shouldStayAdmin ? UserRole.admin : UserRole.customer,
        email: isEnvAdmin ? existingUser.email || getAdminEmail() : existingUser.email,
        name: isEnvAdmin ? existingUser.name || "KROOKIES Admin" : existingUser.name,
      },
    });

    await prisma.order.updateMany({
      where: { userId: null, customerPhone: normalizedPhone },
      data: { userId: user.id },
    });
    return { user, isNew: false };
  }

  const user = await prisma.user.create({
    data: {
      phone: normalizedPhone,
      role: isEnvAdmin ? UserRole.admin : UserRole.customer,
      email: isEnvAdmin ? getAdminEmail() : null,
      name: isEnvAdmin ? "KROOKIES Admin" : null,
    },
  });

  await prisma.order.updateMany({
    where: { userId: null, customerPhone: normalizedPhone },
    data: { userId: user.id },
  });
  return { user, isNew: true };
}

export async function loginUser(userId: string, role: UserRole) {
  await setSessionCookie({ userId, role });
}

export async function logoutUser() {
  await clearSessionCookie();
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  return prisma.user.findUnique({ where: { id: session.userId } });
}
