import { NextRequest, NextResponse } from "next/server";
import { requireApiAdmin } from "@/lib/permissions";
import { deleteAdminProduct, updateAdminProduct } from "@/lib/admin-products";
import { revalidatePath } from "next/cache";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = await requireApiAdmin();
    if (auth.response) return auth.response;

    const body = await request.json();

    const product = await updateAdminProduct(id, {
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
    revalidatePath(`/product/${product.slug}`);

    return NextResponse.json({ product });
  } catch (error) {
    console.error("PATCH /api/admin/products/[id] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "product_update_failed" },
      { status: 400 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = await requireApiAdmin();
    if (auth.response) return auth.response;

    const product = await deleteAdminProduct(id);

    revalidatePath("/");
    revalidatePath("/catalog");
    revalidatePath("/admin/products");
    revalidatePath(`/product/${product.slug}`);

    return NextResponse.json({ product });
  } catch (error) {
    console.error("DELETE /api/admin/products/[id] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "product_delete_failed" },
      { status: 400 }
    );
  }
}
