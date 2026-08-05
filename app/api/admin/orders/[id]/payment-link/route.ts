import { NextResponse } from "next/server";
import { requireApiAdmin } from "@/lib/permissions";
import { saveManualOrderPaymentLink } from "@/lib/orders";
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) { try { const { id }=await params; const auth=await requireApiAdmin(); if(auth.response) return auth.response; const body = await request.json(); const result=await saveManualOrderPaymentLink(id, body.paymentUrl || ""); return NextResponse.json(result); } catch(error) { console.error("PATCH /api/admin/orders/[id]/payment-link error:", error); return NextResponse.json({ error: error instanceof Error ? error.message : "payment_link_save_failed" }, { status: 400 }); } }
