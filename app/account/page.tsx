import Link from "next/link";
import { getRecentAccountOrders } from "@/lib/account-orders";
import { getNamedAccountUser } from "@/lib/account-user";
import { formatPrice } from "@/lib/money";
import { getClientOrderStatusLabel } from "@/components/account/OrderProgress";
import { ArrowRightIcon } from "@/components/ui/Icons";

export const dynamic = "force-dynamic";
export const metadata = { title: "Личный кабинет — KROOKIES" };

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default async function AccountPage() {
  const user = await getNamedAccountUser();
  const recentOrders = await getRecentAccountOrders(user.id);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl bg-[#FFFFFF] shadow-lg ring-1 ring-black/5">
        <div className="grid items-center gap-6 p-6 sm:p-7 md:grid-cols-[1fr_320px] md:p-10">
          <div>
            <p className="text-lg text-[#54342C]">Привет,</p>
            <h2 className="mt-2 text-4xl font-black text-[#54342C] sm:text-5xl">
              {user.name || "KROOKIES friend"}!
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#54342C] sm:text-lg sm:leading-8">
              Спасибо, что выбираете KROOKIES. Здесь можно смотреть заказы,
              обновлять данные профиля и возвращаться за новой порцией печенья
            </p>
            <Link
              href="/"
              className="mt-8 inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-[#54342C] px-6 py-4 font-semibold text-white transition hover:bg-[#54342C] sm:w-auto"
            >
              <span>Открыть витрину</span>
              <ArrowRightIcon size={22} />
            </Link>
          </div>

          <div className="relative hidden min-h-44 items-center justify-center rounded-3xl bg-[#FFF4F8] p-6 sm:flex sm:min-h-56">
            <img
              src="/krookies-brand-seal-transparent.png"
              alt="KROOKIES"
              className="h-[110px] w-[110px] object-contain drop-shadow-lg sm:h-[150px] sm:w-[150px]"
            />
          </div>
        </div>
      </section>

      <section className="rounded-3xl bg-[#FFFFFF] p-6 shadow-lg ring-1 ring-black/5 md:p-8">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <h2 className="text-2xl font-black uppercase text-[#54342C]">
            Последние заказы
          </h2>
          <Link href="/account/orders" className="font-semibold text-[#54342C]">
            Все заказы →
          </Link>
        </div>

        <div className="mt-6 space-y-4">
          {recentOrders.length ? (
            recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="grid gap-3 rounded-2xl bg-white p-4 shadow-lg ring-1 ring-black/5 transition hover:bg-[#FFF9FB] sm:gap-4 md:grid-cols-[minmax(0,1fr)_120px_170px_120px_24px] md:items-center"
              >
                <div>
                  <p className="font-bold text-[#54342C]">Заказ №{order.orderNumber}</p>
                  <p className="mt-1 text-sm text-[#54342C]">{formatDate(order.createdAt)}</p>
                </div>
                <p className="text-sm text-[#54342C] md:text-center">
                  {order.items.reduce((sum, item) => sum + item.quantity, 0)} товара
                </p>
                <div className="md:flex md:justify-center">
                  <span className="inline-flex w-fit justify-center text-center rounded-full bg-[#FFF4F8] px-3 py-1 text-xs font-semibold text-[#54342C] md:min-w-[170px]">
                    {getClientOrderStatusLabel(order.status)}
                  </span>
                </div>
                <p className="font-bold text-[#54342C] md:text-center">{formatPrice(order.total)}</p>
                <span className="hidden text-xl text-[#54342C] md:inline">›</span>
              </Link>
            ))
          ) : (
            <div className="rounded-2xl bg-white p-6 text-center text-[#54342C]">
              Заказов пока нет. Откройте витрину и соберите первый набор KROOKIES
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
