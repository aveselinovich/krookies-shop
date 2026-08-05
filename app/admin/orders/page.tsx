import Link from "next/link";
import { OrderStatus } from "@prisma/client";
import { AdminOrdersFilters } from "@/components/admin/AdminOrdersFilters";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { getAdminOrders } from "@/lib/admin-orders";
import { requireAdmin } from "@/lib/permissions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Заказы — KROOKIES Admin" };

type PageProps = {
  searchParams?: Promise<{
    status?: string;
  }>;
};

const ORDER_STATUSES: OrderStatus[] = [
  "pending_confirmation",
  "pending_payment",
  "accepted",
  "baking",
  "ready",
  "delivered",
  "cancelled",
];

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending_confirmation: "Новые заявки",
  pending_payment: "Ожидают оплаты",
  accepted: "Приняты",
  baking: "Выпекаются",
  ready: "Готовы",
  delivered: "Доставлены",
  cancelled: "Отменены",
};

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const user = await requireAdmin();
  const status = ORDER_STATUSES.includes(resolvedSearchParams?.status as OrderStatus)
    ? (resolvedSearchParams?.status as OrderStatus)
    : undefined;
  const orders = await getAdminOrders(status);

  return (
    <main className="min-h-screen bg-[#FFF9FB]">
      <AdminHeader user={user} />

      <section className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#54342C] md:text-6xl">
              Заказы
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-[#54342C] sm:text-lg sm:leading-8">
              {status ? `Фильтр: ${STATUS_LABELS[status]}` : "Все заказы магазина"}
            </p>
          </div>

          <div className="hidden md:block">
            <Link
              href="/admin/orders"
              className="inline-flex justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#54342C] shadow-sm ring-1 ring-[#E6AECB] transition hover:bg-[#FFF4F8]"
            >
              Показать все
            </Link>
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between gap-3 sm:hidden">
          <AdminOrdersFilters
            currentValue={status}
            options={ORDER_STATUSES.map((item) => ({
              value: item,
              label: STATUS_LABELS[item],
            }))}
          />

          <Link
            href="/admin/orders"
            className="inline-flex shrink-0 justify-center rounded-full bg-white px-4 py-3 text-sm font-semibold text-[#54342C] shadow-sm ring-1 ring-[#E6AECB] transition hover:bg-[#FFF4F8]"
          >
            Показать все
          </Link>
        </div>

        <div className="mb-6 hidden gap-3 sm:flex sm:flex-wrap">
          {ORDER_STATUSES.map((item) => (
            <Link
              key={item}
              href={`/admin/orders?status=${item}`}
              className={`rounded-full px-4 py-3 text-center text-sm font-semibold shadow-sm ring-1 transition sm:py-2 ${
                status === item
                  ? "bg-[#54342C] text-white ring-[#54342C]"
                  : "bg-white text-[#54342C] ring-[#E6AECB] hover:bg-[#FFF4F8]"
              }`}
            >
              {STATUS_LABELS[item]}
            </Link>
          ))}
        </div>

        <OrdersTable orders={orders} />
      </section>
    </main>
  );
}
