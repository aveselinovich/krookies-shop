import { notFound } from "next/navigation";
import { AccountOrderDetails } from "@/components/account/AccountOrderDetails";
import { getAccountOrderById } from "@/lib/account-orders";
import { getNamedAccountUser } from "@/lib/account-user";

export const dynamic = "force-dynamic";

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props) {
  const user = await getNamedAccountUser();
  const order = await getAccountOrderById(user.id, params.id);

  if (!order) return { title: "Заказ не найден — KROOKIES" };
  return { title: `Заказ #${order.orderNumber} — KROOKIES` };
}

export default async function AccountOrderPage({ params }: Props) {
  const user = await getNamedAccountUser();
  const order = await getAccountOrderById(user.id, params.id);

  if (!order) notFound();

  return <AccountOrderDetails order={order} />;
}
