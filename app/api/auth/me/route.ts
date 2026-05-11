import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();

  return NextResponse.json(
    {
      user: user
        ? {
            id: user.id,
            name: user.name,
            phone: user.phone,
            email: user.email,
            telegramUsername: user.telegramUsername,
            role: user.role,
          }
        : null,
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
