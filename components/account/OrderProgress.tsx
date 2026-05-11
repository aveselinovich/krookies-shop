import { OrderStatus } from "@prisma/client";

const STEPS: OrderStatus[] = [
  "pending_confirmation",
  "pending_payment",
  "accepted",
  "baking",
  "ready",
  "delivered",
];

const LABELS: Record<OrderStatus, string> = {
  pending_confirmation: "Ожидает подтверждения",
  pending_payment: "Ожидает оплаты",
  accepted: "Принят",
  baking: "Выпекается",
  ready: "Готов",
  delivered: "Доставлен",
  cancelled: "Отменен",
};

export function getClientOrderStatusLabel(status: OrderStatus) {
  return LABELS[status];
}

export function OrderProgress({ status }: { status: OrderStatus }) {
  if (status === "cancelled") {
    return (
      <div className="rounded-[24px] bg-white p-4 ring-1 ring-[#E6AECB]">
        <div className="flex gap-3">
          <div className="relative flex w-6 shrink-0 justify-center">
            <span className="mt-1 h-4 w-4 rounded-full border-4 border-[#B3536B] bg-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#B3536B]">Отменен</p>
            <p className="mt-1 text-sm leading-6 text-[#8A6A62]">Заказ был отменен и больше не будет продвигаться по этапам</p>
          </div>
        </div>
      </div>
    );
  }

  const currentIndex = STEPS.indexOf(status);

  return (
    <div className="rounded-[24px] bg-white p-4 ring-1 ring-[#E6AECB]">
      {STEPS.map((step, index) => {
        const isCurrent = index === currentIndex;
        const isPassed = index < currentIndex;
        const isLast = index === STEPS.length - 1;

        const dotClass = isCurrent
          ? "border-[#54342C] bg-[#54342C]"
          : isPassed
          ? "border-[#E6AECB] bg-[#E6AECB]"
          : "border-[#E6AECB] bg-white";

        const lineClass = isPassed ? "bg-[#E6AECB]" : "bg-[#F2E3EA]";
        const labelClass = isCurrent
          ? "text-[#54342C]"
          : isPassed
          ? "text-[#7A5448]"
          : "text-[#B8A39A]";

        return (
          <div key={step} className="flex gap-3">
            <div className="relative flex w-6 shrink-0 justify-center">
              <span className={`z-10 mt-1 h-4 w-4 rounded-full border-4 ${dotClass}`} />
              {!isLast ? <span className={`absolute top-6 h-[calc(100%-0.5rem)] w-0.5 rounded-full ${lineClass}`} /> : null}
            </div>
            <div className={`pb-4 ${isLast ? "pb-0" : ""}`}>
              <p className={`text-sm font-semibold ${labelClass}`}>{LABELS[step]}</p>
              {isCurrent ? (
                <p className="mt-1 text-sm leading-6 text-[#8A6A62]">Текущий этап вашего заказа</p>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
