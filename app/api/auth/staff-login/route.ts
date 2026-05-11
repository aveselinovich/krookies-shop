import { NextRequest, NextResponse } from "next/server";
import { loginUser } from "@/lib/auth";
import { authenticateAdminByEmail } from "@/lib/admin-passwords";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body.email || "");
    const password = String(body.password || "");

    const user = await authenticateAdminByEmail(email, password);
    await loginUser(user.id, user.role);

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        telegramUsername: user.telegramUsername,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("POST /api/auth/staff-login error:", error);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "staff_login_failed" },
      { status: 400 }
    );
  }
}
