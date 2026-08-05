import { PaymentStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { updateOrderPaymentStatus } from "@/lib/orders";
import { requireApiAdmin } from "@/lib/permissions";

const PAYMENT_STATUSES: PaymentStatus[] = ["pending", "paid", "failed", "refunded"];

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = await requireApiAdmin();
    if (auth.response) return auth.response;
    const body = await request.json();
    const paymentStatus = body.paymentStatus as PaymentStatus;
    if (!PAYMENT_STATUSES.includes(paymentStatus)) {
      return NextResponse.json({ error: "invalid_payment_status" }, { status: 400 });
    }
    const order = await updateOrderPaymentStatus(id, paymentStatus);
    return NextResponse.json({ order });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "payment_status_update_failed" },
      { status: 400 },
    );
  }
}
