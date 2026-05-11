import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { loginUser } from "@/lib/auth";
import { authenticateCustomerByEmail } from "@/lib/customer-auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body.email || "");
    const password = String(body.password || "");

    const user = await authenticateCustomerByEmail(email, password);
    const sessionRole = UserRole.customer;
    await loginUser(user.id, sessionRole);

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        telegramUsername: user.telegramUsername,
        role: sessionRole,
      },
    });
  } catch (error) {
    console.error("POST /api/auth/login error:", error);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "login_failed" },
      { status: 400 }
    );
  }
}
