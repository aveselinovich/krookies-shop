import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { AdminDeleteProductButton } from "@/components/admin/AdminDeleteProductButton";
import { AdminProductForm } from "@/components/admin/AdminProductForm";
import { getAdminProductById } from "@/lib/admin-products";
import { requireAdmin } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export default async function AdminProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireAdmin();
  const product = await getAdminProductById(id);

  if (!product) notFound();

  return (
    <main className="min-h-screen bg-[#FFF9FB]">
      <AdminHeader user={user} />

      <section className="mx-auto max-w-5xl px-5 py-12 md:px-8 md:py-16">
        <div className="mb-8">
          <Link
            href="/admin/products"
            className="inline-flex w-full justify-center rounded-full bg-[#54342C] px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[#3F2721] sm:w-auto"
          >
            ← Назад к товарам
          </Link>
        </div>

        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-[#54342C] sm:text-4xl md:text-6xl">
              {product.title}
            </h1>
            <p className="mt-5 text-base leading-7 text-[#54342C] sm:text-lg sm:leading-8">
              Изменения повлияют на карточку товара и будущие заказы
            </p>
          </div>

          <AdminDeleteProductButton productId={product.id} />
        </div>

        <AdminProductForm mode="edit" product={product} />
      </section>
    </main>
  );
}
