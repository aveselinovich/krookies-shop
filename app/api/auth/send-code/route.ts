import { NextRequest, NextResponse } from "next/server";
import { createOtpCode, isMockOtpEnabled } from "@/lib/otp";
import { isSmsConfigured } from "@/lib/sms";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const isMockMode = isMockOtpEnabled();

    if (!isMockMode && !isSmsConfigured() && process.env.NODE_ENV === "production") {
      throw new Error("sms_not_configured");
    }

    const result = await createOtpCode(body.phone);

    return NextResponse.json({ ok: true, phone: result.phone });
  } catch (error) {
    console.error("POST /api/auth/send-code error:", error);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "otp_send_failed" },
      { status: 400 }
    );
  }
}
