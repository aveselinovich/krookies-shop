import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { verifyOtpCode } from "@/lib/otp";
import { findOrCreateUserByPhone, loginUser } from "@/lib/auth";
import { assertRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const phone = String(body.phone || "");
    const code = String(body.code || "").replace(/\D/g, "");
    assertRateLimit(`verify-code:${getClientIp(request)}:${phone}`, 10, 15 * 60_000);

    const loginByPhone = async (targetPhone: string) => {
      const result = await findOrCreateUserByPhone(targetPhone);
      const user = result.user;
      const sessionRole = UserRole.customer;
      await loginUser(user.id, sessionRole);

      return NextResponse.json({
        requiresName: !user.name?.trim(),
        isNewUser: result.isNew,
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          telegramUsername: user.telegramUsername,
          role: sessionRole,
        },
      });
    };

    const verified = await verifyOtpCode(phone, code);
    return loginByPhone(verified.phone);
  } catch (error) {
    console.error("POST /api/auth/verify-code error:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "otp_verify_failed",
      },
      {
        status: error instanceof Error && error.message === "rate_limit_exceeded" ? 429 : 400,
      }
    );
  }
}
