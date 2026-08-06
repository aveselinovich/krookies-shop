import { NextRequest, NextResponse } from "next/server";
import { requireApiAdmin } from "@/lib/permissions";
import { createAdminProduct } from "@/lib/admin-products";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    const auth = await requireApiAdmin();
    if (auth.response) return auth.response;

    const body = await request.json();

    const product = await createAdminProduct({
      title: body.title,
      shortDescription: body.shortDescription,
      composition: body.composition,
      allergens: body.allergens,
      weight: body.weight,
      badge: body.badge,
      price: Number(body.price),
      imageUrl: body.imageUrl,
      isAvailable: Boolean(body.isAvailable),
      isPublished: Boolean(body.isPublished),
    });

    revalidatePath("/");
    revalidatePath("/catalog");
    revalidatePath("/admin/products");

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/products error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "product_create_failed" },
      { status: 400 }
    );
  }
}
