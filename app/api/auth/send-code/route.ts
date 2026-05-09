import { NextRequest, NextResponse } from "next/server";
import { createOtpCode, deleteOtpCode, isMockOtpEnabled } from "@/lib/otp";
import { isSmsConfigured, sendSms } from "@/lib/sms";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await createOtpCode(body.phone);
    const isMockMode = isMockOtpEnabled();
    const shouldSendSms = isSmsConfigured();

    if (!isMockMode && !shouldSendSms && process.env.NODE_ENV === "production") {
      if (result.id) {
        await deleteOtpCode(result.id).catch(() => null);
      }
      throw new Error("sms_not_configured");
    }

    if (!isMockMode && shouldSendSms) {
      try {
        await sendSms({
          phone: result.phone,
          message: `KROOKIES: ваш код входа ${result.code}`,
        });
      } catch (error) {
        if (result.id) {
          await deleteOtpCode(result.id).catch(() => null);
        }
        throw error;
      }
    }

    return NextResponse.json({ ok: true, phone: result.phone });
  } catch (error) {
    console.error("POST /api/auth/send-code error:", error);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "otp_send_failed" },
      { status: 400 }
    );
  }
}
