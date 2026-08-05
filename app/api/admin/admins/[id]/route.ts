import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { deleteAdminUser } from "@/lib/admin-users";
import { requireApiAdmin } from "@/lib/permissions";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await requireApiAdmin();
    if (auth.response) return auth.response;

    const user = await deleteAdminUser(id);

    return NextResponse.json({ user });
  } catch (error) {
    console.error("DELETE /api/admin/admins/[id] error:", error);

    if (
      error instanceof Prisma.PrismaClientInitializationError ||
      (error instanceof Error && "code" in error && error.code === "P1001")
    ) {
      return NextResponse.json(
        { error: "database_unavailable" },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "admin_delete_failed" },
      { status: 400 }
    );
  }
}
