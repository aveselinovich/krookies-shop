import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "@/lib/orders";
import { getSession } from "@/lib/session";
import { assertRateLimit, getClientIp } from "@/lib/rate-limit";

const ORDER_RATE_LIMIT_WINDOW = 60 * 60_000;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const ip = getClientIp(request);

    // Keep basic spam protection without locking out a customer after a few
    // corrected form submissions.
    assertRateLimit(`order:ip:${ip}`, 20, ORDER_RATE_LIMIT_WINDOW);
    assertRateLimit(`order:phone:${String(body?.customer?.phone || "")}`, 10, ORDER_RATE_LIMIT_WINDOW);

    const session = await getSession();
    const order = await createOrder(body, session?.role === "customer" ? session.userId : null);
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("POST /api/orders error:", error);
    const message = error instanceof Error ? error.message : "order_create_failed";
    return NextResponse.json(
      { error: message },
      { status: message === "rate_limit_exceeded" ? 429 : 400 }
    );
  }
}
