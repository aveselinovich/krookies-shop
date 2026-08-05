import { NextRequest, NextResponse } from "next/server";
import { requireApiAdmin } from "@/lib/permissions";
import { updateOrderManagerComment } from "@/lib/orders";
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) { try { const { id }=await params; const auth=await requireApiAdmin(); if(auth.response) return auth.response; const body=await request.json(); const order=await updateOrderManagerComment(id, body.managerComment || ""); return NextResponse.json({ order }); } catch(error) { console.error("PATCH /api/admin/orders/[id]/comment error:", error); return NextResponse.json({ error: "manager_comment_update_failed" }, { status: 400 }); } }
