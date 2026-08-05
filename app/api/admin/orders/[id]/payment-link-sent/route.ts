import { NextResponse } from "next/server";
import { requireApiAdmin } from "@/lib/permissions";
import { setPaymentLinkSent } from "@/lib/orders";
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) { try { const { id }=await params; const auth=await requireApiAdmin(); if(auth.response) return auth.response; const body = await request.json().catch(() => ({})); const order=await setPaymentLinkSent(id, Boolean(body.sent)); return NextResponse.json({ order }); } catch(error) { console.error("PATCH /api/admin/orders/[id]/payment-link-sent error:", error); return NextResponse.json({ error: error instanceof Error ? error.message : "payment_link_sent_update_failed" }, { status: 400 }); } }
