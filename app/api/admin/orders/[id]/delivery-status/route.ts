import { NextRequest, NextResponse } from "next/server";
import { DeliveryStatus } from "@prisma/client";
import { requireApiAdmin } from "@/lib/permissions";
import { updateOrderDeliveryStatus } from "@/lib/orders";
const DELIVERY_STATUSES: DeliveryStatus[] = ["not_created","payment_link_sent","delivered"];
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) { try { const { id }=await params; const auth=await requireApiAdmin(); if(auth.response) return auth.response; const body=await request.json(); const deliveryStatus=body.deliveryStatus as DeliveryStatus; if(!DELIVERY_STATUSES.includes(deliveryStatus)) return NextResponse.json({error:"invalid_delivery_status"},{status:400}); const order=await updateOrderDeliveryStatus(id,deliveryStatus); return NextResponse.json({order}); } catch(error) { console.error("PATCH /api/admin/orders/[id]/delivery-status error:", error); return NextResponse.json({ error: "delivery_status_update_failed" }, { status: 400 }); } }
