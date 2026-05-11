"use client";

import { DeliveryDatePicker } from "@/components/checkout/DeliveryDatePicker";
import { DeliverySlotPicker } from "@/components/checkout/DeliverySlotPicker";
import { CheckoutDelivery } from "@/types/order";

type DeliveryTimeFieldsProps = {
  delivery: CheckoutDelivery;
  onChange: (field: keyof CheckoutDelivery, value: string) => void;
  errors?: Partial<Record<"desiredDate" | "desiredSlot", string>>;
};

const DELIVERY_SLOTS = ["12:00–15:00", "15:00–18:00", "18:00–21:00"];

export function DeliveryTimeFields({ delivery, onChange, errors }: DeliveryTimeFieldsProps) {
  return (
    <div className="rounded-3xl bg-[#FFFFFF] p-6 shadow-lg ring-1 ring-black/5">
      <h2 className="text-2xl font-black text-[#54342C]">Желаемое время доставки</h2>
      <p className="mt-2 text-sm leading-6 text-[#54342C]">Это желаемое время. Менеджер подтвердит его после проверки заказа</p>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-[#54342C]">Дата доставки</span>
          <DeliveryDatePicker value={delivery.desiredDate || ""} onChange={(value) => onChange("desiredDate", value)} hasError={Boolean(errors?.desiredDate)} />
          {errors?.desiredDate ? <span className="mt-2 block text-xs font-medium text-[#D05C63]">{errors.desiredDate}</span> : null}
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-[#54342C]">Интервал</span>
          <DeliverySlotPicker value={delivery.desiredSlot || ""} options={DELIVERY_SLOTS} onChange={(value) => onChange("desiredSlot", value)} />
          {errors?.desiredSlot ? <span className="mt-2 block text-xs font-medium text-[#D05C63]">{errors.desiredSlot}</span> : null}
        </label>
      </div>
    </div>
  );
}
