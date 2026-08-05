import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "@/lib/orders";
import { getSession } from "@/lib/session";
import { assertRateLimit, getClientIp } from "@/lib/rate-limit";
export async function POST(request: NextRequest) { try { const body=await request.json(); const ip=getClientIp(request); assertRateLimit(`order:ip:${ip}`, 5, 60 * 60_000); assertRateLimit(`order:phone:${String(body?.customer?.phone || "")}`, 3, 60 * 60_000); const session=await getSession(); const order=await createOrder(body, session?.role === "customer" ? session.userId : null); return NextResponse.json(order,{status:201}); } catch(error) { console.error("POST /api/orders error:", error); const message=error instanceof Error ? error.message : "order_create_failed"; return NextResponse.json({ error: message }, { status: message === "rate_limit_exceeded" ? 429 : 400 }); } }
