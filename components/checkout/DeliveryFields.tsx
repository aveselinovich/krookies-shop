"use client";

import { AddressAutocomplete } from "@/components/checkout/AddressAutocomplete";
import { AddressSuggestion } from "@/types/dadata";
import { CheckoutDelivery } from "@/types/order";

type DeliveryFieldsProps = {
  delivery: CheckoutDelivery;
  onChange: (field: keyof CheckoutDelivery, value: string) => void;
  onAddressSelect: (suggestion: AddressSuggestion) => void;
  addressMessage?: string | null;
};

export function DeliveryFields({ delivery, onChange, onAddressSelect, addressMessage }: DeliveryFieldsProps) {
  const hasAddress = Boolean(delivery.addressLine?.trim());

  return (
    <div className="rounded-3xl bg-[#FFFFFF] p-6 shadow-lg ring-1 ring-black/5">
      <h2 className="text-2xl font-black text-[#54342C]">Адрес доставки</h2>
      <p className="mt-2 text-sm leading-6 text-[#54342C]">Доставляем по Москве и Московской области. Менеджер проверит адрес перед подтверждением заказа</p>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="block md:col-span-2">
          <span className="mb-2 block text-sm font-semibold text-[#54342C]">Адрес: город, улица, дом *</span>
          <AddressAutocomplete value={delivery.addressLine || ""} onInputChange={(value) => onChange("addressLine", value)} onSuggestionSelect={onAddressSelect} externalMessage={addressMessage} hasError={Boolean(addressMessage)} />
        </label>

        {hasAddress ? (
          <>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#54342C]">Квартира / офис</span>
              <input value={delivery.apartment || ""} onChange={(event) => onChange("apartment", event.target.value)} placeholder="Квартира" className="w-full rounded-2xl border border-[#E6AECB] bg-white px-4 py-3 text-[#54342C] outline-none transition focus:border-[#54342C]" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#54342C]">Подъезд</span>
              <input value={delivery.entrance || ""} onChange={(event) => onChange("entrance", event.target.value)} placeholder="Подъезд" className="w-full rounded-2xl border border-[#E6AECB] bg-white px-4 py-3 text-[#54342C] outline-none transition focus:border-[#54342C]" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#54342C]">Этаж</span>
              <input value={delivery.floor || ""} onChange={(event) => onChange("floor", event.target.value)} placeholder="Этаж" className="w-full rounded-2xl border border-[#E6AECB] bg-white px-4 py-3 text-[#54342C] outline-none transition focus:border-[#54342C]" />
            </label>
            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-semibold text-[#54342C]">Комментарий</span>
              <textarea value={delivery.comment || ""} onChange={(event) => onChange("comment", event.target.value)} placeholder="Например: позвонить за 10 минут, не звонить в домофон..." rows={4} className="w-full resize-none rounded-2xl border border-[#E6AECB] bg-white px-4 py-3 text-[#54342C] outline-none transition focus:border-[#54342C]" />
            </label>
          </>
        ) : null}
      </div>
    </div>
  );
}
