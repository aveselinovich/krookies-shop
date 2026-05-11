import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { validateEmail } from "@/lib/email";
import { isEmailDeliveryConfigured, sendEmail } from "@/lib/email-delivery";
import { hashPassword, validatePassword } from "@/lib/passwords";

const PASSWORD_RESET_TTL_HOURS = 1;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function hashResetToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function getSiteUrl() {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.SITE_URL?.trim() ||
    "http://localhost:3000";

  return siteUrl.replace(/\/$/, "");
}

function createResetEmailHtml(resetUrl: string) {
  return `
    <div style="font-family:Arial,sans-serif;color:#54342C;line-height:1.6">
      <h1 style="margin:0 0 16px;font-size:24px">Смена пароля KROOKIES</h1>
      <p style="margin:0 0 16px">Мы получили запрос на смену пароля.</p>
      <p style="margin:0 0 24px">
        Нажмите на кнопку ниже, чтобы задать новый пароль. Ссылка действует 1 час.
      </p>
      <p style="margin:0 0 24px">
        <a
          href="${resetUrl}"
          style="display:inline-block;padding:12px 20px;border-radius:14px;background:#54342C;color:#ffffff;text-decoration:none;font-weight:700"
        >
          Сменить пароль
        </a>
      </p>
      <p style="margin:0 0 12px">Если кнопку не удаётся открыть, используйте эту ссылку:</p>
      <p style="margin:0;word-break:break-all">
        <a href="${resetUrl}" style="color:#54342C">${resetUrl}</a>
      </p>
    </div>
  `;
}

function createResetEmailText(resetUrl: string) {
  return [
    "Смена пароля KROOKIES",
    "",
    "Мы получили запрос на смену пароля.",
    "Откройте ссылку ниже, чтобы задать новый пароль. Ссылка действует 1 час.",
    "",
    resetUrl,
  ].join("\n");
}

export async function requestPasswordReset(email: string) {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    throw new Error("email_required");
  }

  if (!validateEmail(normalizedEmail)) {
    throw new Error("invalid_email");
  }

  const user = await prisma.user.findFirst({
    where: {
      email: normalizedEmail,
      role: "customer",
    },
    orderBy: { createdAt: "asc" },
  });

  if (!user) {
    return { ok: true, debugResetUrl: null as string | null };
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashResetToken(rawToken);
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_HOURS * 60 * 60 * 1000);

  await prisma.passwordResetToken.deleteMany({
    where: {
      userId: user.id,
      consumedAt: null,
    },
  });

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  });

  const resetUrl = `${getSiteUrl()}/reset-password?token=${rawToken}`;

  if (!isEmailDeliveryConfigured()) {
    if (process.env.NODE_ENV !== "production") {
      console.log("password reset link:", resetUrl);
      return { ok: true, debugResetUrl: resetUrl };
    }

    throw new Error("email_not_configured");
  }

  await sendEmail({
    to: normalizedEmail,
    subject: "Смена пароля KROOKIES",
    html: createResetEmailHtml(resetUrl),
    text: createResetEmailText(resetUrl),
  });

  return { ok: true, debugResetUrl: null as string | null };
}

export async function resetPasswordByToken(token: string, password: string) {
  const normalizedToken = token.trim();

  if (!normalizedToken) {
    throw new Error("reset_token_required");
  }

  validatePassword(password);

  const tokenHash = hashResetToken(normalizedToken);
  const resetToken = await prisma.passwordResetToken.findFirst({
    where: {
      tokenHash,
      consumedAt: null,
      expiresAt: { gt: new Date() },
    },
    include: {
      user: true,
    },
  });

  if (!resetToken) {
    throw new Error("invalid_or_expired_reset_token");
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: {
        passwordHash: hashPassword(password),
      },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: {
        consumedAt: new Date(),
      },
    }),
    prisma.passwordResetToken.updateMany({
      where: {
        userId: resetToken.userId,
        consumedAt: null,
        NOT: { id: resetToken.id },
      },
      data: {
        consumedAt: new Date(),
      },
    }),
  ]);

  return { ok: true };
}
