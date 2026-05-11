import { Order, OrderItem, Payment } from "@prisma/client";
import { formatPrice } from "@/lib/money";
import { OrderProgress } from "@/components/account/OrderProgress";
import { AccountCancelOrderButton } from "@/components/account/AccountCancelOrderButton";
import { RepeatOrderButton } from "@/components/account/RepeatOrderButton";
import { canCustomerCancelOrder } from "@/lib/orders";
import { CartItem } from "@/types/cart";

type FullOrder = Order & {
  items: (OrderItem & {
    product: {
      id: string;
      title: string;
      slug: string;
      shortDescription: string;
      imageUrl: string;
      price: number;
      isAvailable: boolean;
      isPublished: boolean;
    } | null;
  })[];
  payment: Payment | null;
};

function formatDate(date: Date | null) {
  return date
    ? new Intl.DateTimeFormat("ru-RU", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(date)
    : "—";
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getClientStatusText(order: FullOrder) {
  const map: Record<string, string> = {
    pending_confirmation: "Мы получили ваш заказ. Менеджер проверит возможность доставки и подтвердит заказ",
    pending_payment: "Заказ подтвержден. Менеджер отправит ссылку на оплату печенья",
    accepted: "Заказ принят в работу",
    baking: "Ваш заказ сейчас выпекается",
    ready: "Заказ готов. Менеджер оформит Яндекс Доставку и отправит отдельную ссылку на оплату доставки",
    delivered: "Заказ доставлен",
    cancelled: "Заказ отменен",
  };

  return map[order.status] || "Статус заказа обновляется";
}

export function AccountOrderDetails({ order }: { order: FullOrder }) {
  const canCancelOrder = canCustomerCancelOrder(order.status, order.paymentStatus);
  const repeatOrderItems: CartItem[] = order.items
    .filter((item) => item.product?.isAvailable && item.product?.isPublished)
    .map((item) => ({
      productId: item.product!.id,
      title: item.product!.title,
      shortDescription: item.product!.shortDescription,
      slug: item.product!.slug,
      imageUrl: item.product!.imageUrl,
      price: item.product!.price,
      quantity: item.quantity,
    }));
  const address = [
    order.deliveryCity,
    order.deliveryStreet,
    `дом ${order.deliveryHouse}`,
    order.deliveryApartment ? `кв./офис ${order.deliveryApartment}` : null,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-[#FFFFFF] p-6 shadow-lg ring-1 ring-black/5 md:p-8">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
          <div>
            <h1 className="text-3xl font-black text-[#54342C] sm:text-4xl">
              Заказ #{order.orderNumber}
            </h1>
            <p className="mt-3 text-[#54342C]">Создан: {formatDateTime(order.createdAt)}</p>
          </div>

          <div className="text-left md:text-right">
            <p className="text-sm text-[#54342C]">Сумма печенья</p>
            <p className="mt-1 text-3xl font-bold text-[#54342C]">
              {formatPrice(order.total)}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <OrderProgress status={order.status} />
        </div>

        <div className="mt-6 rounded-[24px] bg-[#FFF4F8] p-5">
          <h2 className="font-semibold text-[#54342C]">Что происходит?</h2>
          <p className="mt-2 leading-7 text-[#54342C]">{getClientStatusText(order)}</p>
        </div>

        {canCancelOrder || repeatOrderItems.length ? (
          <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <RepeatOrderButton items={repeatOrderItems} />
            {canCancelOrder ? <AccountCancelOrderButton orderId={order.id} variant="text" /> : null}
          </div>
        ) : null}
      </section>

      <section className="rounded-3xl bg-[#FFFFFF] p-6 shadow-lg ring-1 ring-black/5">
        <h2 className="text-2xl font-black text-[#54342C]">Состав заказа</h2>

        <div className="mt-5 space-y-4">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-2 border-b border-[#E6AECB] pb-4 last:border-b-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
            >
              <div>
                <p className="font-semibold text-[#54342C]">{item.productName}</p>
                <p className="mt-1 text-sm text-[#54342C]">
                  {item.quantity} × {formatPrice(item.productPrice)}
                </p>
              </div>
              <p className="font-semibold text-[#54342C] sm:text-right">{formatPrice(item.total)}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 border-t border-[#E6AECB] pt-5">
          <div className="flex justify-between text-[#54342C]">
            <span>Печенье</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="mt-3 flex justify-between text-[#54342C]">
            <span>Доставка</span>
            <span>оплачивается отдельно</span>
          </div>
          <div className="mt-4 flex justify-between gap-4 text-lg font-bold text-[#54342C] sm:text-xl">
            <span>Итого печенье</span>
            <span className="text-right">{formatPrice(order.total)}</span>
          </div>
        </div>
      </section>

      <section className="rounded-3xl bg-[#FFFFFF] p-6 shadow-lg ring-1 ring-black/5">
        <h2 className="text-2xl font-black text-[#54342C]">Доставка</h2>

        <div className="mt-5 space-y-4 text-[#54342C]">
          <div>
            <p className="text-sm text-[#54342C]">Адрес</p>
            <p className="font-semibold leading-7 text-[#54342C]">{address}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-[#54342C]">Желаемая дата</p>
              <p className="font-semibold text-[#54342C]">
                {formatDate(order.deliveryDesiredDate)}
              </p>
            </div>
            <div>
              <p className="text-sm text-[#54342C]">Интервал</p>
              <p className="font-semibold text-[#54342C]">
                {order.deliveryDesiredSlot || "—"}
              </p>
            </div>
          </div>

          <div className="rounded-[24px] bg-[#FFF4F8] p-5">
            <h3 className="font-semibold text-[#54342C]">Доставка Яндекс оплачивается отдельно</h3>
            <p className="mt-2 text-sm leading-6 text-[#54342C]">
              Менеджер оформит доставку вручную и отправит отдельную ссылку на оплату доставки,
              когда заказ будет готов к отправке
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
