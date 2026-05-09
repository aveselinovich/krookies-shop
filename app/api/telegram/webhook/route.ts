import { NextRequest, NextResponse } from "next/server";
import {
  getTelegramWebhookSecret,
  handleTelegramUpdate,
  isTelegramConfigured,
  TelegramUpdate,
} from "@/lib/telegram";

export async function POST(request: NextRequest) {
  try {
    if (!isTelegramConfigured()) {
      return NextResponse.json({ error: "telegram_not_configured" }, { status: 503 });
    }

    const expectedSecret = getTelegramWebhookSecret();
    const receivedSecret =
      request.headers.get("x-telegram-bot-api-secret-token") || "";

    if (expectedSecret && receivedSecret !== expectedSecret) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const body = (await request.json()) as TelegramUpdate;
    await handleTelegramUpdate(body);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST /api/telegram/webhook error:", error);
    return NextResponse.json({ error: "telegram_webhook_failed" }, { status: 400 });
  }
}
