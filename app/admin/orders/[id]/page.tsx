import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/layout/AdminHeader";
import {
  AdminCopyButtons,
  AdminCustomerBlock,
  AdminDeliveryBlock,
  AdminManagerComment,
  AdminOrderHeader,
  AdminOrderItems,
  AdminPaymentBlock,
  AdminStatusActions,
} from "@/components/admin/AdminOrderBlocks";
import { getAdminOrderById } from "@/lib/admin-orders";
import { requireAdmin } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export default async function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireAdmin();
  const order = await getAdminOrderById(id);

  if (!order) notFound();

  return (
    <main className="min-h-screen bg-[#FFF9FB]">
      <AdminHeader user={user} />

      <section className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
        <div className="mb-8">
          <Link
            href="/admin/orders"
            className="inline-flex w-full justify-center rounded-full bg-[#54342C] px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[#3F2721] sm:w-auto"
          >
            ← Назад к заказам
          </Link>
        </div>

        <div className="space-y-6">
          <AdminOrderHeader order={order} />
          <AdminStatusActions order={order} />

          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
            <div className="space-y-6">
              <AdminCustomerBlock order={order} />
              <AdminDeliveryBlock order={order} />
              <AdminOrderItems order={order} />
              <AdminPaymentBlock order={order} />
              <AdminManagerComment order={order} />
            </div>

            <div className="space-y-6">
              <AdminCopyButtons order={order} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
