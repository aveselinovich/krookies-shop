import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/permissions";
import { updateAccountProfile } from "@/lib/account-profile";

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const updatedUser = await updateAccountProfile(user.id, body);

    return NextResponse.json({
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        phone: updatedUser.phone,
        email: updatedUser.email,
        telegramUsername: updatedUser.telegramUsername,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error("PATCH /api/account/profile error:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "profile_update_failed" }, { status: 400 });
  }
}
