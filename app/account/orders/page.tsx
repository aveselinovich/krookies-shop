import { AccountOrderCard } from "@/components/account/AccountOrderCard";
import { getAccountOrders } from "@/lib/account-orders";
import { getNamedAccountUser } from "@/lib/account-user";

export const dynamic = "force-dynamic";
export const metadata = { title: "Мои заказы — KROOKIES" };

export default async function AccountOrdersPage() {
  const user = await getNamedAccountUser();
  const orders = await getAccountOrders(user.id);

  return (
    <div className="rounded-3xl bg-[#FFFFFF] p-6 shadow-lg ring-1 ring-black/5 md:p-8">
      <div className="mb-8">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-[#54342C] md:text-5xl">
            Мои заказы
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-[#54342C]">
            Здесь отображаются ваши заказы и текущий статус каждого заказа
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="py-12 text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#FFF4F8] text-4xl">
            🍪
          </div>
          <h2 className="text-3xl font-bold text-[#54342C]">Заказов пока нет</h2>
          <p className="mx-auto mt-3 max-w-md leading-7 text-[#54342C]">
            Выберите любимые KROOKIES и отправьте первый заказ
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => (
            <AccountOrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
