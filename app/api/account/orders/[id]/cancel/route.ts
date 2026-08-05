import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { cancelCustomerOrder } from "@/lib/orders";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const order = await cancelCustomerOrder(user.id, id);
    return NextResponse.json({ order });
  } catch (error) {
    console.error("PATCH /api/account/orders/[id]/cancel error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "order_cancel_failed" },
      { status: 400 }
    );
  }
}
