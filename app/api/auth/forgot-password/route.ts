import { NextRequest, NextResponse } from "next/server";
import { requestPasswordReset } from "@/lib/password-reset";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body.email || "");
    const result = await requestPasswordReset(email);

    return NextResponse.json({
      ok: true,
      debugResetUrl: result.debugResetUrl,
    });
  } catch (error) {
    console.error("POST /api/auth/forgot-password error:", error);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "forgot_password_failed" },
      { status: 400 }
    );
  }
}
