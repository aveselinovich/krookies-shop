import { NextRequest, NextResponse } from "next/server";
import { resetPasswordByToken } from "@/lib/password-reset";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = String(body.token || "");
    const password = String(body.password || "");

    await resetPasswordByToken(token, password);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST /api/auth/reset-password error:", error);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "reset_password_failed" },
      { status: 400 }
    );
  }
}
