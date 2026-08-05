import { NextRequest, NextResponse } from "next/server";
import { requestPasswordReset } from "@/lib/password-reset";
import { assertRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body.email || "");
    assertRateLimit(`password-reset:ip:${getClientIp(request)}`, 5, 60 * 60_000);
    assertRateLimit(`password-reset:email:${email.trim().toLowerCase()}`, 3, 60 * 60_000);
    const result = await requestPasswordReset(email);

    return NextResponse.json({
      ok: true,
      debugResetUrl: result.debugResetUrl,
    });
  } catch (error) {
    console.error("POST /api/auth/forgot-password error:", error);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "forgot_password_failed" },
      { status: error instanceof Error && error.message === "rate_limit_exceeded" ? 429 : 400 }
    );
  }
}
