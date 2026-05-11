import { OtpPurpose } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { normalizePhone, validatePhone } from "@/lib/phone";
import { checkVerificationCode, isSmsConfigured, sendVerificationCode } from "@/lib/sms";

const OTP_TTL_MINUTES = 10;

function getMockOtpCode() {
  const value = process.env.OTP_MOCK_CODE?.replace(/\D/g, "").slice(0, 4) || "";
  return value.length === 4 ? value : "";
}

function isMockOtpEnabled() {
  return Boolean(getMockOtpCode());
}

export function generateOtpCode() {
  const mockCode = getMockOtpCode();
  if (mockCode) return mockCode;
  return String(Math.floor(1000 + Math.random() * 9000));
}

export async function createOtpCode(phone: string) {
  const normalizedPhone = normalizePhone(phone);
  if (!validatePhone(normalizedPhone)) throw new Error("invalid_phone");

  if (!isMockOtpEnabled() && isSmsConfigured()) {
    const { uuid } = await sendVerificationCode({ phone: normalizedPhone });
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + OTP_TTL_MINUTES);

    const otpCode = await prisma.otpCode.create({
      data: { phone: normalizedPhone, code: uuid, purpose: OtpPurpose.login, expiresAt },
    });

    return { id: otpCode.id, phone: normalizedPhone, code: null, expiresAt };
  }

  const code = generateOtpCode();
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + OTP_TTL_MINUTES);

  const otpCode = await prisma.otpCode.create({
    data: { phone: normalizedPhone, code, purpose: OtpPurpose.login, expiresAt },
  });

  return { id: otpCode.id, phone: normalizedPhone, code, expiresAt };
}

export async function deleteOtpCode(id: string) {
  await prisma.otpCode.delete({ where: { id } });
}

export async function verifyOtpCode(phone: string, code: string) {
  const normalizedPhone = normalizePhone(phone);
  const normalizedCode = String(code).replace(/\D/g, "");

  if (!validatePhone(normalizedPhone)) throw new Error("invalid_phone");

  const mockCode = getMockOtpCode();

  // Explicit mock mode for local/prod testing.
  if (mockCode && normalizedCode === mockCode) {
    return { phone: normalizedPhone };
  }

  if (!isMockOtpEnabled() && isSmsConfigured()) {
    const otpCode = await prisma.otpCode.findFirst({
      where: {
        phone: normalizedPhone,
        purpose: OtpPurpose.login,
        consumedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otpCode) throw new Error("invalid_or_expired_code");

    try {
      await checkVerificationCode({ uuid: otpCode.code, code: normalizedCode });
    } catch (error) {
      if (error instanceof Error && error.message.startsWith("direct_verifier_")) {
        throw new Error("invalid_or_expired_code");
      }
      throw error;
    }

    await prisma.otpCode.update({
      where: { id: otpCode.id },
      data: { consumedAt: new Date() },
    });

    return { phone: normalizedPhone };
  }

  const otpCode = await prisma.otpCode.findFirst({
    where: {
      phone: normalizedPhone,
      code: normalizedCode,
      purpose: OtpPurpose.login,
      consumedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!otpCode) throw new Error("invalid_or_expired_code");

  await prisma.otpCode.update({
    where: { id: otpCode.id },
    data: { consumedAt: new Date() },
  });

  return { phone: normalizedPhone };
}

export { isMockOtpEnabled };
