import type { DeliveryStatus, OrderStatus, PaymentStatus } from "@prisma/client";
const ORDER_STATUS_LABELS: Record<OrderStatus,string> = { pending_confirmation:"Ожидает подтверждения", pending_payment:"Ожидает оплаты", accepted:"Принят", baking:"Выпекается", ready:"Готов", delivered:"Доставлен", cancelled:"Отменен" };
const PAYMENT_STATUS_LABELS: Record<PaymentStatus,string> = { pending:"Ожидает оплаты", paid:"Оплачен", failed:"Ошибка оплаты", refunded:"Возврат" };
const DELIVERY_STATUS_LABELS: Record<DeliveryStatus,string> = { not_created:"Не оформлена", payment_link_sent:"Ссылка отправлена", delivered:"Доставлено" };
function Badge({ children }: { children: string }) { return <span className="inline-flex rounded-full bg-[#FFF4F8] px-3 py-1 text-xs font-semibold text-[#54342C]">{children}</span>; }
export function OrderStatusBadge({ status }: { status: OrderStatus }) { return <Badge>{ORDER_STATUS_LABELS[status]}</Badge>; }
export function PaymentStatusBadge({ status }: { status: PaymentStatus }) { return <Badge>{PAYMENT_STATUS_LABELS[status]}</Badge>; }
export function DeliveryStatusBadge({ status }: { status: DeliveryStatus }) { return <Badge>{DELIVERY_STATUS_LABELS[status]}</Badge>; }
