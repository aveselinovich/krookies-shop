import Link from "next/link";
import { OrderStatus } from "@prisma/client";
import { formatPrice } from "@/lib/money";
import { getClientOrderStatusLabel } from "@/components/account/OrderProgress";

type Props = {
  order: {
    id: string;
    orderNumber: number;
    status: OrderStatus;
    total: number;
    createdAt: Date;
    items: { quantity: number }[];
  };
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function AccountOrderCard({ order }: Props) {
  const itemsCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <article className="rounded-3xl bg-[#FFFFFF] p-6 shadow-lg ring-1 ring-black/5">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#54342C]">
            {formatDate(order.createdAt)}
          </p>
          <h2 className="mt-2 text-2xl font-black text-[#54342C]">
            Заказ #{order.orderNumber}
          </h2>
          <p className="mt-2 text-[#54342C]">{itemsCount} шт. KROOKIES</p>
        </div>

        <div className="flex flex-col gap-3 md:items-end md:text-right">
          <span className="inline-flex w-fit justify-center self-start rounded-full bg-[#FFF4F8] px-4 py-2 text-sm font-medium text-[#8A6A62] ring-1 ring-[#E6AECB] md:self-end">
            {getClientOrderStatusLabel(order.status)}
          </span>
          <p className="text-2xl font-black text-[#54342C]">
            {formatPrice(order.total)}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <Link
          href={`/account/orders/${order.id}`}
          className="inline-flex rounded-full bg-[#54342C] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#3F2721]"
        >
          Открыть заказ
        </Link>
      </div>
    </article>
  );
}
